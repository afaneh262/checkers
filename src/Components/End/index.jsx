import React from 'react';

const End = ({ game, onStartNewGame }) => {
    return (
        <div className="Start">
            <div>
                Game is ended
            </div>
            <div>
                Winner is: {game.winner}
            </div>
            <div>
                <button onClick={onStartNewGame}>Start a new Game</button>
            </div>
        </div>
    );
};

export default End;
