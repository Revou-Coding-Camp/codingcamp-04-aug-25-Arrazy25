document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('todo-form');
    const taskInput = document.getElementById('task-input');
    const dateInput = document.getElementById('date-input');
    const taskList = document.getElementById('task-list');
    const noTaskMessage = document.getElementById('no-task-message');
    const deleteAllBtn = document.getElementById('delete-all');
    const filterButtons = document.querySelectorAll('.controls .btn');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const renderTasks = (filter = 'all') => {
        taskList.innerHTML = '';
        const filteredTasks = tasks.filter(task => {
            if (filter === 'all') return true;
            if (filter === 'completed') return task.completed;
            if (filter === 'pending') return !task.completed;
        });

        if (filteredTasks.length === 0) {
            noTaskMessage.style.display = 'block';
        } else {
            noTaskMessage.style.display = 'none';
            filteredTasks.forEach((task, index) => {
                const listItem = document.createElement('li');
                listItem.className = `task-item ${task.completed ? 'completed' : ''}`;
                listItem.innerHTML = `
                    <div class="task-details">
                        <span class="task-text">${task.text}</span>
                        <span class="task-date">${task.date}</span>
                    </div>
                    <div class="task-actions">
                        <button class="action-btn complete-btn" data-index="${index}">✓</button>
                        <button class="action-btn delete-item-btn" data-index="${index}">✗</button>
                    </div>
                `;
                taskList.appendChild(listItem);
            });
        }
    };

    const addTask = (e) => {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        const taskDate = dateInput.value;

        if (taskText === '' || taskDate === '') {
            alert('Tugas dan tanggal tidak boleh kosong!');
            return;
        }

        const newTask = {
            text: taskText,
            date: taskDate,
            completed: false
        };
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        taskInput.value = '';
        dateInput.value = '';
    };

    const handleTaskActions = (e) => {
        if (e.target.classList.contains('complete-btn')) {
            const index = e.target.dataset.index;
            tasks[index].completed = !tasks[index].completed;
            saveTasks();
            renderTasks();
        }

        if (e.target.classList.contains('delete-item-btn')) {
            const index = e.target.dataset.index;
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        }
    };

    const handleFilter = (e) => {
        filterButtons.forEach(btn => btn.classList.remove('active-filter'));
        e.target.classList.add('active-filter');
        const filter = e.target.id.replace('filter-', '');
        renderTasks(filter);
    };

    const deleteAllTasks = () => {
        if (confirm('Apakah Anda yakin ingin menghapus semua tugas?')) {
            tasks = [];
            saveTasks();
            renderTasks();
        }
    };

    taskForm.addEventListener('submit', addTask);
    taskList.addEventListener('click', handleTaskActions);
    deleteAllBtn.addEventListener('click', deleteAllTasks);
    filterButtons.forEach(btn => btn.addEventListener('click', handleFilter));

    renderTasks();
});