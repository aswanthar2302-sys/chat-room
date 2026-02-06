const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const joinScreen = document.getElementById('join-screen');
const chatScreen = document.getElementById('chat-screen');
const joinForm = document.getElementById('join-form');
const leaveBtn = document.getElementById('leave-btn');

// Socket setup (initially null until join)
let socket;
let username, room;

// Handle Join Event
joinForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get username and room from form
    username = e.target.elements.username.value;
    room = e.target.elements.room.value;

    if (username && room) {
        // Initialize socket connection
        socket = io();

        // Join Chatroom
        socket.emit('joinRoom', { username, room });

        // Switch screens
        joinScreen.classList.remove('active');
        chatScreen.classList.add('active');

        setupSocketEvents();
    }
});

function setupSocketEvents() {
    // Get room and users
    socket.on('roomUsers', ({ room, users }) => {
        outputRoomName(room);
        outputUsers(users);
    });

    // Message from server
    socket.on('message', (message) => {
        console.log(message);
        outputMessage(message);

        // Scroll down
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get message text
    const msg = e.target.elements.msg.value;

    if (!msg) return;

    // Emit message to server
    socket.emit('chatMessage', msg);

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');

    // Check if message is from current user for styling
    const isCurrentUser = message.username === username;
    div.classList.add('message');
    if (isCurrentUser) {
        div.classList.add('right');
    }

    div.innerHTML = `
    <div class="meta">
      <span>${isCurrentUser ? 'You' : message.username}</span> 
      <span>${message.time}</span>
    </div>
    <p class="text">
      ${message.text}
    </p>`;

    chatMessages.appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}

// Prompt the user before leaving chat room
leaveBtn.addEventListener('click', () => {
    const leave = confirm('Are you sure you want to leave the chatroom?');
    if (leave) {
        window.location.reload();
    }
});
