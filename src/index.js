import React from "./react";
import ReactDOM from "./react-dom";
class ScrollingList extends React.Component {
  isAppend = true;
  constructor(props) {
    super(props);
    this.listRef = React.createRef();
    this.state = {
      list: [],
      count: 0,
    };
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    // Are we adding new items to the list?
    // Capture the scroll position so we can adjust scroll later.
    if (prevState.list.length < this.state.list.length) {
      const list = this.listRef.current;
      return list.scrollHeight - list.scrollTop;
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // If we have a snapshot value, we've just added new items.
    // Adjust scroll so these new items don't push the old ones out of view.
    // (snapshot here is the value returned from getSnapshotBeforeUpdate)
    if (snapshot !== null) {
      const list = this.listRef.current;
      list.scrollTop = list.scrollHeight - snapshot;
    }
  }
  appendData() {
    if (this.isAppend) {
      this.intervalId = setInterval(() => {
        this.setState({
          list: [...this.state.list, this.state.count++],
        });
      }, 1000);
    } else {
      clearInterval(this.intervalId);
    }

    this.isAppend = !this.isAppend;
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  render() {
    return (
      <div>
        <button onClick={() => this.appendData()}>add</button>
        <div
          ref={this.listRef}
          style={{
            overflow: "auto",
            height: "400px",
            background: "#efefef",
          }}
        >
          {this.state.list.map((item, index) => {
            return (
              <div
                key={index}
                style={{
                  height: "60px",
                  padding: "10px",
                  margin: "10px",
                  border: "1px solid skyblue",
                  borderRadius: "6px",
                }}
              >
                {item}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

ReactDOM.render(<ScrollingList />, document.getElementById("root"));
