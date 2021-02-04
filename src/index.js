const express = require('express');
const app = require('./app');
const socketio = require('socket.io');
const http = require('http');
const { addUser, removeUser, getUsers, getUsersInRoom} = require('./users');

const port = process.env.PORT || 5000;
const host = process.env.HOST || 'localhost';

const server = http.createServer(app);
const io = socketio(server, { cors: { origin: '*' }});

io.on('connection', (socket) => {
    console.log('We have a new connection!');

    socket.on('join', ({ name, room }, callback) => {

        const { user, error } = addUser({id: socket.id, name, room});

        if(error) return callback(error);
        
        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to the room ${user.room}`});
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, has joined!`});
        
        socket.join(user.room);

        io.to(user.room).emit('roomData', { room: user.room , users: getUsersInRoom(user.room)})

        callback(); 
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUsers(socket.id);

        io.to(user.room).emit('message', { user: user.name, text: message});
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});

        callback();
    });

    socket.on('disconnect', () => {

        const user = removeUser(socket.id);
        user ? io.to(user.room).emit('message', { user: 'admin', text: `${user.name}`}) : null;
    });

})

server.listen(port, host, () => {
    console.log(`\n===============================================`);
    console.log(`   Server running on: http://${host}:${port}/`);
    console.log(`===============================================\n`);
})
