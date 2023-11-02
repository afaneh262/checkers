import clsx from 'clsx';

import './styles.scss';
import kingIcon from './crown.svg';

const Piece = ({ piece, handleClick }) => {
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
                            handleClick('selectPiece', piece);
                        }
                    }}
                    style={{
                        backgroundColor: piece.owner.color,
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
                        handleClick('movePiece', piece);
                    }}
                />
            );
        }

        return <div />;
    };

    return <div className={clsx('Square')}>{renderSquareContent(piece)}</div>;
};

export default Piece;
