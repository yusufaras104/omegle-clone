document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const chatContainer = document.getElementById('chat-container');
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const usernameInput = document.getElementById('username-input');
    const loginButton = document.getElementById('login-button');

    let username;
    let peerConnection;
    let dataChannel;

    loginButton.addEventListener('click', () => {
        username = usernameInput.value.trim();
        if (username) {
            loginContainer.classList.add('hidden');
            chatContainer.classList.remove('hidden');
            setupWebRTC();
        }
    });

    function setupWebRTC() {
        const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
        peerConnection = new RTCPeerConnection(configuration);

        dataChannel = peerConnection.createDataChannel('chat');
        dataChannel.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const message = document.createElement('div');
            message.textContent = `${data.username}: ${data.message}`;
            chatBox.appendChild(message);
            chatBox.scrollTop = chatBox.scrollHeight;
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal({
                    type: 'candidate',
                    candidate: event.candidate,
                });
            }
        };

        // Create offer and set local description
        peerConnection.createOffer().then((offer) => {
            peerConnection.setLocalDescription(offer);
            sendSignal({
                type: 'offer',
                offer: offer,
            });
        });

        // Handle incoming signals
        function sendSignal(signal) {
            // This function should send the signal data to the signaling server
            // In this demo, we'll just log it to the console
            console.log('Send signal:', signal);
        }

        // This function should be called when receiving signals from the signaling server
        function receiveSignal(signal) {
            if (signal.type === 'offer') {
                peerConnection.setRemoteDescription(new RTCSessionDescription(signal.offer));
                peerConnection.createAnswer().then((answer) => {
                    peerConnection.setLocalDescription(answer);
                    sendSignal({
                        type: 'answer',
                        answer: answer,
                    });
                });
            } else if (signal.type === 'answer') {
                peerConnection.setRemoteDescription(new RTCSessionDescription(signal.answer));
            } else if (signal.type === 'candidate') {
                peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
        }

        // Example to simulate receiving a signal
        setTimeout(() => {
            const fakeSignal = {
                type: 'offer',
                offer: peerConnection.localDescription,
            };
            receiveSignal(fakeSignal);
        }, 2000);

        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        function sendMessage() {
            const message = chatInput.value.trim();
            if (message) {
                const messageData = {
                    username: username,
                    message: message,
                };
                dataChannel.send(JSON.stringify(messageData));
                const messageElement = document.createElement('div');
                messageElement.textContent = `You: ${message}`;
                chatBox.appendChild(messageElement);
                chatBox.scrollTop = chatBox.scrollHeight;
                chatInput.value = '';
            }
        }
    }
});
