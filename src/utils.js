import { clone, cloneDeep } from "lodash";
import {
    Players,
    InitalPlayerToStart
} from './constants';

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
    return Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => {
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
            jumpRow < 8 &&
            jumpCol >= 0 &&
            jumpCol < 8 &&
            !board[jumpRow][jumpCol].owner?.id &&
            board[newRow][newCol].owner?.id === getOpponent(player)
        ) {
            return true;
        } else if (
            newRow >= 0 &&
            newRow < 8 &&
            newCol >= 0 &&
            newCol < 8 &&
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
                jumpRow < 8 &&
                jumpCol >= 0 &&
                jumpCol < 8 &&
                !board[jumpRow][jumpCol].owner?.id &&
                board[newRow][newCol]?.owner?.id === getOpponent(player)
            ) {
                jumps.push(cloneDeep(board[jumpRow][jumpCol]));
            } else if (
                newRow >= 0 &&
                newRow < 8 &&
                newCol >= 0 &&
                newCol < 8 &&
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

const evaluateBoard = (board) => {
    let player1Score = 0;
    let player2Score = 0;
    let player1Mobility = 0;
    let player2Mobility = 0;
    let player1Threats = 0;
    let player2Threats = 0;
    let player1CenterControl = 0;
    let player2CenterControl = 0;

    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            const { owner, isKing } = board[row][col];
            // Scoring based on pieces and kings
            if (owner === Players.Player1) {
                player1Score += isKing ? 5 : 3;
                // Consider piece mobility for Player 1
                player1Mobility += findPiecePossibleMoves(cloneDeep(board), Players.Player1, board[row][col]).length;
                // Evaluate threats for Player 1
                if (isPieceThreatened(cloneDeep(board), row, col, Players.Player1, isKing)) {
                    player1Threats++;
                }
                // Evaluate center control for Player 1
                if (row >= 3 && row <= 4 && col >= 3 && col <= 4) {
                    player1CenterControl++;
                }
            } else if (owner === Players.Player2) {
                player2Score += isKing ? 5 : 3;
                // Consider piece mobility for Player 2
                player2Mobility += findPiecePossibleMoves(cloneDeep(board), Players.Player2, board[row][col]).length;
                // Evaluate threats for Player 2
                if (isPieceThreatened(cloneDeep(board), row, col, Players.Player2, isKing)) {
                    player2Threats++;
                }
                // Evaluate center control for Player 2
                if (row >= 3 && row <= 4 && col >= 3 && col <= 4) {
                    player2CenterControl++;
                }
            }
        }
    }

    // Adjust the evaluation based on specific considerations
    // Example adjustments based on mobility, threats, and center control
    player1Score += player1Mobility + 2 * player1CenterControl - player2Threats * 2;
    player2Score += player2Mobility + 2 * player2CenterControl - player1Threats * 2;
    // Return the difference between player scores
    return player1Score - player2Score;
};


// Function to check if a piece is threatened
const isPieceThreatened = (board, row, col, player, isKing) => {
    const opponent = getOpponent(player);
    const directions = getMoveDirections(opponent, isKing); // Consider both forward and backward directions for kings

    for (const [rowDirection, colDirection] of directions) {
        const checkRow = row + rowDirection;
        const checkCol = col + colDirection;
        const jumpRow = checkRow + rowDirection;
        const jumpCol = checkCol + colDirection;

        if (
            jumpRow >= 0 &&
            jumpRow < 8 &&
            jumpCol >= 0 &&
            jumpCol < 8 &&
            board[checkRow][checkCol].owner === opponent &&
            !board[jumpRow][jumpCol].owner
        ) {
            // If there is an opponent's piece that can jump over the current piece, it is threatened
            return true;
        }
    }

    return false;
};


const aiPlayer = (game, depth, alpha, beta, maximizingPlayer) => {
    if (depth === 0 || game.isEnd) {
        return {
            evaluation: evaluateBoard(cloneDeep(game.board)),
            position: null, // Modify this to the best position found during the search
        };
    }

    if (maximizingPlayer) {
        let maxEval = -Infinity;
        let bestMove = null;
        const movablePieces = getMovablePieces(cloneDeep(game.board), Players.Player2);
        for (let i = 0; i < movablePieces.length; i++) {
            const currentPiece = movablePieces[i];
            const possibleMoves = findPiecePossibleMoves(cloneDeep(game.board), Players.Player2, currentPiece);
            for (let j = 0; j < possibleMoves.length; j++) {
                const newGame = moveGamePiece(cloneDeep(game), currentPiece, possibleMoves[j]);
                const { evaluation } = aiPlayer(
                    cloneDeep(newGame),
                    depth - 1,
                    alpha,
                    beta,
                    false
                );
                if (evaluation > maxEval) {
                    maxEval = evaluation;
                    bestMove = {
                        piece: cloneDeep(currentPiece),
                        newPosition: cloneDeep(possibleMoves[j])
                    };
                }
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) {
                    break;
                }
            }
        }
        return { evaluation: maxEval, bestMove };
    } else {
        let minEval = Infinity;
        let bestMove = null;
        const movablePieces = getMovablePieces(cloneDeep(game.board), Players.Player1);

        for (let i = 0; i < movablePieces.length; i++) {
            const currentPiece = movablePieces[i];
            const possibleMoves = findPiecePossibleMoves(cloneDeep(game.board), Players.Player1, currentPiece);

            for (let j = 0; j < possibleMoves.length; j++) {
                const newGame = moveGamePiece(cloneDeep(game), currentPiece, possibleMoves[j]);
                const { evaluation } = aiPlayer(
                    cloneDeep(newGame),
                    depth - 1,
                    alpha,
                    beta,
                    true
                );
                if (evaluation < minEval) {
                    minEval = evaluation;
                    bestMove = {
                        piece: cloneDeep(currentPiece),
                        newPosition: cloneDeep(possibleMoves[j])
                    };
                }
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) {
                    break;
                }
            }
        }
        return { evaluation: minEval, bestMove };
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

    return newGame;
};


export const playAi = async (game) => {
    const { bestMove } = aiPlayer(
        cloneDeep(game),
        3, // specify the desired depth for the search
        -Infinity,
        Infinity,
        true,
    );

    console.log('bestMove', bestMove);

    const { piece, newPosition } = bestMove;
    const newGame = moveGamePiece(cloneDeep(game), newPosition, piece);

    return newGame;
}

function delay(seconds) {
    return new Promise(resolve => {
        setTimeout(resolve, seconds * 1000);
    });
}

