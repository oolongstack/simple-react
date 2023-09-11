export const REACT_ELEMENT = Symbol.for("react.element");
export const REACT_FORWARD_REF = Symbol.for("react.forward_ref");
export const REACT_TEXT = Symbol.for("react.text");
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
