import {
  CREATE,
  MOVE,
  REACT_ELEMENT,
  REACT_FORWARD_REF,
  REACT_MEMO,
  REACT_TEXT,
  shallowEqual,
} from "./utils";
import { addEvent } from "./event";
import { resetHookIndex } from "./hooks";
export let emitUpdateForHooks;

function render(VNode, containerDOM) {
  console.log("all VNode: ", VNode);
  // 将虚拟DOM转化为真实DOM
  // 真实DOM挂载到容器中
  mount(VNode, containerDOM);
  emitUpdateForHooks = () => {
    // reset hook index
    resetHookIndex();
    // update dom tree
    updateDomTree(VNode, VNode, findDomByVNode(VNode));
  };
}

function mount(VNode, containerDOM) {
  const newDOM = createDOM(VNode);
  newDOM && containerDOM.appendChild(newDOM);
}

function createDOM(VNode) {
  const { type, props, ref } = VNode;

  let dom;

  // memo 包裹的函数组件
  if (type && type.$$typeof === REACT_MEMO) {
    return getDomByMemoFunctionComponent(VNode);
  }

  // 类组件
  if (
    typeof type === "function" &&
    VNode.$$typeof === REACT_ELEMENT &&
    type.IS_CLASS_COMPONENT
  ) {
    return getDomByClassComponent(VNode);
  }
  // 函数组件
  if (typeof type === "function" && VNode.$$typeof === REACT_ELEMENT) {
    return getDomByFunctionComponent(VNode);
  }
  // 被forwardRef包裹的函数组件
  if (type && type.$$typeof === REACT_FORWARD_REF) {
    return getDomByForwardRefFunction(VNode);
  }

  if (type === REACT_TEXT) {
    dom = document.createTextNode(props.text);
  } else if (type && VNode.$$typeof === REACT_ELEMENT) {
    dom = document.createElement(type);
  }
  if (props) {
    if (typeof props.children === "object" && props.children.type) {
      mount(props.children, dom);
    } else if (Array.isArray(props.children)) {
      mountArray(props.children, dom);
    }
  }
  // 处理其他属性
  setPropsForDOM(dom, props);

  VNode.dom = dom;

  // 给原生标签的ref赋值
  ref && (ref.current = dom);

  return dom;
}

function getDomByFunctionComponent(VNode) {
  let { type, props } = VNode;
  let renderVNode = type(props);
  if (!renderVNode) return;
  VNode.oldRenderVNode = renderVNode;
  return (VNode.dom = createDOM(renderVNode));
}

function getDomByClassComponent(VNode) {
  let { type, props, ref } = VNode;
  let instance = new type(props);

  ref && (ref.current = instance);
  let renderVNode = instance.render();
  if (!renderVNode) return;
  VNode.classInstacne = instance;
  instance.oldVNode = renderVNode;
  const dom = createDOM(renderVNode);
  VNode.dom = dom;

  if (instance.componentDidMount) {
    instance.componentDidMount();
  }
  return dom;
}
function getDomByForwardRefFunction(VNode) {
  const { type, props, ref } = VNode;

  const { render } = type;

  const renderVnode = render(props, ref);
  if (!renderVnode) return null;
  VNode.oldRenderVNode = renderVnode;
  return (VNode.dom = createDOM(renderVnode));
}
function getDomByMemoFunctionComponent(VNode) {
  const { type, props } = VNode;

  const renderVNode = type.type(props);

  if (!renderVNode) return null;

  VNode.oldRenderVNode = renderVNode;
  return (VNode.dom = createDOM(renderVNode));
}
function setPropsForDOM(dom, VNodeProps = {}) {
  if (!dom) return;
  for (const key in VNodeProps) {
    if (key === "children") continue;
    if (/^on[A-Z].*/.test(key)) {
      // 处理事件

      addEvent(dom, key.toLowerCase(), VNodeProps[key]);
    } else if (key === "style") {
      Object.keys(VNodeProps[key]).forEach((styleKey) => {
        dom.style[styleKey] = VNodeProps[key][styleKey];
      });
    } else {
      dom[key] = VNodeProps[key];
    }
  }
}

function mountArray(children, dom) {
  if (!Array.isArray(children)) return;

  for (let i = 0; i < children.length; i++) {
    children[i].index = i;
    mount(children[i], dom);
  }
}

export function findDomByVNode(VNode) {
  if (!VNode) return null;
  if (VNode.dom) return VNode.dom;
}

export function updateDomTree(oldVNode, newVNode, oldDOM) {
  const parentNode = oldDOM.parentNode;
  const typeMap = {
    NO_OPERATE: !oldVNode && !newVNode,
    ADD: !oldVNode && newVNode,
    DELETE: oldVNode && !newVNode,
    REPLACE: oldVNode && newVNode && oldVNode.type !== newVNode.type,
  };
  const UPDATE_TYPE = Object.keys(typeMap).filter((key) => typeMap[key])[0];
  switch (UPDATE_TYPE) {
    case "NO_OPERATE":
      break;
    case "ADD":
      // mount(newVNode, parentNode);
      parentNode.appendChild(createDOM(newVNode));
      break;
    case "DELETE":
      // parentNode.removeChild(oldDOM);
      removeVNode(oldVNode);
      break;
    case "REPLACE":
      removeVNode(oldVNode);
      parentNode.appendChild(createDOM(newVNode));
      break;
    default:
      // 新节点存在，旧节点也存在，且type一样
      deepDOMDiff(oldVNode, newVNode);
      break;
  }
}

function removeVNode(VNode) {
  const currentDOM = findDomByVNode(VNode);

  currentDOM && currentDOM.remove();
  // 卸载前的回调

  if (VNode.classInstacne && VNode.classInstacne.componentWillUnmount) {
    VNode.classInstacne.componentWillUnmount();
  }
}

function deepDOMDiff(oldVNode, newVNode) {
  const diffTypeMap = {
    ORIGIN_NODE: typeof oldVNode.type === "string", // div 等等
    CLASS_COMPONENT:
      typeof oldVNode.type === "function" && oldVNode.type.IS_CLASS_COMPONENT, // 类组件
    FUNCTION_COMPONENT: typeof oldVNode.type === "function", // 函数组件
    TEXT: oldVNode.type === REACT_TEXT,
    MEMO: oldVNode.type.$$typeof === REACT_MEMO,
  };

  const DIFF_TYPE = Object.keys(diffTypeMap).filter(
    (key) => diffTypeMap[key]
  )[0];

  switch (DIFF_TYPE) {
    case "ORIGIN_NODE":
      const currentDOM = (newVNode.dom = findDomByVNode(oldVNode));
      // 更新属性
      setPropsForDOM(currentDOM, newVNode.props);
      // 更新子节点（核心）
      updateChildren(
        currentDOM,
        oldVNode.props.children,
        newVNode.props.children
      );
      break;
    case "CLASS_COMPONENT":
      updateClassComponent(oldVNode, newVNode);
      break;
    case "FUNCTION_COMPONENT":
      updateFunctionComponent(oldVNode, newVNode);
      break;
    case "TEXT":
      newVNode.dom = findDomByVNode(oldVNode);
      newVNode.dom.textContent = newVNode.props.text;
      break;
    case "MEMO":
      updateMemoFunctionComponent(oldVNode, newVNode);
      break;
    default:
      break;
  }
}

function updateClassComponent(oldVNode, newVNode) {
  const classInstacne = (newVNode.classInstacne = oldVNode.classInstacne);
  // 传入新的props
  classInstacne.updater.lanchUpdate(newVNode.props);
}
function updateFunctionComponent(oldVNode, newVNode) {
  const oldDOM = (newVNode.dom = findDomByVNode(oldVNode));
  if (!oldDOM) return;
  const { type, props } = newVNode;
  const newRenderVNode = type(props);
  updateDomTree(oldVNode.oldRenderVNode, newRenderVNode, oldDOM);
  newVNode.oldRenderVNode = newRenderVNode;
}

function updateMemoFunctionComponent(oldVNode, newVNode) {
  const { type } = oldVNode;

  const compare = type.compare || shallowEqual;
  if (compare) {
    // 更新函数组件
    if (!compare(oldVNode.props, newVNode.props)) {
      const oldDOM = (newVNode.dom = findDomByVNode(oldVNode));
      const { type } = newVNode;
      const renderVNode = type.type(newVNode.props);
      updateDomTree(oldVNode.oldRenderVNode, renderVNode, oldDOM);
      newVNode.oldRenderVNode = renderVNode;
    } else {
      newVNode.oldRenderVNode = oldVNode.oldRenderVNode;
    }
  }
}

// dom-diff
function updateChildren(parentDOM, oldVNodeChildren, newVNodeChildren) {
  oldVNodeChildren = (
    Array.isArray(oldVNodeChildren) ? oldVNodeChildren : [oldVNodeChildren]
  ).filter(Boolean);

  newVNodeChildren = (
    Array.isArray(newVNodeChildren) ? newVNodeChildren : [newVNodeChildren]
  ).filter(Boolean);

  let lastNotChangedIndex = -1;
  const oldKeyChildMap = {};

  oldVNodeChildren.forEach((oldVNode, index) => {
    const oldKey = oldVNode.key ? oldVNode.key : index;
    oldKeyChildMap[oldKey] = oldVNode;
  });

  const actions = [];
  // old
  // a b c d e
  // new
  // c b e f a

  newVNodeChildren.forEach((newVNode, index) => {
    newVNode.index = index;
    const newKey = newVNode.key ? newVNode.key : index;
    const oldVNode = oldKeyChildMap[newKey];
    // 如果这个节点在老的里面有
    if (oldVNode) {
      deepDOMDiff(oldVNode, newVNode);
      if (oldVNode.index < lastNotChangedIndex) {
        // 移动
        actions.push({
          type: MOVE,
          oldVNode,
          newVNode,
          index,
        });
      }
      delete oldKeyChildMap[newKey];
      lastNotChangedIndex = Math.max(lastNotChangedIndex, oldVNode.index);
    } else {
      // 在这个index需要创建这么一个节点
      actions.push({
        type: CREATE,
        newVNode,
        index,
      });
    }
  });

  // 准备移动的节点
  const VNodeToMove = actions
    .filter(({ type }) => type === MOVE)
    .map((action) => action.oldVNode);

  // 能复用的都被删掉了，剩余的都是可被删除的
  const VNodeToDelete = Object.values(oldKeyChildMap);

  // 先删除
  VNodeToMove.concat(VNodeToDelete).forEach((oldVNode) => {
    const currentDom = findDomByVNode(oldVNode);
    currentDom.remove();
  });

  actions.forEach((action) => {
    const { type, index, oldVNode, newVNode } = action;

    // 拿到现在的childNodes
    const childNodes = parentDOM.childNodes;

    const childNode = childNodes[index];

    const getDomForInsert = () => {
      if (type === CREATE) {
        return createDOM(newVNode);
      }
      if (type === MOVE) {
        return findDomByVNode(oldVNode);
      }
    };

    // 原来这个位置已经有节点了
    if (childNode) {
      parentDOM.insertBefore(getDomForInsert(), childNode);
    } else {
      parentDOM.appendChild(getDomForInsert());
    }
  });

  // debugger;
}

const ReactDOM = {
  render,
};

export default ReactDOM;
