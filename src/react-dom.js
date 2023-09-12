import { REACT_ELEMENT, REACT_FORWARD_REF, REACT_TEXT } from "./utils";
import { addEvent } from "./event";
function render(VNode, containerDOM) {
  console.log("all VNode: ", VNode);
  // 将虚拟DOM转化为真实DOM
  // 真实DOM挂载到容器中
  mount(VNode, containerDOM);
}

function mount(VNode, containerDOM) {
  const newDOM = createDOM(VNode);
  newDOM && containerDOM.appendChild(newDOM);
}

function createDOM(VNode) {
  const { type, props, ref } = VNode;
  let dom;

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
  return createDOM(renderVNode);
}

function getDomByClassComponent(VNode) {
  let { type, props, ref } = VNode;
  let instance = new type(props);

  ref && (ref.current = instance);
  let renderVNode = instance.render();
  if (!renderVNode) return;
  VNode.classInstacne = instance;
  instance.oldVNode = renderVNode;
  return createDOM(renderVNode);
}
function getDomByForwardRefFunction(VNode) {
  const { type, props, ref } = VNode;

  const { render } = type;

  const renderVnode = render(props, ref);
  if (!renderVnode) return null;
  return createDOM(renderVnode);
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
  console.log("newVNode: ", newVNode);
  console.log("oldVNode: ", oldVNode);
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
}

function deepDOMDiff(oldVNode, newVNode) {
  const diffTypeMap = {
    ORIGIN_NODE: typeof oldVNode.type === "string", // div 等等
    CLASS_COMPONENT:
      typeof oldVNode.type === "function" && oldVNode.type.IS_CLASS_COMPONENT, // 类组件
    FUNCTION_COMPONENT: typeof oldVNode.type === "function", // 函数组件
    TEXT: oldVNode.type === REACT_TEXT,
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
    default:
      break;
  }
}

function updateClassComponent(oldVNode, newVNode) {
  const classInstacne = (newVNode.classInstacne = oldVNode.classInstacne);
  classInstacne.updater.lanchUpdate();
}
function updateFunctionComponent(oldVNode, newVNode) {
  const oldDOM = findDomByVNode(oldVNode);
  if (!oldDOM) return;
  const { type, props } = newVNode;
  const newRenderVNode = type(props);
  updateDomTree(oldVNode.oldRenderVNode, newRenderVNode, oldDOM);
  newVNode.oldRenderVNode = newRenderVNode;
}

// dom-diff
function updateChildren(parentDOM, oldVNodeChildren, newVNodeChildren) {
  oldVNodeChildren = (
    Array.isArray(oldVNodeChildren) ? oldVNodeChildren : [oldVNodeChildren]
  ).filter(Boolean);

  newVNodeChildren = (
    Array.isArray(newVNodeChildren) ? newVNodeChildren : [newVNodeChildren]
  ).filter(Boolean);

  const lastNotChangedIndex = -1;
  const oldKeyChildMap = {};

  debugger;
}

const ReactDOM = {
  render,
};

export default ReactDOM;
