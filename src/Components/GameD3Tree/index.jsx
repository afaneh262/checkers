import { Players, PlayersColors } from '../../utils';

const cellSize = 20; // Adjust this according to your needs

const renderCheckerPiece = (value, x, y) => {
    if (!value?.owner) {
        return null;
    }
    const circleStyle = {
        cx: x * cellSize + cellSize / 2,
        cy: y * cellSize + cellSize / 2,
        r: cellSize / 2 - 2.5,
    };

    if (value.isKing) {
        return (
            <g>
                <circle {...circleStyle} fill={PlayersColors[value.owner]} />
                <circle
                    {...circleStyle}
                    r={circleStyle.r / 2}
                    fill={
                        value.owner === Players.Player1
                            ? PlayersColors[Players.Player2]
                            : PlayersColors[Players.Player1]
                    }
                />
            </g>
        );
    }

    return <circle {...circleStyle} fill={PlayersColors[value.owner]} />;
};

const GameD3Tree = ({ board, handleClick }) => {
    return (
        <svg width={cellSize * 8} height={cellSize * 8} onClick={handleClick}>
            {board.map((row, y) =>
                row.map((value, x) => (
                    <g key={`${x}-${y}`}>
                        <rect
                            x={x * cellSize}
                            y={y * cellSize}
                            width={cellSize}
                            height={cellSize}
                            fill={(x + y) % 2 === 0 ? '#e8b679' : '#bf8648'}
                        />
                        {renderCheckerPiece(value, x, y)}
                    </g>
                )),
            )}
        </svg>
    );
};

export default GameD3Tree;
