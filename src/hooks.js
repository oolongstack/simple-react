import { emitUpdateForHooks } from "./react-dom";
const states = [];
let hookIndex = 0;
export function resetHookIndex() {
  hookIndex = 0;
}
export function useState(initialValue) {
  states[hookIndex] = states[hookIndex] || initialValue;

  const currentIndex = hookIndex;
  function setState(newState) {
    console.log("newState: ", newState);
    states[currentIndex] = newState;
    // update

    emitUpdateForHooks();
  }

  return [states[hookIndex++], setState];
}
