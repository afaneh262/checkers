import React, { useState, useEffect } from 'react';
import { useReducer } from 'react';
import clsx from 'clsx';

import './styles.scss';

import Start from './Components/Start';
import Game from './Components/Game';

const stages = {
    start: 'start',
    play: 'play',
};

const App = () => {
    const [selectedStage, setSelectedStage] = useState(stages.start);
    const [gameConfig, setGameConfig] = useState({});
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
        </div>
    );
};

export default App;
