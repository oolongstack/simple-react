import React, { useState } from "./react";
import ReactDOM from "./react-dom";

function Counter(props) {
  const [count, setCount] = useState(0);

  const [count1, setCount1] = useState(100);
  return (
    <div>
      <p>You clicked {count} times</p>
      <p>count1: {count1}</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
      <button onClick={() => setCount1(count1 + 100)}>setCount1</button>
    </div>
  );
}

ReactDOM.render(<Counter />, document.getElementById("root"));
