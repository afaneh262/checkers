export const NUMBER_OF_ROWS = 8;
export const NUMBER_OF_COLUMNS = 8;

export const MovementDirection = {
    Upwards: 0,
    Downwards: 1
};

export const PLAYER1 = {
    id: 'Red',
    color: '#c92735',
    direction: MovementDirection.Upwards
};

export const PLAYER2 = {
    id: 'Black',
    color: '#403f3f',
    direction: MovementDirection.Downwards
};

export const GameState = {
    PieceSelect: 0,
    PossibleMovement: 1,
    Won: 2
};

export const checkIfWon = (boardMatrix, players) => {
    for (const player of players) {
        if (!boardMatrix.some((boardRow) => boardRow.some((piece) => piece.owner === player))) {
            return true;
        }
    }
    return false;
};

export const nextTurnOwner = (currentTurnOwner, players) => {
    const index = players.indexOf(currentTurnOwner);
    return players[index + 1 >= players.length ? 0 : index + 1];
};

export const movePiece = (boardMatrix, selectedMovement, currentPiece) => {
    boardMatrix[selectedMovement.coordinates.row][selectedMovement.coordinates.col].owner = currentPiece.owner;
    boardMatrix[selectedMovement.coordinates.row][selectedMovement.coordinates.col].king =
        selectedMovement.coordinates.row === 0 || selectedMovement.coordinates.row === NUMBER_OF_ROWS - 1 ? true : currentPiece.king;
    boardMatrix[currentPiece.coordinates.row][currentPiece.coordinates.col].owner = undefined;
    boardMatrix[currentPiece.coordinates.row][currentPiece.coordinates.col].king = false;
    return boardMatrix;
};

export const hasKillablePieces = (boardMatrix) => {
    return boardMatrix.some((boardRow) => boardRow.some((piece) => Boolean(piece.killableByMovement)));
};

export const killPieceFn = (boardMatrix, selectedPiece) => {
    const killed = boardMatrix.some((boardRow) =>
        boardRow.some((piece) => piece.killableByMovement === selectedPiece.coordinates)
    );
    boardMatrix = boardMatrix.map((boardRow) =>
        boardRow.map((piece) => {
            if (piece.killableByMovement === selectedPiece.coordinates) {
                piece.owner = undefined;
                piece.selectable = false;
                piece.king = false;
                piece.killableByMovement = undefined;
            }
            return piece;
        })
    );
    return { boardMatrix, killed };
};

export const clearHighlights = (boardMatrix) => {
    return boardMatrix.map((boardRow) =>
        boardRow.map((piece) => {
            piece.selectable = false;
            piece.killableByMovement = undefined;
            return piece;
        })
    );
};

export const highlightPlayer = (boardMatrix, player) => {
    const newBoardMatrix = boardMatrix.map((boardRow) =>
        boardRow.map((piece) => {
            if (piece.owner === player) {
                piece.selectable = true;
            } else {
                piece.selectable = false;
            }
            return piece;
        })
    );
    return newBoardMatrix;
};

export const highlightPossibleMovement = (boardMatrix, piece, onlyKillable) => {
    if (piece.owner) {
        if (piece.king) {
            boardMatrix = highlightMovement(boardMatrix, piece, onlyKillable, true);
            boardMatrix = highlightMovement(boardMatrix, piece, onlyKillable, false);
        } else if (piece.owner.direction === MovementDirection.Upwards) {
            boardMatrix = highlightMovement(boardMatrix, piece, onlyKillable, true);
        } else {
            boardMatrix = highlightMovement(boardMatrix, piece, onlyKillable, false);
        }
    }
    return boardMatrix;
};

export const highlightMovement = (boardMatrix, piece, onlyKillable, upwards) => {
    const nextRow = upwards ? piece.coordinates.row - 1 : piece.coordinates.row + 1;
    const checkNext = upwards ? nextRow >= 0 : nextRow < boardMatrix.length;
    const nextNextRow = upwards ? piece.coordinates.row - 2 : piece.coordinates.row + 2;
    const checkNextNext = upwards ? nextNextRow >= 0 : nextNextRow < boardMatrix.length;
    const rightCol = piece.coordinates.col + 1;
    const checkRightNode = rightCol < boardMatrix[0].length;
    const rightRightCol = piece.coordinates.col + 2;
    const checkRightRightNode = rightRightCol < boardMatrix[0].length;
    const leftCol = piece.coordinates.col - 1;
    const checkLeftNode = leftCol >= 0;
    const leftLeftCol = piece.coordinates.col - 2;
    const checkLeftLeftNode = leftLeftCol >= 0;
    boardMatrix = highlightNextNodes(
        boardMatrix,
        piece,
        nextRow,
        rightCol,
        checkNext && checkRightNode,
        nextNextRow,
        rightRightCol,
        checkNextNext && checkRightRightNode,
        onlyKillable
    );
    boardMatrix = highlightNextNodes(
        boardMatrix,
        piece,
        nextRow,
        leftCol,
        checkNext && checkLeftNode,
        nextNextRow,
        leftLeftCol,
        checkNextNext && checkLeftLeftNode,
        onlyKillable
    );
    return boardMatrix;
};

export const highlightNextNodes = (
    boardMatrix,
    piece,
    nextRow,
    nextCol,
    checkNext,
    nextNextRow,
    nextNextCol,
    checkNextNext,
    onlyKillable
) => {
    if (piece.owner) {
        if (checkNext) {
            const nextNode = boardMatrix[nextRow][nextCol].owner;
            if (!nextNode) {
                if (!onlyKillable) {
                    boardMatrix[nextRow][nextCol].selectable = true;
                }
            } else if (nextNode.id !== piece.owner.id) {
                if (checkNextNext) {
                    if (!boardMatrix[nextNextRow][nextNextCol].owner) {
                        boardMatrix[nextRow][nextCol].killableByMovement = boardMatrix[nextNextRow][nextNextCol].coordinates;
                        boardMatrix[nextNextRow][nextNextCol].selectable = true;
                    }
                }
            }
        }
    }
    return boardMatrix;
};

export const mountBoardMatrix = (player1, player2) => {
    const boardMatrix = [];
    for (let i = 0; i < NUMBER_OF_ROWS; i++) {
        const boardRow = [];
        for (let j = 0; j < NUMBER_OF_COLUMNS; j++) {
            if (
                i < 3 &&
                ((!isOdd(i) && isOdd(j)) || (isOdd(i) && !isOdd(j)))
            ) {
                boardRow.push(constructPiece(i, j, player2));
            } else if (
                i > NUMBER_OF_ROWS - 4 &&
                ((!isOdd(i) && isOdd(j)) || (isOdd(i) && !isOdd(j)))
            ) {
                boardRow.push(constructPiece(i, j, player1));
            } else {
                boardRow.push(constructPiece(i, j));
            }
        }
        boardMatrix.push(boardRow);
    }
    return boardMatrix;
};

export const constructPiece = (row, col, player) => {
    if (player) {
        return {
            owner: player,
            coordinates: {
                row,
                col
            },
            selectable: false,
            king: false
        };
    } else {
        return {
            coordinates: {
                row,
                col
            },
            selectable: false,
            king: false
        };
    }
};

export const isOdd = (value) => {
    return value % 2 ? true : false;
};
