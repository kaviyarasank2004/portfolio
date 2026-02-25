# Kaviyarasan K | Blue Team / SOC Portfolio

A blue team / SOC-focused portfolio with dark theme, admin panel for content management, and project/lab screenshot showcase.

## Setup

1. Activate virtual environment:
   ```bash
   venv\Scripts\activate   # Windows
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the application:
   ```bash
   python app.py
   ```

4. Open http://localhost:5000 in your browser.

## Security

- **SECRET_KEY:** Set in `.env` for production (required for sessions)
- **ADMIN_PASSWORD:** Set in `.env`
- **Rate limiting:** Admin login (5/min), uploads (10–30/hr)
- **CSRF protection:** Admin actions require valid token
- **Image uploads:** Validated by magic bytes; random filenames; 5MB max
- **Session:** HttpOnly, SameSite=Lax, 1-hour expiry

## Admin Panel

- **URL:** http://localhost:5000/admin (or set `ADMIN_PATH` in `.env` for a custom path, e.g. `ADMIN_PATH=manage-portfolio`)
- **Default password:** `admin123` (set `ADMIN_PASSWORD` env var to change)
- **Admin-only features:**
  - Upload profile picture
  - Add, edit, delete experience entries
  - Add, edit, delete certificates
  - Add, edit, delete projects/labs
  - Upload lab screenshots for each project

## Features

- **Public portfolio** – Resume, experience, projects, certificates, skills, contact links (email, LinkedIn)
- **Projects & Labs** – Showcase lab screenshots (pfSense, AD, SIEM, etc.)
- **Blue team / SOC UI** – Dark theme with blue accents, monitoring-style grid
