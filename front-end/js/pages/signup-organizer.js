(function () {
    'use strict';

    const { validate, required, email, password, mustBeChecked, maxLength } = window.EMCP.validators;
    const { toast, clearFormErrors, setFormErrors } = window.EMCP.ui;
    const { ROLES } = window.EMCP.constants;

    function bindSignup() {
        const form = document.getElementById('signup-form');
        if (!form) return;

        const summary = document.getElementById('signup-summary');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFormErrors(form);

            const fields = {
                fullName: form.fullName?.value,
                email: form.email?.value,
                orgDept: form.orgDept?.value,
                organizerRole: form.organizerRole?.value,
                password: form.password?.value,
                confirmPassword: form.confirmPassword?.value,
                agree: form.agree?.checked
            };

            const errors = validate(fields, {
                fullName: [required('Full name'), maxLength('Full name', 100)],
                email: [email(), maxLength('Email', 150)],
                orgDept: [required('Organization / Dept'), maxLength('Organization / Dept', 120)],
                organizerRole: [required('Role selection')],
                password: [password()],
                confirmPassword: [required('Confirm password')],
                agree: [mustBeChecked('Agreement')]
            });

            if (!errors.confirmPassword && fields.confirmPassword !== fields.password) {
                errors.confirmPassword = 'Passwords do not match.';
            }

            if (Object.keys(errors).length > 0) {
                setFormErrors(form, errors, summary);
                return;
            }

            const create = await window.EMCP.repo.createUser({
                name: fields.fullName,
                email: fields.email,
                password: fields.password,
                role: ROLES.ORGANIZER,
                status: 'Active',
                orgDept: fields.orgDept
            });

            if (!create.ok) {
                setFormErrors(form, { email: create.error }, summary);
                return;
            }

            toast('Organizer account created. Please log in.', 'success');
            window.location.href = '/login?msg=' + encodeURIComponent('Account created. Log in with your email and password.');
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const user = window.EMCP.session.getCurrentUser();
        if (user) {
            window.location.href = window.EMCP.session.getDashboardForRole(user.role);
            return;
        }
        bindSignup();
    });
})();
