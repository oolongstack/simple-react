import { REACT_ELEMENT } from "./utils";

function render(VNode, containerDOM) {
  // 将虚拟DOM转化为真实DOM
  // 真实DOM挂载到容器中
  mount(VNode, containerDOM);
}

function mount(VNode, containerDOM) {
  const newDOM = createDOM(VNode);
  newDOM && containerDOM.appendChild(newDOM);
}

function createDOM(VNode) {
  const { type, props } = VNode;
  let dom;
  if (
    typeof type === "function" &&
    VNode.$$typeof === REACT_ELEMENT &&
    type.IS_CLASS_COMPONENT
  ) {
    return getDomByClassComponent(VNode);
  }
  if (typeof type === "function" && VNode.$$typeof === REACT_ELEMENT) {
    return getDomByFunctionComponent(VNode);
  }
  if (type && VNode.$$typeof === REACT_ELEMENT) {
    dom = document.createElement(type);
  }
  if (props) {
    if (typeof props.children === "object" && props.children.type) {
      mount(props.children, dom);
    } else if (Array.isArray(props.children)) {
      mountArray(props.children, dom);
    } else if (
      typeof props.children === "string" ||
      typeof props.children === "number"
    ) {
      dom.appendChild(document.createTextNode(props.children));
    }
  }
  // 处理其他属性
  setPropsForDOM(dom, props);

  VNode.dom = dom;

  return dom;
}

function getDomByFunctionComponent(VNode) {
  let { type, props } = VNode;
  let renderVNode = type(props);
  if (!renderVNode) return;
  return createDOM(renderVNode);
}

function getDomByClassComponent(VNode) {
  let { type, props } = VNode;
  let instance = new type(props);
  let renderVNode = instance.render();
  if (!renderVNode) return;
  instance.oldVNode = renderVNode;
  return createDOM(renderVNode);
}
function setPropsForDOM(dom, VNodeProps = {}) {
  if (!dom) return;
  for (const key in VNodeProps) {
    if (key === "children") continue;
    if (/^on[A-Z].*/.test(key)) {
      // 处理事件
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
    if (typeof children[i] === "object") {
      mount(children[i], dom);
    } else if (
      typeof children[i] === "string" ||
      typeof children[i] === "number"
    ) {
      dom.appendChild(document.createTextNode(children[i]));
    }
  }
}

export function findDomByVNode(VNode) {
  if (!VNode) return null;
  if (VNode.dom) return VNode.dom;
}

export function updateDomTree(oldDOM, newVNode) {
  const parentNode = oldDOM.parentNode;
  parentNode.removeChild(oldDOM);
  parentNode.appendChild(createDOM(newVNode));
}

const ReactDOM = {
  render,
};

export default ReactDOM;
