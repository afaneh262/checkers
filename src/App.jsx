import React, { useState } from 'react';

import './styles.scss';

import Start from './Components/Start';
import Game from './Components/Game';
import End from './Components/End';
import { Players } from './constants';

const stages = {
    start: 'start',
    play: 'play',
    end: 'end',
};

const App = () => {
    const [selectedStage, setSelectedStage] = useState(stages.end);
    const [gameConfig, setGameConfig] = useState({});
    const [endedGame, sendEndedGame] = useState({
        winner: Players.Player1,
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
                    onGameEnded={(game) => {
                        sendEndedGame(game);
                        setSelectedStage(stages.end);
                    }}
                ></Game>
            )}
            {(selectedStage === stages.end) && (
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
