import React, { useState, useEffect } from 'react';
import { useReducer } from 'react';
import clsx from 'clsx';

import './styles.scss';

import Start from './Components/Start';
import Game from './Components/Game';
import End from './Components/End';

const stages = {
    start: 'start',
    play: 'play',
    end: 'end',
};

const App = () => {
    const [selectedStage, setSelectedStage] = useState(stages.end);
    const [gameConfig, setGameConfig] = useState({});
    const [endedGame, sendEndedGame] = useState({
        winner: 'player1',
    });
    return (
        <div className="App">
            {selectedStage === stages.start && (
                <Start
                    onStart={(data) => {
                        setGameConfig(data);
                        setSelectedStage(stages.game);
                    }}
                ></Start>
            )}
            {selectedStage === stages.game && (
                <Game
                    gameConfig={gameConfig}
                    onStartNewGame={() => {
                        setSelectedStage(stages.start);
                    }}
                ></Game>
            )}
            {selectedStage === stages.end && (
                <End
                    game={endedGame}
                    onStartNewGame={() => {
                        setSelectedStage(stages.start);
                    }}
                ></End>
            )}
        </div>
    );
};

export default App;
