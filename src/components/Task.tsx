import React from "react";

// Define the type for a single task
interface TaskType {
  content: string;
  priority: "high" | "undefined";
}

interface TaskProps {
  task: TaskType;
  index: number;
}

const Task: React.FC<TaskProps> = ({ task, index}) => {
  return (
    <div className="task">
      <span className="task-index">{index + 1}. </span>
      {/* Display red circle if priority is high */}
      {task.priority === 'high' && (
        <span className="priority-indicator"></span>
      )}
      <span>{task.content}</span>
    </div>
  );
};

export default Task;