export const Players = {
    Player1: 'player1',
    Player2: 'player2'
};

export const PlayersColors = {
    [Players.Player1]: '#000',
    [Players.Player2]: 'red'
};

export const PlayersNames = {
    [Players.Player1]: 'Player 1',
    [Players.Player2]: 'Player 2'
};

export const initalPlayerToStart = Players.Player1;

export const getMoveDirections = (player, isKing) => {
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

export const getPlayerPieces = (board, player) => {
    const pieces = [];
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            const { owner } = board[row][col];
            if (owner === player) {
                pieces.push(board[row][col]);
            }
        }
    }

    return pieces;
};

export const buildInitialBoard = () => {
    return Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => {
            const isRowForPlayer1 = row < 3;
            const isRowForPlayer2 = row > 4;
            const isOddRow = row % 2 === 1;
            const isOddColumn = col % 2 === 1;
            const isPiecePosition =
                (isRowForPlayer1 || isRowForPlayer2) && isOddRow !== isOddColumn;
            const player = isPiecePosition ? (row < 3 ? Players.Player1 : Players.Player2) : undefined;
            return {
                owner: player,
                coordinates: { row, col },
                isKing: false,
                isSelected: false,
            };
        }),
    );
};

export const updateBoardOnPieceMove = (board, currentPosition, newPosition) => {
    const killedPieces = [];
    const newBoard = board.map((row) => [...row]);

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
        killedPieces.push({ ...jumpedPiece });
        // If there's a jumped piece, set its owner to null to indicate it's been taken
        jumpedPiece.owner = null;
        jumpedPiece.isKing = false; // Reset king status if it was a king
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

    return {
        board: newBoard,
        killedPieces: killedPieces,
    };
};

export const addExtrasToBoard = (board, turn, selectedPiece) => {
    const possibleMoves = findPossibleMoves(board, turn, selectedPiece);
    const movablePieces = findMovablePieces(board, turn);
    const newBoard = board.map((row, rowIndex) => {
        return row.map((col, colIndex) => {
            return {
                ...col,
                isSelected:
                    rowIndex === selectedPiece?.coordinates.row &&
                    selectedPiece?.coordinates.col === colIndex,
                isMovable: movablePieces.some(
                    (entry) => entry.col === colIndex && entry.row === rowIndex,
                ),
                isPossibleMove: possibleMoves.some(
                    (entry) => entry.col === colIndex && entry.row === rowIndex,
                ),
            };
        });
    });
    return newBoard;
};

export const findMovablePieces = (board, player) => {
    const movablePieces = [];

    const getOpponent = (currentPlayer) => {
        return currentPlayer === Players.Player1 ? Players.Player2 : Players.Player1;
    };

    const canMove = (row, col, player, isKing, board) => {
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
                !board[jumpRow][jumpCol].owner &&
                board[newRow][newCol].owner === getOpponent(player)
            ) {
                return true;
            } else if (
                newRow >= 0 &&
                newRow < 8 &&
                newCol >= 0 &&
                newCol < 8 &&
                !board[newRow][newCol].owner
            ) {
                return true;
            }
        }

        return false;
    };

    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            const { owner, isKing } = board[row][col];
            if (owner === player) {
                if (canMove(row, col, player, isKing, board)) {
                    movablePieces.push({ row, col });
                }
            }
        }
    }

    return movablePieces;
};

export const findPossibleMoves = (board, player, selectedPiece) => {
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
                !board[jumpRow][jumpCol].owner &&
                board[newRow][newCol].owner === getOpponent(player)
            ) {
                jumps.push({ row: jumpRow, col: jumpCol });
            } else if (
                newRow >= 0 &&
                newRow < 8 &&
                newCol >= 0 &&
                newCol < 8 &&
                !!!board[newRow][newCol].owner
            ) {
                moves.push({ row: newRow, col: newCol });
            }
        }

        return { moves, jumps };
    };

    const { owner, isKing } = selectedPiece;
    if (owner === player) {
        const { moves, jumps } = getMoves(
            selectedPiece.coordinates.row,
            selectedPiece.coordinates.col,
            player,
            isKing,
            board,
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
                player1Mobility += findPossibleMoves(board, Players.Player1, board[row][col]).length;
                // Evaluate threats for Player 1
                if (isPieceThreatened(board, row, col, Players.Player1)) {
                    player1Threats++;
                }
                // Evaluate center control for Player 1
                if (row >= 3 && row <= 4 && col >= 3 && col <= 4) {
                    player1CenterControl++;
                }
            } else if (owner === Players.Player2) {
                player2Score += isKing ? 5 : 3;
                // Consider piece mobility for Player 2
                player2Mobility += findPossibleMoves(board, Players.Player2, board[row][col]).length;
                // Evaluate threats for Player 2
                if (isPieceThreatened(board, row, col, Players.Player2)) {
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
const isPieceThreatened = (board, row, col, player) => {
    const opponent = player === Players.Player1 ? Players.Player2 : Players.Player1;
    const directions = getMoveDirections(opponent, true); // Consider both forward and backward directions for kings

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
        return evaluateBoard(game.board);
    }

    if (maximizingPlayer) {
        let maxEval = -Infinity;
        const movablePieces = findMovablePieces(game.board, Players.Player2);

        for (let i = 0; i < movablePieces.length; i++) {
            const currentPiece = movablePieces[i];
            const possibleMoves = findPossibleMoves(game.board, Players.Player2, currentPiece);

            for (let j = 0; j < possibleMoves.length; j++) {
                const newBoard = addExtrasToBoard(
                    updateBoardOnPieceMove(game.board, currentPiece.coordinates, possibleMoves[j]),
                    Players.Player1,
                    null
                );
                const evaluation = aiPlayer(
                    { board: newBoard, isEnd: game.isEnd, turn: Players.Player1 },
                    depth - 1,
                    alpha,
                    beta,
                    false
                );
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) {
                    break;
                }
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        const movablePieces = findMovablePieces(game.board, Players.Player1);

        for (let i = 0; i < movablePieces.length; i++) {
            const currentPiece = movablePieces[i];
            const possibleMoves = findPossibleMoves(game.board, Players.Player1, currentPiece);

            for (let j = 0; j < possibleMoves.length; j++) {
                const newBoard = addExtrasToBoard(
                    updateBoardOnPieceMove(game.board, currentPiece.coordinates, possibleMoves[j]),
                    Players.Player2,
                    null
                );
                const evaluation = aiPlayer(
                    { board: newBoard, isEnd: game.isEnd, turn: Players.Player2 },
                    depth - 1,
                    alpha,
                    beta,
                    true
                );
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) {
                    break;
                }
            }
        }
        return minEval;
    }
};
