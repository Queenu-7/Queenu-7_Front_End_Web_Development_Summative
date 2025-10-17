import { safeRegexCompile } from './search.js';

export class TaskManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.tasks= [];
        this.currentSort = { field: 'dueDate', direction: 'asc' };
        this.searchTerm = '';
        this.filteredTasks = [];
    }

    addTask(taskData) {
        const now = new Date().toISOString();
        const task = {
            id: this.dataManager.generateId(),
            createdAt: now,
            updatedAt: now,
            ...taskData
        };    
    
        this.tasks.push(task);
        this.applyFilters();
        this.dataManager.saveData(this.tasks);
        return task;
    }

    updateTask(id, updates) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = {
                ...this.tasks[taskIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.applyFilters();
            this.dataManager.saveData(this.tasks);
            return this.tasks[taskIndex];
        }
        return null;
    }


    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.applyFilters();
        this.dataManager.saveData(this.tasks);
    }

    sortTasks(field, direction ='asc') {
        this.currentSort = { field, direction };
        this.applyFilters();
    }

    searchTasks(term) {
        this.searchTerm = term;
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...this.tasks];

        //Apply search
        if (this.searchTerm) {
            const searchRegex = safeRegexCompile(this.searchTerm);
            if (searchRegex) {
                filtered = filtered.filter(task =>
                    searchRegex.test(task.title) ||
                    searchRegex.test(task.tag)
                );
            }

        }

        //Apply sorting
        filtered.sort((a,b) => {
            let aval = a[this.currentSort.field];
            let bval = b[this.currentSort.field];

            if (this.currentSort.field === 'dueDate') {
                aval = new Date(aval);
                bval = new Date(bval);
            }
            
            if (aval < bval) return this.currentSort.direction === 'asc' ? -1 : 1;
            if (aval > bval) return this.currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        this.filteredTasks = filtered;
    }

    getTasks() {
        return this.filteredTasks;
    }

    getAllTasks() {
        return this.tasks;
    }

    getStats() {
        const tasks = this.tasks;
        const totalTasks = tasks.length;
        const totalDuration = tasks.reduce((sum, task) => sum + task.duration, 0);

        //Find Top tag
        const tagCounts = {};
        tasks.forEach(task => {
            tagCounts[task.tag] = (tagCounts[task.tag] || 0) + 1;
        });

        const topTag = Object.keys(tagCounts).reduce((a,b) =>
        tagCounts[a] > tagCounts[b] ? a : (tagCounts[b] > tagCounts[a] ? b : a),
    'None'
        );

        return {
            totalTasks,
            totalDuration,
            topTag
        };
    }
}
