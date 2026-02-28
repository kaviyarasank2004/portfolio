// Theme management - Light/Dark
const THEME_KEY = 'portfolio-theme';

function getTheme() {
    return localStorage.getItem(THEME_KEY) || (typeof window.PORTFOLIO_PRIMARY_THEME === 'string' ? window.PORTFOLIO_PRIMARY_THEME : 'light');
}

function setTheme(theme) {
    theme = theme === 'dark' ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    return theme;
}

function initTheme() {
    const theme = getTheme();
    document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
    const current = getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    return setTheme(next);
}
