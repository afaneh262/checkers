import { cloneDeep } from 'lodash';

export const PlayerTypes = {
    Ai: 'ai',
    Human: 'human',
};

export const Levels = {
    Easy: 1,
    Medium: 3,
    Hard: 5,
};

export const Players = {
    Player1: 'player1',
    Player2: 'player2',
};

export const PlayersColors = {
    [Players.Player1]: '#000',
    [Players.Player2]: '#fff',
};

export const PlayersNames = {
    [Players.Player1]: 'Player 1',
    [Players.Player2]: 'Player 2',
};

export const InitalPlayerToStart = Players.Player1;

export const BoardConfig = {
    row: 8,
    col: 8,
};

export class CheckersGame {
    constructor(players, initalPlayerToStart) {
        this.players = players;
        this.initalPlayerToStart = initalPlayerToStart;
        this.turn = initalPlayerToStart;
        this.killedPieces = [];
        this.winner = null;
        this.board = (function () {
            return Array.from({ length: BoardConfig.row }, (_, row) =>
                Array.from({ length: BoardConfig.col }, (_, col) => {
                    const isRowForPlayer1 = row < 3;
                    const isRowForPlayer2 = row > 4;
                    const isOddRow = row % 2 === 1;
                    const isOddColumn = col % 2 === 1;
                    const isPiecePosition =
                        (isRowForPlayer1 || isRowForPlayer2) && isOddRow !== isOddColumn;
                    const player = isPiecePosition
                        ? row < 3
                            ? Players.Player1
                            : Players.Player2
                        : undefined;
                    return {
                        owner: player,
                        row,
                        col,
                        isKing: false,
                        isSelected: false,
                    };
                }),
            );
        })();
        this.highlighBoard();
    }

    isValidPosition(row, col) {
        return row >= 0 && row < BoardConfig.row && col >= 0 && col < BoardConfig.col;
    }

    getOpponent(player) {
        return player === Players.Player1 ? Players.Player2 : Players.Player1;
    }

    getMoveDirections(player, isKing) {
        // moving in all cases
        if (isKing) {
            return [
                [1, 1],
                [1, -1],
                [-1, 1],
                [-1, -1],
            ];
        }

        // moving down
        if (player === Players.Player1) {
            return [
                [1, 1],
                [1, -1],
            ];
        }

        // moving up
        return [
            [-1, 1],
            [-1, -1],
        ];
    }

    movePiece(currentPosition, newPosition) {
        const killedPieces = [];
        const currentPiece = this.board[currentPosition.row][currentPosition.col];
        const newPiece = this.board[newPosition.row][newPosition.col];

        newPiece.owner = cloneDeep(currentPiece.owner);
        newPiece.isKing = currentPiece.isKing ? true : false;
        newPiece.isSelected = false;

        const jumpedRow = (currentPosition.row + newPosition.row) / 2;
        const jumpedCol = (currentPosition.col + newPosition.col) / 2;
        const jumpedPiece = this.board[jumpedRow]?.[jumpedCol];
        if (jumpedPiece && jumpedPiece.owner && jumpedPiece.owner !== currentPiece.owner) {
            killedPieces.push(cloneDeep(jumpedPiece));
            jumpedPiece.owner = null;
            jumpedPiece.isKing = false;
        }

        if (
            (newPiece.owner === Players.Player1 && newPosition.row === 7) ||
            (newPiece.owner === Players.Player2 && newPosition.row === 0)
        ) {
            newPiece.isKing = true;
        }

        currentPiece.owner = null;
        currentPiece.isSelected = false;
        currentPiece.isKing = false;

        this.killedPieces = this.killedPieces.concat(killedPieces);
        this.selectedPiece = null;
        this.updateWinner();
        this.turn = this.getOpponent(this.turn);
        this.highlighBoard();
    }

    selectPiece(row, col) {
        this.selectedPiece = this.board[row][col];
        this.highlighBoard();
    }

    highlighBoard() {
        const possibleMoves = this.selectedPiece
            ? this.findPiecePossibleMoves(this.selectedPiece.row, this.selectedPiece.col)
            : [];
        const movablePieces = this.getPlayerMovablePieces(this.turn);

        for (let row = 0; row < this.board.length; row++) {
            for (let col = 0; col < this.board[row].length; col++) {
                this.board[row][col].isSelected =
                    this.selectedPiece?.row === row && this.selectedPiece?.col === col
                        ? true
                        : false;
                this.board[row][col].isMovable = movablePieces.some(
                    (entry) => entry.row === row && entry.col === col,
                );
                this.board[row][col].isPossibleMove = possibleMoves.some(
                    (entry) => entry.row === row && entry.col === col,
                );
            }
        }
    }

    findPiecePossibleMoves(row, col) {
        let possibleMoves = [];
        const { isKing, owner } = this.board[row][col];
        const directions = this.getMoveDirections(owner, isKing);
        for (const [rowDirection, colDirection] of directions) {
            const newRow = row + rowDirection;
            const newCol = col + colDirection;
            const jumpRow = newRow + rowDirection;
            const jumpCol = newCol + colDirection;
            if (
                this.isValidPosition(jumpRow, jumpCol) &&
                !!!this.board[jumpRow][jumpCol].owner &&
                this.board[newRow][newCol].owner === this.getOpponent(owner)
            ) {
                possibleMoves.push({ row: jumpRow, col: jumpCol });
            } else if (
                this.isValidPosition(newRow, newCol) &&
                !!!this.board[newRow][newCol]?.owner
            ) {
                possibleMoves.push({ row: newRow, col: newCol });
            }
        }

        return possibleMoves;
    }

    getPlayerMovablePieces(player) {
        const movablePieces = [];

        for (let row = 0; row < this.board.length; row++) {
            for (let col = 0; col < this.board[row].length; col++) {
                const { owner } = this.board[row][col];
                if (owner === player) {
                    const pieceMoves = this.findPiecePossibleMoves(row, col);
                    if (pieceMoves.length > 0) {
                        movablePieces.push({ row, col });
                    }
                }
            }
        }

        return movablePieces;
    }

    updateWinner() {
        const opponent = this.getOpponent(this.turn);
        const opponentMovablePieces = this.getPlayerMovablePieces(opponent);
        if (opponentMovablePieces.length === 0) {
            const currentTurnMovablePieces = this.getPlayerMovablePieces(this.turn);
            if (currentTurnMovablePieces.length > 0) {
                this.winner = this.turn;
            } else {
                this.winner = 'draw';
            }
        }
    }

    isEnd() {
        return !!this.winner;
    }
}

const mobilityWeight = 1;
const centerControlWeight = 2; // Increased weight for center control
const threatWeight = 2;

const evaluateGame = (game) => {
    let player1Score = 0;
    let player2Score = 0;
    let player1Mobility = 0;
    let player2Mobility = 0;
    let player1Threats = 0;
    let player2Threats = 0;
    let player1CenterControl = 0;
    let player2CenterControl = 0;

    const centerRowsAndCols = [
        Math.floor(game.board.length / 2),
        Math.floor(game.board.length / 2) + 1,
    ]; // Rows that contribute to center control

    for (let row = 0; row < game.board.length; row++) {
        for (let col = 0; col < game.board[row].length; col++) {
            const { owner, isKing } = game.board[row][col];
            if (owner === Players.Player1) {
                player1Score += isKing ? 5 : 3;
                player1Mobility += game.findPiecePossibleMoves(row, col).length;
                if (isPieceThreatened(cloneDeep(game.board), row, col)) {
                    player1Threats--;
                }
                if (centerRowsAndCols.includes(row) && centerRowsAndCols.includes(col)) {
                    player1CenterControl++;
                }
            } else if (owner?.id === Players.Player2) {
                player2Score += isKing ? 5 : 3;
                player2Mobility += game.findPiecePossibleMoves(row, col).length;
                if (isPieceThreatened(cloneDeep(game.board), row, col)) {
                    player2Threats--;
                }
                if (centerRowsAndCols.includes(row) && centerRowsAndCols.includes(col)) {
                    player2CenterControl++;
                }
            }
        }
    }

    player1Score +=
        player1Mobility * mobilityWeight +
        player1CenterControl * centerControlWeight +
        player1Threats * threatWeight;
    player2Score +=
        player2Mobility * mobilityWeight +
        player2CenterControl * centerControlWeight +
        player2Threats * threatWeight;
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
                isKing: false,
            },
            {
                offset: { row: 1, col: -1 },
                jump: { row: -1, col: 1 },
                isKing: false,
            },
            {
                offset: { row: -1, col: -1 },
                jump: { row: 1, col: 1 },
                isKing: true,
            },
            {
                offset: { row: -1, col: 1 },
                jump: { row: 1, col: -1 },
                isKing: true,
            },
        ],
        [Players.Player2]: [
            {
                offset: { row: -1, col: -1 },
                jump: { row: 1, col: 1 },
                isKing: false,
            },
            {
                offset: { row: -1, col: 1 },
                jump: { row: 1, col: -1 },
                isKing: false,
            },
            {
                offset: { row: 1, col: 1 },
                jump: { row: -1, col: -1 },
                isKing: true,
            },
            {
                offset: { row: 1, col: -1 },
                jump: { row: -1, col: 1 },
                isKing: true,
            },
        ],
    };

    const owner = board[row][col]?.owner?.id;
    const offsets = owner && surroundingOffsets[owner];
    if (!owner || !offsets) {
        return false;
    }

    const opponent = getOpponent(owner);

    for (let entry of offsets) {
        const newRow = row + entry.offset.row;
        const newCol = col + entry.offset.col;
        const newRowJump = row + entry.jump.row;
        const newColJump = col + entry.jump.col;
        if (
            isValidPosition(newRow, newCol) &&
            board[newRow][newCol]?.owner?.id === opponent &&
            board[newRow][newCol].isKing == entry.isKing &&
            !board[newRowJump][newColJump]?.owner?.id
        ) {
            return true;
        }
    }

    return false;
};

export const getNewGameInstance = (original) => {
    const serialized = JSON.stringify(original);
    const copy = JSON.parse(serialized);
    return Object.setPrototypeOf(copy, Object.getPrototypeOf(original));
};

class TreeNode {
    constructor(value, board) {
        this.board = board;
        this.children = [];
        this.value = value;
    }

    addChild(node) {
        this.children.push(node);
    }
}

const aiPlayer = (game, depth, alpha, beta, maximizingPlayer) => {
    if (depth === 0 || game.isEnd()) {
        const evaluation = evaluateGame(game);
        return new TreeNode({ evaluation }, cloneDeep(game.board));
    }

    if (maximizingPlayer) {
        const currentNode = new TreeNode({}, cloneDeep(game.board));
        let maxEval = -Infinity;
        let bestMove = null;
        const movablePieces = game.getPlayerMovablePieces(game.turn);
        for (let i = 0; i < movablePieces.length; i++) {
            const currentPiece = movablePieces[i];
            const possibleMoves = game.findPiecePossibleMoves(currentPiece.row, currentPiece.col);
            for (let j = 0; j < possibleMoves.length; j++) {
                const newGame = getNewGameInstance(game);
                newGame.movePiece(currentPiece, possibleMoves[j]);
                const childNode = aiPlayer(newGame, depth - 1, alpha, beta, false);
                currentNode.addChild(childNode);
                const evaluation = childNode.value.evaluation;
                const board = childNode.value.board;
                if (evaluation > maxEval) {
                    maxEval = evaluation;
                    bestMove = {
                        piece: cloneDeep(currentPiece),
                        newPosition: cloneDeep(possibleMoves[j]),
                    };
                }
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) {
                    break;
                }
            }
        }
        currentNode.value = { evaluation: maxEval, bestMove };
        return currentNode;
    } else {
        const currentNode = new TreeNode({}, cloneDeep(game.board));
        let minEval = Infinity;
        let bestMove = null;
        const movablePieces = game.getPlayerMovablePieces(game.turn);
        for (let i = 0; i < movablePieces.length; i++) {
            const currentPiece = movablePieces[i];
            const possibleMoves = game.findPiecePossibleMoves(currentPiece.row, currentPiece.col);
            for (let j = 0; j < possibleMoves.length; j++) {
                const newGame = getNewGameInstance(game);
                newGame.movePiece(currentPiece, possibleMoves[j]);
                const childNode = aiPlayer(cloneDeep(newGame), depth - 1, alpha, beta, true);
                currentNode.addChild(childNode);
                const evaluation = childNode.value.evaluation;
                const board = childNode.value.board;
                if (evaluation < minEval) {
                    minEval = evaluation;
                    bestMove = {
                        piece: cloneDeep(currentPiece),
                        newPosition: cloneDeep(possibleMoves[j]),
                    };
                }
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) {
                    break;
                }
            }
        }
        currentNode.value = { evaluation: minEval, bestMove };
        return currentNode;
    }
};

export const playAi = (game, depth) => {
    const gameTree = aiPlayer(game, depth, -Infinity, Infinity, true);
    return gameTree;
};
