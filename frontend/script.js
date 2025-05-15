document.addEventListener('DOMContentLoaded', () => {
  // Check if backend server is up
  fetch('http://localhost:5000/ping')
    .then(response => response.json())
    .then(data => {
      const statusElem = document.getElementById("server-status");
      statusElem.innerText = data.message;
      statusElem.style.color = "green";
    })
    .catch(() => {
      const statusElem = document.getElementById("server-status");
      statusElem.innerText = "Unable to connect to server.";
      statusElem.style.color = "red";
    });

  // Connect to Socket.io backend
  const socket = io("http://localhost:5000");

  const nicknameModal = document.getElementById('nickname-modal');
  const nicknameForm = document.getElementById('nickname-form');
  const nicknameInput = document.getElementById('nickname-input');

  const rulesModal = document.getElementById('rules-modal');
  const openRulesBtn = document.getElementById('open-rules-btn');
  const closeRulesBtn = document.getElementById('close-rules-btn');

  const chatForm = document.getElementById('chat-form');
  const msgInput = document.getElementById('msg');
  const chatMessages = document.getElementById('chat-messages');
  const typingIndicator = document.getElementById('typing-indicator');

  const userCountSpan = document.getElementById('user-count');
  const emojiBtn = document.getElementById('emoji-btn');
  const toggleThemeBtn = document.getElementById('toggle-theme');

  let nickname = '';
  let isDarkTheme = false;

  function openNicknameModal() {
    nicknameModal.setAttribute('aria-hidden', 'false');
    nicknameInput.focus();
  }

  function closeNicknameModal() {
    nicknameModal.setAttribute('aria-hidden', 'true');
  }

  function addMessage(text, msgType = 'user', nick = 'Anonymous') {
    const li = document.createElement('li');
    li.classList.add('chat-message', msgType);

    if (msgType === 'user') {
      const nickElem = document.createElement('div');
      nickElem.classList.add('nickname');
      nickElem.textContent = nick;
      li.appendChild(nickElem);
    }

    const msgText = document.createElement('div');
    msgText.textContent = text;
    li.appendChild(msgText);

    const timestamp = document.createElement('div');
    timestamp.classList.add('timestamp');
    timestamp.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    li.appendChild(timestamp);

    chatMessages.appendChild(li);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  nicknameForm.addEventListener('submit', e => {
    e.preventDefault();
    const val = nicknameInput.value.trim();
    nickname = val.length > 0 ? val : 'Anonymous';
    closeNicknameModal();
    addMessage(`👋 Welcome, ${nickname}! You joined the chat.`, 'system');
    msgInput.focus();
    userCountSpan.textContent = '1';  // Consider updating this dynamically from server later
  });

  openNicknameModal();

  chatForm.addEventListener('submit', e => {
    e.preventDefault();
    const msg = msgInput.value.trim();
    if (msg === '') return;
    addMessage(msg, 'user', nickname);
    socket.emit("chat message", { text: msg, nickname });
    msgInput.value = '';
    msgInput.focus();
  });

  // Listen for chat messages from others
  socket.on("chat message", (data) => {
    if (data.nickname !== nickname) {
      addMessage(data.text, 'user', data.nickname);
    }
  });

  // Optional: Show connection / disconnection messages
  socket.on("connect", () => {
    console.log("Connected to server");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server");
  });

  openRulesBtn.addEventListener('click', () => rulesModal.setAttribute('aria-hidden', 'false'));
  closeRulesBtn.addEventListener('click', () => rulesModal.setAttribute('aria-hidden', 'true'));

  rulesModal.addEventListener('click', e => {
    if (e.target === rulesModal) rulesModal.setAttribute('aria-hidden', 'true');
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (rulesModal.getAttribute('aria-hidden') === 'false') rulesModal.setAttribute('aria-hidden', 'true');
      if (nicknameModal.getAttribute('aria-hidden') === 'false') nicknameModal.setAttribute('aria-hidden', 'true');
    }
  });

  let emojiPickerOpen = false;
  const emojiList = ['😀', '😂', '😍', '😎', '👍', '🎉', '🔥'];
  let emojiPickerDiv;

  function createEmojiPicker() {
    emojiPickerDiv = document.createElement('div');
    emojiPickerDiv.style.position = 'absolute';
    emojiPickerDiv.style.bottom = '60px';
    emojiPickerDiv.style.right = '30px';
    emojiPickerDiv.style.background = '#4b0082';
    emojiPickerDiv.style.padding = '5px 10px';
    emojiPickerDiv.style.borderRadius = '10px';
    emojiPickerDiv.style.display = 'flex';
    emojiPickerDiv.style.gap = '8px';
    emojiPickerDiv.style.zIndex = 1000;

    emojiList.forEach(emoji => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = emoji;
      btn.style.fontSize = '24px';
      btn.style.background = 'transparent';
      btn.style.border = 'none';
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', () => {
        insertAtCursor(msgInput, emoji);
        msgInput.focus();
        toggleEmojiPicker(false);
      });
      emojiPickerDiv.appendChild(btn);
    });

    document.body.appendChild(emojiPickerDiv);
  }

  function toggleEmojiPicker(show = null) {
    if (show === null) show = !emojiPickerOpen;
    emojiPickerOpen = show;
    if (emojiPickerOpen) {
      if (!emojiPickerDiv) createEmojiPicker();
      emojiPickerDiv.style.display = 'flex';
    } else if (emojiPickerDiv) {
      emojiPickerDiv.style.display = 'none';
    }
  }

  emojiBtn.addEventListener('click', () => toggleEmojiPicker());

  function insertAtCursor(input, text) {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    input.value = input.value.substring(0, start) + text + input.value.substring(end);
    input.selectionStart = input.selectionEnd = start + text.length;
  }

  toggleThemeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    isDarkTheme = !isDarkTheme;
    toggleThemeBtn.textContent = isDarkTheme ? '🌞' : '🌙';
  });
});
