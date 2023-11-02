import React, { useState, useEffect } from 'react';
import { clone, cloneDeep } from 'lodash';

import { PlayerTypes, Players } from '../../constants';
import {
    selectGamePiece,
    moveGamePiece,
    playAi,
    buildInitialBoard,
    highlighBoard
} from './../../utils';

import PlayerWidget from '../PlayerWidget';
import Piece from '../Piece';

import './styles.scss';

const buildGameState = (gameConfig) => {
    const {
        level,
        players,
        initalPlayerToStart
    } = gameConfig;

    let board = buildInitialBoard(players);
    board = highlighBoard(board, initalPlayerToStart);
    return {
        board,
        isEnd: false,
        turn: initalPlayerToStart,
        players,
        level,
        selectedPiece: null,
        killedPieces: []
    };
};

const Game = ({ gameConfig, onStartNewGame, onGameEnded }) => {
    const [game, setGame] = useState(buildGameState(gameConfig));
    useEffect(() => {
        const init = async () => {
            const newGame = await playAi(cloneDeep(game));
            setGame(newGame);
        }

        if(game.players[game.turn].type === PlayerTypes.Ai) {
            init();
        }
    }, [game.turn]);

    useEffect(() => {
        if(game.isEnd) {
            onGameEnded(game);
        }
    }, [game.isEnd]);

    const onSelectPiece = (piece) => {
        const newGame = selectGamePiece(cloneDeep(game), piece);
        setGame(newGame);
    };

    const onMovePiece = (piece) => {
        const newGame = moveGamePiece(cloneDeep(game), piece);
        setGame(newGame);
    };

    return (
        <div className="Game">
            <button
                onClick={() => {
                    onStartNewGame();
                }}
            >
                Start new game
            </button>
            <div
                style={{
                    marginBottom: '10px',
                }}
            >
                <PlayerWidget
                    isActive={game.turn === Players.Player1}
                    player={game.players[Players.Player1]}
                    numberOfPiecesHeKilled={
                        game.killedPieces?.filter((e) => e.owner?.id === Players.Player2)?.length
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
                                    handleClick={(action, piece) => {
                                        if(action === 'selectPiece') {
                                            onSelectPiece(piece);
                                        } else if(action === 'movePiece') {
                                            onMovePiece(piece);
                                        }
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
                    player={game.players[Players.Player2]}
                    numberOfPiecesHeKilled={
                        game.killedPieces?.filter((e) => e.owner?.id === Players.Player1)?.length
                    }
                />
            </div>
        </div>
    );
};

export default Game;
