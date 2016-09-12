'use strict';
const url = 'ws://127.0.0.1:7475';
const socket = new WebSocket(url);

const userName = prompt('Please enter your name');

const messageInput = document.getElementById('messageText');
const chatBox = document.getElementById('chatBox');
const onlineUsersBox = document.getElementById('onlineUsersBox');

messageForm.addEventListener('submit', (event) => {
  const message = {
    type: 'message',
    text: messageInput.value
  };

  if (message.text) {
    send(message);
  }

  messageInput.value = '';
  event.preventDefault();
});

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  const messageType = message.type;

  if (messageType === 'message') {
    addMessage(message);
    chatBox.scrollTop = chatBox.clientHeight;
  }

  if (messageType === 'updateUsers') {
    updateOnlineUsers(message.users);
  }

  if (messageType === 'messageHistory') {
    message.messageHistory.forEach((message) => {
        addMessage(message);
    });
  }
};

socket.onopen = function() {
  const message = {
      type: 'newUser',
      userName
  };

  send(message);
};

function send(object) {
  socket.send(JSON.stringify(object))
}

function addMessage(message) {
  const div = document.createElement('div');
  div.innerHTML = `<b>${message.userName}: &nbsp</b>${message.text}`;
  chatBox.appendChild(div);
}

function updateOnlineUsers(users) {
  onlineUsersBox.innerHTML = "";
  users.forEach((user) => {
    const div = document.createElement('div');
    div.innerHTML = user;
    onlineUsersBox.appendChild(div);
  });
}
