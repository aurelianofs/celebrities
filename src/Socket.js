let HOST = window.location.origin.replace(/^http/, 'ws');

if(process.env.NODE_ENV === 'development') {
  HOST = HOST.replace(':3000', ':8080');
}

const savedPlayerID = localStorage && localStorage.getItem('playerID') ? JSON.parse(localStorage.getItem('playerID')) : null;

class Socket {
  ws = new WebSocket(HOST);
  onApiStateChange = null;
  pingTimeout = false;

  constructor(actions, onApiStateChange) {
    this.onApiStateChange = onApiStateChange;

    this.ws.onopen = (e) => {
      // on connecting, do nothing but log it to the console
      this.onApiStateChange('connected');

      this.keepAlive();

      this.send('PLAYER_LOGIN', {
        id: savedPlayerID ? savedPlayerID : null
      });
    }

    this.ws.onmessage = evt => {
      // listen to data sent from the websocket server
      const { action, data } = JSON.parse(evt.data);

      console.log(action, data);

      if(actions[action]) actions[action](data);
    }


    this.ws.onclose = (e) => {
      this.onApiStateChange('closed');
      if(this.pingTimeout) clearTimeout(this.pingTimeout);
    }
  }

  keepAlive = () => {
    if (this.ws.readyState === this.ws.OPEN) {
      this.send('PING', null);
    }
    this.pingTimeout = setTimeout(this.keepAlive, 20000);
  }

  send = (action, data) => {
    this.ws.send(JSON.stringify({
      action,
      data
    }));
  }
}

export default Socket;