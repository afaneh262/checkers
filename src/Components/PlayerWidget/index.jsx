import clsx from 'clsx';

import './styles.scss';

const PlayerWidget = ({ player, numberOfPiecesHeKilled, isActive }) => {
    return (
        <div className={clsx('PlayerTile', { IsActive: isActive })}>
            <div className="PlayerTile__Details">
                <div
                    className="PlayerTile__Avatar"
                    style={{
                        backgroundColor: player.color,
                    }}
                ></div>
                <div className="PlayerTile__Name">{player.name} - {player.type.toUpperCase()}</div>
            </div>
            <div className="PlayerTile__KilledPieces">{numberOfPiecesHeKilled}</div>
        </div>
    );
};

export default PlayerWidget;
