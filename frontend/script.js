document.addEventListener('DOMContentLoaded', () => {

  // Elements
  const chatBox = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const msgInput = document.getElementById('msg');
  const nickModal = document.getElementById('nickname-modal');
  const nickForm = document.getElementById('nickname-form');
  const nickInput = document.getElementById('nickname-input');
  const rulesModal = document.getElementById('rules-modal');
  const emojiBtn = document.getElementById('emoji-btn');
  const themeBtn = document.getElementById('toggle-theme');
  const userCount = document.getElementById('user-count');
  const serverStatus = document.getElementById('server-status');

  let nickname = 'Anonymous';
  let dark = false;

  fetch('http://localhost:5000/ping')
  .then(response => response.json())
  .catch(() => {
    // Do nothing if server is offline
  });


  // Socket.io
  const socket = io("http://localhost:5000");

  // Function to add message
  const addMsg = (text, type='user', name='Anonymous') => {
    const li = document.createElement('li');
    li.className = `chat-message ${type}`;
    if(type==='user') li.innerHTML = `<div class="nickname">${name}</div>`;
    li.innerHTML += `<div>${text}</div><div class="timestamp">${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>`;
    chatBox.appendChild(li);
    chatBox.scrollTop = chatBox.scrollHeight;
  };

  // Nickname form
  nickForm.addEventListener('submit', e => {
    e.preventDefault();
    nickname = nickInput.value.trim() || 'Anonymous';
    nickModal.classList.remove('active');
    addMsg(`👋 Welcome, ${nickname}!`, 'system');
  });
  nickModal.classList.add('active');

  // Send message
  chatForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = msgInput.value.trim();
    if(!text) return;
    addMsg(text,'user',nickname);
    socket.emit('chat message',{text,nickname});
    msgInput.value='';
  });

  // Receive message
  socket.on('chat message', data => {
    if(data.nickname !== nickname) addMsg(data.text,'user',data.nickname);
  });

  // Rules modal
  document.getElementById('open-rules-btn').onclick = () => rulesModal.classList.add('active');
  document.getElementById('close-rules-btn').onclick = () => rulesModal.classList.remove('active');

  // Emoji picker
  const emojis = ['😀','😂','😍','😎','👍','🎉','🔥'];
  emojiBtn.onclick = () => {
    if(document.querySelector('.emoji-picker')) return document.querySelector('.emoji-picker').remove();
    const picker = document.createElement('div');
    picker.className = 'emoji-picker';
    picker.style.cssText = "position:absolute;bottom:60px;right:20px;background:#4b0082;padding:5px;border-radius:10px;display:flex;gap:5px;";
    emojis.forEach(e => {
      const btn = document.createElement('button'); 
      btn.textContent = e; 
      btn.style="background:none;border:none;font-size:20px;cursor:pointer";
      btn.onclick=()=>{msgInput.value+=e; picker.remove();};
      picker.appendChild(btn);
    });
    document.body.appendChild(picker);
  };

  // Theme toggle
  themeBtn.onclick = () => {
    document.body.classList.toggle('light-theme');
    dark = !dark;
    themeBtn.textContent = dark ? '🌞' : '🌙';
  };
});
