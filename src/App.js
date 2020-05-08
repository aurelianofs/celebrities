import React, { Component } from 'react';
import WebSocketAPI from './WebSocketAPI'
import Welcome from './screens/Welcome';
import Lobby from './screens/Lobby';
import Game from './screens/Game';
import './App.css';

class App extends Component {
  state = {
    id: null,
    name: null,
    game: null,
    screen: null,
    availableGames: [],
    apiState: null,
  }

  api = new WebSocketAPI({
    'PLAYER_LOGGED': data => {
      this.setState({
        id: data.id,
        name: data.name,
        game: data.game,
        availableGames: data.games
      });
    },
    'AVAILABLE_GAMES': data => {
      this.setState({
        availableGames: data.games
      });
    },
    'GAME_UPDATE': data => {
      this.setState({
        game: data.game
      });
    }
  }, state => {
    this.setState({
      apiState: state
    });
  });

  componentDidUpdate = prevProps => {
    if(localStorage) localStorage.setItem('playerID',  JSON.stringify(this.state.id));
  }

  onApiStateChange = state => {
  }

  handleNameChange = name => {
    this.setState({name});
    this.api.send('PLAYER_NAME', {name});
  }

  handleCreateGame = () => {
    this.api.send('CREATE_GAME');
  }

  handleSelectGame = id => {
    this.api.send('JOIN_GAME', {id});
  }

  handleStartGame = () => {
    this.api.send('START_GAME');
  }

  handleLeaveGame = () => {
    this.api.send('LEAVE_GAME');
  }

  handleAssignCharacter = character => {
    this.api.send('ASSIGN_CHARACTER', {character});
  }

  render() {
    const { id, name, availableGames, game, apiState } = this.state;
    return (
      <div className="App">
        <small>API Status: <strong>{apiState}</strong></small>
        {
          !name ? <Welcome setName={this.handleNameChange} /> :
          !game ? <Lobby games={availableGames} createGame={this.handleCreateGame} selectGame={this.handleSelectGame} /> :
          <Game myId={id} game={game} startGame={this.handleStartGame} leaveGame={this.handleLeaveGame} assignCharacter={this.handleAssignCharacter} />
        }
      </div>
    );
  }
}

export default App;
