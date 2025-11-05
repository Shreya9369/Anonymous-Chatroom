document.addEventListener('DOMContentLoaded', () => {

  const chatBox = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const msgInput = document.getElementById('msg');
  const nickModal = document.getElementById('nickname-modal');
  const nickForm = document.getElementById('nickname-form');
  const nickInput = document.getElementById('nickname-input');
  const rulesModal = document.getElementById('rules-modal');
  const themeBtn = document.getElementById('toggle-theme');
  const userCount = document.getElementById('user-count');
  const serverStatus = document.getElementById('server-status');

  let nickname = 'Anonymous';
  let dark = false;

  fetch('http://localhost:5000/ping').catch(() => {});
  const socket = io("http://localhost:5000");

  const addMsg = (text, type='user', name='Anonymous') => {
    const li = document.createElement('li');
    li.className = `chat-message ${type}`;
    if(type === 'user') li.innerHTML = `<div class="nickname">${name}</div>`;
    li.innerHTML += `<div>${text}</div><div class="timestamp">${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>`;
    chatBox.appendChild(li);
    chatBox.scrollTop = chatBox.scrollHeight;
  };

  nickForm.addEventListener('submit', e => {
    e.preventDefault();
    nickname = nickInput.value.trim() || 'Anonymous';
    nickModal.classList.remove('active');
    addMsg(`👋 Welcome, ${nickname}!`, 'system');
  });
  nickModal.classList.add('active');

  chatForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = msgInput.value.trim();
    if(!text) return;
    addMsg(text, 'user', nickname);
    socket.emit('chat message', { text, nickname });
    msgInput.value = '';
  });

  socket.on('chat message', data => {
    if(data.nickname !== nickname) addMsg(data.text, 'user', data.nickname);
  });

  document.getElementById('open-rules-btn').onclick = () => rulesModal.classList.add('active');
  document.getElementById('close-rules-btn').onclick = () => rulesModal.classList.remove('active');

  themeBtn.onclick = () => {
    document.body.classList.toggle('light-theme');
    dark = !dark;
    themeBtn.textContent = dark ? '🌞' : '🌙';
  };

});
