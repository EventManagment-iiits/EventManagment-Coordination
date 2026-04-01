(function () {
    'use strict';

    function isBlank(value) {
        return value == null || String(value).trim() === '';
    }

    function isEmail(value) {
        if (isBlank(value)) return false;
        const v = String(value).trim();
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    }

    function isPositiveInt(value) {
        const n = Number(value);
        return Number.isInteger(n) && n > 0;
    }

    function isNonNegativeInt(value) {
        const n = Number(value);
        return Number.isInteger(n) && n >= 0;
    }

    function minLen(value, n) {
        if (isBlank(value)) return false;
        return String(value).trim().length >= n;
    }

    function maxLen(value, n) {
        if (isBlank(value)) return true;
        return String(value).trim().length <= n;
    }

    function isUrl(value) {
        if (isBlank(value)) return false;
        const v = String(value).trim();
        if (v.startsWith('data:image/')) return true;
        return /^(https?:\/\/|\/|\.)/i.test(v);
    }

    function timeOrder(start, end) {
        if (isBlank(start) || isBlank(end)) return false;
        return String(end) > String(start);
    }

    function validate(fields, rules) {
        const errors = {};
        Object.keys(rules).forEach((key) => {
            const validators = rules[key];
            for (const v of validators) {
                const message = v(fields[key], fields);
                if (message) {
                    errors[key] = message;
                    break;
                }
            }
        });
        return errors;
    }

    const required = (label) => (value) => (isBlank(value) ? `${label} is required.` : null);
    const email = () => (value) => (isBlank(value) ? 'Email is required.' : !isEmail(value) ? 'Enter a valid email address.' : null);
    const password = () => (value) => (isBlank(value) ? 'Password is required.' : !minLen(value, 6) ? 'Password must be at least 6 characters.' : null);
    const mustBeChecked = (label) => (value) => (value ? null : `${label} is required.`);
    const positiveInt = (label) => (value) => (isBlank(value) ? `${label} is required.` : !isPositiveInt(value) ? `${label} must be a positive whole number.` : null);
    const nonNegativeInt = (label) => (value) => (isBlank(value) ? `${label} is required.` : !isNonNegativeInt(value) ? `${label} must be 0 or a positive whole number.` : null);
    const maxLength = (label, n) => (value) => (!maxLen(value, n) ? `${label} must be at most ${n} characters.` : null);
    const optionalUrl = (label) => (value) => (isBlank(value) ? null : !isUrl(value) ? `${label} must be a valid URL or /path.` : null);

    window.EMCP = window.EMCP || {};
    window.EMCP.validators = {
        validate,
        required,
        email,
        password,
        mustBeChecked,
        positiveInt,
        nonNegativeInt,
        maxLength,
        optionalUrl,
        timeOrder,
        isEmail,
        isBlank
    };
})();
