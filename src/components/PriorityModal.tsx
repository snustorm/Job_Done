// src/components/PriorityModal.tsx

import React from "react";
import "../App.css"; // We’ll add modal-specific styles here

interface PriorityModalProps {
  onSelectPriority: (priority: "high" | "undefined") => void;
  onClose: () => void;
}

const PriorityModal: React.FC<PriorityModalProps> = ({ onSelectPriority, onClose }) => {
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <p>选择优先级:</p>
        <div className="priority-options">
          <div 
            className="priority-circle high" 
            onClick={() => onSelectPriority("high")}
          ></div>
          <div 
            className="priority-circle undefined" 
            onClick={() => onSelectPriority("undefined")}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default PriorityModal;