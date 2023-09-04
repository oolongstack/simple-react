import { flushUpdaterQueue, updateQueue } from "./Component";

export function addEvent(dom, eventName, bindFunction) {
  dom.attach = dom.attach || {};
  dom.attach[eventName] = bindFunction;
  if (document[eventName]) return;
  document[eventName] = dispatchEvent;
}

function dispatchEvent(nativeEvent) {
  // 触发事件处理函数的时候要批量更新
  updateQueue.isBatch = true;

  // 处理浏览器之间的差异
  const syntheticEvent = createSyntheticEvent(nativeEvent);
  // 触发事件的源
  let target = nativeEvent.target;
  // 模拟冒泡
  while (target) {
    syntheticEvent.currentTarget = target;
    const eventName = `on${nativeEvent.type}`;
    const bindFunction = target.attach && target.attach[eventName];
    if (bindFunction) {
      bindFunction(syntheticEvent);
    }

    // 模拟 停止冒泡s
    if (syntheticEvent.isPropagationStopped) {
      break;
    }
    target = target.parentNode;
  }
  // 更新类组件的状态
  flushUpdaterQueue();
}

/**
 * 创建合成事件
 * @param {*} nativeEvent
 */
function createSyntheticEvent(nativeEvent) {
  const nativeEventKeyValues = {};
  for (const key in nativeEvent) {
    nativeEventKeyValues[key] =
      typeof nativeEvent[key] === "function"
        ? nativeEvent[key].bind(nativeEvent)
        : nativeEvent[key];
  }
  const syntheticEvent = Object.assign(nativeEventKeyValues, {
    nativeEvent,
    isDefaultPrevented: false, // 是否阻止了默认行为
    isPropagationStopped: false, // 是否停止了冒泡
    preventDefault: function () {
      this.isDefaultPrevented = true;
      // chrome
      if (this.nativeEvent.preventDefault) {
        this.nativeEvent.preventDefault();
      } else {
        // ie
        this.nativeEvent.returnValue = false;
      }
    },
    stopPropagation: function () {
      this.isPropagationStopped = true;
      if (this.nativeEvent.stopPropagation) {
        this.nativeEvent.stopPropagation();
      } else {
        this.nativeEvent.cancelBubble = true;
      }
    },
  });
  return syntheticEvent;
}
