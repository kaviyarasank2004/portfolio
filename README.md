# Kaviyarasan K — Cybersecurity Professional Portfolio

A Flask-based portfolio application showcasing cybersecurity experience, certifications, and lab projects. The site features a responsive design with light and dark themes, an administrative panel for content management, and interactive elements such as click-to-enlarge project screenshots.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Admin Panel](#admin-panel)
- [Environment Variables](#environment-variables)
- [Security](#security)
- [Production Deployment](#production-deployment)
- [License](#license)

---

## Tech Stack

| Layer      | Technologies                                      |
|------------|----------------------------------------------------|
| Backend    | Flask 3.0, Python 3.8+                             |
| Frontend   | HTML5, CSS3, JavaScript (vanilla)                  |
| Fonts      | Inter, JetBrains Mono, Poppins (Google Fonts)       |
| Security   | Flask-Limiter, CSRF protection, session hardening  |
| Deployment | Gunicorn (production WSGI server)                  |

---

## Features

### Public Portfolio

| Section          | Description                                                                 |
|------------------|-----------------------------------------------------------------------------|
| **Home**         | Profile photo, greeting, bio, LinkedIn and Resume links                     |
| **About**        | Summary and education details (institution, degree, GPA)                    |
| **Experience**   | Work history with role, company, and bullet points                         |
| **Projects & Labs** | Lab descriptions in a 2-column grid with screenshots (click to enlarge) |
| **Certificates** | Certifications with issuer, year, and optional verification URLs           |
| **Skills**       | Technical and soft skills organized by category                            |
| **Contact**      | Email, phone, location, and LinkedIn links                                |

### Theme System

- **Light and dark themes** — Professional light theme with a refined dark (cyber/terminal) variant
- **Theme toggle** — Available in the navigation bar on the home page
- **Primary theme** — Administrators can set the default theme for new visitors via the admin panel
- **User preference** — Visitor theme choice is stored in `localStorage` and overrides the primary theme on return visits

### Additional Features

- **Responsive design** — Mobile-friendly layout with hamburger navigation
- **Security popup** — Rotating cybersecurity slogans (e.g., "Stay Secure", "Zero Trust Mindset") in the bottom-right corner
- **Screenshot lightbox** — Click project screenshots to view them enlarged
- **Smooth scrolling** — Section navigation with scroll behavior

---

## Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd portfolio
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate          # Windows
   # source venv/bin/activate    # macOS/Linux
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables** — Create a `.env` file in the project root:
   ```env
   SECRET_KEY=your-secret-key-here
   ADMIN_PASSWORD=your-admin-password
   ADMIN_PATH=manage-portfolio
   ```

5. **Run the application:**
   ```bash
   python app.py
   ```

6. **Open in browser:** [http://localhost:5000](http://localhost:5000)

---

## Project Structure

```
portfolio/
├── app.py                  # Flask application and API routes
├── requirements.txt       # Python dependencies
├── site_config.json       # Site settings (primary theme); created on first save
├── .env                    # Environment variables (not committed)
├── templates/
│   ├── index.html          # Main portfolio page
│   ├── admin_login.html    # Admin authentication page
│   └── admin_panel.html    # Admin content management interface
├── static/
│   ├── css/
│   │   └── style.css       # Styles (light and dark themes)
│   ├── js/
│   │   ├── main.js         # Portfolio scripts (nav, lightbox, theme toggle)
│   │   ├── theme.js        # Theme management (localStorage, primary theme)
│   │   └── admin.js        # Admin panel API interactions
│   └── uploads/            # User-uploaded files
│       ├── (profile pics, resume PDF)
│       └── projects/       # Project screenshots
├── DEPLOYMENT.md           # Production deployment guide
└── venv/                   # Virtual environment (not committed)
```

---

## Admin Panel

The admin panel is **not linked** from the public site. Access it directly at the configured path.

**URL:** `http://localhost:5000/manage-portfolio`  
*(Path is configurable via `ADMIN_PATH` in `.env`; default is `/admin`)*

### Capabilities

| Feature              | Description                                                    |
|----------------------|----------------------------------------------------------------|
| **Primary theme**    | Set default theme (light or dark) for new visitors            |
| **Profile picture**  | Upload or replace profile photo (PNG, JPG, GIF, WebP)         |
| **Resume**           | Upload or replace PDF resume                                  |
| **Experience**       | Add, edit, and delete work experience entries                 |
| **Certificates**     | Add, edit, and delete certification entries                   |
| **Projects**         | Add, edit, and delete project/lab entries                     |
| **Screenshots**      | Upload one screenshot per project; replace or remove          |

---

## Environment Variables

| Variable        | Required    | Description                                              |
|-----------------|-------------|----------------------------------------------------------|
| `SECRET_KEY`    | Production  | Secret key for session encryption; use `secrets.token_hex(32)` |
| `ADMIN_PASSWORD`| Yes         | Password for admin panel access                         |
| `ADMIN_PATH`    | No          | URL path for admin (default: `admin`)                    |
| `FLASK_ENV`     | Production  | Set to `production` for deploy; `development` for debug  |
| `PORT`          | No          | Server port (default: 5000)                              |

---

## Security

| Measure          | Details                                                                 |
|------------------|-------------------------------------------------------------------------|
| **SECRET_KEY**   | Required in `.env` for production; avoid default value                 |
| **ADMIN_PASSWORD** | Set in `.env`; never use default in production                       |
| **ADMIN_PATH**   | Custom path to obscure admin URL                                       |
| **Rate limiting**| Login: 5/min; profile pic: 10/hr; resume: 5/hr; general: 200/day     |
| **CSRF**         | All admin API requests require a valid CSRF token                     |
| **Image uploads**| Magic-byte validation (PNG, JPEG, GIF, WebP); random filenames; 10MB max |
| **Resume uploads**| PDF magic-byte validation; 10MB max                                   |
| **Session**      | HttpOnly, SameSite=Lax, Secure (in production), 1-hour expiry          |
| **Security headers** | X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, etc.   |

---

## Production Deployment

Refer to **[DEPLOYMENT.md](DEPLOYMENT.md)** for the security checklist and deployment steps.

**Important:** Use a WSGI server such as Gunicorn in production. Do not run `python app.py` for production traffic.

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## License

© 2026 Kaviyarasan K. Cybersecurity Professional Portfolio. All rights reserved.
