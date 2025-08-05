const board = document.getElementById("board");
const message = document.getElementById("message");
const restartBtn = document.getElementById("restart");
const startGameBtn = document.getElementById("startGame");
const darkModeToggle = document.getElementById("darkMode");

const player1Input = document.getElementById("player1");
const player2Input = document.getElementById("player2");
const vsAICheck = document.getElementById("vsAI");

const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const leaderboardBody = document.getElementById("leaderboardBody");

const moveSound = document.getElementById("moveSound");

let currentPlayer = "X";
let playerX = "Player X";
let playerO = "Player O";
let boardState = Array(9).fill("");
let gameActive = false;
let scores = { X: 0, O: 0 };
let vsAI = false;

// ------------------ Game Logic ------------------

const winningCombos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function handleCellClick(index) {
  if (!gameActive || boardState[index] !== "") return;

  moveSound.play();
  boardState[index] = currentPlayer;
  renderBoard();

  if (checkWin(currentPlayer)) {
    message.textContent = `${getCurrentPlayerName()} wins! 🎉`;
    updateScores(currentPlayer);
    updateLeaderboard(getCurrentPlayerName());
    gameActive = false;
  } else if (boardState.every(cell => cell !== "")) {
    message.textContent = "It's a draw!";
    gameActive = false;
  } else {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    message.textContent = `${getCurrentPlayerName()}'s turn`;
    if (vsAI && currentPlayer === "O") {
      setTimeout(aiMove, 500);
    }
  }
}

function aiMove() {
  let empty = boardState
    .map((cell, i) => (cell === "" ? i : null))
    .filter(i => i !== null);
  let randomIndex = empty[Math.floor(Math.random() * empty.length)];
  handleCellClick(randomIndex);
}

function checkWin(player) {
  return winningCombos.some(combo =>
    combo.every(index => boardState[index] === player)
  );
}

function renderBoard() {
  board.innerHTML = "";
  boardState.forEach((cell, index) => {
    const div = document.createElement("div");
    div.classList.add("cell");
    div.textContent = cell;
    div.addEventListener("click", () => handleCellClick(index));
    board.appendChild(div);
  });
}

function getCurrentPlayerName() {
  return currentPlayer === "X" ? playerX : playerO;
}

function updateScores(winner) {
  scores[winner]++;
  scoreX.textContent = `X: ${scores.X}`;
  scoreO.textContent = `O: ${scores.O}`;
}

function updateLeaderboard(winnerName) {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || {};
  leaderboard[winnerName] = (leaderboard[winnerName] || 0) + 1;
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  renderLeaderboard();
}

function renderLeaderboard() {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || {};
  let sorted = Object.entries(leaderboard).sort((a, b) => b[1] - a[1]);
  leaderboardBody.innerHTML = sorted
    .map((entry, i) =>
      `<tr><td>${i + 1}</td><td>${entry[0]}</td><td>${entry[1]}</td></tr>`
    )
    .join("");
}

// ------------------ UI + Controls ------------------

function startGame() {
  playerX = player1Input.value.trim() || "Player X";
  playerO = player2Input.value.trim() || "Player O";
  vsAI = vsAICheck.checked;

  boardState = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;
  message.textContent = `${playerX}'s turn`;

  scoreX.textContent = `X: 0`;
  scoreO.textContent = `O: 0`;
  scores = { X: 0, O: 0 };

  renderBoard();
  renderLeaderboard();
}

function restartGame() {
  boardState = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;
  message.textContent = `${getCurrentPlayerName()}'s turn`;
  renderBoard();
}

function clearLeaderboard() {
  localStorage.removeItem("leaderboard");
  leaderboardBody.innerHTML = "";
}

// ------------------ Dark Mode ------------------

darkModeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
});

function loadDarkMode() {
  const isDark = localStorage.getItem("darkMode") === "true";
  document.body.classList.toggle("dark", isDark);
  darkModeToggle.checked = isDark;
}

// ------------------ Events ------------------

startGameBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
window.addEventListener("load", () => {
  loadDarkMode();
  renderLeaderboard();
});
