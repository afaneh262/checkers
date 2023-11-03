import React from 'react';

import './styles.scss';

const End = ({ game, onStartNewGame }) => {
    return (
        <div className="End">
            <div className='End__Data'>
                <div className='L1'>Game is ended</div>
                <div className='L2'>Winner is: <span>{game.players?.[game.winner]?.name} - {game.players?.[game.winner]?.type?.toUpperCase()}</span></div>
            </div>
            <div style={{
                textAlign: 'center'
            }}>
                <button onClick={onStartNewGame}>Start a new Game</button>
            </div>
        </div>
    );
};

export default End;
