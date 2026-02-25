// Admin Panel - Profile, Certificates, Projects (credentials: include for session)
document.addEventListener('DOMContentLoaded', () => {
    initProfilePicUpload();
    initCertificates();
    initProjects();
    initScreenshotUploads();
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

function fetchWithAuth(url, options = {}) {
    return fetch(url, { ...options, credentials: 'same-origin' });
}

function initProfilePicUpload() {
    const input = document.getElementById('profilePicInput');
    const container = document.getElementById('profilePicContainer');
    const placeholder = document.getElementById('profilePlaceholder');

    input?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profile_pic', file);

        try {
            const res = await fetchWithAuth('/api/profile/picture', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                if (placeholder) placeholder.remove();
                let img = document.getElementById('profileImg');
                if (!img) {
                    img = document.createElement('img');
                    img.id = 'profileImg';
                    img.alt = 'Profile';
                    img.className = 'profile-pic';
                    container.appendChild(img);
                }
                img.src = data.url + '?t=' + Date.now();
                showToast('Profile picture updated!');
            } else {
                showToast(data.error || 'Upload failed', true);
            }
        } catch (err) {
            showToast('Upload failed', true);
        }
        input.value = '';
    });
}

function initCertificates() {
    const addBtn = document.getElementById('addCertBtn');
    const modal = document.getElementById('addCertModal');
    const form = document.getElementById('certForm');
    const cancelBtn = document.getElementById('cancelCert');

    addBtn?.addEventListener('click', () => modal.classList.add('active'));
    cancelBtn?.addEventListener('click', () => modal.classList.remove('active'));
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const data = Object.fromEntries(fd);

        try {
            const res = await fetchWithAuth('/api/certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const cert = await res.json();
            if (res.ok) {
                modal.classList.remove('active');
                form.reset();
                showToast('Certificate added! Refresh portfolio to see it.');
            } else {
                showToast(data.error || 'Failed to add certificate', true);
            }
        } catch (err) {
            showToast('Failed to add certificate', true);
        }
    });
}

function initScreenshotUploads() {
    document.querySelectorAll('.screenshot-input').forEach(input => {
        input.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            const projectId = parseInt(e.target.dataset.projectId, 10);
            if (!file || !projectId) return;

            const formData = new FormData();
            formData.append('screenshot', file);

            try {
                const res = await fetchWithAuth(`/api/projects/${projectId}/screenshot`, {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (data.success) {
                    const item = document.querySelector(`.admin-project-item[data-id="${projectId}"]`);
                    const preview = item?.querySelector('.project-screenshots-preview');
                    if (preview) {
                        const img = document.createElement('img');
                        img.src = data.url + '?t=' + Date.now();
                        img.alt = 'Screenshot';
                        img.className = 'thumb';
                        preview.appendChild(img);
                    }
                    showToast('Screenshot added!');
                } else {
                    showToast(data.error || 'Upload failed', true);
                }
            } catch (err) {
                showToast('Upload failed', true);
            }
            e.target.value = '';
        });
    });
}

function initProjects() {
    const addBtn = document.getElementById('addProjectBtn');
    const modal = document.getElementById('addProjectModal');
    const form = document.getElementById('projectForm');
    const cancelBtn = document.getElementById('cancelProject');

    addBtn?.addEventListener('click', () => modal.classList.add('active'));
    cancelBtn?.addEventListener('click', () => modal.classList.remove('active'));
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const techStr = fd.get('tech') || '';
        const data = {
            title: fd.get('title'),
            description: fd.get('description'),
            tech: techStr ? techStr.split(',').map(t => t.trim()).filter(Boolean) : [],
            screenshots: []
        };

        try {
            const res = await fetchWithAuth('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const project = await res.json();
            if (res.ok) {
                modal.classList.remove('active');
                form.reset();
                showToast('Project added! Refresh portfolio to see it.');
            } else {
                showToast(project.error || 'Failed to add project', true);
            }
        } catch (err) {
            showToast('Failed to add project', true);
        }
    });
}
