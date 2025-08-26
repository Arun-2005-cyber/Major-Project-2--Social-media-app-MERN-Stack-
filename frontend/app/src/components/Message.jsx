import React, { useState } from 'react';

function Message({ variant='info', children }) {
    const [visible, setVisible] = useState(true);
    const handleClose = () => {
    setVisible(false);
     
  };
  if (!visible) return null;

  const backgroundColors = {
    success: '#d4edda', // light green
    danger: '#f8d7da',  // light red
    warning: '#fff3cd', // light yellow
    info: '#cce5ff',    // light blue
  };

  const textColors = {
    success: '#155724',
    danger: '#721c24',
    warning: '#856404',
    info: '#004085',
  };

  const bgColor = backgroundColors[variant] || '#fefefe';
  const textColor = textColors[variant] || '#000';
  return (
    <div
      style={{
        backgroundColor: bgColor,
        color: textColor,
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '10px',
        position: 'relative',
        border: `1px solid ${textColor}`
      }}
    >
      <span>{children}</span>
      <button 
        onClick={handleClose} 
        style={{
          position: 'absolute',
          right: '10px',
          top: '2px',
          background: 'transparent',
          border: 'none',
          fontSize: '26px',
          cursor: 'pointer',
          color: textColor
        }}
      >
        &times;
      </button>
    </div>
  );
};



export default Message
