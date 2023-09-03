import { REACT_ELEMENT } from "./utils";
import { Component } from "./Component";
function createElement(type, properties, children) {
  let key = properties.key || null;
  let ref = properties.ref || null;

  ["key", "ref", "__self", "__source"].forEach((key) => {
    delete properties[key];
  });

  const props = { ...properties };
  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2);
  } else {
    props.children = children;
  }

  return {
    $$typeof: REACT_ELEMENT,
    type,
    ref,
    key,
    props,
  };
}

const React = {
  createElement,
  Component,
};

export default React;
