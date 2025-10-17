const STORAGE_KEY = 'campus-life-planner-data';

export class DataManager {
    //Load data from localStorage
    loadData() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed : [];
            }
            return [];
        } catch (error) {
            console.error('Error loading from localStorage', error);
            return []; // Return empty if nothing found
        }
    }

    //Save data array to localStorage

    saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data to LocalStorage:', error);
            return false;
        }
    }
    
    //Generating a unique ID for a task
    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    //Export data as a downloadable JSON file

    exportToJSON(data, filename = 'campus-life-planner-data.json') {
        try {
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Error exporting data:', error);
            return false;
        }
    }
    
    //Validate the structure and types of imported data
    validateImportedData(data) {
        if (!Array.isArray(data)) {
            return { valid: false, error: 'Data must be an array' };
        }

        const requiredFields = ['id', 'title', 'dueDate', 'duration', 'tag', 'createdAt', 'updatedAt' ];

        for (const item of data) {
            if (typeof item !== 'object' || item === null) {
                return { valid: false, error: 'All items must be objects'};
            }
            
            //Make sure each required field is present
            for (const field of requiredFields) {
                if (!(field in item)) {
                    return { valid: false, error: `missing required field: ${field}` };
                }
            }

            //Checking if certain fields have have the correct data types
            if (typeof item.title !== 'string' ||
                typeof item.duration !== 'number' ||
                typeof item.tag !== 'string') {
                return { valid: false, error: 'Invalid data types' };
            }

            // Check if dueDate has a valid YYYY-MM-DD format
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(item.dueDate)) {
                return { valid: false, error: 'Invalid date  format in dueDate'};
            }
            
        }

        return { valid: true }; // All checks passed
    }
    
    //Remove all saved data from Storage
    clearAllData() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }
}
