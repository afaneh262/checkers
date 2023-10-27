import { MovementDirection } from "./game-constants";

const IPlayer = {
    id: "",
    color: "",
    direction: 0
};

const IPiece = {
    owner: undefined,
    coordinates: {
        row: 0,
        col: 0
    },
    killableByMovement: undefined,
    selectable: false,
    king: false
};

const ICoordinates = {
    row: 0,
    col: 0
};

export { IPlayer, IPiece, ICoordinates };
