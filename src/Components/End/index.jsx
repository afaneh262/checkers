import React from 'react';

import './styles.scss';

const End = ({ game, onStartNewGame, onViewBoard }) => {
    return (
        <div className="End">
            <div>
                <div className="End__Data">
                    <div className="L1">Game is ended</div>
                    <div className="L2">
                        Winner is:{' '}
                        <span>
                            {game.players?.[game.winner]?.name} -{' '}
                            {game.players?.[game.winner]?.type?.toUpperCase()}
                        </span>
                    </div>
                </div>
                <div
                    style={{
                        textAlign: 'center',
                    }}
                >
                    <div><button onClick={onStartNewGame}>Start a new Game</button></div>
                    <div style={{marginTop: '10px'}}><small style={{fontWeight: 700, fontSize: '16px', textDecoration: 'underline', color: '#000', cursor: 'pointer'}} onClick={onViewBoard}>View Board</small></div>
                </div>
            </div>
        </div>
    );
};

export default End;
