<template>
    <div class="chat">
        <div class="chat__sidebar">
            <h3>People</h3>
            <div id="users">
                <ol>
                    <li v-for="user in users">{{ user }}</li>
                </ol>
            </div>
        </div>

        <div class="chat__main">
            <ol class="chat__messages">
                <li class="message" v-for="msg in responsedMessages">
                    <div class="message__title">
                        <h4>{{ msg.from }}</h4>
                        <span>{{ msg.createAt }}</span>
                    </div>
                    <div class="message__body">
                        <p v-if="msg.text">{{ msg.text }}</p>
                        <a v-else-if="msg.url" :href="msg.url" target="_blank">My current location</a>
                    </div>
                </li>
            </ol>
            <div class="chat__footer">
                <form id="message-form">
                    <input type="text" placeholder="Message" autofocus autocomplete="off" v-model="message">
                    <button @click.prevent="sendMsg">Send</button>
                </form>
                <button @click="sendLocation">Send location</button>
            </div>
        </div>
    </div>
</template>

<script>
    import moment from 'moment';
    import socketIOClient from 'socket.io-client';
    const socket = socketIOClient('localhost:3000');

    export default {
        data() {
            return {
                message: '',
                responsedMessages: [],
                query: this.$route.query,
                users: []
            };
        },
        methods: {
            sendMsg() {
                const msg = { text: this.message };
                socket.emit('createMessage', msg, (serverMsg) => {
                    console.log(serverMsg);
                });
                this.message = '';
            },
            sendLocation() {
                navigator.geolocation.getCurrentPosition(function (position) {
                    socket.emit('createLocationMessage', { latitude: position.coords.latitude, longitude: position.coords.longitude });
                });
            },
            scrollToBottom() {
                const messages = document.querySelector('.chat__messages');
                const newMessage = document.querySelector('li:last-child') || {};
                const scrollHeight = messages.scrollHeight;
                const scrollTop = messages.scrollTop;
                const clientHeight = messages.clientHeight;
                const newMessageHeight = newMessage.scrollHeight;
                if (scrollTop + clientHeight + newMessageHeight * 5 >= scrollHeight) {
                    messages.scrollTop = scrollHeight;
                }
            },
            joinChat() {
                socket.emit('join', this.query, (err) => {
                    if (err) {
                        alert(err);
                        this.$router.push('/');
                    } else {
                        console.log('No error');
                    }
                })
            }
        },
        created() {
            socket.on('connect', () => {
                console.log('connect to server');
                this.joinChat();
            });

            socket.on('newMessage', (msg) => {
                msg.createAt = moment(msg.createAt).format('h:mm a');
                this.responsedMessages.push(msg);
                setTimeout(this.scrollToBottom, 10);
            });

            socket.on('updateUserList', (users) => {
                this.users = users;
            });
        }
    };
</script>