const cloneDeep = (source) => {
    if (source === null || typeof source !== 'object') {
        return source;
    }

    const target = Array.isArray(source) ? [] : {};

    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = cloneDeep(source[key]);
        }
    }

    return target;
};

export const PlayerTypes = {
    Ai: 'ai',
    'Human': 'human'
};

export const Levels = {
    'Easy': 1,
    'Medium': 3,
    'Hard': 5
};

export const Players = {
    Player1: 'player1',
    Player2: 'player2'
};

export const PlayersColors = {
    [Players.Player1]: '#000',
    [Players.Player2]: '#fff'
};

export const PlayersNames = {
    [Players.Player1]: 'Player 1',
    [Players.Player2]: 'Player 2'
};

export const InitalPlayerToStart = Players.Player1;

export const BoardConfig = {
    row: 8,
    col: 8
};

const getMoveDirections = (player, isKing) => {
    if (isKing) {
        return [
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1],
        ];
    }

    if (player === Players.Player1) {
        return [
            [1, 1],
            [1, -1],
        ];
    }

    return [
        [-1, 1],
        [-1, -1],
    ];
};

const getPlayerPieces = (board, player) => {
    const pieces = [];
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            const { owner } = board[row][col];
            if (owner === player) {
                pieces.push(cloneDeep(board[row][col]));
            }
        }
    }

    return pieces;
};

export const buildInitialBoard = (players) => {
    return Array.from({ length: BoardConfig.row }, (_, row) =>
        Array.from({ length: BoardConfig.col }, (_, col) => {
            const isRowForPlayer1 = row < 3;
            const isRowForPlayer2 = row > 4;
            const isOddRow = row % 2 === 1;
            const isOddColumn = col % 2 === 1;
            const isPiecePosition =
                (isRowForPlayer1 || isRowForPlayer2) && isOddRow !== isOddColumn;
            const player = isPiecePosition ? (row < 3 ? players[Players.Player1] : players[Players.Player2]) : undefined;
            return {
                id: `${row}-${col}`,
                owner: player,
                coordinates: { row, col },
                isKing: false,
                isSelected: false,
            };
        }),
    );
};

const movePiece = (board, currentPosition, newPosition) => {
    const killedPieces = [];
    const newBoard = cloneDeep(board);

    const currentPiece = newBoard[currentPosition.row][currentPosition.col];
    const newPiece = newBoard[newPosition.row][newPosition.col];

    newPiece.owner = currentPiece.owner;
    newPiece.isKing = currentPiece.isKing ? true : false;
    newPiece.isSelected = false;

    // Check if there's an opponent's piece that has been jumped over
    const jumpedRow = (currentPosition.row + newPosition.row) / 2;
    const jumpedCol = (currentPosition.col + newPosition.col) / 2;
    const jumpedPiece = newBoard[jumpedRow]?.[jumpedCol];
    if (jumpedPiece && jumpedPiece.owner && jumpedPiece.owner !== currentPiece.owner) {
        killedPieces.push(cloneDeep(jumpedPiece));
        // If there's a jumped piece, set its owner to null to indicate it's been taken
        jumpedPiece.owner = null;
        jumpedPiece.isKing = false; // Reset king status if it was a king
    }

    if (
        (newPiece.owner?.id === Players.Player1 && newPosition.row === 7) ||
        (newPiece.owner?.id === Players.Player2 && newPosition.row === 0)
    ) {
        newPiece.isKing = true;
    }

    currentPiece.owner = null;
    currentPiece.isSelected = false;
    currentPiece.isKing = false;

    return {
        board: newBoard,
        killedPieces: killedPieces,
    };
};

export const highlighBoard = (board, turn, selectedPiece) => {
    const possibleMoves = findPiecePossibleMoves(cloneDeep(board), turn, cloneDeep(selectedPiece));
    const movablePieces = getMovablePieces(cloneDeep(board), turn);
    const newBoard = board.map((row) => {
        return row.map((col) => {
            return {
                ...col,
                isSelected: col.id == selectedPiece?.id,
                isMovable: movablePieces.some(
                    (entry) => entry.id === col.id,
                ),
                isPossibleMove: possibleMoves.some(
                    (entry) => entry.id == col.id,
                ),
            };
        });
    });

    return newBoard;
};

const getOpponent = (currentPlayer) => {
    return currentPlayer === Players.Player1 ? Players.Player2 : Players.Player1;
};

const canPieceMove = (row, col, player, isKing, board) => {
    const directions = getMoveDirections(player, isKing);

    for (const [rowDirection, colDirection] of directions) {
        const newRow = row + rowDirection;
        const newCol = col + colDirection;
        const jumpRow = newRow + rowDirection;
        const jumpCol = newCol + colDirection;

        if (
            jumpRow >= 0 &&
            jumpRow < BoardConfig.row &&
            jumpCol >= 0 &&
            jumpCol < BoardConfig.col &&
            !board[jumpRow][jumpCol].owner?.id &&
            board[newRow][newCol].owner?.id === getOpponent(player)
        ) {
            return true;
        } else if (
            newRow >= 0 &&
            newRow < BoardConfig.row &&
            newCol >= 0 &&
            newCol < BoardConfig.col &&
            !board[newRow][newCol].owner?.id
        ) {
            return true;
        }
    }

    return false;
};

const getMovablePieces = (board, player) => {
    const newBoard = cloneDeep(board);
    const movablePieces = [];

    for (let row = 0; row < newBoard.length; row++) {
        for (let col = 0; col < newBoard[row].length; col++) {
            const { owner, isKing } = newBoard[row][col];
            if (owner?.id === player) {
                if (canPieceMove(row, col, player, isKing, newBoard)) {
                    movablePieces.push(newBoard[row][col]);
                }
            }
        }
    }

    return cloneDeep(movablePieces);
};

const findPiecePossibleMoves = (board, player, selectedPiece) => {
    let possibleMoves = [];
    if (!selectedPiece) {
        return possibleMoves;
    }

    const getOpponent = (currentPlayer) => {
        return currentPlayer === Players.Player1 ? Players.Player2 : Players.Player1;
    };

    const getMoves = (row, col, player, isKing, board) => {
        const moves = [];
        const jumps = [];
        const directions = getMoveDirections(player, isKing);
        for (const [rowDirection, colDirection] of directions) {
            const newRow = row + rowDirection;
            const newCol = col + colDirection;
            const jumpRow = newRow + rowDirection;
            const jumpCol = newCol + colDirection;
            if (
                jumpRow >= 0 &&
                jumpRow < BoardConfig.row &&
                jumpCol >= 0 &&
                jumpCol < BoardConfig.col &&
                !board[jumpRow][jumpCol].owner?.id &&
                board[newRow][newCol]?.owner?.id === getOpponent(player)
            ) {
                jumps.push(cloneDeep(board[jumpRow][jumpCol]));
            } else if (
                newRow >= 0 &&
                newRow < BoardConfig.row &&
                newCol >= 0 &&
                newCol < BoardConfig.col &&
                !!!board[newRow][newCol]?.owner?.id
            ) {
                moves.push(cloneDeep(board[newRow][newCol]));
            }
        }

        return { moves, jumps };
    };

    const { owner, isKing } = selectedPiece;
    if (owner?.id === player) {
        const { moves, jumps } = getMoves(
            selectedPiece.coordinates.row,
            selectedPiece.coordinates.col,
            player,
            isKing,
            cloneDeep(board),
        );
        if (jumps.length > 0) {
            possibleMoves = possibleMoves.concat(jumps);
        }
        if (moves.length > 0) {
            possibleMoves = possibleMoves.concat(moves);
        }
    }

    return possibleMoves;
};

const mobilityWeight = 1;
const centerControlWeight = 2; // Increased weight for center control
const threatWeight = 2;

const evaluateBoard = (board) => {
    let player1Score = 0;
    let player2Score = 0;
    let player1Mobility = 0;
    let player2Mobility = 0;
    let player1Threats = 0;
    let player2Threats = 0;
    let player1CenterControl = 0;
    let player2CenterControl = 0;

    const centerRowsAndCols = [Math.floor(board.length / 2), Math.floor(board.length / 2) + 1]; // Rows that contribute to center control

    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            const { owner, isKing } = board[row][col];
            if (owner?.id === Players.Player1) {
                player1Score += isKing ? 5 : 3;
                player1Mobility += findPiecePossibleMoves(cloneDeep(board), Players.Player1, board[row][col]).length;
                if (isPieceThreatened(cloneDeep(board), row, col)) {
                    player1Threats--;
                }
                if (centerRowsAndCols.includes(row) && centerRowsAndCols.includes(col)) {
                    player1CenterControl++;
                }
            } else if (owner?.id === Players.Player2) {
                player2Score += isKing ? 5 : 3;
                player2Mobility += findPiecePossibleMoves(cloneDeep(board), Players.Player2, board[row][col]).length;
                if (isPieceThreatened(cloneDeep(board), row, col)) {
                    player2Threats--;
                }
                if (centerRowsAndCols.includes(row) && centerRowsAndCols.includes(col)) {
                    player2CenterControl++;
                }
            }
        }
    }

    player1Score += player1Mobility * mobilityWeight + player1CenterControl * centerControlWeight + player1Threats * threatWeight;
    player2Score += player2Mobility * mobilityWeight + player2CenterControl * centerControlWeight + player2Threats * threatWeight;
    return player2Score - player1Score;
};



// Function to check if a piece is threatened
const isPieceThreatened = (board, row, col) => {
    return false;
    const surroundingOffsets = {
        [Players.Player1]: [
            {
                offset: { row: 1, col: 1 },
                jump: { row: -1, col: -1 },
                isKing: false
            },
            {
                offset: { row: 1, col: -1 },
                jump: { row: -1, col: 1 },
                isKing: false
            },
            {
                offset: { row: -1, col: -1 },
                jump: { row: 1, col: 1 },
                isKing: true
            },
            {
                offset: { row: -1, col: 1 },
                jump: { row: 1, col: -1 },
                isKing: true
            },
        ],
        [Players.Player2]: [
            {
                offset: { row: -1, col: -1 },
                jump: { row: 1, col: 1 },
                isKing: false
            },
            {
                offset: { row: -1, col: 1 },
                jump: { row: 1, col: -1 },
                isKing: false
            },
            {
                offset: { row: 1, col: 1 },
                jump: { row: -1, col: -1 },
                isKing: true
            },
            {
                offset: { row: 1, col: -1 },
                jump: { row: -1, col: 1 },
                isKing: true
            },
        ]
    };

    const owner = board[row][col]?.owner?.id;
    const offsets = owner && surroundingOffsets[owner];
    if(!owner || !offsets) {
        return false;
    }

    const opponent = getOpponent(owner);

    for (let entry of offsets) {
        const newRow = row + entry.offset.row;
        const newCol = col + entry.offset.col;
        const newRowJump = row + entry.jump.row;
        const newColJump = col + entry.jump.col;
        if (isValidPosition(newRow, newCol) && board[newRow][newCol]?.owner?.id === opponent && board[newRow][newCol].isKing == entry.isKing && !board[newRowJump][newColJump]?.owner?.id) {
            return true;
        }
    }

    return false;
};

class TreeNode {
    constructor(value) {
        this.value = value;
        this.children = [];
    }

    addChild(node) {
        this.children.push(node);
    }
}

const aiPlayer = (game, depth, alpha, beta, maximizingPlayer) => {
    if (depth === 0 || game.isEnd) {
        const evaluation = evaluateBoard(cloneDeep(game.board));
        return new TreeNode({ evaluation, board: cloneDeep(game.board) });
    }

    if (maximizingPlayer) {
        const currentNode = new TreeNode({});
        let maxEval = -Infinity;
        let bestMove = null;
        let theResultBoard = null;
        const movablePieces = getMovablePieces(cloneDeep(game.board), game.turn);
        for (let i = 0; i < movablePieces.length; i++) {
            const currentPiece = movablePieces[i];
            const possibleMoves = findPiecePossibleMoves(cloneDeep(game.board), game.turn, currentPiece);
            for (let j = 0; j < possibleMoves.length; j++) {
                debugger;
                const newGame = moveGamePiece(cloneDeep(game), possibleMoves[j], currentPiece);
                debugger;
                const childNode = aiPlayer(cloneDeep(newGame), depth - 1, alpha, beta, false);
                debugger;
                currentNode.addChild(childNode);
                const evaluation = childNode.value.evaluation;
                if (evaluation > maxEval) {
                    maxEval = evaluation;
                    bestMove = {
                        piece: cloneDeep(currentPiece),
                        newPosition: cloneDeep(possibleMoves[j]),
                    };
                    theResultBoard = cloneDeep(newGame.board);
                }
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) {
                    break;
                }
            }
        }
        currentNode.value = { evaluation: maxEval, bestMove, board: cloneDeep(game.board) };
        return currentNode;
    } else {
        const currentNode = new TreeNode({});
        let minEval = Infinity;
        let bestMove = null;
        let theResultBoard = null;
        const movablePieces = getMovablePieces(cloneDeep(game.board), game.turn);
        for (let i = 0; i < movablePieces.length; i++) {
            const currentPiece = movablePieces[i];
            const possibleMoves = findPiecePossibleMoves(cloneDeep(game.board), game.turn, currentPiece);
            for (let j = 0; j < possibleMoves.length; j++) {
                const newGame = moveGamePiece(cloneDeep(game), possibleMoves[j], currentPiece);
                const childNode = aiPlayer(cloneDeep(newGame), depth - 1, alpha, beta, true);
                currentNode.addChild(childNode);
                const evaluation = childNode.value.evaluation;
                if (evaluation < minEval) {
                    minEval = evaluation;
                    bestMove = {
                        piece: cloneDeep(currentPiece),
                        newPosition: cloneDeep(possibleMoves[j]),
                    };
                    theResultBoard = cloneDeep(newGame.board);
                }
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) {
                    break;
                }
            }
        }
        currentNode.value = { evaluation: minEval, bestMove, board: cloneDeep(game.board) };
        return currentNode;
    }
};



///
export const selectGamePiece = (game, piece) => {
    const newBoard = highlighBoard(cloneDeep(game.board), game.turn, piece);
    const newGame = {
        ...game,
        board: newBoard,
        selectedPiece: piece,
    };

    return newGame;
};

export const moveGamePiece = (game, newPosition, selectedPiece2) => {
    const {
        selectedPiece,
        turn,
        board,
        killedPieces
    } = game;
    const opponent = getOpponent(turn);
    const clonedBoard = cloneDeep(board);
    const selectedPiece3 = selectedPiece || selectedPiece2;

    let isEnd = false;
    let winner = null;
    const { board: updatedBoard, killedPieces: newKilledPieces } = movePiece(
        clonedBoard,
        selectedPiece3.coordinates,
        newPosition.coordinates,
    );
    debugger;

    // check if game ended
    const opponentMovablePieces = getMovablePieces(cloneDeep(updatedBoard), opponent);
    if (opponentMovablePieces.length === 0) {
        isEnd = true;
        const currentTurnMovablePieces = getMovablePieces(cloneDeep(updatedBoard), turn);
        if (currentTurnMovablePieces.length > 0) {
            winner = turn;
        } else {
            winner = 'draw'
        }
    }

    const newGame = {
        ...game,
        board: highlighBoard(cloneDeep(updatedBoard), opponent, null),
        selectedPiece: null,
        turn: opponent,
        isEnd,
        winner,
        killedPieces: (killedPieces || []).concat(newKilledPieces)
    };

    debugger;
    return newGame;
};

const isValidPosition = (row, col) => {
    return row >= 0 && row < BoardConfig.row && col >= 0 && col < BoardConfig.col;
};

export const playAi = (game, depth) => {
    const gameTree = aiPlayer(
        cloneDeep(game),
        depth, // specify the desired depth for the search
        -Infinity,
        Infinity,
        true,
    );

    const { bestMove } = gameTree.value;
    const { piece, newPosition } = bestMove;
    const newGame = moveGamePiece(cloneDeep(game), newPosition, piece);

    return { newGame, bestMove, gameTree };
}

function delay(seconds) {
    return new Promise(resolve => {
        setTimeout(resolve, seconds * 1000);
    });
}

