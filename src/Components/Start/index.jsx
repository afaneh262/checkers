import React, { useState } from 'react';
import clsx from 'clsx';

import {
    Levels,
    PlayerTypes,
    PlayersColors,
    PlayersNames,
    Players,
    InitalPlayerToStart,
} from './../../utils';

import './styles.scss';

const Start = ({ onStart }) => {
    const [selectedLevel, setSelectedLevel] = useState(Levels.Medium);
    const [selectedPlayers, setSelectedPlayers] = useState([PlayerTypes.Human, PlayerTypes.Ai]);

    return (
        <div className="Start">
            <h1>Chose your settings</h1>
            <div className="PlayerChoice">
                <div className="PlayerChoice__Title">Chose Player</div>
                <div className="PlayerChoice__List">
                    {Object.keys(Players).map((entry, playerIndex) => {
                        return (
                            <div className="PlayerList">
                                <div className="PlayerList__Title">
                                    {PlayersNames[Players[entry]]}
                                </div>
                                <div className="PlayerList__Types">
                                    {Object.keys(PlayerTypes).map((type) => {
                                        return (
                                            <div
                                                className="PlayerList__Type"
                                                onClick={() => {
                                                    const players = [...selectedPlayers];
                                                    players[playerIndex] = PlayerTypes[type];
                                                    setSelectedPlayers(players);
                                                }}
                                            >
                                                <div
                                                    className={clsx('PlayerList__Types__Check', {
                                                        IsSelected:
                                                            selectedPlayers[playerIndex] ===
                                                            PlayerTypes[type],
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
            {!(
                selectedPlayers[0] === PlayerTypes.Human && selectedPlayers[1] === PlayerTypes.Human
            ) && (
                <div className="Level">
                    <div className="Level__Title">Chose the level</div>
                    <div className="Level__Choices">
                        {Object.keys(Levels).map((type) => {
                            return (
                                <div
                                    className={clsx('Level2', {
                                        IsSelected: selectedLevel === Levels[type],
                                    })}
                                    onClick={() => {
                                        setSelectedLevel(Levels[type]);
                                    }}
                                >
                                    {type}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            <div style={{
                textAlign: 'center'
            }}>
                <button
                    className="StartBtn"
                    onClick={() => {
                        onStart({
                            level: selectedLevel,
                            players: {
                                [Players.Player1]: {
                                    id: Players.Player1,
                                    type: selectedPlayers[0],
                                    name: PlayersNames[Players.Player1],
                                    color: PlayersColors[Players.Player1],
                                },
                                [Players.Player2]: {
                                    id: Players.Player2,
                                    type: selectedPlayers[1],
                                    name: PlayersNames[Players.Player2],
                                    color: PlayersColors[Players.Player2],
                                },
                            },
                            initalPlayerToStart: InitalPlayerToStart,
                        });
                    }}
                >
                    Start
                </button>
            </div>
        </div>
    );
};

export default Start;
