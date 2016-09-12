'use strict';

const http = require('http');
const WebSocketServer = require('ws').Server;
const nstatic = require('node-static');
const httpPort = 7474;
const wsPort = 7475;
const file = new nstatic.Server('./frontend');

const httpServer = http.createServer((req, res) => {
  req.addListener('end', function () {
    file.serve(req, res);
  }).resume();
});

httpServer.listen(httpPort);

const wss = new WebSocketServer({
  port: wsPort
})

const users = [];
const messageHistory = [];

wss.on('connection', (ws) => {
  let userName;

  //send message history to the new user
  ws.send(JSON.stringify({
    type: 'messageHistory',
    messageHistory,
  }));

  ws.on('message', (msg) => {
    const message = JSON.parse(msg);

    if(message.type === "newUser") {
      //set new user name
      userName = message.userName ? message.userName.replace(/\W/g, '') : `User${users.length}`;
      users.push(userName);

      //notify about changes in users list
      sendUsersList();
    }

    if(message.type === "message") {
      const userMessage = { 
        type: 'message',
        text: message.text.trim(),
        userName
      };

      //add message to history
      messageHistory.push(userMessage);
      //send new message to all users
      sendToAll(userMessage);
    }
  });

  ws.on('close', (msg) => {
    // remove user from users list
    const userIndex = users.indexOf(userName);
    users.splice(userIndex, 1);

    //notify about changes in users list
    sendUsersList();
  });
});

function sendToAll(message) {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(message));
  });
}

function sendUsersList() {
  const message = { 
    type: 'updateUsers',
    users
  };
  sendToAll(message);
}