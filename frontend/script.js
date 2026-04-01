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
  const openRulesBtn = document.getElementById('open-rules-btn');
  const closeRulesBtn = document.getElementById('close-rules-btn');

  let nickname = 'Anonymous';
  let isDark = false;

  themeBtn.textContent = '🌙';

  const socket = io('http://localhost:5000');

  const addMsg = (text, type = 'user', name = 'Anonymous', time = null) => {
    const li = document.createElement('li');
    li.className = `chat-message ${type}`;

    if (type === 'user') {
      li.innerHTML = `<div class="nickname">${name}</div>`;
    }

    const displayTime =
      time ||
      new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });

    li.innerHTML += `
      <div>${text}</div>
      <div class="timestamp">${displayTime}</div>
    `;

    chatBox.appendChild(li);
    chatBox.scrollTop = chatBox.scrollHeight;
  };

  nickForm.addEventListener('submit', (e) => {
    e.preventDefault();

    nickname = nickInput.value.trim() || 'Anonymous';
    nickModal.classList.remove('active');
    addMsg(`👋 Welcome, ${nickname}!`, 'system');

    socket.emit('user joined', nickname);
  });

  nickModal.classList.add('active');

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = msgInput.value.trim();
    if (!text) return;

    addMsg(text, 'user', nickname);
    socket.emit('chat message', { text, nickname });

    msgInput.value = '';
    typingIndicator.textContent = '';
  });

  socket.on('chat message', (data) => {
    if (data.nickname !== nickname) {
      addMsg(data.text, 'user', data.nickname, data.time);
    }
  });

  socket.on('chat history', (messages) => {
    chatBox.innerHTML = '';

    messages.forEach((msg) => {
      addMsg(msg.text_message, 'user', msg.nickname, msg.time_sent);
    });
  });

  socket.on('user count', (count) => {
    userCount.textContent = count;
  });

 

  socket.on('system message', (message) => {
    addMsg(message, 'system');
  });

  msgInput.addEventListener('input', () => {
    socket.emit('typing', nickname);
  });

  openRulesBtn.onclick = () => {
    rulesModal.classList.add('active');
  };

  closeRulesBtn.onclick = () => {
    rulesModal.classList.remove('active');
  };

  themeBtn.onclick = () => {
    document.body.classList.toggle('dark-theme');
    isDark = !isDark;
    themeBtn.textContent = isDark ? '🌞' : '🌙';
  };
});
