# Kaviyarasan K — Cybersecurity Professional Portfolio

A Flask-based cybersecurity portfolio showcasing experience, certifications, and lab projects. Built with a dark theme, admin panel for content management, and click-to-enlarge lab screenshots.

## Tech Stack

- **Backend:** Flask 3.0, Python
- **Frontend:** HTML, CSS, JavaScript
- **Security:** Flask-Limiter, CSRF protection, session hardening

## Quick Start

1. **Activate the virtual environment:**
   ```bash
   venv\Scripts\activate   # Windows
   source venv/bin/activate   # macOS/Linux
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment** — Create a `.env` file in the project root:
   ```
   SECRET_KEY=your-secret-key-here
   ADMIN_PASSWORD=your-admin-password
   ADMIN_PATH=manage-portfolio
   ```

4. **Run the application:**
   ```bash
   python app.py
   ```

5. **Open in browser:** http://localhost:5000

## Project Structure

```
portfolio/
├── app.py              # Flask application
├── requirements.txt
├── .env                # Environment variables (not in git)
├── templates/          # HTML templates
├── static/
│   ├── css/            # Styles
│   ├── js/             # Client-side scripts
│   └── uploads/        # Profile pictures & project screenshots
└── venv/               # Virtual environment
```

## Features

| Section | Description |
|---------|-------------|
| **Home** | Profile, bio, skills, contact links (email, LinkedIn) |
| **About** | Summary and education |
| **Experience** | Work history with role, company, and bullet points |
| **Projects & Labs** | Lab descriptions with screenshot gallery (click to enlarge) |
| **Certificates** | Certifications with optional verification links |
| **Skills** | Technical and soft skills by category |
| **Contact** | Email, phone, location, LinkedIn links |

## Admin Panel

The admin panel is **not linked** from the public site. Access it directly at:

**URL:** http://localhost:5000/manage-portfolio  
*(Path is set by `ADMIN_PATH` in `.env`; default is `/admin`)*

**Capabilities:**
- Upload profile picture
- Add, edit, delete experience entries
- Add, edit, delete certificates
- Add, edit, delete projects/labs
- Upload lab screenshots per project

## Security

| Measure | Details |
|---------|---------|
| **SECRET_KEY** | Required in `.env` for production |
| **ADMIN_PASSWORD** | Set in `.env`; no default in production |
| **ADMIN_PATH** | Custom path to hide admin URL |
| **Rate limiting** | Login: 5/min; uploads: 10–30/hr |
| **CSRF** | All admin actions require valid token |
| **Image uploads** | Magic-byte validation, random filenames, 5MB max |
| **Session** | HttpOnly, SameSite=Lax, 1-hour expiry |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Production | Secret key for sessions |
| `ADMIN_PASSWORD` | Yes | Admin login password |
| `ADMIN_PATH` | No | Admin URL path (default: `admin`) |
| `FLASK_ENV` | Production | Set to `production` for deploy; `development` for debug |
| `PORT` | No | Server port (default: 5000) |

## Production Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for security checklist and deployment steps. Use Gunicorn, not `python app.py`.

## License

© 2026 Kaviyarasan K. Cybersecurity Professional Portfolio. All rights reserved.
