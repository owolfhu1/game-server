const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const port = process.env.PORT || 4002;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const TableMap = {};
const UserMap ={};

const Game = require('./Game');

function Table(id) {
    this.id = id;
    this.members = [];
    this.game = null;
    this.playersReady = [];
}

function User(name, socketId, tableId) {
    this.name = name;
    this.socketId = socketId;
    this.tableId = tableId;
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
    
    socket.on('ready', () => {
        
        console.log('player ' + name + ' ready.');
        
        
        let table = TableMap[UserMap[name].tableId];
        if (table.playersReady.indexOf(name) === -1)
            table.playersReady.push(name);
        if (table.playersReady.length === table.members.length) {
            //start game
            
            table.game = new Game(table.members, (winner, score) => {
                 for(let i in table.members)
                     io.to(UserMap[table.members[i]].socketId).emit(
                         'response', winner + ' has won with ' + score + ' points');
            });
    
            console.log(table);
            
            for(let i in table.members) {
                let socketId = UserMap[table.members[i]].socketId;
                io.to(socketId).emit('update' + table.id, table.game.getBoard());
                console.log("updating");
            }
        } else {
            for (let i in table.members)
                io.to(UserMap[table.members[i]].socketId)
                    .emit('response', 'there are ' + table.playersReady.length
                        + ' out of ' + table.members.length + ' players ready.');
        }
    });
    
    socket.on('move', spot => {
        let table = TableMap[UserMap[name].tableId];
        let game = table.game;
        
        if (game.getTurn() === name && game.isLegal(spot)){
            game.move(spot);
    
            for(let i in table.members) {
                let socketId = UserMap[table.members[i]].socketId;
                io.to(socketId).emit('update' + table.id, table.game.getBoard());
                console.log("updating");
            }
            
        }
        
    });
    
    
    //TODO disconnection
    
});

server.listen(port, () => console.log(`Listening on port ${port}`));
