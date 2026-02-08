import { initTables, moveTable, scoreTable, heuristicTableEarly, heuristicTableMid, heuristicTableLate, transpose, reverseRow } from './bitboard';

// Initialize tables immediately
initTables();

// The simplified Grid interface for the worker
type CompactGrid = [number, number, number, number];

// Transposition Table (4M entries = ~64MB)
const TT_SIZE = 4194304; // 2^22
const TT_MASK = 0x3FFFFFn;
const ttKeys = new BigUint64Array(TT_SIZE);
const ttValues = new Float64Array(TT_SIZE);
const ttDepths = new Uint8Array(TT_SIZE);

/**
 * Core expectimax search
 */
class AI {
    maxDepth: number;
    startTime: number;
    timeLimit: number; // ms

    constructor(timeLimit: number = 100) {
        this.timeLimit = timeLimit;
        this.maxDepth = 0;
        this.startTime = 0;
    }

    // Convert standard grid (from main thread) to CompactGrid
    // Grid is 4x4 array of Tile objects or null
    static toCompact(grid: any[][]): CompactGrid {
        const cGrid: CompactGrid = [0, 0, 0, 0];
        for (let r = 0; r < 4; r++) {
            let rowVal = 0;
            for (let c = 0; c < 4; c++) {
                const cell = grid[r][c];
                if (cell) {
                    // Normalize value back to exponent (log2)
                    // value 2 -> 1, 4 -> 2, ...
                    let val = cell.value;
                    let exp = 0;
                    while (val > 1) { val >>= 1; exp++; }
                    rowVal |= (exp << (c * 4));
                }
            }
            cGrid[r] = rowVal;
        }
        return cGrid;
    }

    // Get best move using Iterative Deepening
    getBestMove(grid: CompactGrid): number {
        this.startTime = performance.now();
        let bestMove = -1;

        // Start at depth 1 and go up
        // We go up to depth 8-10 easily with bitboards
        for (let d = 1; d <= 8; d++) {
            this.maxDepth = d;
            try {
                const move = this.searchRoot(grid, d);
                if (move !== -1) bestMove = move;

                // If we're out of time, stop
                if (performance.now() - this.startTime > this.timeLimit) break;
            } catch (e) {
                // Timeout
                break;
            }
        }

        return bestMove;
    }

    searchRoot(grid: CompactGrid, depth: number): number {
        let bestScore = -Infinity;
        let bestMove = -1;

        // 0: Up, 1: Down, 2: Left, 3: Right
        for (let dir = 0; dir < 4; dir++) {
            const result = this.playMove(grid, dir);
            if (result.moved) {
                const score = result.points + this.expect(result.grid, depth - 1);
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = dir;
                }
            }
        }

        return bestMove;
    }

    expect(grid: CompactGrid, depth: number): number {
        if (depth === 0) return this.evaluate(grid);
        if (performance.now() - this.startTime > this.timeLimit) throw new Error("Timeout");

        // Count empty spots
        let emptySpots = 0;
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (((grid[r] >> (c * 4)) & 0xF) === 0) emptySpots++;
            }
        }

        if (emptySpots === 0) return this.evaluate(grid); // Game over check?

        // Optimization: Instead of average over ALL spots, average over weighted spots
        // Or simplified: probability sum

        let cumulativeScore = 0;

        // For each empty spot
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const shift = c * 4;
                if (((grid[r] >> shift) & 0xF) === 0) {
                    // Try placing a 2 (prob 0.9)
                    const grid2 = [...grid] as CompactGrid;
                    grid2[r] |= (1 << shift);
                    const s2 = this.maximize(grid2, depth - 1);

                    // Try placing a 4 (prob 0.1)
                    const grid4 = [...grid] as CompactGrid;
                    grid4[r] |= (2 << shift);
                    const s4 = this.maximize(grid4, depth - 1);

                    cumulativeScore += (0.9 * s2) + (0.1 * s4);
                }
            }
        }

        return cumulativeScore / emptySpots;
    }




    maximize(grid: CompactGrid, depth: number): number {
        if (depth === 0) return this.evaluate(grid);

        // TT Lookup
        // Create 64-bit key from 4x 16-bit rows
        const key = (BigInt(grid[0]) << 48n) | (BigInt(grid[1]) << 32n) | (BigInt(grid[2]) << 16n) | BigInt(grid[3]);
        // Simple hash: mask the lower 20 bits
        const index = Number(key & TT_MASK);

        if (ttKeys[index] === key && ttDepths[index] >= depth) {
            return ttValues[index];
        }

        let maxScore = -Infinity;
        let movedAny = false;

        for (let dir = 0; dir < 4; dir++) {
            const result = this.playMove(grid, dir);
            if (result.moved) {
                movedAny = true;
                const score = result.points + this.expect(result.grid, depth - 1);
                maxScore = Math.max(maxScore, score);
            }
        }

        const finalScore = movedAny ? maxScore : this.evaluate(grid);

        // TT Store
        // Replace if slot is empty, or different key (collision), or if we have a deeper/better search
        // We prefer to keep entries with higher depth.
        // If collision (keys differ), we just overwrite (simple strategy)
        // If same key, only update if depth is >= current
        if (ttKeys[index] !== key || depth >= ttDepths[index]) {
            ttKeys[index] = key;
            ttValues[index] = finalScore;
            ttDepths[index] = depth;
        }

        return finalScore;
    }

    // Execute move on bitboard
    playMove(grid: CompactGrid, dir: number): { grid: CompactGrid, moved: boolean, points: number } {
        const newGrid = [0, 0, 0, 0] as CompactGrid;
        let points = 0;
        let moved = false;

        if (dir === 2) { // Left
            for (let i = 0; i < 4; i++) {
                const r = grid[i];
                const res = moveTable[r];
                newGrid[i] = res;
                points += scoreTable[r];
                if (r !== res) moved = true;
            }
        } else if (dir === 3) { // Right
            for (let i = 0; i < 4; i++) {
                const r = grid[i];
                const rev = reverseRow(r);
                const res = moveTable[rev];
                newGrid[i] = reverseRow(res);
                points += scoreTable[rev];
                if (r !== newGrid[i]) moved = true;
            }
        } else {
            // Up/Down requires transpose
            const t = transpose(grid[0], grid[1], grid[2], grid[3]);
            if (dir === 0) { // Up (Left on transposed)
                for (let i = 0; i < 4; i++) {
                    const r = t[i];
                    const res = moveTable[r];
                    t[i] = res;
                    points += scoreTable[r];
                    if (r !== res) moved = true;
                }
            } else { // Down (Right on transposed)
                for (let i = 0; i < 4; i++) {
                    const r = t[i];
                    const rev = reverseRow(r);
                    const res = moveTable[rev];
                    t[i] = reverseRow(res);
                    points += scoreTable[rev];
                    if (r !== t[i]) moved = true;
                }
            }
            // Transpose back
            const final = transpose(t[0], t[1], t[2], t[3]);
            return { grid: final, moved, points };
        }

        return { grid: newGrid, moved, points };
    }

    evaluate(grid: CompactGrid): number {
        // Determine game stage based on max tile
        let maxVal = 0;
        for (let i = 0; i < 4; i++) {
            // Check each nibble
            let r = grid[i];
            for (let j = 0; j < 4; j++) {
                const val = (r >> (j * 4)) & 0xF;
                if (val > maxVal) maxVal = val;
            }
        }

        // Select heuristic table
        // MaxVal is exponent: 9=512, 11=2048
        let table;
        if (maxVal < 9) { // < 512
            table = heuristicTableEarly;
        } else if (maxVal < 11) { // < 2048
            table = heuristicTableMid;
        } else { // >= 2048
            table = heuristicTableLate;
        }

        // Use pre-computed heuristic table + transpose check
        let score =
            table[grid[0]] +
            table[grid[1]] +
            table[grid[2]] +
            table[grid[3]];

        // Also evaluate columns (by transposing)
        const t = transpose(grid[0], grid[1], grid[2], grid[3]);
        score +=
            table[t[0]] +
            table[t[1]] +
            table[t[2]] +
            table[t[3]];

        return score;
    }
}

// Worker Interface
const ai = new AI(150); // 150ms time budget

self.onmessage = (e: MessageEvent) => {
    const { grid } = e.data;
    if (!grid) return;

    const compactGrid = AI.toCompact(grid);
    const bestMove = ai.getBestMove(compactGrid);

    // Map internal direction (0-3) to string names
    const dirs = ['up', 'down', 'left', 'right'];

    self.postMessage({
        move: bestMove !== -1 ? dirs[bestMove] : null
    });
};
