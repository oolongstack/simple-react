import { updateDomTree, findDomByVNode } from "./react-dom";
import { deepClone } from "./utils";
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
  lanchUpdate(nextProps) {
    // 进行何冰属性
    const { ClassComponentInstance, pendingStates } = this;
    if (!pendingStates.length && !nextProps) return;
    let isShouldUpdate = true;

    const prevProps = deepClone(ClassComponentInstance.props);
    const prevState = deepClone(ClassComponentInstance.state);
    const nextState = pendingStates.reduce((preState, newState) => {
      return { ...preState, ...newState };
    }, ClassComponentInstance.state);
    this.pendingStates.length = 0;

    // shouldComponentUpdate
    if (
      ClassComponentInstance.shouldComponentUpdate &&
      !ClassComponentInstance.shouldComponentUpdate(nextProps, nextState)
    ) {
      isShouldUpdate = false;
    }

    ClassComponentInstance.state = nextState;
    if (nextProps) ClassComponentInstance.props = nextProps;
    // 调用更新
    if (isShouldUpdate) ClassComponentInstance.update(prevProps, prevState);
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
  update(prevProps, prevState) {
    // 类组件真正的更新逻辑
    let oldVNode = this.oldVNode;
    let oldDOM = findDomByVNode(oldVNode);

    // static属性
    if (this.constructor.getDerivedStateFromProps) {
      const newState = this.constructor.getDerivedStateFromProps(
        this.props,
        this.state
      );

      this.state = { ...this.state, ...newState };
    }

    let newVNode = this.render();
    const snapshot =
      this.getSnapshotBeforeUpdate &&
      this.getSnapshotBeforeUpdate(prevProps, prevState);
    updateDomTree(oldVNode, newVNode, oldDOM);
    this.oldVNode = newVNode;

    // componentDidUpdate
    if (this.componentDidUpdate) {
      this.componentDidUpdate(this.props, this.state, snapshot);
    }
  }
}
