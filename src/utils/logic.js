import {
    NUMBER_OF_ROWS,
    NUMBER_OF_COLUMNS,
    MovementDirection,
} from './constants';

export function checkIfWon(boardMatrix, players) {
    return players.every(player => boardMatrix.some(boardRow => boardRow.some(piece => piece.owner === player)));
}

export function nextTurnOwner(currentTurnOwner, players) {
    const index = players.indexOf(currentTurnOwner);
    return players[(index + 1) % players.length];
}

export function movePiece(boardMatrix, { coordinates: { row, col } }, currentPiece) {
    const newRow = row;
    boardMatrix[newRow][col] = { ...boardMatrix[newRow][col], owner: currentPiece.owner, king: (newRow === 0 || newRow === NUMBER_OF_ROWS - 1) ? true : currentPiece.king };
    boardMatrix[currentPiece.coordinates.row][currentPiece.coordinates.col].owner = undefined;
    boardMatrix[currentPiece.coordinates.row][currentPiece.coordinates.col].king = false;
    return boardMatrix;
}

export function hasKillablePieces(boardMatrix) {
    return boardMatrix.some(boardRow => boardRow.some(({ killableByMovement }) => killableByMovement));
}

export function killPieceFn(boardMatrix, selectedPiece) {
    let killed = false;
    boardMatrix = boardMatrix.map(boardRow =>
        boardRow.map(piece => {
            if (piece.killableByMovement === selectedPiece.coordinates) {
                const { killableByMovement, ...updatedPiece } = piece;
                boardMatrix[selectedPiece.coordinates.row][selectedPiece.coordinates.col] = updatedPiece;
                killed = true;
            }
            return piece;
        })
    );
    return { boardMatrix, killed };
}

export function clearHighlights(boardMatrix) {
    return boardMatrix.map(boardRow =>
        boardRow.map(piece => ({
            ...piece,
            selectable: false,
            killableByMovement: undefined
        }))
    );
}

export function highlightPlayer(boardMatrix, player) {
    return boardMatrix.map(boardRow =>
        boardRow.map(piece => ({
            ...piece,
            selectable: piece.owner === player
        }))
    );
}

export function highlightPossibleMovement(boardMatrix, piece, onlyKillable) {
    if (piece.owner) {
        if (piece.king) {
            boardMatrix = highlightMovement(boardMatrix, piece, onlyKillable, true);
            boardMatrix = highlightMovement(boardMatrix, piece, onlyKillable, false);
        } else {
            const direction = piece.owner.direction === MovementDirection.Upwards;
            boardMatrix = highlightMovement(boardMatrix, piece, onlyKillable, direction);
        }
    }
    return boardMatrix;
}

export function highlightMovement(boardMatrix, piece, onlyKillable, upwards) {
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
}

export function mountBoardMatrix(player1, player2) {
    const boardMatrix = Array.from({ length: NUMBER_OF_ROWS }, (_, row) =>
        Array.from({ length: NUMBER_OF_COLUMNS }, (_, col) => {
            const isRowInRange = row < 3 || row > NUMBER_OF_ROWS - 4;
            const isOddRow = row % 2 === 1;
            const isOddColumn = col % 2 === 1;
            const isPiecePosition = isRowInRange && (isOddRow !== isOddColumn);
            const player = isPiecePosition ? (row < 3 ? player2 : player1) : undefined;
            return constructPiece(row, col, player);
        })
    );
    return boardMatrix;
}

export function constructPiece(row, col, player) {
    return {
        owner: player,
        coordinates: { row, col },
        selectable: false,
        king: false,
    };
}

export function isOdd(value) {
    return value % 2 === 1;
}
