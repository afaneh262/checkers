import clsx from 'clsx';

import './styles.scss';
import { PlayerTypes } from '../../constants';

const PlayerWidget = ({ player, numberOfPiecesHeKilled, isActive, opponent }) => {
    return (
        <div className={clsx('PlayerTile')}>
            <div className="PlayerTile__Content">
                <div className="PlayerTile__Details">
                    <div
                        className="PlayerTile__Avatar"
                        style={{
                            backgroundColor: player.color,
                        }}
                    ></div>
                    <div className="PlayerTile__KilledPieces">
                        <div
                            className="KilledPieces__Opponent"
                            style={{
                                backgroundColor: opponent.color,
                            }}
                        ></div>
                        <div className="KilledPieces__Count">X {numberOfPiecesHeKilled}</div>
                    </div>
                </div>
                <div className="PlayerTile__Name">
                    {player.name} - {player.type.toUpperCase()}
                </div>
            </div>
            {isActive && (
                <div className="Action">
                    {player.type === PlayerTypes.Ai ? 'Thinking...' : 'Your Turn'}
                </div>
            )}
        </div>
    );
};

export default PlayerWidget;
