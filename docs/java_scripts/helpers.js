// Date and time helpers
export const dateHelpers = {
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

    },

    formatDateTime: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    isToday: (dateString) => {
        const today = new Date();
        const date = new Date(dateString);
        return date.toDateString() === today.toDateString();
    },

    isThisWeek: (dateString) => {
        const today = new Date();
        const date = new Date(dateString);
        const diffTime = date - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
    },

    daysUntil: (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = new Date(dateString);
        date.setHours(0, 0, 0, 0);
        const diffTime = date - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
};

//Duration formatting helpers
export const durationHelpers = {
    formatMinutes: (minutes) => {
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            if (mins === 0) {
                return `${hours} hour${hours !== 1 ? 's' : ''}`;
            } else {
                return `${hours}h ${mins}m`;
            }
        }
    },

    parseDuration: (durationString) => {
        //parse strings like "2 hours 30 min 90 min"
        const hoursMatch = durationString.match(/(\d+)\s*h/);
        const minutesMatch = durationString.match(/(\d+)\s*m/);

        let totalMinutes = 0;
        if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60;
        if (minutesMatch) totalMinutes += parseInt(minutesMatch[1]);

        return totalMinutes || parseInt(durationString) || 0;
    },

    convertToHours: (minutes) => {
        return (minutes / 60).toFixed(1);
    },

    convertToMinutes: (hours) => {
        return Math.round(hours * 60);
    }
};

//DOM helpers
export const domHelpers = {
    showElement: (element) => {
        if (element) element.style.display = '';
    },

    hideElement: (element) => {
        if (element) element.style.display = 'none';
    },

    toggleElement: (element) => {
        if (element) {
            element.style.display = element.style.display === 'none' ? '' : 'none';
        }
    },

    setLoading: (element, isLoading) => {
        if (element) {
            if (isLoading) {
                element.classList.add('loading');
                element.disabled = true;
            } else {
                element.classList.remove('loading');
                element.disabled = false;
            }
        }
    },

    scrollToElement: (elementId, behavior = 'smooth') => {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior, block: 'start' });
        }
    }
};

//Storage helpers
export const storageHelpers = {
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    },

    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    },

    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch {
            return false;
        }
    }
};

//Error handling helpers

export const errorHelpers = {
    handleError: (error, userMessage = 'An error occurred') => {
        console.error('Application error:', error);

        //send this to an error tarcking device
        //logErrorToService

        return userMessage;
    },

    showErrorToast: (message, duration = 5000) => {
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 4px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            `;

            document.body.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, duration);
    }
};


//Accessibilty helpers
export const a11yHelpers = {
    announceToScreenReader: (message, priority = 'polite') => {
        //create or updateARIA live region
        let liveRegion = document.getElementById('a11y-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'a11y-live-region';
            liveRegion.setAttribute('aria-live', priority);
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.cssText = `
                position: absolute;
                left: -10000px;
                width: 1px;
                height: 1px;
                overflow: hidden;
            `;
            document.body.appendChild(liveRegion);
        }

        liveRegion.textContent = message;

        // clear message after a delay

        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    },

    trapFocus: (element) => {
        //simple focus trap for modals
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length -1];

        element.addEventListener('keydown', (e) => {
            if (e.key == 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });

        firstElement.focus();
    }
};

//Export all helpers as a single object
export default {
    dateHelpers,
    durationHelpers,
    domHelpers,
    storageHelpers,
    errorHelpers,
    a11yHelpers
};
