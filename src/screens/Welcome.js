import React, { Component } from 'react';

class Welcome extends Component {
  state = {
    name: ''
  }

  handleNameChange = e => {
    const name = e.target.value;
    this.setState({name});
  }

  handleSubmit = e => {
    e.preventDefault();
    const { name } = this.state;
    this.props.setName(name);
  }

  render() {
    const { name } = this.state;
    return (
      <div>
        <h1>Welcome{ name ? ` ${name}` : '' }!</h1>
        <form onSubmit={this.handleSubmit}>
          <p>What's your name?</p>
          <input required type="text" value={name} onChange={this.handleNameChange} />
          <button>Continue</button>
        </form>
      </div>
    )
  }
}

export default Welcome;