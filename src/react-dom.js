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
  if (!renderVNode) returnss;
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
  const parentNode = oldDOM.parentNode;
  parentNode.removeChild(oldDOM);
  parentNode.appendChild(createDOM(newVNode));
}

const ReactDOM = {
  render,
};

export default ReactDOM;
