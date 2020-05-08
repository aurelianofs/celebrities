import React, { Component } from 'react';

class Game extends Component {
  state = {
    character: '',
  }

  handleCharacterChange = e => {
    const character = e.target.value;
    this.setState({character});
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.assignCharacter(this.state.character);
    this.setState({character: ''});
  }

  render() {
    const { game, myId, startGame, leaveGame } = this.props;
    const me = game.players.find(p => p.id === myId);
    const myTarget = game.players.find(p => p.id === me.target);
    return (
      <div>
        <h2>Game: {game.id}</h2>
        { myTarget && !myTarget.character ?
          <form onSubmit={this.handleSubmit}>
            <p>Give <strong>{myTarget.name}</strong> a character</p>
            <input type="text" value={this.state.character} onChange={this.handleCharacterChange} required />
            <button>Send!</button>
          </form>
        : null }
        <p>Connected Players:</p>
        <ul>
          {game.players.map(p => (
            <li key={p.id}>
              <strong>{p.name}</strong>
              { p.character ?
                <span> is <strong>{p.character}</strong></span>
              : null }
            </li>
          ))}
        </ul>
        { game.hostId === myId ?
          <button onClick={startGame}>Start Game</button>
        : null }
        <button onClick={leaveGame}>Leave Game</button>
      </div>
    )
  }
}

export default Game;