import { useState } from "react";
import "./App.css";
import Task from "./components/Task"; 
import PriorityModal from "./components/PriorityModal";
import { invoke } from '@tauri-apps/api/core'


function App() {

  interface TaskType {
        content: string;
        priority: "high" | "undefined";
  }
  // Static task data for display
  const [tasks, setTasks] = useState<TaskType[]>([
    { content: "今日待办事项", priority: "undefined" },
    { content: "完成前后端API对接", priority: "undefined" },
    { content: "修改网站颜色样式", priority: "high" },
    { content: "删除多余不需要的代码", priority: "undefined" },
  ]);

  const [newTaskContent, setNewTaskContent] = useState(""); 
  const [showModal, setShowModal] = useState(false); 
  
  const resetTasks = () => {
   
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
        console.log("content: {}, priority: {}", newTask.content, newTask.priority);
        
        try {
            // Call the Rust backend to add the task and get the updated task list
            const updatedTasks = await invoke<TaskType[]>("add_task", { content: newTask.content, priority: newTask.priority });

            console.log(updatedTasks);
    
            // Update the state with the returned task list
            setTasks(updatedTasks);
        } catch (error) {
            console.error("Failed to add task:", error);
        }
    
        setNewTaskContent(""); 
        setShowModal(false); 
    };

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
            <span 
            className="delete-text" 
            onClick={resetTasks}
            >
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
          <Task key={index} task={task} index={index}/>
        ))}
      </div>

      <div className="completed">已完成: 0 </div>
    </main>
  );
}

export default App;