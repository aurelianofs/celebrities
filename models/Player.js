const crypto = require("crypto");

class Player {
  id = null;
  name = null;
  client = null;
  game = null;

  constructor(client) {
    this.id = crypto.randomBytes(7).toString('hex');
    this.client = client;
  }

  setName(name) {
    this.name = name;
  }

  setClient(client) {
    this.client = client;
  }

  send(action, data) {
    this.client.send(JSON.stringify({
      action,
      data
    }));
  }

  joinGame(game) {
    this.game = game;
  }

  leaveGame() {
    this.game = null;
  }

  getGame() {
    return this.game ? {
      id: this.game.id,
      hostId: this.game.hostId,
      players: this.game.getPlayers(this.id)
    } : null;
  }
}

module.exports = Player;