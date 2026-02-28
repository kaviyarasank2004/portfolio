// Public Portfolio - Contact form and mobile nav only
document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initScreenshotLightbox();
    initNavScroll();
    initSecurityPopup();
});

function initSecurityPopup() {
    const popup = document.getElementById('securityPopup');
    const closeBtn = popup?.querySelector('.security-popup-close');
    if (!popup) return;

    const slogans = ['Stay Secure', 'Protect & Defend', 'Secure by Design', 'Zero Trust Mindset', 'Defense in Depth'];
    const slogan = slogans[Math.floor(Math.random() * slogans.length)];
    popup.querySelector('.security-popup-text').textContent = slogan;

    const show = () => {
        if (sessionStorage.getItem('securityPopupSeen')) return;
        popup.classList.add('visible');
        sessionStorage.setItem('securityPopupSeen', '1');
        setTimeout(() => popup.classList.remove('visible'), 4500);
    };

    setTimeout(show, 1500);

    closeBtn?.addEventListener('click', () => popup.classList.remove('visible'));
}

function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const onScroll = () => {
        nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

function showToast(message, isError = false) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// Screenshot lightbox - click to enlarge
function initScreenshotLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');

    document.querySelectorAll('.project-screenshot').forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.setAttribute('aria-hidden', 'false');
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox?.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox?.classList.contains('active')) closeLightbox();
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
