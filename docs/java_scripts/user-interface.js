import { highlightMatches } from './search.js';
import { validateForm } from './validators.js';

export class UserInterface {
    constructor(taskManager, dataManager) {
        this.taskManager = taskManager;
        this.dataManager = dataManager;
        this.elements = this.cacheDOM();
    }

    cacheDOM() {
        return {
            //form elements
            taskForm: document.getElementById('task-form'),
            titleInput: document.getElementById('title'),
            dueDateInput: document.getElementById('due-date'),
            durationInput: document.getElementById('duration'),
            tagsInput: document.getElementById('tag'),

            //task container
            tasksContainer: document.getElementById('tasks-container'),

            // serch and sort
            searchInput: document.getElementById('search-input'),
            sortSelect: document.getElementById('sort-select'),
            sortDirection: document.getElementById('sort-direction'),

            //stats
            statsTotal: document.getElementById('stats-total'),
            statsDuration: document.getElementById('stats-duration'),
            statsTopTag: document.getElementById('stats-top-tag'),

            //settinngs
            exportBtn: document.getElementById('export-data'),
            importBtn: document.getElementById('import-data'),
            clearBtn: document.getElementById('clear-data'),
            importFile: document.getElementById('import-file'),
            importStatus: document.getElementById('import-status'),
            weeklyTarget: document.getElementById('weekly-target'),
            updateTarget: document.getElementById('update-target'),
            targetStatus: document.getElementById('target-status'),
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text')
            
        };
    }

    bindEvents() {
        //form submission
        this.elements.taskForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.elements.titleInput.addEventListener('blur', (e) => this.validateField('title', e.target.value));
        this.elements.dueDateInput.addEventListener('change', (e) => this.validateField('dueDate', e.target.value));
        this.elements.durationInput.addEventListener('blur', (e) => this.validateField('duration', e.target.value));
        this.elements.tagsInput.addEventListener('blur', (e) => this.validateField('tag', e.target.value));

        //search and sort

        this.elements.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        this.elements.sortSelect.addEventListener('change', (e) => this.handleSort(e));
        this.elements.sortDirection.addEventListener('click', (e) => this.toggleSortDirection(e));

        //settings
        this.elements.exportBtn.addEventListener('click', () => this.exportData());
        this.elements.importBtn.addEventListener('click', () => this.elements.importFile.click());
        this.elements.importFile.addEventListener('change', (e) => this.importData(e));
        this.elements.clearBtn.addEventListener('click', () => this.clearData());
        this.elements.updateTarget.addEventListener('click', () => this.updateTargetProgress());

        // set default date to today
        this.elements.dueDateInput.valueAsDate = new Date();
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const formData = {
            title: this.elements.titleInput.value.trim(),
            dueDate: this.elements.dueDateInput.value,
            duration: parseInt(this.elements.durationInput.value),
            tags: this.elements.tagsInput.value.trim()
        };

        // validate all fields
        const errors = validateForm(formData);
        const hasErrors = Object.keys(errors).length > 0;

        //show errors
        this.showFieldErrors(errors);

        if (!hasErrors) {
            this.taskManager.addTask(formData);
            this.renderTasks();
            this.updateStats();
            this.elements.taskForm.reset();
            this.elements.dueDateInput.valueAsDate = new Date();

            this.showMessage('task added successfully!', 'success');
        }
    }

    validateField(field, value) {
        const errors = validateForm({ [field]: value });
        this.showFieldErrors(errors);
    }

    showFieldErrors(errors) {
        //clear all errors first
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });

        // show new errors
        Object.entries(errors).forEach(([field, error]) => {
            const errorElement = document.getElementById(`${field}-error`);
            if (errorElement) {
                errorElement.textContent = error;
            }
        });
    }

    handleSearch(e) {
        this.taskManager.searchTasks(e.target.value);
        this.renderTasks();
    }

    handleSort(e) {
        this.taskManager.sortTasks(e.target.value, this.taskManager.currentSort.direction);
        this.renderTasks();
    }

    toggleSortDirection() {
        const newDirection = this.taskManager.currentSort.direction === 'asc' ? 'desc' : 'asc';
        this.taskManager.sortTasks(this.taskManager.currentSort.field, newDirection);
        this.elements.sortDirection.textContent = newDirection === 'asc' ? '⬆' : '⬇';
        this.renderTasks();
    }

    renderTasks() {
        const tasks = this.taskManager.getTasks();
        const searchRegex = this.taskManager.searchTerm ?
            new RegExp(this.taskManager.searchTerm, 'gi') : null;

        if (tasks.length === 0) {
            const searchMessage = this.taskManager.searchTerm ?
                '❌ No tasks match your search. Try adjusting your search terms.':
                '❓ No tasks yet. Add your first task above!';

            this.elements.tasksContainer.innerHTML = `
                <div class="empty-state">
                    <p>${searchMessage}</p>
                </div>
            `;
            return;
        }

        this.elements.tasksContainer.innerHTML = tasks.map(task => `
            <div class="task-card" data-task-id="${task.id}">
               <div class="task-header">
                   <h3 class="task-title">${searchRegex ? this.highlightText(task.title, searchRegex) : task.title} </h3>
                   <div class="task-actions">
                       <button class="btn-edit" aria-label="Edit task" data-id="${task.id}">🖋 </button>
                       <button class="btn-delete" aria-label="Delete task" data-id="${task.id}">🗑</button>
                    </div>
                </div>
                <div class="task-details">
                    <div class="task-due-date">
                        <strong>📅 Due:</strong> ${new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div class="task-duration">
                        <strong>⏳ Duration:</strong> ${this.formatDuration(task.duration)}

                    </div>
                    <div class="task-tag">
                        <span class="tag">🏷 ${searchRegex ? this.highlightText(task.tag, searchRegex) : task.tag} </span>
                    </div>
                </div>

                <div class="task-meta">
                    ⏲ Created: ${new Date(task.createdAt).toLocaleDateString()}
                    ${task.updatedAt !== task.createdAt ?
                        ` . ✏ Updated: ${new Date(task.updatedAt).toLocaleDateString()}` : '' 
                    }

                </div>
            </div>
        `).join('');

        //add event listeners for action button
        this.bindTaskEvents();
    }

    bindTaskEvents() {
        //Edit buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.dataset.id;
                this.editTask(taskId);
            });
        });

        //Delete buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.dataset.id;
                this.deleteTask(taskId);
            });
        });
    }

    editTask(taskId) {
        //simple inline edit - in a real app
        const task = this.taskManager.tasks.find(t => t.id === taskId);
        if (task) {
            const newTitle = prompt('Edit task title:', task.title);
            if (newTitle !== null && newTitle.trim() !== '') {
                const errors = validateForm({ title: newTitle.trim() });
                if (errors.title) {
                    this.showMessage(`Error: ${errors.title}`, `error`);
                } else {
                    this.taskManager.updateTask(taskId, { title: newTitle.trim() });
                    this.renderTasks();
                    this.updateStats();
                    this.showMessage('Task updated successfully!', 'success');
                }
            }
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.taskManager.deleteTask(taskId);
            this.renderTasks();
            this.updateStats();
            this.showMessage('Task delete succesfully!', 'success');
        }
    }

    highlightText(text, regex) {
        return text.replace(regex, match => `<mark>${match}</mark>`);
    }

    formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
    }

    updateStats() {
        const stats = this.taskManager.getStats();

        this.elements.statsTotal.textContent = stats.totalTasks;
        this.elements.statsDuration.textContent = this.formatDuration(stats.totalDuration);
        this.elements.statsTopTag.textContent = stats.topTag;

        this.updateTargetProgress();
    }

    updateTargetProgress() {
        const targetHours = parseInt(this.elements.weeklyTarget.value) || 20;
        const totalMinutes = this.taskManager.getStats().totalDuration;
        const targetMinutes = targetHours * 60;
        const progress = Math.min((totalMinutes / targetMinutes) * 100, 100);
        this.elements.progressFill.style.width = `${progress}%`;
        const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
        this.elements.progressText.textContent= `${totalHours}/${targetHours} hours`;

        //update Aria live region
        if (totalMinutes > targetMinutes) {
            const overage = totalMinutes - targetMinutes;
            const overageHours = Math.round(overage / 60 * 10) / 10;
            this.elements.targetStatus.textContent = `🚨 Warning: You've exceeded your weekly target by ${overageHours} hours`;
            this.elements.targetStatus.style.color = 'var(--error-color)';
            this.elements.progressFill.style.backgroundColor = 'var(--error-color)';
        } else if (progress >= 80) {
            this.elements.targetStatus.textContent = "🟡 You are reaching your weekly target";
            this.elements.targetStatus.style.color = 'var(--warning-color)';
            this.elements.progressFill.style.backgroundColor = 'var(--warning-color)';
        } else {
            const remaining = targetHours - totalHours;
            this.elements.targetStatus.textContent = `🎉 You have ${remaining} hours remaining in your weekly target`;
            this.elements.progressFill.style.backgroundColor = 'var(--success-color)';
        }
    }

    exportData() {
        const data = this.taskManager.getAllTasks();
        if (data.length === 0) {
            this.showMessage('No data to export', 'warning');
            return;
        }

        if (this.dataManager.exportToJSON(data)) {
            this.showMessage('Data exported successfully!', 'success');
        } else {
            this.showMessage('Error exporting data', 'error');
        }
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                const validation = this.dataManager.validateImportedData(importedData);

                if (validation.valid) {
                    this.taskManager.tasks = importedData;
                    this.taskManager.applyFilters();
                    this.taskManager.saveData(importedData);
                    this.renderTasks();
                    this.updateStats();
                    this.showMessage('Data imported successfully!', 'success');

                    this.elements.importStatus.textContent = 'Import succesful';
                } else {
                    this.showMessage(`Import failed: ${validation.error}`, 'error');
                }
            } catch (error) {
                this.showMessage('Invalid JSON file', 'error');
                this.elements.importStatus.textContent = 'Error: Invalid JSON file';
            }
        };
        reader.readAsText(file);

        //Reset file input
        event.target.value = '';
    }

    clearData() {
        if (confirm('are you sure you want to clear all data?'))  {
            this.taskManager.tasks = [];
            this.taskManager.applyFilters();
            this.dataManager.clearAllData();
            this.renderTasks();
            this.updateStats();
            this.showMessage('All data cleared', 'success');
        }
    }

    showMessage(message, type = 'info') {
        //removing existing messages
        document.querySelectorAll('.message').forEach(el => el.remove());

        const messageE1 = document.createElement('div');
        messageE1.className = `message message-${type}`;
        messageE1.textContent = message;
        messageE1.setAttribute('role', 'alert');
        messageE1.setAttribute('aria-live', 'polite');

        document.body.appendChild(messageE1);

        setTimeout(() => {
            messageE1.remove();
        }, 4000);
    }
}
