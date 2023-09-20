export const REACT_ELEMENT = Symbol.for("react.element");
export const REACT_FORWARD_REF = Symbol.for("react.forward_ref");
export const REACT_TEXT = Symbol.for("react.text");
export const REACT_MEMO = Symbol.for("react.memo");

export const CREATE = Symbol.for("react.dom.diff.create");
export const MOVE = Symbol.for("react.dom.diff.move");

export function toVNode(node) {
  return typeof node === "string" || typeof node === "number"
    ? {
        type: REACT_TEXT,
        props: {
          text: node,
        },
      }
    : node;
}

export function deepClone(data) {
  if (!data) return null;
  // 简便方法 使用JSON方法
  return JSON.parse(JSON.stringify(data));
}

export function getType(obj) {
  const toString = Object.prototype.toString;
}

function isObject(obj) {
  return typeof obj === "object" && obj !== null;
}

// 两个对象是否浅相等
export function shallowEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (!isObject(obj1) || !isObject(obj2)) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}
