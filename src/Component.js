import { updateDomTree, findDomByVNode } from "./react-dom";
export let updateQueue = {
  isBatch: false,
  updaters: new Set(),
};
export function flushUpdaterQueue() {
  updateQueue.isBatch = false;
  updateQueue.updaters.forEach((updater) => updater.lanchUpdate());
  updateQueue.updaters.clear();
}
class Updater {
  constructor(ClassComponentInstance) {
    this.ClassComponentInstance = ClassComponentInstance;
    this.pendingStates = [];
  }
  addState(partialState) {
    this.pendingStates.push(partialState);

    this.preHandleForUpdate();
  }
  // 更新前的预处理（关键：是否为批量更新）
  preHandleForUpdate() {
    if (updateQueue.isBatch) {
      updateQueue.updaters.add(this);
    } else {
      this.lanchUpdate();
    }
  }
  lanchUpdate() {
    // 进行何冰属性
    const { ClassComponentInstance, pendingStates } = this;
    if (!pendingStates.length) return;
    ClassComponentInstance.state = pendingStates.reduce(
      (preState, newState) => {
        return { ...preState, ...newState };
      },
      ClassComponentInstance.state
    );
    this.pendingStates.length = 0;
    // 调用更新
    ClassComponentInstance.update();
  }
}
export class Component {
  static IS_CLASS_COMPONENT = true;
  constructor(props) {
    this.updater = new Updater(this);
    this.state = {};
    this.props = props;
  }
  setState(partialState) {
    // 更新机制
    this.updater.addState(partialState);
  }
  update() {
    // 类组件真正的更新逻辑
    let oldVNode = this.oldVNode;
    let oldDOM = findDomByVNode(oldVNode);
    let newVNode = this.render();
    updateDomTree(oldDOM, newVNode);
    this.oldVNode = newVNode;
  }
}
