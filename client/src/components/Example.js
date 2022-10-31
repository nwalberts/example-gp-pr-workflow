import React, { useState, useEffect } from 'react';

const Example = () => {
  const [count, setCount] = useState(0);

  // runs whenever the component renders
  useEffect(() => {
    // Update the document title (look at your tab!)
    document.title = `You clicked ${count} times`;
  });

  const increaseCount = () => {
    setCount(count + 1)
  }

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={increaseCount}>
        Click me
      </button>
    </div>
  );
}

export default Example