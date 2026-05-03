(function () {
    'use strict';

    window.EMCP = window.EMCP || {};
    
    let activeEventId = null;
    let pollInterval = null;
    let currentUserId = null;

    async function initChat(user) {
        currentUserId = user.id;
        const channelsList = document.getElementById('chat-channels-list');
        const messagesDisplay = document.getElementById('chat-messages-display');
        const sendForm = document.getElementById('chat-send-form');
        const inputField = document.getElementById('chat-input-field');
        const activeContent = document.getElementById('chat-active-content');
        const emptyState = document.getElementById('chat-empty-state');
        const channelNameDisplay = document.getElementById('active-channel-name');

        if (!channelsList || !sendForm) return;

        // 1. Load channels (Events)
        let events = [];
        if (user.role === 'ORGANIZER') {
            events = await window.EMCP.repo.listEventsByOrganizer(user.id);
        } else if (user.role === 'STAFF') {
            const allStaff = await window.EMCP.repo.listEventStaff();
            const myAssignments = allStaff.filter(s => s.staffId === user.id);
            const allEvents = await window.EMCP.repo.listEvents();
            events = allEvents.filter(e => myAssignments.some(a => a.eventId === e.id));
        }

        renderChannels(events);

        // 2. Setup event listeners
        sendForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = inputField.value.trim();
            if (!content || !activeEventId) return;

            const res = await window.EMCP.repo.sendMessage(activeEventId, content);
            if (res.ok) {
                inputField.value = '';
                loadMessages(activeEventId, true);
            }
        });

        function renderChannels(eventsList) {
            channelsList.innerHTML = eventsList.map(event => `
                <div class="chat-channel-item" data-event-id="${event.id}">
                    <div class="channel-name">${event.title}</div>
                    <div class="channel-last-msg">Team Channel</div>
                </div>
            `).join('') || '<div class="muted small text-center p-3">No active events for chat.</div>';

            channelsList.querySelectorAll('.chat-channel-item').forEach(item => {
                item.addEventListener('click', () => {
                    const eventId = item.getAttribute('data-event-id');
                    const eventTitle = item.querySelector('.channel-name').textContent;
                    selectChannel(eventId, eventTitle);
                    
                    channelsList.querySelectorAll('.chat-channel-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                });
            });
        }

        function selectChannel(eventId, title) {
            activeEventId = eventId;
            channelNameDisplay.textContent = title;
            emptyState.classList.add('hidden');
            activeContent.classList.remove('hidden');
            
            loadMessages(eventId, true);

            if (pollInterval) clearInterval(pollInterval);
            pollInterval = setInterval(() => loadMessages(eventId), 3000);
        }

        async function loadMessages(eventId, forceScroll = false) {
            if (activeEventId !== eventId) return;
            const messages = await window.EMCP.repo.listMessages(eventId);
            renderMessages(messages, forceScroll);
        }

        function getInitials(name) {
            return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??';
        }

        function renderMessages(msgs, forceScroll = false) {
            const isAtBottom = messagesDisplay.scrollHeight - messagesDisplay.scrollTop <= messagesDisplay.clientHeight + 100;
            
            let html = '';
            msgs.forEach((msg, index) => {
                const isMine = msg.senderId === currentUserId;
                const prevMsg = msgs[index - 1];
                const isConsecutive = prevMsg && prevMsg.senderId === msg.senderId;
                
                html += `
                    <div class="message ${isMine ? 'sent' : 'received'} ${isConsecutive ? 'consecutive' : ''}">
                        <div class="avatar-wrapper">
                            <div class="chat-avatar" style="background: ${isMine ? 'var(--chat-primary)' : '#94A3B8'}">
                                ${getInitials(msg.senderName)}
                            </div>
                        </div>
                        <div class="message-content">
                            ${!isConsecutive && !isMine ? `<span class="sender-name-meta" style="font-size: 0.8rem; font-weight: 700; margin-bottom: 4px; color: var(--chat-text-main)">${msg.senderName}</span>` : ''}
                            <div class="message-bubble">${msg.content}</div>
                            <div class="message-info">
                                <span class="time">${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>
                `;
            });

            messagesDisplay.innerHTML = html;
            
            setTimeout(() => {
                if (isAtBottom || forceScroll) {
                    messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
                }
            }, 50);
        }
    }

    window.EMCP.chat = {
        init: initChat
    };
})();
