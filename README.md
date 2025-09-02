# Pro Task Manager

An advanced, project-based task management application designed for developers, data scientists, and IT students. Built with a clean Python Flask backend and a powerful vanilla JavaScript frontend, this single-page application helps you organize complex workflows with features like project management, task prioritization, Markdown notes, and a beautiful dark mode.


*(A screenshot showing the dark mode UI with the projects sidebar, a list of tasks with priority indicators, and the task details.)*

## ✨ Key Features

*   **🚀 Project-Based Organization:** Group your tasks into distinct projects to manage multiple contexts, such as `API Development`, `Data Analysis Pipeline`, or `Personal Blog`.
*   **🌗 Dark & Light Modes:** A sleek, modern interface with a theme toggle for comfortable viewing in any lighting condition.
*   **🚦 Task Priority Levels:** Assign **High**, **Medium**, or **Low** priority to tasks, visualized with distinct color codes for at-a-glance importance.
*   **🗓️ Flexible Due Dates & Countdowns:** Move beyond rigid deadlines. Use the date picker to set any due date and see a dynamic countdown of the time remaining.
*   **✍️ Markdown Notes with Code Formatting:** Add detailed notes to any task. Use Markdown for inline code with `` `code()` `` and code blocks with ` ``` ` for technical documentation.
*   **🔍 Powerful Search & Sort:** Instantly find any task with the live search bar. Sort your task list by **Due Date**, **Priority**, or **Creation Date** to customize your view.
*   **✏️ Full Task Editing:** A comprehensive modal allows you to create and edit all aspects of a task, including its project, priority, notes, and due date.
*   **📊 Project Progress Visualization:** The sidebar displays a visual progress bar for each project, showing the percentage of completed tasks.
*   **💾 Persistent Local Storage:** Your projects and tasks are saved in the browser's Local Storage, ensuring your data persists across sessions.
*   **📄 Export to CSV:** Export all your tasks to a CSV file for record-keeping, reporting, or integration with other tools.

## 🛠️ Tech Stack

This project is a single-page application (SPA) served by a minimal backend.

*   **Backend:**
    *   ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
    *   ![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logo-color=white)
*   **Frontend:**
    *   ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
    *   ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
    *   ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have Python 3 and `pip` installed on your system.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/devranjeet/Pro-Task-Manager.git
    ```

2.  **Navigate into the project directory:**
    ```sh
    cd Pro-Task-Manager
    ```

3.  **Create and activate a virtual environment (recommended):**

    *   On macOS/Linux:
        ```sh
        python3 -m venv venv
        source venv/bin/activate
        ```
    *   On Windows:
        ```sh
        python -m venv venv
        .\venv\Scripts\activate
        ```

4.  **Install the required dependencies:**
    ```sh
    pip install -r requirements.txt
    ```

5.  **Run the Flask application:**
    ```sh
    python app.py
    ```

6.  **Open your browser** and navigate to `http://127.0.0.1:5000` to see the application in action!

##  usage How to Use

1.  **Create a Project:** Click the `+` button in the sidebar to add a new project.
2.  **Select a Project:** Click on a project name to view its tasks. The "All Tasks" view shows tasks from every project.
3.  **Add a Task:** Click the "Add Task" button in the main header.
4.  **Fill out the Details:** In the modal, provide a task name, assign it to a project, set a due date and priority, and add any detailed notes.
5.  **Edit a Task:** Simply click anywhere on a task card (except the action buttons) to open the edit modal.
6.  **Manage Tasks:**
    *   Mark tasks as complete with the ✔️ button.
    *   Search for specific tasks using the search bar.
    *   Change the sorting order using the dropdown menu.
7.  **Switch Themes:** Use the sun/moon icon in the sidebar to toggle between light and dark mode.

## 📁 Project Structure

The project follows a standard Flask application structure:

```
pro-task-manager/
├── app.py              # Flask backend server
├── static/
│   ├── style.css       # All CSS styles for the application
│   └── script.js       # All client-side JavaScript logic
└── templates/
    └── index.html      # Main HTML structure for the single-page app
```

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
