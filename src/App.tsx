import { useState, useEffect } from "react";
import "./App.css";
import Task from "./components/Task"; 
import PriorityModal from "./components/PriorityModal";
import { invoke } from '@tauri-apps/api/core';

function App() {
  interface TaskType {
    content: string;
    priority: "high" | "undefined";
  }

  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [completedTasks, setCompleteTasks] = useState<TaskType[]>([]);
  const [newTaskContent, setNewTaskContent] = useState(""); 
  const [showModal, setShowModal] = useState(false); 


  // Load tasks from the backend on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const loadedTasks = await invoke<TaskType[]>("load_tasks_from_file");
        setTasks(loadedTasks);
      } catch (error) {
        console.error("Failed to load tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  const resetTasks = async () => {
    // Reset functionality can be implemented here, if needed.
    try {
        await invoke("reset");  // Since reset doesn't return tasks, we don't need <TaskType[]>
        setTasks([]);  // Clear the frontend task list after reset
        setCompleteTasks([]); // Clear the frontend completed task list after reset
      } catch (error) {
        console.error("Failed to reset tasks:", error);
      }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTaskContent(e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskContent.trim()) {
      setShowModal(true); 
    }
  };

  const handlePrioritySelect = async (priority: "high" | "undefined") => {
    const newTask = { content: newTaskContent, priority };
    try {
      // Call Rust backend to add the task and get updated task list
      const updatedTasks = await invoke<TaskType[]>("add_task", { content: newTask.content, priority: newTask.priority });
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Failed to add task:", error);
    }
    
    setNewTaskContent(""); 
    setShowModal(false); 
  };

  const onCompleteTask = async (index: number) => {
    const completedTask = tasks[index];
    await invoke("complete_task", { index });
    setTasks(tasks.filter((_, i) => i !== index));
    setCompleteTasks([...completedTasks, completedTask]);
  }

  return (
    <main className="container">
        <div className="logo-container">
            <img src="/logo.png" className="app-logo" alt="App Logo" />
        </div>
        <h1>今日待办事项</h1>
        
        <form className="row" onSubmit={handleFormSubmit}>
            <input 
                id="task-input" 
                placeholder="创建一个事项" 
                value={newTaskContent}
                onChange={handleInputChange}
            />
            <button type="submit">添加</button>
        </form>
        
        <div className="ongoing">
            正在进行中: {tasks.length}
            <span className="delete-text" onClick={resetTasks}>
            重制
            </span>
        </div>

        {showModal && (
            <PriorityModal 
            onSelectPriority={handlePrioritySelect} 
            onClose={() => setShowModal(false)} 
            />
        )}

        <div className="task-list">
            {tasks.map((task, index) => (
            <Task key={index} task={task} index={index} onComplete={onCompleteTask} />
            ))}
        </div>

        <div className="completed">
            已完成: 0 
            <div className="completed_task_list">
                {completedTasks.map((task, index) => (
                    <div key={index} className="completed-task">
                        {task.content}
                    </div>
                ))}
            </div>
            </div>
      
    </main>
  );
}

export default App;