import React from "./react";
import ReactDOM from "./react-dom";

// PureComponent
class Parent extends React.Component {
  state = {
    name: "",
    address: "",
  };
  setName(name) {
    this.setState({ name });
  }
  setAddress(address) {
    this.setState({ address });
  }
  render() {
    console.log("father render");
    return (
      <div>
        <label>
          Name{": "}
          <input
            value={this.state.name}
            onInput={(e) => this.setName(e.target.value)}
          />
        </label>
        <label>
          Address{": "}
          <input
            value={this.state.address}
            onInput={(e) => this.setAddress(e.target.value)}
          />
        </label>
        <MemoFunc name={this.state.name} />
      </div>
    );
  }
}

class Greeting extends React.PureComponent {
  render() {
    console.log("Greeting was rendered at", new Date().toLocaleTimeString());
    return (
      <h3>
        Hello{this.props.name && ", "}
        {this.props.name}!
      </h3>
    );
  }
}

const MemoFunc = React.memo((props) => {
  console.log("Greeting was rendered at", new Date().toLocaleTimeString());
  return (
    <h3>
      Hello{props.name && ", "}
      {props.name}!
    </h3>
  );
});
console.log(MemoFunc);

ReactDOM.render(<Parent />, document.getElementById("root"));
