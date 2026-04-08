(function () {
    'use strict';
  
     //Ye file UI utilities ka collection hai
     //  — DOM helpers, form errors, toast 
     // notifications, modal behavior, aur
     //  formatting.




    function qs(sel, root = document) {
        return root.querySelector(sel);
    }

    function qsa(sel, root = document) {
        return Array.from(root.querySelectorAll(sel));
    }

    function escapeHtml(str) {
        return String(str)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function formatDate(isoDate) {
        if (!isoDate) return '';
        const d = new Date(isoDate + 'T00:00:00');
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
    }

    function formatTime(hhmm) {
        if (!hhmm) return '';
        const [h, m] = String(hhmm).split(':').map(Number);
        const d = new Date();
        d.setHours(h || 0, m || 0, 0, 0);
        return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }

    function toast(message, type = 'info') {
        const region = document.getElementById('toast-region');
        if (!region) return;
        const el = document.createElement('div');
        el.className = `toast toast-${type}`;
        el.textContent = message;
        region.appendChild(el);
        window.setTimeout(() => el.classList.add('show'), 10);
        window.setTimeout(() => {
            el.classList.remove('show');
            window.setTimeout(() => el.remove(), 250);
        }, 3200);
    }

    function clearFormErrors(form) {
        if (!form) return;
        qsa('[data-error-for]', form).forEach((s) => (s.textContent = ''));
        qsa('.is-invalid', form).forEach((i) => i.classList.remove('is-invalid'));
        const summary = qs('.form-error-summary', form) || document.getElementById(form.id + '-summary');
        if (summary) summary.classList.add('hidden');
        if (summary) summary.textContent = '';
    }

    function setFormErrors(form, errors, summaryEl) {
        if (!form) return;
        Object.keys(errors).forEach((key) => {
            const msg = errors[key];
            const field = qs(`[name="${key}"]`, form) || document.getElementById(key);
            const err = qs(`[data-error-for="${key}"]`, form);
            if (field) field.classList.add('is-invalid');
            if (err) err.textContent = msg;
        });

        const keys = Object.keys(errors);
        if (keys.length > 1 && summaryEl) {
            summaryEl.textContent = `Please fix ${keys.length} errors and try again.`;
            summaryEl.classList.remove('hidden');
        }

        const firstKey = keys[0];
        const first = qs(`[name="${firstKey}"]`, form) || document.getElementById(firstKey);
        if (first && typeof first.focus === 'function') first.focus();
    }

    function initModal() {
        const modal = document.getElementById('modal');
        const closeBtn = document.getElementById('modal-close');
        if (!modal) return null;

        let activeController = null;

        function close() {
            modal.classList.add('hidden');
            if (activeController) {
                activeController.abort();
                activeController = null;
            }
            const form = document.getElementById('modal-form');
            if (form) form.innerHTML = '';
            const body = document.getElementById('modal-body');
            if (body) body.innerHTML = '';
            modal.querySelector('.modal-content')?.classList?.remove('modal-wide');
        }

        function open({ title, formHtml, onSubmit, wide = false }) {
            // Clean up any previous modal state
            if (activeController) {
                activeController.abort();
                activeController = null;
            }

            const titleEl = document.getElementById('modal-title');
            if (titleEl) titleEl.textContent = title || 'Modal';
            if (wide) modal.querySelector('.modal-content')?.classList?.add('modal-wide');

            const form = document.getElementById('modal-form');
            if (form) {
                form.innerHTML = formHtml || '';
                if (typeof onSubmit === 'function') {
                    activeController = new AbortController();
                    form.addEventListener(
                        'submit',
                        (e) => {
                            e.preventDefault();
                            onSubmit(form);
                        },
                        { signal: activeController.signal }
                    );
                }
            }

            modal.classList.remove('hidden');
        }

        closeBtn?.addEventListener('click', close);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) close();
        });

        return { open, close, el: modal };
    }

    window.EMCP = window.EMCP || {};
    window.EMCP.ui = {
        qs,
        qsa,
        toast,
        escapeHtml,
        formatDate,
        formatTime,
        clearFormErrors,
        setFormErrors,
        initModal
    };
})();
