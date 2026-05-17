import React from 'react';

function Toast({ message }) {
  return (
    <div className="toast show">
      {message}
    </div>
  );
}

export default Toast;
