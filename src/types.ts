// Types for the 4096 game

export interface Position {
    row: number;
    col: number;
}

export interface Tile {
    id: string;
    value: number;
    position: Position;
    mergedFrom?: [Tile, Tile];
    isNew?: boolean;
}

export type Grid = (Tile | null)[][];

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface GameState {
    grid: Grid;
    score: number;
    bestScore: number;
    won: boolean;
    over: boolean;
    tiles: Tile[];
}

export type GameMode = 'human' | 'ai';

export interface MoveResult {
    grid: Grid;
    tiles: Tile[];
    score: number;
    moved: boolean;
}
