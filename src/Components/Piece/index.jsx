import clsx from 'clsx';

import './styles.scss';
import kingIcon from './crown.svg';
import kingBlackIcon from './crown-black.svg';
import {
    PlayersColors
} from '../../utils';

const Piece = ({ piece, handleClick, players }) => {
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
                        backgroundColor: players[piece.owner].color,
                    }}
                >
                    {piece.isKing ? (
                        <div className="IsKing">
                            <img src={players[piece.owner].color === '#000' ? kingIcon : kingBlackIcon} />
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
