// import React from "react";
import React from "./react";
// import ReactDOM from "react-dom";
import ReactDOM from "./react-dom";
class MyClassComponent extends React.Component {
  constructor(props) {
    super(props);

    console.log(this.props);
  }
  render() {
    return (
      <div>
        MyClassComponent <span>{this.props.name}</span>
        {this.props.children}
      </div>
    );
  }
}
const element = (
  <div>
    hello react<span style={{ color: "red", fontSize: "20px" }}>xxx </span>
    <MyFunctionComponent name="cjl" />
    <MyClassComponent name="mf">
      <span>我是类组件的children</span>
    </MyClassComponent>
  </div>
);
function MyFunctionComponent(props) {
  console.log("props: ", props);
  return (
    <div>
      MyFunctionComponent <span>{props.name}</span>
    </div>
  );
}

console.log("element: ", element);
ReactDOM.render(element, document.getElementById("root"));
