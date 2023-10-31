import clsx from 'clsx';

import { PlayersColors, PlayersNames } from '../../utils';
import './styles.scss';

const PlayerWidget = ({ player, numberOfPiecesHeKilled, isActive, playerType }) => {
    return (
        <div className={clsx('PlayerTile', { IsActive: isActive })}>
            <div className="PlayerTile__Details">
                <div
                    className="PlayerTile__Avatar"
                    style={{
                        backgroundColor: PlayersColors[player],
                    }}
                ></div>
                <div className="PlayerTile__Name">{PlayersNames[player]} - {playerType.toUpperCase()}</div>
            </div>
            <div className="PlayerTile__KilledPieces">{numberOfPiecesHeKilled}</div>
        </div>
    );
};

export default PlayerWidget;
