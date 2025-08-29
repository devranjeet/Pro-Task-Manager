document.addEventListener('DOMContentLoaded', () => {

    // --- DOM ELEMENT SELECTION ---
    const projectList = document.getElementById('project-list');
    const taskList = document.getElementById('task-list');
    const projectTitle = document.getElementById('project-title');
    const addProjectBtn = document.getElementById('add-project-btn');
    const addTaskBtnMain = document.getElementById('add-task-btn-main');
    const modal = document.getElementById('task-modal');
    const taskForm = document.getElementById('task-form');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const exportBtn = document.getElementById('export-csv');

    // --- STATE MANAGEMENT ---
    let state = {
        projects: [],
        tasks: [],
        selectedProjectId: 'all',
        searchTerm: '',
        sortOrder: 'due-date',
        theme: 'light'
    };
    
    // --- INITIALIZATION ---
    loadStateFromStorage();
    initializeTheme();
    render();

    // --- EVENT LISTENERS ---

    // Add Project
    addProjectBtn.addEventListener('click', () => {
        const projectName = prompt('Enter new project name:');
        if (projectName && projectName.trim()) {
            addProject(projectName.trim());
        }
    });

    // Select Project OR Delete Project (Event Delegation)
    projectList.addEventListener('click', e => {
        const deleteBtn = e.target.closest('.delete-project-btn');
        const projectItem = e.target.closest('.project-item');
        
        if (deleteBtn) {
            const projectId = projectItem.dataset.id;
            deleteProject(projectId);
        } else if (projectItem) {
            state.selectedProjectId = projectItem.dataset.id;
            render();
        }
    });

    // Open Add/Edit Modal
    addTaskBtnMain.addEventListener('click', () => openModal());
    taskList.addEventListener('click', e => {
        if (e.target.closest('.task-item') && !e.target.closest('.task-actions')) {
            const taskId = e.target.closest('.task-item').dataset.id;
            openModal(taskId);
        }
    });
    
    // Toggle Task Complete & Delete
    taskList.addEventListener('click', e => {
        const completeBtn = e.target.closest('.complete-btn');
        const deleteBtn = e.target.closest('.delete-btn');
        if(completeBtn) {
            const taskId = completeBtn.closest('.task-item').dataset.id;
            toggleTaskComplete(taskId);
        }
        if(deleteBtn) {
            if(confirm('Are you sure you want to delete this task?')) {
                const taskId = deleteBtn.closest('.task-item').dataset.id;
                deleteTask(taskId);
            }
        }
    });

    // Modal Form Submission
    taskForm.addEventListener('submit', handleFormSubmit);
    modalCancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });

    // Theme Toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Search and Sort
    searchInput.addEventListener('input', e => {
        state.searchTerm = e.target.value.toLowerCase();
        renderTasks();
    });
    sortSelect.addEventListener('change', e => {
        state.sortOrder = e.target.value;
        renderTasks();
    });

    // Export
    exportBtn.addEventListener('click', exportToCSV);


    // --- RENDER FUNCTIONS ---
    function render() {
        renderProjects();
        renderTasks();
    }

    function renderProjects() {
        projectList.innerHTML = '';
        
        // "All Tasks" virtual project
        const allTasksCount = state.tasks.length;
        const allTasksItem = createProjectDOM({ id: 'all', name: 'All Tasks' }, allTasksCount);
        projectList.appendChild(allTasksItem);

        state.projects.forEach(project => {
            const taskCount = state.tasks.filter(t => t.projectId === project.id).length;
            const projectItem = createProjectDOM(project, taskCount);
            projectList.appendChild(projectItem);
        });
        updateProjectTitle();
    }

    function createProjectDOM(project, taskCount) {
        const item = document.createElement('li');
        item.className = `project-item ${state.selectedProjectId === project.id ? 'active' : ''}`;
        item.dataset.id = project.id;

        const completedCount = state.tasks.filter(t => t.projectId === project.id && t.isComplete).length;
        const totalTasksInProject = state.tasks.filter(t => t.projectId === project.id).length;
        const progress = totalTasksInProject > 0 ? (completedCount / totalTasksInProject) * 100 : 0;
        
        // Add delete button only for real projects, not "All Tasks"
        const deleteBtnHTML = project.id !== 'all' 
            ? `<button class="delete-project-btn" title="Delete Project">&times;</button>` 
            : '';

        let projectStatsHTML = `<span class="project-task-count">${taskCount} tasks</span>`;
        if (project.id !== 'all') {
             projectStatsHTML += `
                <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: ${progress}%;"></div>
                </div>
             `;
        }

        item.innerHTML = `
            <div class="project-item-header">
                <span class="project-name">${project.name}</span>
                ${deleteBtnHTML}
            </div>
            ${projectStatsHTML}
        `;
        return item;
    }

    function renderTasks() {
        taskList.innerHTML = '';
        let filteredTasks = state.tasks;

        // Filter by project
        if (state.selectedProjectId !== 'all') {
            filteredTasks = filteredTasks.filter(t => t.projectId === state.selectedProjectId);
        }

        // Filter by search term
        if (state.searchTerm) {
            filteredTasks = filteredTasks.filter(t => 
                t.text.toLowerCase().includes(state.searchTerm) || 
                t.notes.toLowerCase().includes(state.searchTerm)
            );
        }

        // Sort tasks
        filteredTasks.sort((a, b) => {
            if (state.sortOrder === 'priority') {
                const priorityMap = { high: 3, medium: 2, low: 1 };
                return priorityMap[b.priority] - priorityMap[a.priority];
            } else if (state.sortOrder === 'creation-date') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            // Default: due-date
            return new Date(a.dueDate) - new Date(b.dueDate);
        });

        if(filteredTasks.length === 0) {
            taskList.innerHTML = `<li class="empty-state">No tasks found. Time to create one!</li>`;
            return;
        }

        filteredTasks.forEach(task => {
            const taskItem = createTaskDOM(task);
            taskList.appendChild(taskItem);
        });
    }

    function createTaskDOM(task) {
        const item = document.createElement('li');
        item.className = `task-item priority-${task.priority} ${task.isComplete ? 'completed' : ''}`;
        item.dataset.id = task.id;

        const dueDate = new Date(task.dueDate + 'T23:59:59'); // End of day
        const now = new Date();
        const remainingTime = dueDate - now;
        const isOverdue = remainingTime < 0;

        let countdownText = '';
        if (task.isComplete) {
            countdownText = 'Completed';
        } else if (isOverdue) {
            countdownText = `Overdue by ${formatDistance(remainingTime)}`;
        } else {
            countdownText = `${formatDistance(remainingTime)} remaining`;
        }

        const projectName = state.projects.find(p => p.id === task.projectId)?.name || 'N/A';
        const notesHTML = formatNotes(task.notes);

        item.innerHTML = `
            <div class="task-header">
                <span class="task-text">${escapeHTML(task.text)}</span>
                <div class="task-actions">
                    <button class="complete-btn" title="Toggle Complete">${task.isComplete ? '↩️' : '✔️'}</button>
                    <button class="delete-btn" title="Delete Task">🗑️</button>
                </div>
            </div>
            <div class="task-details">
                <span class="countdown ${isOverdue && !task.isComplete ? 'overdue' : ''}">${countdownText}</span>
                <span>|</span>
                <span>Due: ${new Date(task.dueDate).toLocaleDateString()}</span>
                <span>|</span>
                <span>Project: ${projectName}</span>
            </div>
            ${notesHTML ? `<div class="task-notes">${notesHTML}</div>` : ''}
        `;
        return item;
    }
    
    function updateProjectTitle() {
        if (state.selectedProjectId === 'all') {
            projectTitle.textContent = 'All Tasks';
        } else {
            const project = state.projects.find(p => p.id === state.selectedProjectId);
            projectTitle.textContent = project ? project.name : 'All Tasks';
        }
    }


    // --- CORE LOGIC FUNCTIONS ---
    
    function addProject(name) {
        const newProject = { id: Date.now().toString(), name };
        state.projects.push(newProject);
        state.selectedProjectId = newProject.id;
        saveStateToStorage();
        render();
    }
    
    // NEW function to delete a project and its tasks
    function deleteProject(projectId) {
        const project = state.projects.find(p => p.id === projectId);
        const confirmation = confirm(`Are you sure you want to delete the "${project.name}" project? This will also delete all of its tasks permanently.`);
        
        if (confirmation) {
            // Filter out the project
            state.projects = state.projects.filter(p => p.id !== projectId);
            
            // Filter out the tasks associated with the project
            state.tasks = state.tasks.filter(t => t.projectId !== projectId);
            
            // If the deleted project was the selected one, switch to "All Tasks"
            if (state.selectedProjectId === projectId) {
                state.selectedProjectId = 'all';
            }
            
            saveStateToStorage();
            render();
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const taskId = document.getElementById('task-id').value;
        let projectName = document.getElementById('task-project').value.trim();
        let project = state.projects.find(p => p.name.toLowerCase() === projectName.toLowerCase());
        
        if (!project && projectName) {
            project = { id: Date.now().toString(), name: projectName };
            state.projects.push(project);
        }

        const taskData = {
            projectId: project ? project.id : '',
            text: document.getElementById('task-text').value.trim(),
            priority: document.getElementById('task-priority').value,
            dueDate: document.getElementById('task-due-date').value,
            notes: document.getElementById('task-notes').value,
        };

        if (taskId) { // Editing existing task
            const taskIndex = state.tasks.findIndex(t => t.id === taskId);
            state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...taskData };
        } else { // Creating new task
            state.tasks.push({
                ...taskData,
                id: Date.now().toString(),
                isComplete: false,
                createdAt: new Date().toISOString()
            });
        }
        
        saveStateToStorage();
        render();
        closeModal();
    }

    function toggleTaskComplete(taskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if(task) {
            task.isComplete = !task.isComplete;
            saveStateToStorage();
            render();
        }
    }
    
    function deleteTask(taskId) {
        state.tasks = state.tasks.filter(t => t.id !== taskId);
        saveStateToStorage();
        render();
    }

    // --- MODAL & THEME ---

    function openModal(taskId = null) {
        taskForm.reset();
        const projectDatalist = document.getElementById('project-datalist');
        projectDatalist.innerHTML = state.projects.map(p => `<option value="${p.name}"></option>`).join('');

        if (taskId) {
            const task = state.tasks.find(t => t.id === taskId);
            const project = state.projects.find(p => p.id === task.projectId);
            document.getElementById('modal-title').textContent = 'Edit Task';
            document.getElementById('task-id').value = task.id;
            document.getElementById('task-text').value = task.text;
            document.getElementById('task-project').value = project ? project.name : '';
            document.getElementById('task-due-date').value = task.dueDate;
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-notes').value = task.notes;
        } else {
            document.getElementById('modal-title').textContent = 'Add New Task';
            document.getElementById('task-id').value = '';
            document.getElementById('task-due-date').valueAsDate = new Date(); // Today
            if(state.selectedProjectId !== 'all') {
                const project = state.projects.find(p => p.id === state.selectedProjectId);
                if (project) document.getElementById('task-project').value = project.name;
            }
        }
        modal.classList.remove('hidden');
    }

    function closeModal() {
        modal.classList.add('hidden');
    }

    function initializeTheme() {
        if (state.theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }
    }
    
    function toggleTheme() {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        initializeTheme();
        saveStateToStorage();
    }

    // --- UTILITY & DATA PERSISTENCE ---

    function saveStateToStorage() {
        localStorage.setItem('proTaskAppState', JSON.stringify(state));
    }
    
    function loadStateFromStorage() {
        const storedState = localStorage.getItem('proTaskAppState');
        if (storedState) {
            state = JSON.parse(storedState);
        } else {
            // Default state for first-time users
            state = {
                projects: [{id: '1', name: 'Getting Started'}],
                tasks: [{id: '1', projectId: '1', text: 'Explore the new features', priority: 'high', dueDate: new Date().toISOString().split('T')[0], notes: 'Try adding projects, tasks, and using markdown for `code`!', isComplete: false, createdAt: new Date().toISOString()}],
                selectedProjectId: '1', searchTerm: '', sortOrder: 'due-date', theme: 'light'
            };
        }
    }
    
    function formatDistance(ms) {
        const days = Math.floor(Math.abs(ms) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((Math.abs(ms) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    }

    function escapeHTML(str) {
        const p = document.createElement('p');
        p.textContent = str;
        return p.innerHTML;
    }
    
    function formatNotes(notes) {
        if (!notes) return '';
        // Basic markdown for code blocks ```...```
        let html = escapeHTML(notes);
        html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
            return `<pre><code>${code.trim()}</code></pre>`;
        });
        // Basic markdown for inline code `...`
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        return html;
    }

    function exportToCSV() {
        const headers = ['Task_ID', 'Project_Name', 'Task_Name', 'Priority', 'Due_Date', 'Notes', 'Complete_Status', 'Missed_Status', 'Creation_Date'];
        
        const rows = state.tasks.map(task => {
            const project = state.projects.find(p => p.id === task.projectId);
            const isMissed = !task.isComplete && new Date(task.dueDate) < new Date();
            
            return [
                task.id,
                project ? `"${project.name.replace(/"/g, '""')}"` : '""',
                `"${task.text.replace(/"/g, '""')}"`,
                task.priority,
                task.dueDate,
                `"${task.notes.replace(/"/g, '""').replace(/\n/g, ' ')}"`, // Flatten notes for CSV
                task.isComplete ? 'Yes' : 'No',
                isMissed ? 'Yes' : 'No',
                new Date(task.createdAt).toISOString()
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "pro_task_manager_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});