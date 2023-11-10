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
    PlayersColors,
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

const cellSize = 20; // Adjust this according to your needs

const renderCheckerPiece = (value, x, y) => {
    if (!value?.owner) {
        return null;
    }
    const circleStyle = {
        cx: x * cellSize + cellSize / 2,
        cy: y * cellSize + cellSize / 2,
        r: cellSize / 2 - 2.5,
    };

    if (value.isKing) {
        return (
            <g>
                <circle {...circleStyle} fill={value.owner.color} />
                <circle {...circleStyle} r={circleStyle.r / 2} fill={value.owner.id === Players.Player1 ? PlayersColors[Players.Player2] : PlayersColors[Players.Player1]} />
            </g>
        );
    }

    return <circle {...circleStyle} fill={value.owner.color} />;
};

const CheckersBoard = ({ board, handleClick }) => {
    return (
        <svg width={cellSize * 8} height={cellSize * 8} onClick={handleClick}>
            {board.map((row, y) =>
                row.map((value, x) => (
                    <g key={`${x}-${y}`}>
                        <rect
                            x={x * cellSize}
                            y={y * cellSize}
                            width={cellSize}
                            height={cellSize}
                            fill={(x + y) % 2 === 0 ? '#e8b679' : '#bf8648'}
                        />
                        {renderCheckerPiece(value, x, y)}
                    </g>
                )),
            )}
        </svg>
    );
};

const Game = ({ gameConfig, onStartNewGame, onGameEnded }) => {
    const [game, setGame] = useState(buildGameState(gameConfig));
    const [player1Move, setPlayer1Move] = useState({});
    const [player2Move, setPlayer2Move] = useState({});
    const [player1Tree, setPlayer1Tree] = useState(null);
    const [player2Tree, setPlayer2Tree] = useState();
    const [isPlayer1TreeShown, setIsPlayer1TreeShown] = useState(false);
    const [isPlayer2TreeShown, setIsPlayer2TreeShown] = useState(false);

    useEffect(() => {
        const init = () => {
            debugger;
            const { newGame, bestMove, gameTree } = playAi(cloneDeep(game), gameConfig.level);
            console.log({gameTree});
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
                        onShowMoveTree={() => {
                            setIsPlayer2TreeShown(false);
                            setIsPlayer1TreeShown(true);
                        }}
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
                            y: 200
                        }}
                        renderCustomNodeElement={({ nodeDatum, toggleNode }) => (
                            <g>
                                <CheckersBoard board={nodeDatum.value.board} handleClick={toggleNode} />
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
