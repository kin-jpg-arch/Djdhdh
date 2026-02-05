const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const difficultySelect = document.getElementById('difficulty');

let board = Array(9).fill(null);
let gameActive = true;
const human = 'O';
const ai = 'X';

// 게임 초기화
function initGame() {
    boardElement.innerHTML = "";
    board = Array(9).fill(null);
    gameActive = true;
    statusElement.innerText = "당신의 차례입니다 (O)";
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.addEventListener('click', () => handleMove(i), { once: true });
        boardElement.appendChild(cell);
    }
}

// 플레이어 이동
function handleMove(index) {
    if (!gameActive || board[index]) return;
    
    makeMove(index, human);
    
    if (!checkGameOver(board, human)) {
        gameActive = false;
        statusElement.innerText = "컴퓨터가 생각 중...";
        setTimeout(computerMove, 600);
    }
}

// 말 그리기 (SVG)
function makeMove(index, player) {
    board[index] = player;
    const cell = boardElement.children[index];
    const svg = player === 'O' ? 
        `<svg class="symbol"><circle class="path o-path" cx="32.5" cy="32.5" r="28"/></svg>` :
        `<svg class="symbol"><path class="path x-path" d="M15,15 L50,50 M50,15 L15,50"/></svg>`;
    cell.innerHTML = svg;
}

// 인공지능 이동 로직
function computerMove() {
    const level = parseFloat(difficultySelect.value);
    let move;

    // 난이도 확률에 따라 최선의 수 또는 랜덤 수 선택
    if (Math.random() < level) {
        move = getBestMove();
    } else {
        const emptyIndices = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
        move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    if (move !== undefined) {
        makeMove(move, ai);
        if (!checkGameOver(board, ai)) {
            gameActive = true;
            statusElement.innerText = "당신의 차례입니다 (O)";
        }
    }
}

// --- Minimax 알고리즘 (무적 로직) ---
function getBestMove() {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = ai;
            let score = minimax(board, 0, false);
            board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(newBoard, depth, isMaximizing) {
    const result = checkWinner(newBoard);
    if (result === ai) return 10 - depth;
    if (result === human) return depth - 10;
    if (newBoard.every(s => s !== null)) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === null) {
                newBoard[i] = ai;
                bestScore = Math.max(bestScore, minimax(newBoard, depth + 1, false));
                newBoard[i] = null;
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === null) {
                newBoard[i] = human;
                bestScore = Math.min(bestScore, minimax(newBoard, depth + 1, true));
                newBoard[i] = null;
            }
        }
        return bestScore;
    }
}

function checkWinner(b) {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let p of wins) {
        if (b[p[0]] && b[p[0]] === b[p[1]] && b[p[0]] === b[p[2]]) return b[p[0]];
    }
    return null;
}

function checkGameOver(b, player) {
    const winner = checkWinner(b);
    if (winner) {
        statusElement.innerText = winner === human ? "당신이 이겼습니다! 🎉" : "컴퓨터가 이겼습니다! 🤖";
        gameActive = false;
        return true;
    }
    if (b.every(s => s !== null)) {
        statusElement.innerText = "무승부입니다! 🤝";
        gameActive = false;
        return true;
    }
    return false;
}

resetBtn.addEventListener('click', initGame);
initGame();