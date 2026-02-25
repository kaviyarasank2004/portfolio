"""
Cybersecurity Portfolio - Blue Team / SOC Focused
Flask Application
"""
import os
from dotenv import load_dotenv

load_dotenv()
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from werkzeug.utils import secure_filename
from flask_cors import CORS
from functools import wraps

app = Flask(__name__)
CORS(app)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-change-in-production')

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 8 * 1024 * 1024  # 8MB max for uploads
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'uploads')
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
app.config['ADMIN_PASSWORD'] = os.environ.get('ADMIN_PASSWORD', 'admin123')

# Email config for contact form (send to your inbox)
app.config['EMAIL_HOST'] = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
app.config['EMAIL_PORT'] = int(os.environ.get('EMAIL_PORT', '587'))
app.config['EMAIL_USER'] = os.environ.get('EMAIL_USER', '')
app.config['EMAIL_PASSWORD'] = os.environ.get('EMAIL_PASSWORD', '')
app.config['CONTACT_EMAIL'] = os.environ.get('CONTACT_EMAIL', 'kkaviyarasan961@gmail.com')

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


def send_contact_email(name, email, message):
    """Send contact form message to portfolio owner's email."""
    if not app.config['EMAIL_USER'] or not app.config['EMAIL_PASSWORD']:
        return False, "Email not configured. Set EMAIL_USER and EMAIL_PASSWORD env vars."
    try:
        msg = MIMEMultipart()
        msg['From'] = app.config['EMAIL_USER']
        msg['To'] = app.config['CONTACT_EMAIL']
        msg['Subject'] = f"Portfolio Contact: {name}"
        body = f"""
New message from your portfolio contact form:

Name: {name}
Email: {email}

Message:
{message}

---
Reply to: {email}
"""
        msg.attach(MIMEText(body.strip(), 'plain'))
        with smtplib.SMTP(app.config['EMAIL_HOST'], app.config['EMAIL_PORT']) as server:
            server.starttls()
            server.login(app.config['EMAIL_USER'], app.config['EMAIL_PASSWORD'])
            server.send_message(msg)
        return True, None
    except Exception as e:
        return False, str(e)


os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'projects'), exist_ok=True)


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated


# Kaviyarasan K - Resume Data
PROFILE = {
    "name": "Kaviyarasan K",
    "title": "System-focused Computer Science Student | SOC Aspirant",
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
    "experience": {
        "role": "Software Engineer Intern",
        "company": "Icanio Technologies",
        "points": [
            "Developed and maintained Python scripts in a production IT environment",
            "Assisted with debugging, script optimization, and basic automation tasks",
            "Used Git for version control and collaborative development",
            "Worked within structured workflows and task-based assignments"
        ]
    },
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
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


@app.route('/')
def index():
    return render_template('index.html', profile=PROFILE, certificates=CERTIFICATES, projects=PROJECTS)


@app.route('/admin', methods=['GET', 'POST'])
def admin():
    if request.method == 'POST':
        password = request.form.get('password', '')
        if password == app.config['ADMIN_PASSWORD']:
            session['admin_logged_in'] = True
            return redirect(url_for('admin_panel'))
        return render_template('admin_login.html', error='Invalid password')
    if session.get('admin_logged_in'):
        return redirect(url_for('admin_panel'))
    return render_template('admin_login.html')


@app.route('/admin/panel')
def admin_panel():
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin'))
    return render_template('admin_panel.html', profile=PROFILE, certificates=CERTIFICATES, projects=PROJECTS)


@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('index'))


@app.route('/api/profile', methods=['GET'])
def get_profile():
    return jsonify(PROFILE)


@app.route('/api/profile/picture', methods=['POST'])
@admin_required
def upload_profile_picture():
    if 'profile_pic' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['profile_pic']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename('profile.' + file.filename.rsplit('.', 1)[1].lower())
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        PROFILE['profile_pic'] = f'/static/uploads/{filename}'
        return jsonify({"success": True, "url": PROFILE['profile_pic']})
    return jsonify({"error": "Invalid file type"}), 400


@app.route('/api/certificates', methods=['GET'])
def get_certificates():
    return jsonify(CERTIFICATES)


@app.route('/api/certificates', methods=['POST'])
@admin_required
def add_certificate():
    data = request.json
    new_id = max((c['id'] for c in CERTIFICATES), default=0) + 1
    cert = {
        "id": new_id,
        "name": data.get('name', ''),
        "issuer": data.get('issuer', ''),
        "year": data.get('year', ''),
        "credential_id": data.get('credential_id', ''),
        "url": data.get('url', '')
    }
    CERTIFICATES.append(cert)
    return jsonify(cert), 201


@app.route('/api/projects', methods=['GET'])
def get_projects():
    return jsonify(PROJECTS)


@app.route('/api/projects', methods=['POST'])
@admin_required
def add_project():
    data = request.json
    new_id = max((p['id'] for p in PROJECTS), default=0) + 1
    project = {
        "id": new_id,
        "title": data.get('title', ''),
        "description": data.get('description', ''),
        "screenshots": data.get('screenshots', []),
        "tech": data.get('tech', [])
    }
    PROJECTS.append(project)
    return jsonify(project), 201


@app.route('/api/projects/<int:project_id>/screenshot', methods=['POST'])
@admin_required
def upload_project_screenshot(project_id):
    project = next((p for p in PROJECTS if p['id'] == project_id), None)
    if not project:
        return jsonify({"error": "Project not found"}), 404
    if 'screenshot' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['screenshot']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    if file and allowed_file(file.filename):
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = secure_filename(f'project_{project_id}_{len(project["screenshots"])}.{ext}')
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'projects', filename)
        file.save(filepath)
        url = f'/static/uploads/projects/{filename}'
        project['screenshots'].append(url)
        return jsonify({"success": True, "url": url, "screenshots": project['screenshots']})
    return jsonify({"error": "Invalid file type"}), 400


@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.json or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    message = data.get('message', '').strip()
    if not name or not email or not message:
        return jsonify({"success": False, "error": "All fields are required."}), 400
    success, err = send_contact_email(name, email, message)
    if success:
        return jsonify({"success": True, "message": "Thank you! Your message has been sent."})
    return jsonify({"success": False, "error": err or "Failed to send message."}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
