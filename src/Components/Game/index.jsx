import React, { useState, useEffect } from 'react';
import { useReducer } from 'react';
import clsx from 'clsx';

import {
    getPlayerPieces,
    buildInitialBoard,
    updateBoardOnPieceMove,
    addExtrasToBoard,
    findMovablePieces,
    initalPlayerToStart,
    Players,
} from './../../utils';

import PlayerWidget from '../PlayerWidget';
import Piece from '../Piece';

import './styles.scss';

function gameReducer(game, action) {
    switch (action.type) {
        case 'selectPiece': {
            return {
                ...game,
                board: addExtrasToBoard(game.board, game.turn, action.selectedPiece),
                turn: game.turn,
                selectedPiece: action.selectedPiece,
            };
        }
        case 'movePiece': {
            const newTurn = game.turn === Players.Player1 ? Players.Player2 : Players.Player1;
            const { board, killedPieces } = updateBoardOnPieceMove(
                game.board,
                game.selectedPiece.coordinates,
                action.newPosition,
            );
            let updatedKilledPieces = game.killedPieces ? [...game.killedPieces] : [];
            updatedKilledPieces = updatedKilledPieces.concat(killedPieces);
            let winner = null;
            let isEnd = false;
            const nextTurnMovablePieces = findMovablePieces(board, newTurn);
            if (nextTurnMovablePieces.length === 0) {
                isEnd = true;

                //find winner
                const player1Pieces = getPlayerPieces(board, Players.Player1);
                const player2Pieces = getPlayerPieces(board, Players.Player2);
                if (player1Pieces.length === 0) {
                    winner = Players.Player2;
                } else if (player2Pieces.length === 0) {
                    winner = Players.Player1;
                } else {
                    winner = 'draw';
                }
            }

            return {
                ...game,
                board: addExtrasToBoard(board, newTurn, null),
                turn: newTurn,
                selectedPiece: null,
                killedPieces: updatedKilledPieces,
                isEnd: isEnd,
                winner: winner,
            };
        }
        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}

const initialGameState = {
    board: addExtrasToBoard(buildInitialBoard(), initalPlayerToStart, null),
    turn: initalPlayerToStart,
    selectedPiece: null,
    killedPieces: [],
};

const Game = ({ gameConfig, onStartNewGame }) => {
    const [game, dispatch] = useReducer(gameReducer, initialGameState);

    return (
        <div className="Game">
            <button onClick={() => {
                onStartNewGame();
            }}>Start new game</button>
            <div
                style={{
                    marginBottom: '10px',
                }}
            >
                <PlayerWidget
                    isActive={game.turn === Players.Player1}
                    player={Players.Player1}
                    playerType={gameConfig.players[0]}
                    numberOfPiecesHeKilled={
                        game.killedPieces?.filter((e) => e.owner === Players.Player2)?.length
                    }
                />
            </div>
            <div
                className="Board"
                style={{
                    marginBottom: '10px',
                }}
            >
                {game.board.map((boardRow, rowIndex) => (
                    <div className="Row" key={'Row' + rowIndex}>
                        {boardRow.map((piece, colIndex) => {
                            return (
                                <Piece
                                    key={`Piece-${rowIndex}-${colIndex}`}
                                    piece={piece}
                                    onClick={(eventData) => {
                                        dispatch(eventData);
                                    }}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
            <div>
                <PlayerWidget
                    isActive={game.turn === Players.Player2}
                    player={Players.Player2}
                    playerType={gameConfig.players[1]}
                    numberOfPiecesHeKilled={
                        game.killedPieces?.filter((e) => e.owner === Players.Player1)?.length
                    }
                />
            </div>
        </div>
    );
};

export default Game;
