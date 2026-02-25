// Public Portfolio - Contact form and mobile nav only
document.addEventListener('DOMContentLoaded', () => {
    initContact();
    initMobileNav();
});

function showToast(message, isError = false) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// Contact Form
function initContact() {
    const form = document.getElementById('contactForm');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const data = Object.fromEntries(fd);

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json().catch(() => ({}));
            if (res.ok && result.success) {
                showToast(result.message);
                form.reset();
            } else {
                showToast(result.error || 'Failed to send', true);
            }
        } catch (err) {
            showToast('Failed to send message', true);
        }
    });
}

// Mobile Navigation
function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    toggle?.addEventListener('click', () => {
        links?.classList.toggle('active');
    });
}
