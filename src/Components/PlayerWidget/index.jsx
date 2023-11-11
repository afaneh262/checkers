import clsx from 'clsx';

import './styles.scss';
import { PlayerTypes } from '../../utils';

const PlayerWidget = ({ player, numberOfPiecesHeKilled, isActive, opponent, move, onShowMoveTree }) => {
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
                {move?.piece && (
                    <div className="PlayerTile__Move">
                        <div>
                            <small>{`[${move?.piece?.row}, ${move?.piece?.col}] -> [${move?.newPosition?.row}, ${move?.newPosition?.col}]`}</small>
                        </div>
                        <div>
                            <small onClick={onShowMoveTree} style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: 700}}>Show move tree</small>
                        </div>
                    </div>
                )}
            </div>
            {isActive && (
                <div className="Action">
                    {player?.type === PlayerTypes.Ai ? 'Thinking...' : 'Your Turn'}
                </div>
            )}
        </div>
    );
};

export default PlayerWidget;
