const socket = io();

let currentGameCode = '';
let currentPlayerId = '';
let diceRoll = 0;

// Board layout generation
function generateBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    // Create 15x15 grid for Ludo board
    for (let i = 0; i < 225; i++) {
        const cell = document.createElement('div');
        cell.classList.add('ludo-cell');

        // Add home and start zones (simplified for example)
        if (i % 20 === 0) cell.classList.add('home');
        if (i % 10 === 0) cell.classList.add('start');

        board.appendChild(cell);
    }
}

document.getElementById('generateCode').addEventListener('click', function() {
    fetch('/generateCode')
        .then(response => response.json())
        .then(data => {
            document.getElementById('gameCode').value = data.code;
        })
        .catch(error => console.error('Error generating code:', error));
});

document.getElementById('joinGame').addEventListener('click', function() {
    const code = document.getElementById('gameCode').value;
    currentPlayerId = document.getElementById('playerId').value;
    fetch('/joinGame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, playerId: currentPlayerId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentGameCode = code;
            socket.emit('join', code);
            alert('Joined the game successfully!');
        } else {
            alert('Failed to join the game.');
        }
    })
    .catch(error => console.error('Error joining game:', error));
});

document.getElementById('rollDice').addEventListener('click', function() {
    diceRoll = Math.floor(Math.random() * 6) + 1;
    document.getElementById('diceResult').innerText = `Dice Result: ${diceRoll}`;
    // Emit dice roll to server if needed
});

socket.on('update', (game) => {
    // Update the board and game state
    console.log('Game update:', game);
    updateBoard(game);
});

function updateBoard(game) {
    const board = document.getElementById('board');
    // This example assumes game.board has piece data to update
    // Update board cells and piece positions based on the game state
}
