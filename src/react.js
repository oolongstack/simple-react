import {
  REACT_ELEMENT,
  REACT_FORWARD_REF,
  toVNode,
  shallowEqual,
  REACT_MEMO,
} from "./utils";
import { Component } from "./Component";
function createElement(type, properties, children) {
  let key = properties.key || null;
  let ref = properties.ref || null;

  ["key", "ref", "__self", "__source"].forEach((key) => {
    delete properties[key];
  });

  const props = { ...properties };
  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2).map(toVNode);
  } else {
    props.children = toVNode(children);
  }

  return {
    $$typeof: REACT_ELEMENT,
    type,
    ref,
    key,
    props,
  };
}
function createRef() {
  return {
    current: null,
  };
}

function forwardRef(render) {
  return {
    $$typeof: REACT_FORWARD_REF,
    render,
  };
}

class PureComponent extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    // 浅比较
    // 只要state 或者 props 有一个不是浅相等 就返回true 也就是重新渲染组件
    return (
      !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState)
    );
  }
}

/**
 *
 * @param {*} type 组件类型
 * @param {*} compare 自定义对比函数
 */
function memo(type, compare) {
  return {
    $$typeof: REACT_MEMO,
    type,
    compare,
  };
}

const React = {
  createElement,
  Component,
  PureComponent,
  createRef,
  forwardRef,
  memo,
};

export default React;
export * from "./hooks";
