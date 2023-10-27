import React from 'react';
import { BoardRow, BoardSquare, Piece, BoardStyled, IconStyled } from './board.component.style';
import { IPiece } from './game-models';

const Board = (props) => {
    const { onClick, boardMatrix } = props;

    return (
        <BoardStyled>
            <tbody>
                {boardMatrix.map((boardRow, rowIndex) => (
                    <BoardRow key={'Row' + rowIndex}>
                        {boardRow.map((piece, colIndex) => {
                            const handleClick = () => (piece.selectable ? onClick(piece) : null);
                            return (
                                <BoardSquare key={'Square' + rowIndex + colIndex}>
                                    <Piece onClick={handleClick} owner={piece.owner} selectable={piece.selectable}>
                                        {piece.king ? <IconStyled name='rocket' /> : null}
                                    </Piece>
                                </BoardSquare>
                            );
                        })}
                    </BoardRow>
                ))}
            </tbody>
        </BoardStyled>
    );
};

export default Board;
