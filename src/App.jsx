import React, { useState } from 'react';

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
    const [selectedStage, setSelectedStage] = useState(stages.start);
    const [gameConfig, setGameConfig] = useState({});
    const [endedGame, sendEndedGame] = useState();
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
            {[stages.game, stages.end].includes(selectedStage) && (
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
                    onViewBoard={() => {
                        setSelectedStage(stages.game);
                    }}
                ></End>
            )}
        </div>
    );
};

export default App;
