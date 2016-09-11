'use strict';

const http = require('http');
const WebSocketServer = require('ws').Server;
const fs = require('fs');

const indexPage = fs.readFileSync('./index.html');

const host = '127.0.0.1';
const httpPort = 7474;
const wsPort = 7475;

const httpServer = http.createServer((req, res) => {
    res.writeHeader(200, {'Content-Type': 'text/html'});
    res.end(indexPage);
});

httpServer.listen(httpPort, host);

const wss = new WebSocketServer({
    host,
    port: wsPort
})

const users = [];
const messageHistory = [];
let userIndex = -1;

wss.on('connection', (ws) => {
  let userName;

  ws.send(JSON.stringify({
    type: 'initialData',
    messageHistory,
    users
  }));

  ws.on('message', (msg) => {
      console.log(`received: ${msg}`);

      const message = JSON.parse(msg);

      if(message.type === "userIn") {
        ++userIndex;
        userName = message.userName ? message.userName.replace(/\W/g, '') : `Anonymous${userIndex}`;
        users.push(userName);

        wss.clients.forEach((client) => {
          client.send(JSON.stringify({ 
              type: 'userIn',
              userName
            })
          );
        });
      }

      if(message.type === "message") {
        wss.clients.forEach((client) => {
          const userMessage = { 
              type: 'message',
              text: message.text.trim(),
              userName
            };
          messageHistory.push(userMessage)
          client.send(JSON.stringify(userMessage));
        }); 
      }
  });

  ws.on('close', (msg) => {
    wss.clients.forEach((client) => {
      client.send(JSON.stringify({ 
          type: 'userOut',
          userName,
          userIndex
        })
      );
    });
  });

});

