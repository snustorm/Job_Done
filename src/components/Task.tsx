import React, { useState } from "react";
import { FaCheck } from "react-icons/fa";

// Define the type for a single task
interface TaskType {
  content: string;
  priority: "high" | "undefined";
}

interface TaskProps {
  task: TaskType;
  index: number;
  onComplete: (index: number) => void;
}

const Task: React.FC<TaskProps> = ({ task, index, onComplete}) => {

  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => {
    setIsPressed(true);
  }

  const handleMouseUp = () => {
    setIsPressed(false);
    onComplete(index);
  }

  return (
    <div className="task">
      <span className="task-index">{index + 1}. </span>
      {/* Display red circle if priority is high */}
      {task.priority === 'high' && (
        <span className="priority-indicator"></span>
      )}
      <span className="task_content">{task.content}</span>
      <button
        className="complete-button"
        onMouseDown={handleMouseDown} // When mouse button is pressed
        onMouseUp={handleMouseUp} // When mouse button is released
        onMouseLeave={() => setIsPressed(false)} // If mouse leaves, reset the state
      >
        <div className={`square ${isPressed ? 'pressed' : ''}`}></div>
      </button>
    </div>
  );
};

export default Task;