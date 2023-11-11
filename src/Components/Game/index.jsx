import React, { useState, useEffect } from 'react';
import Tree from 'react-d3-tree';

import {
    PlayerTypes,
    Players,
    CheckersGame,
    playAi,
} from './../../utils';

import GameD3Tree from '../GameD3Tree';
import PlayerWidget from '../PlayerWidget';
import Piece from '../Piece';

import './styles.scss';

const Game = ({ gameConfig, onStartNewGame, onGameEnded }) => {
    const [game, setGame] = useState(
        () => new CheckersGame(gameConfig.players, gameConfig.initalPlayerToStart),
    );
    const [player1Move, setPlayer1Move] = useState({});
    const [player2Move, setPlayer2Move] = useState({});
    const [player1Tree, setPlayer1Tree] = useState(null);
    const [player2Tree, setPlayer2Tree] = useState();
    const [isPlayer1TreeShown, setIsPlayer1TreeShown] = useState(false);
    const [isPlayer2TreeShown, setIsPlayer2TreeShown] = useState(false);

    useEffect(() => {
        const init = () => {
            const gameTree = playAi(game, gameConfig.level);
            const {
                value: {
                    bestMove: { piece, newPosition },
                },
            } = gameTree;
            game.movePiece(
                { row: piece.row, col: piece.col },
                { row: newPosition.row, col: newPosition.col },
            );
            setGame((prevInstance) => {
                const newInstance = Object.create(Object.getPrototypeOf(prevInstance));
                Object.assign(newInstance, prevInstance);
                return newInstance;
            });
            if (game.turn === Players.Player2) {
                setPlayer1Move({ piece, newPosition });
                setPlayer1Tree(gameTree);
            } else if (game.turn === Players.Player1) {
                console.log({ gameTree });
                setPlayer2Move({ piece, newPosition });
                setPlayer2Tree(gameTree);
            }
        };

        if (game.players[game.turn].type === PlayerTypes.Ai && !game.isEnd()) {
            setTimeout(() => {
                init();
            }, 100);
        }
    }, [game.turn]);

    useEffect(() => {
        if (game.isEnd()) {
            onGameEnded(game);
        }
    }, [game]);

    const onSelectPiece = (piece) => {
        setIsPlayer1TreeShown(false);
        setIsPlayer2TreeShown(false);
        game.selectPiece(piece.row, piece.col);
        setGame((prevInstance) => {
            const newInstance = Object.create(Object.getPrototypeOf(prevInstance));
            Object.assign(newInstance, prevInstance);
            return newInstance;
        });
    };

    const onMovePiece = (piece) => {
        setIsPlayer1TreeShown(false);
        setIsPlayer2TreeShown(false);
        game.movePiece(
            { row: game.selectedPiece.row, col: game.selectedPiece.col },
            { row: piece.row, col: piece.col },
        );
        setGame((prevInstance) => {
            const newInstance = Object.create(Object.getPrototypeOf(prevInstance));
            Object.assign(newInstance, prevInstance);
            return newInstance;
        });
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
                            game.killedPieces?.filter((e) => e.owner === Players.Player2)?.length
                        }
                        opponent={game.players[Players.Player2]}
                        move={player1Move}
                        onShowMoveTree={() => {
                            setIsPlayer2TreeShown(false);
                            setIsPlayer1TreeShown(true);
                        }}
                    />
                </div>
                <div className="Board">
                    {game.board.map((row, rowIndex) => (
                        <div className="Row" key={'Row' + rowIndex}>
                            {row.map((col, colIndex) => {
                                return (
                                    <Piece
                                        key={`Piece-${rowIndex}-${colIndex}`}
                                        piece={col}
                                        handleClick={(action, piece) => {
                                            if (action === 'selectPiece') {
                                                onSelectPiece(piece);
                                            } else if (action === 'movePiece') {
                                                onMovePiece(piece);
                                            }
                                        }}
                                        players={game.players}
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
                            game.killedPieces?.filter((e) => e.owner === Players.Player1)?.length
                        }
                        opponent={game.players[Players.Player1]}
                        move={player2Move}
                        onShowMoveTree={() => {
                            setIsPlayer1TreeShown(false);
                            setIsPlayer2TreeShown(true);
                        }}
                    />
                </div>
            </div>
            {(isPlayer1TreeShown || isPlayer2TreeShown) && (player2Tree || player1Tree) && (
                <div className="TreeWrapper">
                    <Tree
                        data={isPlayer1TreeShown ? player1Tree : player2Tree}
                        orientation={'vertical'}
                        collapsible={true}
                        nodeSize={{
                            x: 200,
                            y: 200,
                        }}
                        renderCustomNodeElement={({ nodeDatum, toggleNode }) => (
                            <g>
                                <GameD3Tree
                                    board={nodeDatum.board}
                                    handleClick={toggleNode}
                                />
                                <text fill="black" strokeWidth="1" x="20" onClick={toggleNode}>
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
