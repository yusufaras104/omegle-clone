document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

    // Replace with your WebSocket server URL
    const socket = new WebSocket('wss://your-websocket-server-url');

    socket.addEventListener('open', () => {
        console.log('Connected to the server');
    });

    socket.addEventListener('message', (event) => {
        const message = document.createElement('div');
        message.textContent = `Stranger: ${event.data}`;
        chatBox.appendChild(message);
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            const messageElement = document.createElement('div');
            messageElement.textContent = `You: ${message}`;
            chatBox.appendChild(messageElement);
            chatBox.scrollTop = chatBox.scrollHeight;
            socket.send(message);
            chatInput.value = '';
        }
    }
});
