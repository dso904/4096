import type { Grid, Tile, Direction, MoveResult, Position } from './types';

const GRID_SIZE = 4;
const WIN_VALUE = 4096;

// Generate a unique ID for tiles
let tileId = 0;
const generateId = (): string => `tile-${++tileId}`;

// Create an empty grid
export const createEmptyGrid = (): Grid => {
    return Array.from({ length: GRID_SIZE }, () =>
        Array.from({ length: GRID_SIZE }, () => null)
    );
};

// Get all empty cell positions
export const getEmptyCells = (grid: Grid): Position[] => {
    const empty: Position[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (!grid[row][col]) {
                empty.push({ row, col });
            }
        }
    }
    return empty;
};

// Add a random tile (90% chance of 2, 10% chance of 4)
export const addRandomTile = (grid: Grid): { grid: Grid; tile: Tile | null } => {
    const emptyCells = getEmptyCells(grid);
    if (emptyCells.length === 0) return { grid, tile: null };

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const value = Math.random() < 0.9 ? 2 : 4;
    const newTile: Tile = {
        id: generateId(),
        value,
        position: randomCell,
        isNew: true,
    };

    const newGrid = grid.map(row => [...row]);
    newGrid[randomCell.row][randomCell.col] = newTile;
    return { grid: newGrid, tile: newTile };
};

// Initialize a new game
export const initializeGame = (): { grid: Grid; tiles: Tile[] } => {
    tileId = 0;
    let grid = createEmptyGrid();
    const tiles: Tile[] = [];

    // Add two random tiles
    const first = addRandomTile(grid);
    grid = first.grid;
    if (first.tile) tiles.push(first.tile);

    const second = addRandomTile(grid);
    grid = second.grid;
    if (second.tile) tiles.push(second.tile);

    return { grid, tiles };
};

// Clone grid for immutability
const cloneGrid = (grid: Grid): Grid => {
    return grid.map(row => row.map(tile => (tile ? { ...tile } : null)));
};

// Move tiles in a direction
export const move = (grid: Grid, direction: Direction): MoveResult => {
    let score = 0;
    let moved = false;
    const newGrid = cloneGrid(grid);
    const allTiles: Tile[] = [];

    const vectors: Record<Direction, { row: number; col: number }> = {
        up: { row: -1, col: 0 },
        down: { row: 1, col: 0 },
        left: { row: 0, col: -1 },
        right: { row: 0, col: 1 },
    };

    const buildTraversals = (vector: { row: number; col: number }) => {
        const rows = Array.from({ length: GRID_SIZE }, (_, i) => i);
        const cols = Array.from({ length: GRID_SIZE }, (_, i) => i);
        if (vector.row === 1) rows.reverse();
        if (vector.col === 1) cols.reverse();
        return { rows, cols };
    };

    const vector = vectors[direction];
    const { rows, cols } = buildTraversals(vector);

    // Clear merged flags
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (newGrid[r][c]) {
                newGrid[r][c] = { ...newGrid[r][c]!, isNew: false, mergedFrom: undefined };
            }
        }
    }

    for (const row of rows) {
        for (const col of cols) {
            const tile = newGrid[row][col];
            if (!tile) continue;

            let targetRow = row;
            let targetCol = col;

            // Find the farthest position
            while (true) {
                const nextRow = targetRow + vector.row;
                const nextCol = targetCol + vector.col;

                if (nextRow < 0 || nextRow >= GRID_SIZE || nextCol < 0 || nextCol >= GRID_SIZE) break;

                const nextTile = newGrid[nextRow][nextCol];
                if (nextTile) {
                    // Can merge if same value and not already merged
                    if (nextTile.value === tile.value && !nextTile.mergedFrom) {
                        targetRow = nextRow;
                        targetCol = nextCol;
                    }
                    break;
                }

                targetRow = nextRow;
                targetCol = nextCol;
            }

            if (targetRow !== row || targetCol !== col) {
                moved = true;
                const targetTile = newGrid[targetRow][targetCol];

                if (targetTile && targetTile.value === tile.value) {
                    // Merge
                    const mergedValue = tile.value * 2;
                    score += mergedValue;
                    const mergedTile: Tile = {
                        id: generateId(),
                        value: mergedValue,
                        position: { row: targetRow, col: targetCol },
                        mergedFrom: [tile, targetTile],
                    };
                    newGrid[targetRow][targetCol] = mergedTile;
                } else {
                    // Move
                    newGrid[targetRow][targetCol] = {
                        ...tile,
                        position: { row: targetRow, col: targetCol },
                    };
                }
                newGrid[row][col] = null;
            }
        }
    }

    // Collect all tiles
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (newGrid[r][c]) {
                allTiles.push(newGrid[r][c]!);
            }
        }
    }

    return { grid: newGrid, tiles: allTiles, score, moved };
};

// Check if game is won (4096 tile exists)
export const checkWin = (tiles: Tile[]): boolean => {
    return tiles.some(tile => tile.value >= WIN_VALUE);
};

// Check if any moves are possible
export const canMove = (grid: Grid): boolean => {
    // Check for empty cells
    if (getEmptyCells(grid).length > 0) return true;

    // Check for possible merges
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const tile = grid[row][col];
            if (!tile) continue;

            // Check right neighbor
            if (col < GRID_SIZE - 1) {
                const right = grid[row][col + 1];
                if (right && right.value === tile.value) return true;
            }

            // Check bottom neighbor
            if (row < GRID_SIZE - 1) {
                const bottom = grid[row + 1][col];
                if (bottom && bottom.value === tile.value) return true;
            }
        }
    }

    return false;
};

// Get grid from tiles
export const getTilesFromGrid = (grid: Grid): Tile[] => {
    const tiles: Tile[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col]) {
                tiles.push(grid[row][col]!);
            }
        }
    }
    return tiles;
};
