import React, { useState, useEffect } from 'react';
import { useReducer } from 'react';
import clsx from 'clsx';

import './styles.scss';

const players = ['Player 1', 'Player 2'];
const playerTypes = ['human', 'ai'];
const levels = ['easy', 'medium', 'hard'];
const Start = ({ onStart }) => {
    const [selectedLevel, setSelectedLevel] = useState(levels[1]);
    const [selectedPlayers, setSelectedPlayers] = useState(['human', 'ai']);

    return (
        <div className="Start">
            <div className="PlayerChoice">
                <div className="PlayerChoice__Title">Chose Player</div>
                <div className="PlayerChoice__List">
                    {players.map((entry, playerIndex) => {
                        return (
                            <div className="PlayerList">
                                <div className="PlayerList__Title">{entry}</div>
                                <div className="PlayerList__Types">
                                    {playerTypes.map((type) => {
                                        return (
                                            <div
                                                className="PlayerList__Type"
                                                onClick={() => {
                                                    const players = [...selectedPlayers];
                                                    players[playerIndex] = type;
                                                    setSelectedPlayers(players);
                                                }}
                                            >
                                                <div
                                                    className={clsx('PlayerList__Types__Check', {
                                                        IsSelected:
                                                            selectedPlayers[playerIndex] === type,
                                                    })}
                                                ></div>
                                                <div className="PlayerList__Types__Name">
                                                    {type}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="Level">
                <div className="Level__Title">Chose the level</div>
                <div className="Level__Choices">
                    {levels.map((type) => {
                        return (
                            <div
                                className={clsx('Level', { IsSelected: selectedLevel === type })}
                                onClick={() => {
                                    setSelectedLevel(type);
                                }}
                            >
                                {type}
                            </div>
                        );
                    })}
                </div>
            </div>
            <button
                className="StartBtn"
                onClick={() => {
                    onStart({
                        level: selectedLevel,
                        players: selectedPlayers,
                    });
                }}
            >
                Start
            </button>
        </div>
    );
};

export default Start;
