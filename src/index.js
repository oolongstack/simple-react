// import React from "react";
import React from "./react";
// import ReactDOM from "react-dom";
import ReactDOM from "./react-dom";

class OtherClassComp extends React.Component {
  otherFunction() {
    console.log("otherFunction");
  }
  render() {
    return <div>OtherClassComp</div>;
  }
}

const OtherFunction = React.forwardRef(function (props, ref) {
  const func = () => {
    console.log(ref);
  };
  return (
    <div>
      otherfunction <input type="text" ref={ref} />
      <button onClick={() => func()}>fun click</button>
    </div>
  );
});

class MyClassComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      count: 0,
    };

    this.inputRef = React.createRef();
    this.componentRef = React.createRef();
    this.functionRef = React.createRef();
  }
  handleInputClick() {
    this.inputRef.current.focus();
    this.componentRef.current.otherFunction();

    this.functionRef.current.focus();
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
        props.name <span>{this.props.name}</span>
        <div
          onClick={(e) => {
            console.log("e: ", e);
            this.setState({ count: count + 1 });
          }}
        >
          count:{count}
        </div>
        <input type="text" ref={this.inputRef} />
        <button onClick={() => this.handleInputClick()}>click</button>
        <OtherFunction ref={this.functionRef} />
        <OtherClassComp ref={this.componentRef} />
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
