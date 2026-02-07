import type { Tile as TileType } from '../types';
import Tile from './Tile';
import './Board.css';

interface BoardProps {
    tiles: TileType[];
}

const Board: React.FC<BoardProps> = ({ tiles }) => {
    return (
        <div className="board-container">
            <div className="board-grid">
                {/* Background cells */}
                {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="grid-cell" />
                ))}
            </div>
            <div className="tiles-container">
                {tiles.map((tile) => (
                    <Tile key={tile.id} tile={tile} />
                ))}
            </div>
        </div>
    );
};

export default Board;
