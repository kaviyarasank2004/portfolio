import os
import re
import secrets
from dotenv import load_dotenv

load_dotenv()
from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.utils import secure_filename
from flask_cors import CORS
from functools import wraps

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Security: Require strong SECRET_KEY in production
_secret = os.environ.get('SECRET_KEY')
if not _secret or _secret == 'dev-secret-change-in-production':
    import warnings
    warnings.warn('Set SECRET_KEY in .env for production!', UserWarning)
app.secret_key = _secret or 'dev-secret-change-in-production'

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max for uploads
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'uploads')
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
app.config['ADMIN_PASSWORD'] = os.environ.get('ADMIN_PASSWORD', 'admin123')
app.config['ADMIN_PATH'] = (os.environ.get('ADMIN_PATH') or 'admin').strip('/') or 'admin'

# Session security
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = os.environ.get('FLASK_ENV') == 'production'
app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 hour

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'projects'), exist_ok=True)

# Image magic bytes (file signatures) for validation
IMAGE_SIGNATURES = {
    b'\x89PNG\r\n\x1a\n': ['png'],
    b'\xff\xd8\xff': ['jpg', 'jpeg'],
    b'GIF87a': ['gif'],
    b'GIF89a': ['gif'],
    b'\xff\xd8\xff': ['jpg', 'jpeg'],
    b'RIFF': ['webp'],  # WEBP starts with RIFF
}


def validate_image_content(file_stream, allowed_ext):
    """Validate file is actually an image by checking magic bytes."""
    header = file_stream.read(12)
    file_stream.seek(0)
    ext_lower = allowed_ext.lower()
    if ext_lower == 'webp':
        return header.startswith(b'RIFF') and b'WEBP' in header
    if ext_lower in ('jpg', 'jpeg'):
        return header.startswith(b'\xff\xd8\xff')
    if ext_lower == 'png':
        return header.startswith(b'\x89PNG\r\n\x1a\n')
    if ext_lower == 'gif':
        return header.startswith(b'GIF87a') or header.startswith(b'GIF89a')
    return False


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated


def csrf_required(f):
    """Validate CSRF token for admin API requests."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('X-CSRF-Token') or (request.form.get('csrf_token') if request.form else None)
        if not token or not secrets.compare_digest(token, session.get('csrf_token', '')):
            return jsonify({"error": "Invalid security token. Refresh the page and try again."}), 403
        return f(*args, **kwargs)
    return decorated


def get_csrf_token():
    if 'csrf_token' not in session:
        session['csrf_token'] = secrets.token_hex(32)
    return session['csrf_token']


# Kaviyarasan K - Resume Data
PROFILE = {
    "name": "Kaviyarasan K",
    "title": "Security-focused Computer Science Student | SOC Aspirant",
    "location": "Tamil Nadu, India",
    "email": "kkaviyarasan961@gmail.com",
    "phone": "+91 86681 13009",
    "linkedin": "https://linkedin.com/in/kaviyarasan-0x01",
    "github": "",
    "bio": "System-focused Computer Science student with hands-on experience in Linux/Windows administration, networking, and scripting. Built a home lab simulating enterprise environments using Active Directory, firewalls, and centralized logging. Strong foundation in system monitoring and incident handling through cybersecurity training. Seeking a System Administrator Internship.",
    "profile_pic": None,
    "skills": {
        "os_admin": ["Linux administration", "Windows administration", "Active Directory basics", "User and access management", "System monitoring"],
        "networking": ["TCP/IP fundamentals", "VLANs", "Network segmentation", "Firewall concepts", "Traffic analysis"],
        "security_monitoring": ["Log analysis", "SIEM monitoring (Splunk, Wazuh)", "Sysmon", "IDS/IPS fundamentals"],
        "scripting": ["Python scripting", "Git"]
    },
    "education": {
        "institution": "DMI Engineering College",
        "degree": "B.E. in Computer Science",
        "gpa": "8.0/10"
    },
    "experience": [
        {
            "id": 1,
            "role": "Software Engineer Intern",
            "company": "Icanio Technologies",
            "points": [
                "Developed and maintained Python scripts in a production IT environment",
                "Assisted with debugging, script optimization, and basic automation tasks",
                "Used Git for version control and collaborative development",
                "Worked within structured workflows and task-based assignments"
            ]
        }
    ],
    "soft_skills": ["Analytical problem-solving", "Attention to detail", "Clear technical communication", "Willingness to learn and document systems"]
}

CERTIFICATES = [
    {"id": 1, "name": "Google Cybersecurity Professional Certificate", "issuer": "Google", "year": "2024", "credential_id": "", "url": ""},
    {"id": 2, "name": "TryHackMe SOC Level 1", "issuer": "TryHackMe", "year": "2024", "credential_id": "", "url": ""},
]

PROJECTS = [
    {
        "id": 1,
        "title": "Home Infrastructure and Monitoring Lab",
        "description": "Built and managed a lab using pfSense, Windows Server (Active Directory), and Windows workstations. Configured users, groups, and access controls in Active Directory. Implemented system and network logging using Sysmon and SIEM tools. Practiced monitoring system activity and responding to simulated incidents.",
        "screenshots": [],
        "tech": ["pfSense", "Windows Server", "Active Directory", "Sysmon", "SIEM"]
    },
    {
        "id": 2,
        "title": "Python Networking Toolkit",
        "description": "Developed TCP and UDP client-server applications using Python sockets. Built a port scanning and service identification utility. Created a multi-client chat application to explore connection handling.",
        "screenshots": [],
        "tech": ["Python", "Sockets", "Networking"]
    },
]


def allowed_file(filename):
    """Validate extension and reject double extensions (e.g. file.php.jpg)."""
    if '.' not in filename:
        return False
    parts = filename.rsplit('.', 1)
    ext = parts[1].lower()
    if ext not in app.config['ALLOWED_EXTENSIONS']:
        return False
    # Reject suspicious patterns
    if re.search(r'[^\w\-.]', parts[0]):
        return False
    return True


def sanitize_filename(name):
    """Generate safe random filename for uploads."""
    return secrets.token_hex(16)


@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    return response


@app.route('/')
def index():
    return render_template('index.html', profile=PROFILE, certificates=CERTIFICATES, projects=PROJECTS)


_admin_path = app.config['ADMIN_PATH']


@app.route(f'/{_admin_path}', methods=['GET', 'POST'])
@limiter.limit("5 per minute", key_func=lambda: request.remote_addr)
def admin():
    if request.method == 'POST':
        csrf_token = request.form.get('csrf_token', '')
        if not secrets.compare_digest(csrf_token, session.get('csrf_token', '')):
            return render_template('admin_login.html', error='Invalid request. Please try again.', csrf_token=get_csrf_token())
        password = request.form.get('password', '')
        if password == app.config['ADMIN_PASSWORD']:
            session['admin_logged_in'] = True
            session.permanent = True
            session['csrf_token'] = secrets.token_hex(32)
            return redirect(url_for('admin_panel'))
        return render_template('admin_login.html', error='Invalid password', csrf_token=get_csrf_token())
    if session.get('admin_logged_in'):
        return redirect(url_for('admin_panel'))
    return render_template('admin_login.html', csrf_token=get_csrf_token())


@app.route(f'/{_admin_path}/panel')
def admin_panel():
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin'))
    return render_template('admin_panel.html', profile=PROFILE, certificates=CERTIFICATES, projects=PROJECTS, csrf_token=get_csrf_token())


@app.route(f'/{_admin_path}/logout')
def admin_logout():
    session.clear()
    return redirect(url_for('index'))


@app.route('/api/csrf')
def api_csrf():
    """Get CSRF token for admin API requests (requires admin session)."""
    if not session.get('admin_logged_in'):
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"csrf_token": get_csrf_token()})


@app.route('/api/profile', methods=['GET'])
def get_profile():
    return jsonify(PROFILE)


@app.route('/api/profile/picture', methods=['POST'])
@admin_required
@csrf_required
@limiter.limit("10 per hour")
def upload_profile_picture():
    if 'profile_pic' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['profile_pic']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400
    ext = file.filename.rsplit('.', 1)[1].lower()
    if not validate_image_content(file.stream, ext):
        return jsonify({"error": "File is not a valid image"}), 400
    file.stream.seek(0)
    safe_name = f"{sanitize_filename('')}.{ext}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], safe_name)
    file.save(filepath)
    PROFILE['profile_pic'] = f'/static/uploads/{safe_name}'
    return jsonify({"success": True, "url": PROFILE['profile_pic']})


@app.route('/api/experience', methods=['GET'])
def get_experiences():
    return jsonify(PROFILE['experience'])


@app.route('/api/experience', methods=['POST'])
@admin_required
@csrf_required
@limiter.limit("20 per hour")
def add_experience():
    data = request.json or {}
    role = str(data.get('role', ''))[:200]
    company = str(data.get('company', ''))[:200]
    points = data.get('points', [])
    if isinstance(points, list):
        points = [str(p)[:500] for p in points[:15] if p]
    else:
        points = []
    new_id = max((e['id'] for e in PROFILE['experience']), default=0) + 1
    exp = {"id": new_id, "role": role, "company": company, "points": points}
    PROFILE['experience'].append(exp)
    return jsonify(exp), 201


@app.route('/api/experience/<int:exp_id>', methods=['PUT'])
@admin_required
@csrf_required
def update_experience(exp_id):
    exp = next((e for e in PROFILE['experience'] if e['id'] == exp_id), None)
    if not exp:
        return jsonify({"error": "Experience not found"}), 404
    data = request.json or {}
    exp['role'] = str(data.get('role', exp['role']))[:200]
    exp['company'] = str(data.get('company', exp['company']))[:200]
    points = data.get('points', exp.get('points', []))
    if isinstance(points, list):
        exp['points'] = [str(p)[:500] for p in points[:15] if p]
    return jsonify(exp)


@app.route('/api/experience/<int:exp_id>', methods=['DELETE'])
@admin_required
@csrf_required
def delete_experience(exp_id):
    exp = next((e for e in PROFILE['experience'] if e['id'] == exp_id), None)
    if not exp:
        return jsonify({"error": "Experience not found"}), 404
    PROFILE['experience'] = [e for e in PROFILE['experience'] if e['id'] != exp_id]
    return jsonify({"success": True})


@app.route('/api/certificates', methods=['GET'])
def get_certificates():
    return jsonify(CERTIFICATES)


@app.route('/api/certificates', methods=['POST'])
@admin_required
@csrf_required
@limiter.limit("20 per hour")
def add_certificate():
    data = request.json or {}
    name = str(data.get('name', ''))[:200]
    issuer = str(data.get('issuer', ''))[:200]
    year = str(data.get('year', ''))[:20]
    url = str(data.get('url', ''))[:500]
    if not url.startswith(('http://', 'https://', '')):
        url = ''
    new_id = max((c['id'] for c in CERTIFICATES), default=0) + 1
    cert = {
        "id": new_id,
        "name": name,
        "issuer": issuer,
        "year": year,
        "credential_id": str(data.get('credential_id', ''))[:100],
        "url": url
    }
    CERTIFICATES.append(cert)
    return jsonify(cert), 201


@app.route('/api/certificates/<int:cert_id>', methods=['PUT'])
@admin_required
@csrf_required
def update_certificate(cert_id):
    cert = next((c for c in CERTIFICATES if c['id'] == cert_id), None)
    if not cert:
        return jsonify({"error": "Certificate not found"}), 404
    data = request.json or {}
    cert['name'] = str(data.get('name', cert['name']))[:200]
    cert['issuer'] = str(data.get('issuer', cert['issuer']))[:200]
    cert['year'] = str(data.get('year', cert['year']))[:20]
    cert['credential_id'] = str(data.get('credential_id', cert.get('credential_id', '')))[:100]
    url = str(data.get('url', cert.get('url', '')))[:500]
    cert['url'] = url if url.startswith(('http://', 'https://')) else ''
    return jsonify(cert)


@app.route('/api/certificates/<int:cert_id>', methods=['DELETE'])
@admin_required
@csrf_required
def delete_certificate(cert_id):
    global CERTIFICATES
    cert = next((c for c in CERTIFICATES if c['id'] == cert_id), None)
    if not cert:
        return jsonify({"error": "Certificate not found"}), 404
    CERTIFICATES = [c for c in CERTIFICATES if c['id'] != cert_id]
    return jsonify({"success": True})


@app.route('/api/projects', methods=['GET'])
def get_projects():
    return jsonify(PROJECTS)


@app.route('/api/projects', methods=['POST'])
@admin_required
@csrf_required
@limiter.limit("20 per hour")
def add_project():
    data = request.json or {}
    title = str(data.get('title', ''))[:200]
    description = str(data.get('description', ''))[:2000]
    tech = data.get('tech', [])
    if isinstance(tech, list):
        tech = [str(t)[:50] for t in tech[:20]]
    else:
        tech = []
    new_id = max((p['id'] for p in PROJECTS), default=0) + 1
    project = {
        "id": new_id,
        "title": title,
        "description": description,
        "screenshots": [],
        "tech": tech
    }
    PROJECTS.append(project)
    return jsonify(project), 201


@app.route('/api/projects/<int:project_id>', methods=['PUT'])
@admin_required
@csrf_required
def update_project(project_id):
    project = next((p for p in PROJECTS if p['id'] == project_id), None)
    if not project:
        return jsonify({"error": "Project not found"}), 404
    data = request.json or {}
    project['title'] = str(data.get('title', project['title']))[:200]
    project['description'] = str(data.get('description', project['description']))[:2000]
    tech = data.get('tech', project.get('tech', []))
    if isinstance(tech, list):
        project['tech'] = [str(t)[:50] for t in tech[:20]]
    else:
        project['tech'] = project.get('tech', [])
    return jsonify(project)


@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
@admin_required
@csrf_required
def delete_project(project_id):
    global PROJECTS
    project = next((p for p in PROJECTS if p['id'] == project_id), None)
    if not project:
        return jsonify({"error": "Project not found"}), 404
    PROJECTS = [p for p in PROJECTS if p['id'] != project_id]
    return jsonify({"success": True})


@app.route('/api/projects/<int:project_id>/screenshot', methods=['POST'])
@admin_required
@csrf_required
@limiter.limit("30 per hour")
def upload_project_screenshot(project_id):
    project = next((p for p in PROJECTS if p['id'] == project_id), None)
    if not project:
        return jsonify({"error": "Project not found"}), 404
    if 'screenshot' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['screenshot']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400
    ext = file.filename.rsplit('.', 1)[1].lower()
    if not validate_image_content(file.stream, ext):
        return jsonify({"error": "File is not a valid image"}), 400
    file.stream.seek(0)
    safe_name = f"project_{project_id}_{sanitize_filename('')}.{ext}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'projects', safe_name)
    file.save(filepath)
    url = f'/static/uploads/projects/{safe_name}'
    project['screenshots'].append(url)
    return jsonify({"success": True, "url": url, "screenshots": project['screenshots']})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
