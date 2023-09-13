export const REACT_ELEMENT = Symbol.for("react.element");
export const REACT_FORWARD_REF = Symbol.for("react.forward_ref");
export const REACT_TEXT = Symbol.for("react.text");

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
