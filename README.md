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

## Contact Form (Email)

Messages are sent to `kkaviyarasan961@gmail.com`. Configure SMTP:

```bash
# Windows PowerShell
$env:EMAIL_USER = "your-gmail@gmail.com"
$env:EMAIL_PASSWORD = "your-app-password"
python app.py
```

For Gmail: use an [App Password](https://support.google.com/accounts/answer/185833) (not your regular password).

## Admin Panel

- **URL:** http://localhost:5000/admin
- **Default password:** `admin123` (set `ADMIN_PASSWORD` env var to change)
- **Admin-only features:**
  - Upload profile picture
  - Add certificates
  - Add projects/labs
  - Upload lab screenshots for each project

## Features

- **Public portfolio** – Resume, experience, projects, certificates, skills, contact
- **Projects & Labs** – Showcase lab screenshots (pfSense, AD, SIEM, etc.)
- **Blue team / SOC UI** – Dark theme with blue accents, monitoring-style grid
