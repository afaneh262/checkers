import React, { useState, useEffect } from 'react';
import Icon from 'react-fa';
import { Button, WinBox, WinOverlay, WinTitle } from './App.style';
import { Board } from './board.component';
import { GameState, PLAYER1, PLAYER2 } from './game-constants';
import { checkIfWon, clearHighlights, hasKillablePieces, highlightPlayer, highlightPossibleMovement, killPieceFn, mountBoardMatrix, movePiece, nextTurnOwner } from './game-logic';
import { IPiece } from './game-models';

const App = () => {
	const [players, setPlayers] = useState([PLAYER1, PLAYER2]);
	const [turnOwner, setTurnOwner] = useState(PLAYER1);
	const [boardMatrix, setBoardMatrix] = useState(mountBoardMatrix(PLAYER1, PLAYER2));
	const [gameState, setGameState] = useState(GameState.PieceSelect);
	const [currentPiece, setCurrentPiece] = useState({ coordinates: { row: 0, col: 0 }, selectable: false, king: false });
	const [canEndTurn, setCanEndTurn] = useState(false);

	useEffect(() => {
		let updatedBoardMatrix = clearHighlights(boardMatrix);
		updatedBoardMatrix = highlightPlayer(updatedBoardMatrix, turnOwner);
		setBoardMatrix(updatedBoardMatrix);
	}, [turnOwner]);

	const handleEndTurn = () => {
		const newTurnOwner = nextTurnOwner(turnOwner, players);
		const newGameState = GameState.PieceSelect;
		let updatedBoardMatrix = clearHighlights(boardMatrix);
		updatedBoardMatrix = highlightPlayer(updatedBoardMatrix, newTurnOwner);
		setTurnOwner(newTurnOwner);
		setGameState(newGameState);
		setBoardMatrix(updatedBoardMatrix);
		setCanEndTurn(false);
	};

	const handlePlayAgain = () => {
		setPlayers([PLAYER1, PLAYER2]);
		setTurnOwner(PLAYER1);
		setBoardMatrix(mountBoardMatrix(PLAYER1, PLAYER2));
		setGameState(GameState.PieceSelect);
		setCurrentPiece({ coordinates: { row: 0, col: 0 }, selectable: false, king: false });
	};

	const handlePieceClick = (selectedPiece) => {
		let updatedBoardMatrix = boardMatrix;
		let updatedGameState = gameState;
		let updatedCurrentPiece = currentPiece;
		let updatedTurnOwner = turnOwner;
		let updatedCanEndTurn = canEndTurn;

		const handlePieceSelect = (selectedPiece) => {
			updatedBoardMatrix = highlightPossibleMovement(updatedBoardMatrix, selectedPiece, false);
			updatedGameState = GameState.PossibleMovement;
			updatedCurrentPiece = selectedPiece;
		};

		const handlePossibleMovement = (selectedPiece) => {
			if (selectedPiece.owner === updatedTurnOwner) {
				updatedBoardMatrix = clearHighlights(updatedBoardMatrix);
				updatedBoardMatrix = highlightPlayer(updatedBoardMatrix, updatedTurnOwner);
				updatedBoardMatrix = highlightPossibleMovement(updatedBoardMatrix, selectedPiece, false);
				updatedCurrentPiece = selectedPiece;
			} else {
				updatedBoardMatrix = movePiece(updatedBoardMatrix, selectedPiece, updatedCurrentPiece);
				const killPieceReturn = killPieceFn(updatedBoardMatrix, selectedPiece);
				updatedBoardMatrix = killPieceReturn.boardMatrix;
				updatedBoardMatrix = clearHighlights(updatedBoardMatrix);

				if (killPieceReturn.killed) {
					if (checkIfWon(updatedBoardMatrix, players)) {
						updatedGameState = GameState.Won;
					} else {
						updatedBoardMatrix = highlightPossibleMovement(updatedBoardMatrix, selectedPiece, true);
					}
				}

				if (hasKillablePieces(updatedBoardMatrix)) {
					updatedCurrentPiece = selectedPiece;
					updatedCanEndTurn = true;
				} else {
					updatedTurnOwner = nextTurnOwner(updatedTurnOwner, players);
					updatedGameState = GameState.PieceSelect;
					updatedBoardMatrix = clearHighlights(updatedBoardMatrix);
					updatedBoardMatrix = highlightPlayer(updatedBoardMatrix, updatedTurnOwner);
					updatedCanEndTurn = false;
				}
			}
		};

		switch (gameState) {
			case GameState.PieceSelect:
				handlePieceSelect(selectedPiece);
				break;
			case GameState.PossibleMovement:
				handlePossibleMovement(selectedPiece);
				break;
			case GameState.Won:
				break;
			default:
				break;
		}

		setBoardMatrix(updatedBoardMatrix);
		setGameState(updatedGameState);
		setTurnOwner(updatedTurnOwner);
		setCurrentPiece(updatedCurrentPiece);
		setCanEndTurn(updatedCanEndTurn);
	};

	return (
		<React.Fragment>
			<Board boardMatrix={boardMatrix} onClick={handlePieceClick} />
			{canEndTurn ? <Button onClick={handleEndTurn}>End turn</Button> : null}
			{gameState === GameState.Won ? (
				<React.Fragment>
					<WinOverlay />
					<WinBox>
						<WinTitle>{turnOwner.id} won!</WinTitle>
						<Button onClick={handlePlayAgain}>
							Play again <Icon name="undo" />
						</Button>
					</WinBox>
				</React.Fragment>
			) : null}
		</React.Fragment>
	);
};

export default App;
