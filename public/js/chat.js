// public/js/chat.js

const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const userList = document.getElementById('userList');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');

let username = '';
const usernameModal = document.getElementById('usernameModal');
const usernameInput = document.getElementById('usernameInput');
const enterChatBtn = document.getElementById('enterChatBtn');

enterChatBtn.addEventListener('click', () => {
  username = usernameInput.value.trim() || 'Anonymous';
  socket.emit('new-user', username);
  usernameModal.classList.add('hidden');
});

// Send message
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = input.value.trim();
  if (msg) {
    const data = {
      name: username,
      message: msg,
      timestamp: new Date().toISOString()
    };
    socket.emit('send-message', msg);
    addMessage(data, true);
    input.value = '';
  }
});

// Add message bubble
function addMessage(data, self = false) {
  const time = formatTime(data.timestamp);
  const wrapper = document.createElement('div');
  wrapper.className = `flex ${self ? 'justify-end' : 'justify-start'} px-4`;

  const bubble = document.createElement('div');
  bubble.className = `max-w-[75%] px-4 py-2 rounded-2xl shadow ${
    self ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-zinc-700 text-white rounded-bl-none'
  }`;

  const label = document.createElement('div');
  label.className = 'text-sm font-medium mb-1';
  label.textContent = `${self ? '🧍 You' : '👤 ' + data.name}:`;

  const content = document.createElement('div');
  content.textContent = data.message;

  const meta = document.createElement('div');
  meta.className = 'text-xs text-gray-300 mt-1 text-right';
  meta.textContent = `[${time}]`;

  bubble.appendChild(label);
  bubble.appendChild(content);
  bubble.appendChild(meta);
  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
}

// Time formatter
function formatTime(isoString) {
  const date = new Date(isoString);
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

// File Upload
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('socketId', socket.id);
  fetch('/upload', { method: 'POST', body: formData });
  fileInput.value = '';
});

// Render uploaded files
socket.on('file-uploaded', data => {
  const time = formatTime(data.timestamp);
  const wrapper = document.createElement('div');
  wrapper.className = `flex ${data.name === username ? 'justify-end' : 'justify-start'} px-4`;

  const bubble = document.createElement('div');
  bubble.className = `max-w-[75%] px-4 py-2 rounded-2xl shadow ${
    data.name === username ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-zinc-700 text-white rounded-bl-none'
  }`;

  const label = document.createElement('div');
  label.className = 'text-sm font-medium mb-1';
  label.textContent = `${data.name === username ? '🧍 You' : '👤 ' + data.name}:`;

  const content = document.createElement('div');
  if (data.isImage) {
    const img = document.createElement('img');
    img.src = data.fileUrl;
    img.alt = data.originalName;
    img.className = 'rounded-lg max-w-xs max-h-60 border border-gray-700';
    content.appendChild(img);
  } else {
    const link = document.createElement('a');
    link.href = data.fileUrl;
    link.download = data.originalName;
    link.textContent = `📎 ${data.originalName}`;
    link.className = 'underline text-blue-300 hover:text-blue-200';
    content.appendChild(link);
  }

  const meta = document.createElement('div');
  meta.className = 'text-xs text-gray-300 mt-1 text-right';
  meta.textContent = `[${time}]`;

  bubble.appendChild(label);
  bubble.appendChild(content);
  bubble.appendChild(meta);
  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
});

// Realtime messaging
socket.on('chat-message', data => {
  if (data.name !== username) {
    addMessage(data, false);
  }
});
socket.on('user-connected', name => notify(`${name} joined the chat`));
socket.on('user-disconnected', name => notify(`${name} left the chat`));

// Notifications
function notify(text) {
  const item = document.createElement('li');
  item.className = 'text-sm text-gray-400 italic px-4';
  item.textContent = text;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
}

// Active user list
socket.on('update-user-list', (users) => {
  userList.innerHTML = '';
  Object.values(users).forEach(name => {
    const li = document.createElement('li');
    li.textContent = (name === username) ? `🧍 ${name} (You)` : `👤 ${name}`;
    li.className = (name === username) ? 'text-emerald-400 font-semibold' : '';
    userList.appendChild(li);
  });
});
