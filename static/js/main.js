// Project Management Tool - Frontend Logic

class ProjectManager {
    constructor() {
        this.currentProject = null;
        this.ganttChart = null;
        this.activeTimer = null;
        this.timerStartTime = null;
        
        this.init();
    }

    async init() {
        this.initializeTheme();
        await this.loadProjects();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadProjects();
        });

        document.getElementById('project-select').addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadProject(e.target.value);
            } else {
                this.showAllProjectsView();
            }
        });

        document.getElementById('stop-timer').addEventListener('click', () => {
            this.stopTimer();
        });

        document.getElementById('theme-select').addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });
    }

    initializeTheme() {
        // Load saved theme or use default
        const savedTheme = localStorage.getItem('pm-theme') || 'blue';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Set the select value
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.value = savedTheme;
        }
    }

    changeTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('pm-theme', theme);
        
        // Re-render gantt chart with new theme if one exists
        if (this.ganttChart && this.currentProject) {
            setTimeout(() => {
                this.renderGanttChart(this.currentProject.tasks);
            }, 100);
        }
    }

    async loadProjects() {
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            
            this.populateProjectSelect(data.projects);
            
            if (data.projects.length === 0) {
                this.showEmptyState();
            } else {
                this.showAllProjectsView(data.projects);
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    populateProjectSelect(projects) {
        const select = document.getElementById('project-select');
        select.innerHTML = '<option value="">All Projects</option>';
        
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            select.appendChild(option);
        });
    }

    showEmptyState() {
        document.getElementById('gantt').innerHTML = `
            <div class="empty-state">
                <h3>📝 No Projects Yet</h3>
                <p>Use Claude Code to create your first project:</p>
                <code>Claude, I need to plan a project for...</code>
            </div>
        `;
        
        document.getElementById('task-list').innerHTML = `
            <p>No tasks available</p>
        `;
    }

    showAllProjectsView(projects = []) {
        document.getElementById('current-project').textContent = 'All Projects Overview';
        
        if (projects.length === 0) {
            this.showEmptyState();
            return;
        }

        // Create a simple overview for all projects
        const ganttContainer = document.getElementById('gantt');
        ganttContainer.innerHTML = `
            <div class="projects-overview">
                ${projects.map(project => `
                    <div class="project-card" onclick="projectManager.loadProject('${project.id}')">
                        <h4>${project.name}</h4>
                        <span class="project-status ${project.status}">${project.status}</span>
                        <small>Created: ${new Date(project.created).toLocaleDateString()}</small>
                    </div>
                `).join('')}
            </div>
        `;

        document.getElementById('task-list').innerHTML = `
            <p>Select a project to see tasks and start timers</p>
        `;
    }

    async loadProject(projectId) {
        try {
            const response = await fetch(`/api/project/${projectId}`);
            const data = await response.json();
            
            if (data.error) {
                alert('Project not found');
                return;
            }

            this.currentProject = data.project;
            document.getElementById('current-project').textContent = this.currentProject.name;
            
            this.renderGanttChart(this.currentProject.tasks);
            this.renderTaskList(this.currentProject.tasks);
            
            // Update select to show current project
            document.getElementById('project-select').value = projectId;
            
        } catch (error) {
            console.error('Error loading project:', error);
        }
    }

    renderGanttChart(tasks) {
        if (!tasks || tasks.length === 0) {
            document.getElementById('gantt').innerHTML = '<p>No tasks in this project</p>';
            return;
        }

        // Convert tasks to Frappe Gantt format
        const ganttTasks = tasks.map(task => ({
            id: task.id,
            name: task.name,
            start: task.start,
            end: task.end,
            progress: task.completed ? 100 : 0,
            dependencies: task.dependencies || []
        }));

        // Create Gantt chart
        this.ganttChart = new Gantt("#gantt", ganttTasks, {
            header_height: 50,
            column_width: 30,
            step: 24,
            view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
            bar_height: 20,
            bar_corner_radius: 3,
            arrow_curve: 5,
            padding: 18,
            view_mode: 'Day',
            date_format: 'YYYY-MM-DD',
            on_click: (task) => {
                this.selectTask(task.id);
            },
            on_date_change: (task, start, end) => {
                console.log('Date changed:', task.id, start, end);
                // Could implement auto-save here
            }
        });
    }

    renderTaskList(tasks) {
        const taskListContainer = document.getElementById('task-list');
        
        if (!tasks || tasks.length === 0) {
            taskListContainer.innerHTML = '<p>No tasks in this project</p>';
            return;
        }

        taskListContainer.innerHTML = `
            <div class="task-actions">
                ${tasks.map(task => `
                    <div class="task-item ${task.completed ? 'completed' : ''}">
                        <label class="task-checkbox">
                            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                                   onchange="projectManager.toggleTask('${task.id}')">
                            <span class="task-name">${task.name}</span>
                        </label>
                        <div class="task-controls">
                            <button class="timer-btn" onclick="projectManager.startTimer('${task.id}', '${task.name}')">
                                ⏰ Start
                            </button>
                            <span class="time-spent">${this.formatTime(task.timeSpent || 0)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    selectTask(taskId) {
        console.log('Task selected:', taskId);
        // Could highlight the task in the list
    }

    async toggleTask(taskId) {
        if (!this.currentProject) return;

        try {
            const response = await fetch(`/api/project/${this.currentProject.id}/task/${taskId}/toggle`, {
                method: 'POST'
            });

            if (response.ok) {
                // Update local state
                const task = this.currentProject.tasks.find(t => t.id === taskId);
                if (task) {
                    task.completed = !task.completed;
                    // Re-render Gantt to show progress change
                    this.renderGanttChart(this.currentProject.tasks);
                }
            }
        } catch (error) {
            console.error('Error toggling task:', error);
        }
    }

    startTimer(taskId, taskName) {
        if (this.activeTimer) {
            alert('Stop the current timer first');
            return;
        }

        this.activeTimer = taskId;
        this.timerStartTime = new Date();
        
        // Show timer display
        const timerDisplay = document.getElementById('timer-display');
        timerDisplay.classList.remove('hidden');
        document.getElementById('timer-task').textContent = taskName;
        
        // Start timer update
        this.timerInterval = setInterval(() => {
            const elapsed = new Date() - this.timerStartTime;
            document.getElementById('timer-time').textContent = this.formatTime(elapsed / 1000 / 60);
        }, 1000);
    }

    async stopTimer() {
        if (!this.activeTimer || !this.timerStartTime) return;

        const endTime = new Date();
        const duration = (endTime - this.timerStartTime) / 1000 / 60; // minutes

        try {
            await fetch(`/api/project/${this.currentProject.id}/task/${this.activeTimer}/time`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    start: this.timerStartTime.toISOString(),
                    end: endTime.toISOString(),
                    duration: Math.round(duration)
                })
            });

            // Update task time in UI
            const task = this.currentProject.tasks.find(t => t.id === this.activeTimer);
            if (task) {
                task.timeSpent = (task.timeSpent || 0) + Math.round(duration);
                this.renderTaskList(this.currentProject.tasks);
            }

        } catch (error) {
            console.error('Error logging time:', error);
        }

        // Reset timer
        clearInterval(this.timerInterval);
        this.activeTimer = null;
        this.timerStartTime = null;
        document.getElementById('timer-display').classList.add('hidden');
    }

    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = Math.floor(minutes % 60);
        const secs = Math.floor((minutes % 1) * 60);
        
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        } else if (mins > 0) {
            return `${mins}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }
}

// Initialize when page loads
let projectManager;
document.addEventListener('DOMContentLoaded', () => {
    projectManager = new ProjectManager();
});