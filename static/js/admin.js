// Admin Panel - Profile, Certificates, Projects (credentials: include for session)
document.addEventListener('DOMContentLoaded', () => {
    initProfilePicUpload();
    initResumeUpload();
    initAddExperience();
    initEditExperience();
    initDeleteExperience();
    initCertificates();
    initProjects();
    initScreenshotUploads();
    initEditCertificates();
    initEditProjects();
    initDeleteCertificates();
    initDeleteProjects();
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

function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content || '';
}

function getCertificatesData() {
    const el = document.getElementById('certificates-data');
    if (!window._certificatesData) {
        window._certificatesData = el ? JSON.parse(el.textContent) : [];
    }
    return window._certificatesData;
}

function getProjectsData() {
    const el = document.getElementById('projects-data');
    if (!window._projectsData) {
        window._projectsData = el ? JSON.parse(el.textContent) : [];
    }
    return window._projectsData;
}

function getExperiencesData() {
    const el = document.getElementById('experiences-data');
    if (!window._experiencesData) {
        window._experiencesData = el ? JSON.parse(el.textContent) : [];
    }
    return window._experiencesData;
}

function fetchWithAuth(url, options = {}) {
    const headers = { ...(options.headers || {}) };
    const token = getCsrfToken();
    if (token) headers['X-CSRF-Token'] = token;
    return fetch(url, { ...options, credentials: 'same-origin', headers });
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
        formData.append('csrf_token', getCsrfToken());

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

function initResumeUpload() {
    const input = document.getElementById('resumeInput');
    input?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('csrf_token', getCsrfToken());

        try {
            const res = await fetchWithAuth('/api/profile/resume', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                const statusEl = document.querySelector('.resume-status');
                const labelEl = document.querySelector('label[for="resumeInput"]');
                if (statusEl) {
                    statusEl.innerHTML = `Current: <a href="${data.url}" target="_blank">View resume</a>`;
                }
                if (labelEl) labelEl.textContent = 'Change Resume';
                showToast('Resume updated!');
            } else {
                showToast(data.error || 'Upload failed', true);
            }
        } catch (err) {
            showToast('Upload failed', true);
        }
        input.value = '';
    });
}

function initAddExperience() {
    const btn = document.getElementById('addExpBtn');
    const modal = document.getElementById('addExpModal');
    const form = document.getElementById('addExpForm');
    const cancelBtn = document.getElementById('cancelAddExp');

    btn?.addEventListener('click', () => modal.classList.add('active'));
    cancelBtn?.addEventListener('click', () => modal.classList.remove('active'));
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const pointsStr = fd.get('points') || '';
        const points = pointsStr.split('\n').map(p => p.trim()).filter(Boolean);
        const data = { role: fd.get('role'), company: fd.get('company'), points };

        try {
            const res = await fetchWithAuth('/api/experience', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const exp = await res.json();
            if (res.ok) {
                getExperiencesData().push(exp);
                const list = document.getElementById('adminExpList');
                const item = document.createElement('div');
                item.className = 'admin-list-item';
                item.dataset.id = exp.id;
                item.innerHTML = `<span class="admin-list-title">${exp.role} at ${exp.company}</span><div class="admin-item-actions"><button type="button" class="admin-edit-btn admin-edit-exp" data-exp-id="${exp.id}" title="Edit">Edit</button><button type="button" class="admin-delete-btn admin-delete-exp" data-exp-id="${exp.id}" title="Delete">Delete</button></div>`;
                list.appendChild(item);
                item.querySelector('.admin-edit-exp').addEventListener('click', () => openEditExpModal(exp));
                item.querySelector('.admin-delete-exp').addEventListener('click', () => deleteExperience(exp.id, item));
                modal.classList.remove('active');
                form.reset();
                showToast('Experience added!');
            } else {
                showToast(exp.error || 'Failed to add', true);
            }
        } catch (err) {
            showToast('Failed to add experience', true);
        }
    });
}

function openEditExpModal(exp) {
    const form = document.getElementById('editExpForm');
    form.querySelector('[name="id"]').value = exp.id;
    form.querySelector('[name="role"]').value = exp.role || '';
    form.querySelector('[name="company"]').value = exp.company || '';
    form.querySelector('[name="points"]').value = (exp.points || []).join('\n');
    document.getElementById('editExpModal').classList.add('active');
}

function initEditExperience() {
    const modal = document.getElementById('editExpModal');
    const form = document.getElementById('editExpForm');
    const cancelBtn = document.getElementById('cancelEditExp');
    const experiences = getExperiencesData();

    document.querySelectorAll('.admin-edit-exp').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.expId, 10);
            const exp = experiences.find(e => e.id === id);
            if (exp) openEditExpModal(exp);
        });
    });

    cancelBtn?.addEventListener('click', () => modal.classList.remove('active'));
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const id = parseInt(fd.get('id'), 10);
        const pointsStr = fd.get('points') || '';
        const points = pointsStr.split('\n').map(p => p.trim()).filter(Boolean);
        const data = { role: fd.get('role'), company: fd.get('company'), points };

        try {
            const res = await fetchWithAuth(`/api/experience/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const exp = await res.json();
            if (res.ok) {
                const existing = experiences.find(e => e.id === id);
                if (existing) Object.assign(existing, exp);
                modal.classList.remove('active');
                const item = document.querySelector(`.admin-list-item[data-id="${id}"]`);
                const title = item?.querySelector('.admin-list-title');
                if (title) title.textContent = `${exp.role} at ${exp.company}`;
                showToast('Experience updated!');
            } else {
                showToast(exp.error || 'Failed to update', true);
            }
        } catch (err) {
            showToast('Failed to update', true);
        }
    });
}

async function deleteExperience(id, item) {
    if (!confirm('Delete this experience?')) return;
    try {
        const res = await fetchWithAuth(`/api/experience/${id}`, { method: 'DELETE' });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
            item?.remove();
            const idx = getExperiencesData().findIndex(e => e.id === id);
            if (idx >= 0) getExperiencesData().splice(idx, 1);
            showToast('Experience deleted.');
        } else {
            showToast(data.error || 'Failed to delete', true);
        }
    } catch (err) {
        showToast('Failed to delete', true);
    }
}

function initDeleteExperience() {
    document.querySelectorAll('.admin-delete-exp').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.expId, 10);
            deleteExperience(id, btn.closest('.admin-list-item'));
        });
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
                getCertificatesData().push(cert);
                const list = document.getElementById('adminCertList');
                const item = document.createElement('div');
                item.className = 'admin-list-item';
                item.dataset.id = cert.id;
                item.innerHTML = `<span class="admin-list-title">${cert.name}</span><div class="admin-item-actions"><button type="button" class="admin-edit-btn admin-edit-cert" data-cert-id="${cert.id}" title="Edit">Edit</button><button type="button" class="admin-delete-btn" data-cert-id="${cert.id}" title="Delete">Delete</button></div>`;
                list.appendChild(item);
                item.querySelector('.admin-edit-cert').addEventListener('click', () => {
                    const form = document.getElementById('editCertForm');
                    form.querySelector('[name="id"]').value = cert.id;
                    form.querySelector('[name="name"]').value = cert.name || '';
                    form.querySelector('[name="issuer"]').value = cert.issuer || '';
                    form.querySelector('[name="year"]').value = cert.year || '';
                    form.querySelector('[name="credential_id"]').value = cert.credential_id || '';
                    form.querySelector('[name="url"]').value = cert.url || '';
                    document.getElementById('editCertModal').classList.add('active');
                });
                item.querySelector('.admin-delete-btn').addEventListener('click', async () => {
                    if (!confirm('Delete this certificate?')) return;
                    try {
                        const delRes = await fetchWithAuth(`/api/certificates/${cert.id}`, { method: 'DELETE' });
                        const data = await delRes.json().catch(() => ({}));
                        if (delRes.ok && data.success) {
                            item.remove();
                            const idx = getCertificatesData().findIndex(c => c.id === cert.id);
                            if (idx >= 0) getCertificatesData().splice(idx, 1);
                            showToast('Certificate deleted.');
                        }
                    } catch (e) { showToast('Failed to delete', true); }
                });
                modal.classList.remove('active');
                form.reset();
                showToast('Certificate added!');
            } else {
                showToast(cert.error || 'Failed to add certificate', true);
            }
        } catch (err) {
            showToast('Failed to add certificate', true);
        }
    });
}

function attachScreenshotUpload(input) {
    if (!input) return;
    input.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            const projectId = parseInt(e.target.dataset.projectId, 10);
            if (!file || !projectId) return;

            const formData = new FormData();
            formData.append('screenshot', file);
            formData.append('csrf_token', getCsrfToken());

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
}

function initScreenshotUploads() {
    document.querySelectorAll('.screenshot-input').forEach(attachScreenshotUpload);
}

function attachProjectEdit(btn) {
    if (!btn) return;
    btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.projectId, 10);
        const project = getProjectsData().find(p => p.id === id);
        if (project) {
            const form = document.getElementById('editProjectForm');
            form.querySelector('[name="id"]').value = project.id;
            form.querySelector('[name="title"]').value = project.title || '';
            form.querySelector('[name="description"]').value = project.description || '';
            form.querySelector('[name="tech"]').value = (project.tech || []).join(', ');
            document.getElementById('editProjectModal').classList.add('active');
        }
    });
}

function attachProjectDelete(btn) {
    if (!btn) return;
    btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.projectId, 10);
        if (!confirm('Delete this project? Screenshots will remain on server.')) return;
        try {
            const res = await fetchWithAuth(`/api/projects/${id}`, { method: 'DELETE' });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success) {
                btn.closest('.admin-project-item')?.remove();
                const idx = getProjectsData().findIndex(p => p.id === id);
                if (idx >= 0) getProjectsData().splice(idx, 1);
                showToast('Project deleted.');
            } else {
                showToast(data.error || 'Failed to delete', true);
            }
        } catch (err) {
            showToast('Failed to delete', true);
        }
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
                getProjectsData().push(project);
                const list = document.getElementById('adminProjectsList');
                const item = document.createElement('div');
                item.className = 'admin-project-item';
                item.dataset.id = project.id;
                item.innerHTML = `<div class="admin-project-header"><h4>${project.title}</h4><div class="admin-item-actions"><button type="button" class="admin-edit-btn admin-edit-project" data-project-id="${project.id}" title="Edit project">Edit</button><button type="button" class="admin-delete-btn" data-project-id="${project.id}" title="Delete project">Delete</button></div></div><div class="project-screenshots-preview"></div><label class="upload-screenshot-btn"><input type="file" data-project-id="${project.id}" accept="image/*" class="screenshot-input" hidden>+ Add Screenshot</label>`;
                list.appendChild(item);
                attachScreenshotUpload(item.querySelector('.screenshot-input'));
                attachProjectEdit(item.querySelector('.admin-edit-project'));
                attachProjectDelete(item.querySelector('.admin-delete-btn[data-project-id]'));
                modal.classList.remove('active');
                form.reset();
                showToast('Project added!');
            } else {
                showToast(project.error || 'Failed to add project', true);
            }
        } catch (err) {
            showToast('Failed to add project', true);
        }
    });
}

function initEditCertificates() {
    const modal = document.getElementById('editCertModal');
    const form = document.getElementById('editCertForm');
    const cancelBtn = document.getElementById('cancelEditCert');
    const certificates = getCertificatesData();

    document.querySelectorAll('.admin-edit-cert').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.certId, 10);
            const cert = certificates.find(c => c.id === id);
            if (cert) {
                form.querySelector('[name="id"]').value = cert.id;
                form.querySelector('[name="name"]').value = cert.name || '';
                form.querySelector('[name="issuer"]').value = cert.issuer || '';
                form.querySelector('[name="year"]').value = cert.year || '';
                form.querySelector('[name="credential_id"]').value = cert.credential_id || '';
                form.querySelector('[name="url"]').value = cert.url || '';
                modal.classList.add('active');
            }
        });
    });

    cancelBtn?.addEventListener('click', () => modal.classList.remove('active'));
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const id = parseInt(fd.get('id'), 10);
        const data = {
            name: fd.get('name'),
            issuer: fd.get('issuer'),
            year: fd.get('year'),
            credential_id: fd.get('credential_id'),
            url: fd.get('url')
        };

        try {
            const res = await fetchWithAuth(`/api/certificates/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const cert = await res.json();
            if (res.ok) {
                const existing = certificates.find(c => c.id === id);
                if (existing) Object.assign(existing, cert);
                modal.classList.remove('active');
                const item = document.querySelector(`.admin-list-item[data-id="${id}"]`);
                const title = item?.querySelector('.admin-list-title');
                if (title) title.textContent = cert.name;
                showToast('Certificate updated!');
            } else {
                showToast(cert.error || 'Failed to update', true);
            }
        } catch (err) {
            showToast('Failed to update', true);
        }
    });
}

function initDeleteCertificates() {
    document.querySelectorAll('.admin-delete-btn[data-cert-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = parseInt(btn.dataset.certId, 10);
            if (!confirm('Delete this certificate?')) return;
            try {
                const res = await fetchWithAuth(`/api/certificates/${id}`, { method: 'DELETE' });
                const data = await res.json().catch(() => ({}));
                if (res.ok && data.success) {
                    btn.closest('.admin-list-item')?.remove();
                    showToast('Certificate deleted.');
                } else {
                    showToast(data.error || 'Failed to delete', true);
                }
            } catch (err) {
                showToast('Failed to delete', true);
            }
        });
    });
}

function initEditProjects() {
    const modal = document.getElementById('editProjectModal');
    const form = document.getElementById('editProjectForm');
    const cancelBtn = document.getElementById('cancelEditProject');
    const projects = getProjectsData();

    document.querySelectorAll('.admin-edit-project').forEach(attachProjectEdit);

    cancelBtn?.addEventListener('click', () => modal.classList.remove('active'));
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const id = parseInt(fd.get('id'), 10);
        const techStr = fd.get('tech') || '';
        const data = {
            title: fd.get('title'),
            description: fd.get('description'),
            tech: techStr.split(',').map(t => t.trim()).filter(Boolean)
        };

        try {
            const res = await fetchWithAuth(`/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const project = await res.json();
            if (res.ok) {
                const existing = projects.find(p => p.id === id);
                if (existing) Object.assign(existing, project);
                modal.classList.remove('active');
                const item = document.querySelector(`.admin-project-item[data-id="${id}"]`);
                const titleEl = item?.querySelector('.admin-project-header h4');
                if (titleEl) titleEl.textContent = project.title;
                showToast('Project updated!');
            } else {
                showToast(project.error || 'Failed to update', true);
            }
        } catch (err) {
            showToast('Failed to update', true);
        }
    });
}

function initDeleteProjects() {
    document.querySelectorAll('.admin-delete-btn[data-project-id]').forEach(attachProjectDelete);
}
