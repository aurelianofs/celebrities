'use strict';
const express = require('express');
const { Server } = require('ws');
const {
  Game,
  Player,
  PlayerCollection
} = require('./models');

//init Express
const app = express();

//init Express Router
const port = process.env.PORT || 3000;

app.use(express.static('build'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/build/index.html');
});

const server = app.listen(port, function () {
  console.log('node.js static server listening on port: ' + port + ", with websockets listener")
})

const wss = new Server({ server });

const games = [];
const allPlayers = new PlayerCollection();

wss.on('connection', (ws) => {

  let player = new Player(ws);

  console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''), 'New device connected.');

  ws.on('message', function(msg) {
    const { action, data } = JSON.parse(msg);

    console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''), action, data);

    switch (action) {
      case 'PLAYER_LOGIN': {
        const found = data.id ? allPlayers.find( p => p.id === data.id ) : null;

        // Check if it's a returning player
        if(found) {
          player = found;
          player.returning(ws);
        } else {
          allPlayers.push(player)
        }

        player.send('PLAYER_LOGGED', {
          id: player.id,
          name: player.name,
          game: player.getGame(),
          games: games.map(g => {
            return {
              id: g.id,
              host: g.getHost().name
            }
          })
        })
        break;
      }
      case 'PLAYER_NAME': {
        player.setName(data.name);
        break;
      }
      case 'CREATE_GAME': {
        const game = new Game(player);
        games.push(game);

        player.send('GAME_UPDATE', {
          game: player.getGame()
        })

        allPlayers.send('AVAILABLE_GAMES', {
          games: games.map(g => {
            return {
              id: g.id,
              host: g.getHost().name
            }
          })
        })
        break;
      }
      case 'JOIN_GAME': {
        const game = games.find(g => g.id === data.id);
        game.addPlayer(player);

        game.broadcast('GAME_UPDATE', p => {
          return {
            game: p.getGame()
          }
        });
        break;
      }
      case 'LEAVE_GAME': {
        const game = player.game;
        const gamePlayers = game.players;
        const closeGame = game.removePlayer(player);

        // The host left, remove the game
        if(closeGame) {
          const gameIndex = games.findIndex(g => g.id === game.id);
          games.splice(gameIndex, 1);

          allPlayers.send('AVAILABLE_GAMES', {
            games: games.map(g => {
              return {
                id: g.id,
                host: g.getHost().name
              }
            })
          });
        }
        break;
      }
      case 'START_GAME': {
        const game = player.game;
        if(game.hostId === player.id){
          game.assignTargets();
          game.broadcast('GAME_UPDATE', p => {
            return {
              game: p.getGame()
            }
          });
        }
        break;
      }
      case 'ASSIGN_CHARACTER': {
        const game = player.game;
        game.assignCharacter(player.id, data.character);
        game.broadcast('GAME_UPDATE', p => {
          return {
            game: p.getGame()
          }
        });
        break;
      }
      default:
        break;
    }

  });

  ws.on('close', () => {
    player.leaving(function(){
      const playerIndex = allPlayers.findIndex(p => p.id === player.id);
      allPlayers.splice(playerIndex, 1);

      if(player.game) {
        const game = player.game;
        const gamePlayers = game.players;
        const closeGame = game.removePlayer(player);

        // The host left, remove the game
        if(closeGame) {
          const gameIndex = games.findIndex(g => g.id === game.id);
          games.splice(gameIndex, 1);

          allPlayers.send('AVAILABLE_GAMES', {
            games: games.map(g => {
              return {
                id: g.id,
                host: g.getHost().name
              }
            })
          });
        }
      }
    }, 1000*60*10);
    console.log('Player ' + player.id + ' disconnected');
  });
});