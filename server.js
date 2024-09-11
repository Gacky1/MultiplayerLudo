const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

let games = {}; // Store game sessions

app.use(express.static('public'));

app.get('/generateCode', (req, res) => {
    const code = Math.random().toString(36).substr(2, 5).toUpperCase();
    games[code] = {
        players: {},
        board: initializeBoard(),
        currentTurn: 0
    };
    res.json({ code });
});

app.post('/joinGame', express.json(), (req, res) => {
    const { code, playerId } = req.body;
    if (games[code]) {
        const game = games[code];
        if (Object.keys(game.players).length < 2) {
            game.players[playerId] = { pieces: [0, 0, 0, 0] };
            res.json({ success: true });
            io.to(code).emit('update', game); // Notify all players about the update
        } else {
            res.json({ success: false, message: 'Game is full' });
        }
    } else {
        res.json({ success: false, message: 'Invalid game code' });
    }
});

io.on('connection', (socket) => {
    console.log('A player connected');

    socket.on('join', (gameCode) => {
        socket.join(gameCode);
    });

    socket.on('movePiece', ({ gameCode, playerId, pieceIndex, diceRoll }) => {
        const game = games[gameCode];
        if (game && game.players[playerId]) {
            // Handle piece movement logic
            const player = game.players[playerId];
            player.pieces[pieceIndex] += diceRoll;
            if (player.pieces[pieceIndex] > 56) {
                player.pieces[pieceIndex] = 56; // Cap at the end of the board
            }

            // Switch turn
            game.currentTurn = (game.currentTurn + 1) % Object.keys(game.players).length;

            io.to(gameCode).emit('update', game); // Notify all players about the update
        }
    });

    socket.on('disconnect', () => {
        console.log('A player disconnected');
    });
});

function initializeBoard() {
    // Initialize a Ludo board with positions
    return {
        player1: { position: 0, pieces: [0, 0, 0, 0] },
        player2: { position: 0, pieces: [0, 0, 0, 0] }
    };
}

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
