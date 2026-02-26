# Deployment & Security Checklist

## Security Audit Summary

### ✅ Implemented

| Control | Status |
|--------|--------|
| CSRF protection | Admin actions require valid token |
| Rate limiting | Login 5/min, uploads 10–30/hr |
| Session security | HttpOnly, SameSite=Lax, Secure (prod) |
| Image validation | Magic-byte check for PNG/JPEG/GIF/WebP |
| PDF validation | Magic-byte check for resume (%PDF-) |
| Random filenames | No path traversal, no overwrites |
| Input sanitization | Length limits, URL validation |
| Security headers | X-Content-Type-Options, X-Frame-Options, etc. |
| Admin path hidden | No public link, configurable path |
| Strong password | Required via ADMIN_PASSWORD env |

### ⚠️ Before Production

1. **Set `FLASK_ENV=production`** — Disables debug, enables HSTS
2. **Set `SECRET_KEY`** — Use `secrets.token_hex(32)` or similar
3. **Set `ADMIN_PASSWORD`** — Never use default
4. **Use a WSGI server** — Do NOT use `python app.py` in production

### 🚫 Do Not

- Commit `.env` to git
- Run with `debug=True` in production
- Use Flask dev server for production traffic
- Leave `ADMIN_PASSWORD` unset or default

---

## Deployment Steps

### 1. Environment Variables

```bash
FLASK_ENV=production
SECRET_KEY=<generate-with-secrets.token_hex-32>
ADMIN_PASSWORD=<strong-password>
ADMIN_PATH=manage-portfolio
PORT=5000
```

### 2. Install Production Server

```bash
pip install gunicorn
```

### 3. Run with Gunicorn

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

Or with Waitress (Windows-friendly):

```bash
pip install waitress
waitress-serve --port=5000 app:app
```

### 4. Reverse Proxy (Recommended)

Use Nginx or Caddy in front of Gunicorn:

- Terminate SSL/TLS
- Set `X-Forwarded-For`, `X-Forwarded-Proto` for correct client IP and HTTPS
- Serve static files directly

### 5. Verify

- [ ] Debug mode is OFF
- [ ] HTTPS works
- [ ] Admin panel at custom path only
- [ ] `.env` not in repository

---

## Known Limitations

- **In-memory data** — Profile, certificates, projects reset on restart. Use a database for persistence.
- **Rate limiter** — In-memory; with multiple Gunicorn workers, limits are per-worker.
- **File storage** — Uploads in `static/uploads/`; consider object storage (S3) for scale.
