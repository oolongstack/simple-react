// import React from "react";
import React from "./react";
// import ReactDOM from "react-dom";
import ReactDOM from "./react-dom";
class MyClassComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      count: 0,
    };
  }
  render() {
    const { count } = this.state;
    return (
      <div
        onClick={(e) => {
          console.log("father e: ", e);
          console.log("father click");
        }}
        style={{ color: "pink" }}
      >
        MyClassComponent <span>{this.props.name}</span>
        <div
          onClick={(e) => {
            console.log("e: ", e);
            this.setState({ count: count + 1 });
          }}
        >
          count:{count}
        </div>
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
  return (
    <div style={{ color: "blue" }}>
      MyFunctionComponent <span>{props.name}</span>
    </div>
  );
}

console.log("element: ", element);
ReactDOM.render(element, document.getElementById("root"));
