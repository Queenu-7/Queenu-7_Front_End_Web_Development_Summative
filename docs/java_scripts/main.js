import { TaskManager } from './task-manager.js';
import { DataManager } from './data-manager.js';
import { UserInterface } from './user-interface.js';

class CampusLifePlanner {
    constructor() {
        this.dataManager = new DataManager();
        this.taskManager = new TaskManager(this.dataManager);
        this.ui = new UserInterface(this.taskManager, this.dataManager);

        this.init();
    }

    init (){
        //Load data from local storage when the app starts
        const savedTasks = this.dataManager.loadData();
        if (savedTasks.length > 0) {
            this.taskManager.tasks = savedTasks;
        } else {
            // load sample data if no saved data
            this.loadSampleData();
        }

        this.taskManager.applyFilters();
        this.ui.renderTasks();
        this.ui.updateStats();
        this.ui.bindEvents();

        console.log('Campus Life Planner initialized!');

    }

    loadSampleData() {
        // you can add some sample tasks here for testing
        const sampleTasks= [
            {
            id: this.dataManager.generateId(),
            title: 'Study for Math Final',
            dueDate: '2025-10-15',
            duration: 120,
            tag: 'Academic',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
            },
            {
                id: this.dataManager.generateId(),
                title: 'Group Project Meeting',
                dueDate: '2025-12-20',
                duration: 60,
                tag: 'Academic',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        this.taskManager.tasks = sampleTasks;
        this.dataManager.saveData(sampleTasks);

    }
}

// start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CampusLifePlanner();

});
