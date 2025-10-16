export const validators = {
    //Title: no leading/trailing spaces, no double spaces
    title: (value) => {
        if (!value || value.trim() === '') {
            return "Title is required";
        }

        const trimmed = value.trim();
        if (trimmed.length < 2) {
            return "Title must be at least 2 characters long";
        }

        // check for leading/trailing spaces
        if (value !== trimmed) {
            return "Title can't have leading or trailing spaces";
        }

        // check for multiple spaces

        if (/\s{2,}/.test(value)) {
            return " Title can't have multiple consecutive spaces";
        }

        //Advanced: check for duplicate words
        const duplicateWords = /\b(\w+)\s+\1\b/i;
        if (duplicateWords.test(value)) {
            return "Title contains duplicate words";
        }

        return null;
        
    },
    //Duration: must be a positive whole number 
    duration: (value) => {
        if (!value && value !== 0) {
            return "Duration is required";
        }

        const numValue = parseInt(value);
        if (isNaN(numValue)) {
            return "Duration must be a number";
        }

        const regex = /^(0|[1-9]\d*)$/;
        if (!regex.test(value) || numValue <= 0) {
            return "Duration must be a positive whole number";
        }

        if (numValue > 1440) {
            return "Duration cant exceed 24 hours (1440 minutes)";
        }

        return null;
    },

    // Date: yyyy-mm-dd format and must not be in the past
    dueDate: (value) => {
        if (!value) {
            return "Due date is Required";
        }

        const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
        if (!regex.test(value)) {
            return "Date must be in YYYY-MM-DD format";
        }

        //Additional validation for actual valid dates
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // reset time part for comaprison

        if (isNaN(date.getTime())) {
            return "Invalid date";
        }

        //check if date is in the past
        if (date < today) {
            return "Due date cant be in the past";
        }

        return null;

    },

        // Tag: letters, spaces, hypens
        tag: (value) => {
            if (!value || value.trim() === '') {
                return "tag is required";
            }

            const trimmed = value.trim();
            if (trimmed.length < 2) {
                return "Tag must be at least 2 characters long";
            }

            if (trimmed.length > 20) {
                return "Tag cant exceed 20 characters";
            }

            const regex = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
            if (!regex.test(trimmed)) {
                return "Tag can only contain letters, spaces, and hyphens";
            }

            return null;
        }

    };

    export function ValidateForm(formData) {
        const errors = {};

        for (const [field, value] of Object.entries(formData)) {
            if (validators[field]) {
                const error = validators[field](value);
                if (error) {
                    errors[field] = error;
                }
            }
        }

        return errors;
    }

    //validation for search patterns
    export function validateSearchPattern(pattern) {
        if (!pattern || pattern.trim() === '') {
            return null;
        }

        try {
            new RegExp(pattern);
            return null;
        } catch (error) {
            return "Invalid regex pattern";
        }
    }
