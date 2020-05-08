import React, { Component } from 'react';

class Lobby extends Component {
  render() {
    const { games, createGame, selectGame } = this.props;
    return (
      <div>
        <h2>Choose your game</h2>
        {games.map((g, i) => (
          <div key={i}>
            <h4>{ g.host }'s Game</h4>
            <button onClick={() => {
              selectGame(g.id);
            }}>Join this game</button>
          </div>
        ))}
        <button onClick={createGame}>Create new game</button>
      </div>
    )
  }
}

export default Lobby;