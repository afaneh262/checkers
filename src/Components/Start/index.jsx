import React, { useState } from 'react';
import clsx from 'clsx';

import {
    Levels,
    PlayerTypes,
    PlayersColors,
    PlayersNames,
    Players,
    InitalPlayerToStart,
    Algos,
} from './../../utils';

import './styles.scss';

const RadioGroup = ({ title, choices, selectedChoice, onChange }) => {
    return (
        <div className='RadioGroup'>
            <div className='RadioGroup__Title'>{title}</div>
            <div className="RadioGroup__Choices">
                {choices.map((entry) => {
                    return (
                        <div
                            className="Choices__Choice"
                            onClick={() => {
                                onChange(entry.id);
                            }}
                        >
                            <div
                                className={clsx('Choice__Check', {
                                    IsSelected: selectedChoice === entry.id,
                                })}
                            ></div>
                            <div className="Choice__Name">{entry.name}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const Start = ({ onStart }) => {
    const [forceJump, setForceJump] = useState(true);
    const [selectedAlgo, setSelectedAlgo] = useState(Algos.AlphaBetaPruning);
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
            <div className="RulesAndAlog">
                <div className="RulesAndAlgo__Title">Rules & Algo</div>
                <div className="RulesAndAlgo__Body">
                    <div
                        style={{
                            marginBottom: '15px',
                        }}
                    >
                        <RadioGroup
                            title={'Force Jump'}
                            choices={[
                                {
                                    id: true,
                                    name: 'Yes',
                                },
                                {
                                    id: false,
                                    name: 'No',
                                },
                            ]}
                            selectedChoice={forceJump}
                            onChange={(newVal) => {
                                setForceJump(newVal);
                            }}
                        />
                    </div>
                    <div>
                        <RadioGroup
                            title={'Algo'}
                            choices={Object.keys(Algos).map((entry) => {
                                return {
                                    id: Algos[entry],
                                    name: entry,
                                };
                            })}
                            selectedChoice={selectedAlgo}
                            onChange={(newVal) => {
                                setSelectedAlgo(newVal);
                            }}
                        />
                    </div>
                </div>
            </div>
            <div
                style={{
                    textAlign: 'center',
                }}
            >
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
                            forceJump: forceJump,
                            alog: selectedAlgo
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
