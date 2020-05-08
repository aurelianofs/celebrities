const PlayerCollection = require('./PlayerCollection');

let id = 0;

class Game {
  id = null;
  hostId = null;
  players = new PlayerCollection();
  targets = {};
  characters = {};

  constructor(host) {
    this.id = id;
    id++;

    this.hostId = host.id;
    this.addPlayer(host);
  }

  addPlayer(player) {
    this.players.push(player);
    player.joinGame(this);
  }

  removePlayer(player) {
    let closeGame = false;
    if(player.id === this.hostId) {
      this.players.forEach(p => p.leaveGame());
      closeGame = true;
    } else {
      this.players = this.players.filter(p => p.id !== player.id);
      player.leaveGame();
    }
    return closeGame;
  }

  getHost() {
    return this.players.find(p => p.id === this.hostId)
  }

  broadcast(action, data) {
    this.players.send(action, data)
  }

  assignTargets() {
    this.characters = {};
    let ids = this.players.map(p => p.id);
    ids = this.shuffle(ids);

    this.targets = ids.reduce((dictionary, n, i) => {
      dictionary[n] = ids[ i ? i - 1 : ids.length - 1 ];
      return dictionary;
    }, {});

    return this.targets;
  }

  assignCharacter(giverId, character) {
    const targetId = this.targets[giverId];
    this.characters[targetId] = character;
  }

  shuffle(arr) {
    const result = [];
    while(arr.length) {
      result.push(arr.splice(Math.floor(Math.random() * arr.length),1)[0])
    }
    return result;
  }

  getPlayers(forId) {
    return this.players.map(p => {
      return {
        id: p.id,
        name: p.name,
        target: this.targets[p.id] ? this.targets[p.id] : null,
        character: this.characters[p.id] && forId !== p.id ? this.characters[p.id] : null,
      }
    })
  }
}

module.exports = Game;