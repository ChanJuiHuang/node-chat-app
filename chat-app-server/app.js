const express = require('express');
const socketIO = require('socket.io');

const app = express();
const server = require('http').createServer(app);
const io = socketIO(server);
const { generateMessage, generateLocationMessage, isRealString } = require('./utils');
const Users = require('./utils/users');
const users = new Users();

app.use(express.static('public'));

io.on('connect', (socket) => {
    console.log('a user connected');

    socket.on('join', (query, cb) => {
        if (!isRealString(query.name) || !isRealString(query.room)) {
            return cb('Name and room name are required.');
        }

        socket.join(query.room);

        users.removeUser(socket.id);
        users.addUser(socket.id, query.name, query.room);
        io.to(query.room).emit('updateUserList', users.getUserList(query.room));

        socket.emit('newMessage', generateMessage('Admin', `Welcome to the ${query.room}`));
        socket.broadcast.to(query.room).emit('newMessage', generateMessage('Admin', `${query.name} joined`));
        cb(null);
    });

    socket.on('disconnect', () => {
        const user = users.removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left`));
        }
    });

    socket.on('createMessage', (msg, cb) => {
        const user = users.getUser(socket.id);
        if (user) {
            io.to(user.room).emit('newMessage', generateMessage(user.name, msg.text));
        }
        cb('I am Server^^');
    });

    socket.on('createLocationMessage', (coords) => {
        const user = users.getUser(socket.id);
        if (user) {
            io.to(user.room).emit('newMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude));
        }
    });
});

server.listen(3000);