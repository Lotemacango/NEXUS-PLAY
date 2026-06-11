const games = {
    pacman: {
        title: 'Pac-Man Clássico',
        description: 'Move o Pac-Man pelo labirinto, recolhe todos os pontos e evita as paredes.',
        instructions: 'Use as setas do teclado para mover. Colete todos os pontos para vencer.',
        type: 'canvas',
        init: initPacMan
    },
    mario: {
        title: 'Super Mario',
        description: 'Plataforma side-scroller com saltos e plataformas. Alcance a bandeira final.',
        instructions: 'Setas esquerda/direita para mover, Espaço para saltar.',
        type: 'canvas',
        init: initMario
    },
    tictactoe: {
        title: 'Jogo da Velha',
        description: 'Jogue com um amigo localmente. Primeiro a alinhar 3 vence.',
        instructions: 'Clique nas células para marcar X ou O.',
        type: 'board',
        init: initTicTacToe
    },
    chess: {
        title: 'Xadrez',
        description: 'Partida de xadrez por turnos com regras básicas de movimento e captura.',
        instructions: 'Clique em uma peça sua e depois no destino válido.',
        type: 'board',
        init: initChess
    },
    cards: {
        title: 'War / Paciência',
        description: 'Um modo de cartas competitivo com batalhas por pontos e rounds estratégicos.',
        instructions: 'Clique em Jogar Round e veja quem ganha cada confronto.',
        type: 'board',
        init: initCardGame
    },
    racing: {
        title: 'Corrida 3D',
        description: 'Corrida estilo arcade com vista pseudo-3D. Desvie dos obstáculos e marque pontos.',
        instructions: 'Setas esquerda/direita para mudar de pista. Evite colisões.',
        type: 'canvas',
        init: initRacing
    },
    killb: {
        title: 'Kill B',
        description: 'Shooter de ação rápida com chefes, tiros e reflexos. O destaque da plataforma.',
        instructions: 'Setas esquerda/direita para mover, Espaço para atirar.',
        type: 'canvas',
        init: initKillB
    }
};

let currentGame = 'pacman';
let activeLoop = null;
let gameState = {};
let selectedChess = null;

const colors = {
    background: '#07111f',
    panel: 'rgba(10, 15, 30, 0.88)',
    border: 'rgba(0, 242, 254, 0.25)',
    primary: '#00f2fe',
    accent: '#ff00cc',
    text: '#f2f7ff'
};

function $(id) {
    return document.getElementById(id);
}

function init() {
    bindTabs();
    $('resetGameBtn').addEventListener('click', () => loadGame(currentGame));
    loadGame(currentGame);
}

function bindTabs() {
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            loadGame(button.dataset.game);
        });
    });
}

function loadGame(gameKey) {
    stopActiveLoop();
    currentGame = gameKey;
    const config = games[gameKey];
    $('gameTitle').textContent = config.title;
    $('gameDescription').textContent = config.description;
    $('gameInstructions').textContent = config.instructions;
    $('gameStatus').textContent = 'A iniciar...';

    const canvasWrapper = $('gameCanvasWrapper');
    const boardWrapper = $('gameBoardWrapper');
    if (config.type === 'canvas') {
        canvasWrapper.style.display = 'flex';
        boardWrapper.style.display = 'none';
        const canvas = $('gameCanvas');
        canvas.width = 880;
        canvas.height = 520;
        config.init(canvas);
    } else {
        canvasWrapper.style.display = 'none';
        boardWrapper.style.display = 'grid';
        boardWrapper.innerHTML = '';
        config.init(boardWrapper);
    }
}

function stopActiveLoop() {
    if (activeLoop) {
        cancelAnimationFrame(activeLoop);
        activeLoop = null;
    }
    if (gameState.interval) {
        clearInterval(gameState.interval);
        gameState.interval = null;
    }
    window.onkeydown = null;
    window.onkeyup = null;
    selectedChess = null;
}

function setStatus(text) {
    $('gameStatus').textContent = text;
}

function initTicTacToe(boardWrapper) {
    const state = {
        cells: Array(9).fill(null),
        turn: 'X',
        winner: null
    };
    boardWrapper.className = 'game-board-wrapper board-game';
    const grid = document.createElement('div');
    grid.className = 'board-grid board-3x3';
    state.cells.forEach((value, index) => {
        const cell = document.createElement('button');
        cell.className = 'board-cell';
        cell.innerHTML = value || '';
        cell.addEventListener('click', () => {
            if (state.winner || state.cells[index]) return;
            state.cells[index] = state.turn;
            updateBoard();
            const winner = computeWinner(state.cells);
            if (winner) {
                state.winner = winner;
                setStatus(`${winner} venceu! Reinicie para jogar novamente.`);
                return;
            }
            if (!state.cells.includes(null)) {
                setStatus('Empate! Reinicie para tentar de novo.');
                return;
            }
            state.turn = state.turn === 'X' ? 'O' : 'X';
            setStatus(`Vez de ${state.turn}`);
        });
        grid.appendChild(cell);
    });
    boardWrapper.appendChild(grid);
    setStatus('Vez de X');

    function updateBoard() {
        Array.from(grid.children).forEach((cell, index) => {
            cell.textContent = state.cells[index] || '';
            cell.classList.toggle('cell-active', !!state.cells[index]);
        });
    }
}

function computeWinner(board) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (const [a, b, c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

function initCardGame(boardWrapper) {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = shuffle(suits.flatMap(suit => ranks.map(rank => ({ rank, suit, value: ranks.indexOf(rank) + 2 }))));
    let playerScore = 0;
    let opponentScore = 0;
    let round = 0;

    boardWrapper.className = 'game-board-wrapper war-game';
    const layout = document.createElement('div');
    layout.className = 'war-layout';

    const scorePanel = document.createElement('div');
    scorePanel.className = 'war-scoreboard';
    scorePanel.innerHTML = `<div><strong>Você</strong><span id="playerScore">0</span></div><div><strong>Adversário</strong><span id="opponentScore">0</span></div><div><strong>Rodada</strong><span id="roundNumber">0</span></div>`;

    const cardsSection = document.createElement('div');
    cardsSection.className = 'war-cards';
    const playerCard = document.createElement('div');
    const opponentCard = document.createElement('div');
    playerCard.className = 'war-card';
    opponentCard.className = 'war-card';
    playerCard.innerHTML = '<span>Você</span><strong>?</strong>';
    opponentCard.innerHTML = '<span>Adversário</span><strong>?</strong>';
    cardsSection.append(playerCard, opponentCard);

    const actions = document.createElement('div');
    actions.className = 'war-actions';
    const drawBtn = document.createElement('button');
    drawBtn.className = 'btn-primary';
    drawBtn.textContent = 'Jogar Round';
    actions.appendChild(drawBtn);

    const message = document.createElement('p');
    message.className = 'war-message';
    message.textContent = 'Clique em Jogar Round para iniciar a batalha.';

    layout.append(scorePanel, cardsSection, actions, message);
    boardWrapper.appendChild(layout);
    setStatus('Modo War habilitado. Prepare-se para a batalha de cartas.');

    function formatCard(card) {
        return `<span>${card.rank}${card.suit}</span>`;
    }

    function playRound() {
        if (deck.length < 2) {
            const winner = playerScore > opponentScore ? 'Você venceu o modo War!' : playerScore < opponentScore ? 'O adversário venceu!' : 'Empate no modo War!';
            setStatus(winner + ' Reinicie para jogar novamente.');
            drawBtn.disabled = true;
            return;
        }
        round += 1;
        const playerDraw = deck.shift();
        const opponentDraw = deck.shift();
        playerCard.innerHTML = `<span>Você</span><strong>${formatCard(playerDraw)}</strong>`;
        opponentCard.innerHTML = `<span>Adversário</span><strong>${formatCard(opponentDraw)}</strong>`;
        document.getElementById('roundNumber').textContent = round;

        if (playerDraw.value > opponentDraw.value) {
            playerScore += 1;
            message.textContent = `Você ganhou a rodada ${round}! ${playerDraw.rank}${playerDraw.suit} vence ${opponentDraw.rank}${opponentDraw.suit}.`;
        } else if (playerDraw.value < opponentDraw.value) {
            opponentScore += 1;
            message.textContent = `Rodada ${round} para o adversário. ${opponentDraw.rank}${opponentDraw.suit} vence ${playerDraw.rank}${playerDraw.suit}.`;
        } else {
            message.textContent = `Empate na rodada ${round}. Próxima rodada define o desempate.`;
        }

        document.getElementById('playerScore').textContent = playerScore;
        document.getElementById('opponentScore').textContent = opponentScore;
    }

    drawBtn.addEventListener('click', playRound);
}

function initChess(boardWrapper) {
    const initial = [
        ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
        ['bP','bP','bP','bP','bP','bP','bP','bP'],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['wP','wP','wP','wP','wP','wP','wP','wP'],
        ['wR','wN','wB','wQ','wK','wB','wN','wR']
    ];
    const state = {
        board: initial,
        turn: 'w',
        winner: null
    };
    boardWrapper.className = 'game-board-wrapper chess-game';
    const board = document.createElement('div');
    board.className = 'chess-board board-grid board-8x8';
    boardWrapper.appendChild(board);
    renderChessBoard();
    setStatus('Turno das brancas. Clique em uma peça branca.');

    function renderChessBoard() {
        board.innerHTML = '';
        state.board.forEach((row, rowIndex) => {
            row.forEach((pieceCode, colIndex) => {
                const square = document.createElement('button');
                square.className = `chess-square ${((rowIndex + colIndex) % 2 === 0 ? 'light-square' : 'dark-square')}`;
                square.dataset.row = rowIndex;
                square.dataset.col = colIndex;
                square.innerHTML = pieceCode ? `<span class="piece">${getPieceSymbol(pieceCode)}</span>` : '';
                square.addEventListener('click', () => handleSquareClick(rowIndex, colIndex));
                if (selectedChess && selectedChess.row === rowIndex && selectedChess.col === colIndex) {
                    square.classList.add('selected-square');
                }
                board.appendChild(square);
            });
        });
    }

    function handleSquareClick(row, col) {
        if (state.winner) return;
        const selected = state.board[row][col];
        if (selectedChess) {
            if (selectedChess.row === row && selectedChess.col === col) {
                selectedChess = null;
                renderChessBoard();
                return;
            }
            const originPiece = state.board[selectedChess.row][selectedChess.col];
            if (originPiece && originPiece.startsWith(state.turn) && canMove(originPiece, selectedChess, { row, col }, state.board)) {
                const boardCopy = cloneBoard(state.board);
                boardCopy[row][col] = originPiece;
                boardCopy[selectedChess.row][selectedChess.col] = '';
                if (isKingInCheck(state.turn, boardCopy)) {
                    setStatus('Movimento ilegal: o seu rei ficaria em xeque.');
                    return;
                }
                state.board[row][col] = originPiece;
                state.board[selectedChess.row][selectedChess.col] = '';
                selectedChess = null;
                const opponent = state.turn === 'w' ? 'b' : 'w';
                if (isKingInCheck(opponent, state.board)) {
                    if (isCheckmate(opponent, state.board)) {
                        state.winner = state.turn;
                        setStatus(`Xeque-mate! ${state.turn === 'w' ? 'Brancas' : 'Pretas'} venceram.`);
                    } else {
                        setStatus(`Xeque! Turno de ${opponent === 'w' ? 'brancas' : 'pretas'}.`);
                    }
                } else {
                    setStatus(`Turno de ${opponent === 'w' ? 'brancas' : 'pretas'}.`);
                }
                state.turn = opponent;
                renderChessBoard();
            } else {
                if (selected && selected.startsWith(state.turn)) {
                    selectedChess = { row, col };
                    setStatus(`Peça selecionada: ${getPieceName(selected)}. Escolha destino.`);
                    renderChessBoard();
                } else {
                    setStatus('Movimento inválido. Seleciona outra peça ou destino.');
                }
            }
            return;
        }
        if (selected && selected.startsWith(state.turn)) {
            selectedChess = { row, col };
            setStatus(`Peça selecionada: ${getPieceName(selected)}. Escolha destino.`);
            renderChessBoard();
        }
    }
}

function cloneBoard(board) {
    return board.map(row => [...row]);
}

function findKing(color, board) {
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            if (board[row][col] === `${color}K`) {
                return { row, col };
            }
        }
    }
    return null;
}

function isKingInCheck(color, board) {
    const king = findKing(color, board);
    if (!king) return false;
    return positionUnderAttack(king.row, king.col, color, board);
}

function positionUnderAttack(row, col, color, board) {
    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[r].length; c++) {
            const piece = board[r][c];
            if (piece && piece[0] !== color) {
                if (canMove(piece, { row: r, col: c }, { row, col }, board)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function hasAnyLegalMove(color, board) {
    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[r].length; c++) {
            const piece = board[r][c];
            if (!piece || piece[0] !== color) continue;
            for (let tr = 0; tr < board.length; tr++) {
                for (let tc = 0; tc < board[tr].length; tc++) {
                    if (canMove(piece, { row: r, col: c }, { row: tr, col: tc }, board)) {
                        const copy = cloneBoard(board);
                        copy[tr][tc] = piece;
                        copy[r][c] = '';
                        if (!isKingInCheck(color, copy)) {
                            return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}

function isCheckmate(color, board) {
    if (!isKingInCheck(color, board)) return false;
    return !hasAnyLegalMove(color, board);
}

function getPieceSymbol(code) {
    const map = {
        wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
        bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟︎'
    };
    return map[code] || '';
}

function getPieceName(code) {
    const map = { K: 'rei', Q: 'rainha', R: 'torre', B: 'bispo', N: 'cavalo', P: 'peão' };
    if (!code) return '';
    return `${code.startsWith('w') ? 'Branca' : 'Preta'} ${map[code[1]]}`;
}

function canMove(piece, from, to, board) {
    if (!piece) return false;
    const color = piece[0];
    const type = piece[1];
    const target = board[to.row][to.col];
    if (target && target[0] === color) return false;
    const dx = to.col - from.col;
    const dy = to.row - from.row;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    switch (type) {
        case 'P':
            const direction = color === 'w' ? -1 : 1;
            if (dx === 0 && dy === direction && !target) return true;
            if (dx === 0 && dy === direction * 2 && ((from.row === 6 && color === 'w') || (from.row === 1 && color === 'b')) && !target && !board[from.row + direction][from.col]) return true;
            if (absX === 1 && dy === direction && target) return true;
            return false;
        case 'R':
            return isStraightPathClear(from, to, board);
        case 'B':
            return isDiagonalPathClear(from, to, board);
        case 'Q':
            return isStraightPathClear(from, to, board) || isDiagonalPathClear(from, to, board);
        case 'K':
            return absX <= 1 && absY <= 1;
        case 'N':
            return (absX === 1 && absY === 2) || (absX === 2 && absY === 1);
        default:
            return false;
    }
}

function isStraightPathClear(from, to, board) {
    if (from.row !== to.row && from.col !== to.col) return false;
    const rowStep = Math.sign(to.row - from.row);
    const colStep = Math.sign(to.col - from.col);
    let row = from.row + rowStep;
    let col = from.col + colStep;
    while (row !== to.row || col !== to.col) {
        if (board[row][col]) return false;
        row += rowStep;
        col += colStep;
    }
    return true;
}

function isDiagonalPathClear(from, to, board) {
    const absX = Math.abs(to.col - from.col);
    const absY = Math.abs(to.row - from.row);
    if (absX !== absY) return false;
    const rowStep = Math.sign(to.row - from.row);
    const colStep = Math.sign(to.col - from.col);
    let row = from.row + rowStep;
    let col = from.col + colStep;
    while (row !== to.row && col !== to.col) {
        if (board[row][col]) return false;
        row += rowStep;
        col += colStep;
    }
    return true;
}

function initPacMan(canvas) {
    const ctx = canvas.getContext('2d');
    const map = [
        'WWWWWWWWWWWWWWW',
        'W.............W',
        'W.WWWW.WWWW.W.W',
        'W.W.........W.W',
        'W.W.WWWWWW.W.W',
        'W.....W.......W',
        'WWWWW.W.W.WWWWW',
        'W..............W',
        'W.W.WWWWWW.W.W',
        'W.W.W......W.W',
        'W.W.WWWWWW.W.W',
        'W.W.........W.W',
        'W.WWWW.WWWW.W.W',
        'W.............W',
        'WWWWWWWWWWWWWWW'
    ];
    const cellSize = 32;
    let pac = { x: 1, y: 1, dx: 0, dy: 0, score: 0, dots: 0 };
    const walls = [];
    const dots = new Set();

    map.forEach((row, rowIndex) => {
        row.split('').forEach((cell, colIndex) => {
            if (cell === 'W') walls.push({ row: rowIndex, col: colIndex });
            if (cell === '.') dots.add(`${rowIndex},${colIndex}`);
        });
    });
    pac.dots = dots.size;
    setStatus('Use as setas para mover. Pontos restantes: ' + pac.dots);

    function drawPacman() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#081421';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (const wall of walls) {
            ctx.fillStyle = '#0fc2ff';
            ctx.fillRect(wall.col * cellSize, wall.row * cellSize, cellSize, cellSize);
        }
        ctx.fillStyle = '#ffffff';
        dots.forEach(entry => {
            const [row, col] = entry.split(',').map(Number);
            ctx.beginPath();
            ctx.arc(col * cellSize + cellSize / 2, row * cellSize + cellSize / 2, 4, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.fillStyle = '#f3d600';
        ctx.beginPath();
        ctx.arc(pac.x * cellSize + cellSize / 2, pac.y * cellSize + cellSize / 2, cellSize / 2 - 2, 0.25 * Math.PI, 1.75 * Math.PI);
        ctx.lineTo(pac.x * cellSize + cellSize / 2, pac.y * cellSize + cellSize / 2);
        ctx.fill();
    }

    function movePacman() {
        const targetX = pac.x + pac.dx;
        const targetY = pac.y + pac.dy;
        if (isWall(targetX, targetY)) return;
        pac.x = targetX;
        pac.y = targetY;
        const key = `${pac.y},${pac.x}`;
        if (dots.has(key)) {
            dots.delete(key);
            pac.score += 10;
            pac.dots -= 1;
            setStatus(`Pontos: ${pac.score}. Restam: ${pac.dots}`);
        }
        if (pac.dots === 0) {
            setStatus('Vitória! Colecionaste todos os pontos. Reinicie para jogar novamente.');
            pac.dx = 0;
            pac.dy = 0;
            return;
        }
    }

    function isWall(x, y) {
        return walls.some(w => w.row === y && w.col === x);
    }

    window.onkeydown = event => {
        switch (event.key) {
            case 'ArrowUp': pac.dx = 0; pac.dy = -1; event.preventDefault(); break;
            case 'ArrowDown': pac.dx = 0; pac.dy = 1; event.preventDefault(); break;
            case 'ArrowLeft': pac.dx = -1; pac.dy = 0; event.preventDefault(); break;
            case 'ArrowRight': pac.dx = 1; pac.dy = 0; event.preventDefault(); break;
            default: return;
        }
    };

    function loop() {
        movePacman();
        drawPacman();
        activeLoop = requestAnimationFrame(loop);
    }
    loop();
}

function initMario(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const player = { x: 80, y: 420, width: 28, height: 40, vy: 0, grounded: false };
    const gravity = 1.2;
    const platforms = [
        { x: 0, y: 480, width: width, height: 40 },
        { x: 240, y: 400, width: 140, height: 22 },
        { x: 520, y: 340, width: 140, height: 22 },
        { x: 760, y: 280, width: 120, height: 22 }
    ];
    const goal = { x: 840, y: 220, width: 20, height: 60 };
    const keys = { left: false, right: false, up: false };
    setStatus('Use ← → para andar e Espaço para saltar. Chegue ao final.');

    window.onkeydown = event => {
        if (event.key === 'ArrowLeft') { keys.left = true; event.preventDefault(); }
        if (event.key === 'ArrowRight') { keys.right = true; event.preventDefault(); }
        if (event.key === ' ' || event.key === 'Spacebar') {
            if (player.grounded) { player.vy = -18; player.grounded = false; }
            event.preventDefault();
        }
    };
    window.onkeyup = event => {
        if (event.key === 'ArrowLeft') keys.left = false;
        if (event.key === 'ArrowRight') keys.right = false;
    };

    function draw() {
        ctx.fillStyle = '#07111f';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#121927';
        ctx.fillRect(0, 0, width, height);
        platforms.forEach(platform => {
            ctx.fillStyle = '#0fc2ff';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
        ctx.fillStyle = '#ff3f7d';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('🏁', goal.x - 18, goal.y - 12);
    }

    function update() {
        if (keys.left) player.x -= 5;
        if (keys.right) player.x += 5;
        player.x = Math.max(0, Math.min(width - player.width, player.x));
        player.vy += gravity;
        player.y += player.vy;
        player.grounded = false;
        platforms.forEach(platform => {
            if (player.x < platform.x + platform.width && player.x + player.width > platform.x && player.y + player.height > platform.y && player.y + player.height < platform.y + platform.height + 20 && player.vy >= 0) {
                player.y = platform.y - player.height;
                player.vy = 0;
                player.grounded = true;
            }
        });
        if (player.y > height) {
            player.x = 80;
            player.y = 420;
            player.vy = 0;
            setStatus('Caiu fora da pista. Tente novamente.');
        }
        if (player.x + player.width >= goal.x && player.y + player.height > goal.y) {
            setStatus('Vitória! Chegou ao final do nível. Reinicie para jogar novamente.');
            window.onkeydown = null;
            window.onkeyup = null;
            return;
        }
        draw();
        activeLoop = requestAnimationFrame(update);
    }
    update();
}

function initRacing(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const laneCount = 3;
    const laneWidth = width / 5;
    const lanes = [width / 2 - laneWidth * 1.3, width / 2 - laneWidth * 0.15, width / 2 + laneWidth * 1.05];
    const player = { lane: 1, x: lanes[1], y: height - 120, width: 48, height: 72 };
    const obstacles = [];
    let score = 0;
    let speed = 6;
    let gameOver = false;
    setStatus('Use ← → para mudar de pista. Evite os obstáculos.');

    window.onkeydown = event => {
        if (event.key === 'ArrowLeft') { moveLane(-1); event.preventDefault(); }
        if (event.key === 'ArrowRight') { moveLane(1); event.preventDefault(); }
    };

    function moveLane(direction) {
        player.lane = Math.max(0, Math.min(laneCount - 1, player.lane + direction));
        player.x = lanes[player.lane];
    }

    function spawnObstacle() {
        const lane = Math.floor(Math.random() * laneCount);
        obstacles.push({ lane, y: -100, width: 60, height: 80 });
    }

    function draw() {
        ctx.fillStyle = '#050b17';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#19284c';
        ctx.beginPath();
        ctx.moveTo(width * 0.25, 0);
        ctx.lineTo(width * 0.75, 0);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 4;
        ctx.setLineDash([20, 20]);
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const y = i * 80;
            ctx.moveTo(width * 0.5, y);
            ctx.lineTo(width * 0.5, y + 40);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        obstacles.forEach(obs => {
            ctx.fillStyle = '#ff004b';
            ctx.fillRect(lanes[obs.lane] - obs.width / 2, obs.y, obs.width, obs.height);
        });
        ctx.fillStyle = '#00ffad';
        ctx.fillRect(player.x - player.width / 2, player.y, player.width, player.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Outfit';
        ctx.fillText(`Pontuação: ${score}`, 28, 42);
    }

    function update() {
        if (gameOver) return;
        obstacles.forEach(obs => obs.y += speed);
        if (Math.random() < 0.03) spawnObstacle();
        for (let i = obstacles.length - 1; i >= 0; i--) {
            if (obstacles[i].y > height) obstacles.splice(i, 1);
        }
        for (const obs of obstacles) {
            if (obs.lane === player.lane && obs.y + obs.height > player.y && obs.y < player.y + player.height) {
                gameOver = true;
                setStatus('Colisão! Fim de jogo. Reinicie para tentar de novo.');
                window.onkeydown = null;
                return;
            }
        }
        score += 1;
        draw();
        activeLoop = requestAnimationFrame(update);
    }
    update();
}

function initKillB(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const player = { x: width / 2, y: height - 70, width: 50, height: 20, speed: 6 };
    const bullets = [];
    const enemies = [];
    let score = 0;
    let spawnTimer = 0;
    let gameOver = false;
    const keys = { left: false, right: false, shoot: false };

    setStatus('Use ← → para mover, Espaço para atirar. Derrote os inimigos Kill B.');

    window.onkeydown = event => {
        if (event.key === 'ArrowLeft') keys.left = true;
        if (event.key === 'ArrowRight') keys.right = true;
        if (event.key === ' ') keys.shoot = true;
    };

    window.onkeyup = event => {
        if (event.key === 'ArrowLeft') keys.left = false;
        if (event.key === 'ArrowRight') keys.right = false;
        if (event.key === ' ') keys.shoot = false;
    };

    function spawnEnemy() {
        const x = 40 + Math.random() * (width - 80);
        enemies.push({ x, y: -40, width: 40, height: 40, speed: 2 + score * 0.05 });
    }

    function fireBullet() {
        bullets.push({ x: player.x, y: player.y - 12, width: 6, height: 14, speed: 12 });
    }

    function draw() {
        ctx.fillStyle = '#080b15';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#0a1d2f';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#00f2fe';
        ctx.fillRect(player.x - player.width / 2, player.y, player.width, player.height);
        bullets.forEach(bullet => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(bullet.x - bullet.width / 2, bullet.y, bullet.width, bullet.height);
        });
        enemies.forEach(enemy => {
            ctx.fillStyle = '#ff3750';
            ctx.fillRect(enemy.x - enemy.width / 2, enemy.y, enemy.width, enemy.height);
            ctx.fillStyle = '#000000';
            ctx.fillRect(enemy.x - 10, enemy.y + 10, 20, 10);
        });
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Outfit';
        ctx.fillText(`Pontos: ${score}`, 26, 38);
    }

    function update() {
        if (gameOver) return;
        if (keys.left) player.x -= player.speed;
        if (keys.right) player.x += player.speed;
        player.x = Math.max(player.width / 2, Math.min(width - player.width / 2, player.x));
        if (keys.shoot && bullets.length < 5) {
            fireBullet();
        }
        bullets.forEach(bullet => bullet.y -= bullet.speed);
        for (let i = bullets.length - 1; i >= 0; i--) {
            if (bullets[i].y < -20) bullets.splice(i, 1);
        }
        enemies.forEach(enemy => enemy.y += enemy.speed);
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (enemies[i].y > height + enemies[i].height) enemies.splice(i, 1);
        }
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (Math.abs(enemy.x - player.x) < (enemy.width + player.width) / 2 && enemy.y + enemy.height > player.y) {
                gameOver = true;
                setStatus('Enemy Kill B venceu! Reinicie para tentar novamente.');
                window.onkeydown = null;
                window.onkeyup = null;
                return;
            }
            for (let j = bullets.length - 1; j >= 0; j--) {
                const bullet = bullets[j];
                if (bullet.x > enemy.x - enemy.width / 2 && bullet.x < enemy.x + enemy.width / 2 && bullet.y < enemy.y + enemy.height && bullet.y > enemy.y) {
                    bullets.splice(j, 1);
                    enemies.splice(i, 1);
                    score += 10;
                    break;
                }
            }
        }
        spawnTimer += 1;
        if (spawnTimer > 50) {
            spawnEnemy();
            spawnTimer = 0;
        }
        draw();
        activeLoop = requestAnimationFrame(update);
    }
    update();
}

function initChessBoard() {
    // placeholder for future enhancements
}

function initChessPlaceholder() {
    // placeholder for future enhancements
}

function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

document.addEventListener('DOMContentLoaded', init);
