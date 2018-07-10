const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const port = process.env.PORT || 4002;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const TableMap = {};
const UserMap ={};

function Table(id) {
    this.id = id;
    this.members = [];
}

function User(name, socketId, tableId) {
    this.name = name;
    this.socketId = socketId;
    this.tableId = tableId
}

io.on('connection', socket => {
    console.log('Player connected.');
    
    let name = '';
    
    
    
    socket.on('start', data => {
        name = data.name;
        UserMap[name] = new User(name, socket.id, data.id);
        if (!(data.id in TableMap))
            TableMap[data.id] = new Table(data.id);
        console.log(TableMap[data.id]);
        TableMap[data.id].members.push(name);
    });
    
    socket.on('click', () => {
        console.log('click from '+ name);
        
        let table = TableMap[UserMap[name].tableId];
        
        for (let i in table.members)
            io.to(UserMap[table.members[i]].socketId)
                .emit('response', 'Click from: ' + name);
    });
    
});

server.listen(port, () => console.log(`Listening on port ${port}`));