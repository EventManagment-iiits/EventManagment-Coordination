(function () {
    'use strict';

    const { validate, email, password } = window.EMCP.validators;
    const { toast, clearFormErrors, setFormErrors } = window.EMCP.ui;

    function readQueryMessage() {
        const params = new URLSearchParams(window.location.search);
        return params.get('msg');
    }

    function bindPasswordToggle() {
        const toggle = document.getElementById('toggle-password');
        const input = document.getElementById('password');
        if (!toggle || !input) return;
        toggle.addEventListener('click', () => {
            input.type = input.type === 'password' ? 'text' : 'password';
        });
    }

    function bindDemoButtons() {
        const google = document.getElementById('google-btn');
        const ms = document.getElementById('microsoft-btn');
        const msg = 'Social login is not available in the mock prototype.';
        google?.addEventListener('click', () => toast(msg, 'info'));
        ms?.addEventListener('click', () => toast(msg, 'info'));

        const forgot = document.getElementById('forgot-password');
        forgot?.addEventListener('click', (e) => {
            e.preventDefault();
            toast('Password reset is not available in the mock prototype.', 'info');
        });
    }

    function bindLogin() {
        const form = document.getElementById('login-form');
        if (!form) return;

        const summary = document.getElementById('login-summary');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            clearFormErrors(form);

            const fields = {
                email: form.email?.value,
                password: form.password?.value
            };

            const errors = validate(fields, {
                email: [email()],
                password: [password()]
            });

            if (Object.keys(errors).length > 0) {
                setFormErrors(form, errors, summary);
                return;
            }

            const res = window.EMCP.repo.login(fields.email, fields.password);
            if (!res.ok) {
                setFormErrors(form, { password: 'Invalid credentials. Try a demo account listed below.' }, summary);
                return;
            }

            window.EMCP.session.setCurrentUser(res.user);
            toast(`Welcome, ${res.user.name}.`, 'success');
            window.EMCP.session.redirectToDashboard(res.user);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const msg = readQueryMessage();
        if (msg) toast(msg, 'info');
        bindPasswordToggle();
        bindDemoButtons();
        bindLogin();

        // If already logged in, go to dashboard.
        const user = window.EMCP.session.getCurrentUser();
        if (user) window.EMCP.session.redirectToDashboard(user);
    });
})();
