import React, { useState, useEffect } from 'react';
import { cloneDeep } from 'lodash';
import Tree from 'react-d3-tree';

import {
    PlayerTypes, 
    Players,
    selectGamePiece,
    moveGamePiece,
    playAi,
    buildInitialBoard,
    highlighBoard,
} from './../../utils';

import PlayerWidget from '../PlayerWidget';
import Piece from '../Piece';

import './styles.scss';

const buildGameState = (gameConfig) => {
    const { level, players, initalPlayerToStart } = gameConfig;

    let board = buildInitialBoard(players);
    board = highlighBoard(board, initalPlayerToStart);
    return {
        board,
        isEnd: false,
        turn: initalPlayerToStart,
        players,
        level,
        selectedPiece: null,
        killedPieces: [],
    };
};

const Game = ({ gameConfig, onStartNewGame, onGameEnded }) => {
    const [game, setGame] = useState(buildGameState(gameConfig));
    const [player1Move, setPlayer1Move] = useState({});
    const [player2Move, setPlayer2Move] = useState({});
    const [player1Tree, setPlayer1Tree] = useState(null);
    const [player2Tree, setPlayer2Tree] = useState();

    useEffect(() => {
        const init = async () => {
            const { newGame, bestMove, gameTree } = await playAi(cloneDeep(game), gameConfig.level);
            setGame(newGame);
            if (game.turn === Players.Player1) {
                setPlayer1Move(bestMove);
                setPlayer1Tree(gameTree);
            } else if (game.turn === Players.Player2) {
                setPlayer2Move(bestMove);
                setPlayer2Tree(gameTree);
            }
        };

        if (game.players[game.turn].type === PlayerTypes.Ai) {
            setTimeout(() => {
                init();
            }, 100);
        }
    }, [game.turn]);

    useEffect(() => {
        if (game.isEnd) {
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
        <div>
            <div className="Game">
                <button
                    className="StartNewGameBtn"
                    onClick={() => {
                        onStartNewGame();
                    }}
                >
                    Start new game
                </button>
                <div className="PlayerWidget__Wrap">
                    <PlayerWidget
                        isActive={game.turn === Players.Player1}
                        player={game.players[Players.Player1]}
                        numberOfPiecesHeKilled={
                            game.killedPieces?.filter((e) => e.owner?.id === Players.Player2)
                                ?.length
                        }
                        opponent={game.players[Players.Player2]}
                        move={player1Move}
                    />
                </div>
                <div className="Board">
                    {game.board.map((boardRow, rowIndex) => (
                        <div className="Row" key={'Row' + rowIndex}>
                            {boardRow.map((piece, colIndex) => {
                                return (
                                    <Piece
                                        key={`Piece-${rowIndex}-${colIndex}`}
                                        piece={piece}
                                        handleClick={(action, piece) => {
                                            if (action === 'selectPiece') {
                                                onSelectPiece(piece);
                                            } else if (action === 'movePiece') {
                                                onMovePiece(piece);
                                            }
                                        }}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="PlayerWidget__Wrap">
                    <PlayerWidget
                        isActive={game.turn === Players.Player2}
                        player={game.players[Players.Player2]}
                        numberOfPiecesHeKilled={
                            game.killedPieces?.filter((e) => e.owner?.id === Players.Player1)
                                ?.length
                        }
                        opponent={game.players[Players.Player1]}
                        move={player2Move}
                    />
                </div>
            </div>
            {player2Tree && (
                <div id="treeWrapper" style={{ width: '90%', height: '100vh', background: '#fff' }}>
                    <Tree
                        data={player2Tree}
                        orientation={'vertical'}
                        collapsible={false}
                        renderCustomNodeElement={({ nodeDatum, toggleNode }) => (
                            <g>
                                <rect width="20" height="20" x="-10" onClick={toggleNode} />
                                <text fill="black" strokeWidth="1" x="20">
                                    {nodeDatum.value.evaluation}
                                </text>
                            </g>
                        )}
                    />
                </div>
            )}
        </div>
    );
};

export default Game;
