export const NUMBER_OF_ROWS = 8;
export const NUMBER_OF_COLUMNS = 8;

export const MovementDirection = {
    Upwards: 0,
    Downwards: 1
};

export const PLAYER1 = {
    id: 'Red',
    color: '#c92735',
    direction: MovementDirection.Upwards
};

export const PLAYER2 = {
    id: 'Black',
    color: '#403f3f',
    direction: MovementDirection.Downwards
};

export const GameState = {
    PieceSelect: 0,
    PossibleMovement: 1,
    Won: 2
};
