// import React from "react";
import React from "./react";
// import ReactDOM from "react-dom";
import ReactDOM from "./react-dom";

class ParentComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: "cjl",
    };
  }

  changeUserId() {
    this.setState({
      userId: "mf",
    });
  }

  render() {
    return (
      <div>
        <input
          type="button"
          value="点击改变userId"
          onClick={() => this.changeUserId()}
        />
        <ChildComponent userId={this.state.userId} />
      </div>
    );
  }
}

class ChildComponent extends React.Component {
  state = {
    prevUserId: "cjl",
    email: "2245675739@qq.com",
  };
  static getDerivedStateFromProps(props, state) {
    if (props.userId !== state.prevUserId) {
      return {
        prevUserId: props.userId,
        email: props.userId + "2245675739@qq.com",
      };
    }

    return null;
  }
  render() {
    return <div>email:{this.state.email}</div>;
  }
}

ReactDOM.render(<ParentComponent />, document.getElementById("root"));
