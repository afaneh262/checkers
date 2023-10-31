import clsx from 'clsx';

import './styles.scss';
import kingIcon from './crown.svg';
import { PlayersColors, PlayersNames } from '../../utils';

const Piece = ({ piece, onClick }) => {
    const renderSquareContent = (piece) => {
        if (piece.owner) {
            return (
                <div
                    className={clsx('Piece', {
                        IsMovable: piece.isMovable,
                        IsSelected: piece.isSelected,
                    })}
                    onClick={() => {
                        if (piece.isMovable) {
                            onClick({
                                type: 'selectPiece',
                                selectedPiece: piece,
                            });
                        }
                    }}
                    style={{
                        backgroundColor: PlayersColors[piece.owner],
                    }}
                >
                    {piece.isKing ? (
                        <div className="IsKing">
                            <img src={kingIcon} />
                        </div>
                    ) : null}
                </div>
            );
        }

        if (piece.isPossibleMove) {
            return (
                <div
                    className={clsx('PossibleMove')}
                    onClick={() => {
                        onClick({
                            type: 'movePiece',
                            newPosition: piece.coordinates,
                        });
                    }}
                />
            );
        }

        return <div />;
    };

    return <div className={clsx('Square')}>{renderSquareContent(piece)}</div>;
};

export default Piece;
