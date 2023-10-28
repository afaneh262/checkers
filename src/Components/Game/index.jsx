import React, { useState, useEffect } from 'react';
import { useReducer } from 'react';
import clsx from 'clsx';
import './styles.scss';

const getMoveDirections = (player, isKing) => {
	if(isKing) {
		return (
			[
				[1, 1],
				[1, -1],
				[-1, 1],
				[-1, -1],
			]
		);
	}

	if(player === 'player1') {
		return (
			[
				[1, 1],
				[1, -1],
			]
		);
	}

	return (
		[
			[-1, 1],
			[-1, -1],
		]
	);
};

function gameReducer(game, action) {
    switch (action.type) {
        case 'selectPiece': {
            return {
                board: addExtrasToBoard(game.board, game.turn, action.selectedPiece),
                turn: game.turn,
                selectedPiece: action.selectedPiece,
            };
        }
        case 'movePiece': {
            const newTurn = game.turn === 'player1' ? 'player2' : 'player1';
            const newBoard = updateBoardOnPieceMove(
                game.board,
                game.selectedPiece.coordinates,
                action.newPosition,
            );
            return {
                board: addExtrasToBoard(newBoard, newTurn, null),
                turn: newTurn,
                selectedPiece: null,
            };
        }
        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}

const initalPlayerToStart = 'player1';

const buildInitialBoard = () => {
    return Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => {
            const isRowForPlayer1 = row < 3;
            const isRowForPlayer2 = row > 4;
            const isOddRow = row % 2 === 1;
            const isOddColumn = col % 2 === 1;
            const isPiecePosition =
                (isRowForPlayer1 || isRowForPlayer2) && isOddRow !== isOddColumn;
            const player = isPiecePosition ? (row < 3 ? 'player1' : 'player2') : undefined;
            return {
                owner: player,
                coordinates: { row, col },
                isKing: false,
                isSelected: false,
            };
        }),
    );
};

const updateBoardOnPieceMove = (board, currentPosition, newPosition) => {
	const newBoard = board.map(row => [...row]);

	const currentPiece = newBoard[currentPosition.row][currentPosition.col];
	const newPiece = newBoard[newPosition.row][newPosition.col];
	
	newPiece.owner = currentPiece.owner;
	newPiece.isKing = currentPiece.isKing ? true : false;
	
	currentPiece.owner = null;
	currentPiece.isSelected = false;
	currentPiece.isKing = false;
	
	return newBoard;
};

const addExtrasToBoard = (board, turn, selectedPiece) => {
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

const findMovablePieces = (board, player) => {
    const movablePieces = [];

    const getOpponent = (currentPlayer) => {
        return currentPlayer === 'player1' ? 'player2' : 'player1';
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

const findPossibleMoves = (board, player, selectedPiece) => {
    let possibleMoves = [];

    if (!selectedPiece) {
        return possibleMoves;
    }

    const getOpponent = (currentPlayer) => {
        return currentPlayer === 'player1' ? 'player2' : 'player1';
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

const initialGameState = {
    board: addExtrasToBoard(buildInitialBoard(), initalPlayerToStart, null),
    turn: initalPlayerToStart,
    selectedPiece: null,
};

const Game = () => {
    const [game, dispatch] = useReducer(gameReducer, initialGameState);
    const renderSquareContent = (piece) => {
        if (piece.owner) {
            return (
                <div
                    className={clsx('Piece', {
                        IsMovable: piece.isMovable,
                        IsSelected: piece.isSelected,
                    })}
                    onClick={() => {
                        if (piece.isMovable) {
                            dispatch({
                                type: 'selectPiece',
                                selectedPiece: piece,
                            });
                        }
                    }}
                    owner={piece.owner}
                >
                    {piece.king ? <div name="rocket" /> : null}
                </div>
            );
        }

        if (piece.isPossibleMove) {
            return (
                <div
                    className={clsx('PossibleMove')}
                    onClick={() => {
                        console.log('dddd');
                        dispatch({
                            type: 'movePiece',
                            newPosition: piece.coordinates,
                        });
                    }}
                />
            );
        }

        return <div />;
    };

    return (
        <div className="Board">
            {game.board.map((boardRow, rowIndex) => (
                <div className="Row" key={'Row' + rowIndex}>
                    {boardRow.map((piece, colIndex) => {
                        return (
                            <div className={clsx('Square')} key={'Square' + rowIndex + colIndex}>
                                {renderSquareContent(piece)}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default Game;
