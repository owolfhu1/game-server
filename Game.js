
const playerAtSpot = (board,spot) => {
    let atSpot = false;
    for (let player in board.players)
        atSpot = board.players[player].x === spot.x
        && board.players[player].y === spot.y ? true : atSpot;
    return atSpot;
};

function Player(i) {
    this.x = i + 3;
    this.y = 11;
    this.direction = true;//true = up; false = down
    this.points = 0;
    this.moves = 0;
}

function Square(x,y) {
    this.x = x;
    this.y = y;
    this.points = Math.floor(Math.random() * 4);
}

const makeBoard = (players) => {
    let board = {};
    board.board = [];
    board.players = {};
    for (let y = 0; y < 12; y++) {
        board.board.push([]);
        for (let x = 0; x < 8; x++)
            board.board[y].push(new Square(x,y));
    }
    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        board.players[player] = new Player(i);
        board.board[11][i+3].points = 0;
    }
    return board;
};


const isLegal = (board,player,spot) => {
    if (playerAtSpot(board,spot))
        return false;
    player = board.players[player];
    
    //return false if trying to move in wrong direction
    if (player.direction && spot.y > player.y || !player.direction && spot.y < player.y )
        return false;
    
    //return if the spot is 1 space away
    return (player.y === spot.y && (player.x + 1 === spot.x || player.x - 1 === spot.x) ||
        player.x === spot.x && (player.y + 1 === spot.y || player.y - 1 === spot.y));
};

function Game(playerList, callback) { //callback(winner,highestPoints)
    
    let players = playerList;
    
    let board = makeBoard(playerList);
    this.getBoard = () => board;
    
    let finished = false;
    
    let turn = Math.floor(Math.random() * playerList.length);
    
    this.getTurn = () => players[turn];
    const nextTurn = () => {
        if (finished)
            return;
        turn = ++turn === players.length ? 0 : turn;
        let player = board.players[this.getTurn()];
        player.moves = player.direction ? 2 : 3;
    };
    nextTurn();
    this.isLegal = spot => isLegal(board, this.getTurn(), spot);
    
    const endGame = () => {
        finished = true;
        let winner = players[0];
        let highestPoints = board.players[players[0]].points;
        for (let i = 0; i < players.length; i++) {
            let player = board.players[players[i]];
            winner = player.points > highestPoints ? players[i] : winner;
            highestPoints = board.players[winner].points;
        }
        if (board.players[this.getTurn()].points === highestPoints)
            winner = this.getTurn();
        callback(winner,highestPoints);
    };
    
    this.move = (spot) => {
        if (finished)
            return;
        let player = board.players[this.getTurn()];
        
        player.moves--;
        
        console.log(player.moves);
        
        player.x = spot.x;
        player.y = spot.y;
        
        if (board.board[spot.y][spot.x].points !== 0) {
            player.points += board.board[spot.y][spot.x].points;
            board.board[spot.y][spot.x].points = 0;
        }
        
        if (player.y === 0)
            player.direction = false;
        
        if (!player.direction && player.y === 11)
            endGame();
        
        else if (player.moves < 1) nextTurn();
        
    };
    
}

module.exports = Game;