let boardSize = 20;
let selectedAmountOfMines = 40;
let grid = [];
let isGameOver = false;
let revealedCellsCount = 0;
let time = 0;
let timer = null;
let playerName = "";
let TopPlayers = []

const board = document.getElementById("board");
const dialog = document.getElementById("dialog");
const user = document.getElementById("user_name");

document.getElementById("startGame").addEventListener("click", () => {
  const sizeInput = document.getElementById("boardSize");
  const minesInput = document.getElementById("mineCount");

  time = 0;
  clearInterval(timer);
  timer = setInterval(() => {
    time++;
    console.log(time);
  }, 1000);

  playerName = user.value;

  boardSize = parseInt(sizeInput.value);
  selectedAmountOfMines = parseInt(minesInput.value);
  if (boardSize > 50) {
    boardSize = 50;
  }
  startGame();
});

document.getElementById("dialogButton").addEventListener("click", () => {
  dialog.close();
  startGame();
});

function startGame() {
  isGameOver = false;
  revealedCellsCount = 0;
  grid = [];
  board.innerHTML = '';

  const cellSize = 1000 / boardSize;
  board.style.gridTemplateColumns = `repeat(${boardSize}, ${cellSize}px)`;
  board.style.gridTemplateRows = `repeat(${boardSize}, ${cellSize}px)`;

  createBoard();
  placeMines();
  calculateNeighbors();
}

function createBoard() {
  const cellSize = 1000 / boardSize;

  for (let row = 0; row < boardSize; row++) {
    const rowArr = [];
    for (let col = 0; col < boardSize; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.style.width = cellSize + "px";
      cell.style.height = cellSize + "px";

      const cellData = {
        element: cell,
        row: row,
        col: col,
        isMine: false,
        mineCount: 0,
        isRevealed: false,
        isFlagged: false,
      };

      cell.addEventListener("click", () => revealCell(cellData));
      cell.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        toggleFlag(cellData);
      });

      rowArr.push(cellData);
      board.appendChild(cell);
    }
    grid.push(rowArr);
  }
}

function placeMines() {
  let minesPlacedCount = 0;

  while (minesPlacedCount < selectedAmountOfMines) {
    const row = Math.floor(Math.random() * boardSize);
    const col = Math.floor(Math.random() * boardSize);

    if (!grid[row][col].isMine) {
      grid[row][col].isMine = true;
      minesPlacedCount++;
    }
  }
}

function calculateNeighbors() {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cellData = grid[row][col];

      if (cellData.isMine) continue;

      let mineCount = 0;
      for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
          const newRow = row + r;
          const newCol = col + c;

          if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
            if (grid[newRow][newCol].isMine) {
              mineCount++;
            }
          }
        }
      }
      cellData.mineCount = mineCount;
    }
  }
}

function revealCell(cellData) {
  if (isGameOver || cellData.isRevealed) return;

  const cell = cellData.element;

  if (cellData.isFlagged) {
    cellData.isFlagged = false;
    cell.classList.remove('flagged');
  }

  cellData.isRevealed = true;
  revealedCellsCount++;
  cell.classList.add('revealed');

  if (cellData.isMine) {
    isGameOver = true;
    clearInterval(timer);
    revealAllMines();
    showDialog("Вы проиграли.");
    return;
  }

  if (cellData.mineCount > 0) {
    cell.textContent = cellData.mineCount;
  } else {
    revealNeighbors(cellData.row, cellData.col);
  }

  checkWinCondition();
}

function revealAllMines() {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cellData = grid[row][col];
      if (cellData.isMine) {
        cellData.element.classList.add('revealed');
        cellData.element.classList.add('mine');
      }
    }
  }
}

function revealNeighbors(row, col) {
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      const newRow = row + r;
      const newCol = col + c;

      if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
        const neighbor = grid[newRow][newCol];

        if (!neighbor.isRevealed && !neighbor.isMine) {
          if (neighbor.isFlagged) {
            neighbor.isFlagged = false;
            neighbor.element.classList.remove('flagged');
          }

          neighbor.isRevealed = true;
          neighbor.element.classList.add('revealed');
          revealedCellsCount++;

          if (neighbor.mineCount === 0) {
            revealNeighbors(newRow, newCol);
          } else {
            neighbor.element.textContent = neighbor.mineCount;
          }
        }
      }
    }
  }
}

function checkWinCondition() {
  if (revealedCellsCount === (boardSize * boardSize - selectedAmountOfMines)) {
    isGameOver = true;
    clearInterval(timer);
    showDialog(`Вы выиграли, ${time} секунд`);


    if (boardSize === 5 && selectedAmountOfMines === 1) {
      sendResultToBackend(playerName, time);
    }
  }
}

function sendResultToBackend(name, seconds) {
  const userData = { name: name, time: seconds };

  fetch('http://127.0.0.1:8000/add_player', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  })
    .then(response => response.json())
    .then(data => console.log('Результат отправлен:', data))
    .catch(error => console.error('Ошибка отправки результата:', error));
}



function loadTopPlayers() {
  return fetch('http://127.0.0.1:8000/player')
    .then(response => response.json())
    .then(data => {
      TopPlayers = data;
      console.log('Игроки загружены:', TopPlayers);
      renderTopPlayers();
      return data;
    })
    .catch(error => console.error('Ошибка загрузки игроков:', error));
}

function renderTopPlayers() {
  const container = document.getElementById('topPlayers');
  if (!container) return;

  container.innerHTML = '';


  TopPlayers.forEach((player) => {
    const li = document.createElement('li');
    li.textContent = `${player.name} — ${player.time} сек`;
    container.appendChild(li);
  });
}

loadTopPlayers();

function showDialog(message) {
  document.getElementById("dialogMessage").textContent = message;
  dialog.showModal();
}

function toggleFlag(cellData) {
  if (isGameOver || cellData.isRevealed) return;
  cellData.isFlagged = !cellData.isFlagged;
  cellData.element.classList.toggle('flagged');
}
