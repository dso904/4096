/**
 * 4096 AI - Bitboard Implementation
 * 
 * Architecture Overview:
 * We use a "Bitboard" representation where the 4x4 grid is stored as a 64-bit integer (actually four 16-bit integers in JS, 
 * as bitwise operations on 64-bit ints are tricky in JS without BigInt, and BigInt is slower).
 * 
 * Representation:
 * - Each tile is a nibble (4 bits).
 * - Value 0 = 0, 1 = 2, 2 = 4, 3 = 8, ..., 15 = 32768.
 * - A row is 16 bits (4 tiles * 4 bits).
 * - The board is 4 rows of 16 bits.
 * 
 * Optimization:
 * We pre-compute all possible moves and scores for a single row (0-65535).
 * - `moves[row]` -> returns the new row after moving left.
 * - `scores[row]` -> returns the score gained from moving left.
 * 
 * For moving right/up/down, we simply transform the board (reverse/transpose), applies the left-move lookup, and transform back.
 * This effectively makes board movement O(1) per row.
 */

// Tables for row operations (size 65536)
// moveTable[row] gives the result of moving that row to the LEFT
export const moveTable = new Uint16Array(65536);
// scoreTable[row] gives the score gained by the move
export const scoreTable = new Uint32Array(65536); // Score can exceed 65535
// heuristicsTable[row] gives the heuristic score of the row
// Multi-Stage Heuristics
export const heuristicTableEarly = new Float64Array(65536);
export const heuristicTableMid = new Float64Array(65536);
export const heuristicTableLate = new Float64Array(65536);

// Initialize tables (run once on startup)
export const initTables = () => {
    console.time('AI Table Initialization');
    for (let row = 0; row < 65536; row++) {
        // 1. Decode row
        const line = [
            (row >> 0) & 0xf,
            (row >> 4) & 0xf,
            (row >> 8) & 0xf,
            (row >> 12) & 0xf,
        ];

        // 2. Compute Move (Left)
        let score = 0;
        const newLine = [...line];

        // Shift left
        for (let i = 0; i < 3; i++) {
            let next = i + 1;
            while (next < 4) {
                if (newLine[next] !== 0) break;
                next++;
            }
            if (next === 4) break; // No more tiles

            if (newLine[i] === 0) {
                newLine[i] = newLine[next];
                newLine[next] = 0;
                i--; // Retry this position
            } else if (newLine[i] === newLine[next]) {
                if (newLine[i] !== 0xf) { // Don't merge if max value (32768)
                    newLine[i]++;
                    score += Math.pow(2, newLine[i]);
                }
                newLine[next] = 0;
            }
        }

        // Encode result
        const resultRow =
            (newLine[0] << 0) |
            (newLine[1] << 4) |
            (newLine[2] << 8) |
            (newLine[3] << 12);

        moveTable[row] = resultRow;
        scoreTable[row] = score;

        // 3. Compute Heuristics for 3 Stages

        // Helper to calculate score with custom weights
        const calcHeuristic = (wEmpty: number, wMerges: number, wMono: number, wEdge: number) => {
            let h = 0;
            let empty = 0;
            let merges = 0;
            let monoLeft = 0;
            let monoRight = 0;

            for (let i = 0; i < 4; i++) {
                const val = line[i];
                if (val === 0) {
                    empty++;
                } else {
                    h += Math.pow(val, 2.5); // Base value reward
                }

                if (i < 3) {
                    // Check monotonicity
                    if (line[i] >= line[i + 1]) monoLeft += (line[i] * line[i]); // squared weight
                    if (line[i] <= line[i + 1]) monoRight += (line[i + 1] * line[i + 1]);

                    // Check merges (smoothness)
                    if (line[i] !== 0 && line[i] === line[i + 1]) {
                        merges++;
                    }
                }
            }

            h += empty * wEmpty;
            h += merges * wMerges;
            h += Math.max(monoLeft, monoRight) * wMono; // Monotonicity

            // Corner/Edge Bonus: Reward having the largest tiles at the edges
            let maxVal = 0;
            let maxIdx = -1;
            for (let i = 0; i < 4; i++) {
                if (line[i] > maxVal) { maxVal = line[i]; maxIdx = i; }
            }
            if (maxVal > 0 && (maxIdx === 0 || maxIdx === 3)) {
                h += Math.pow(maxVal, 3.0) * wEdge;
            }

            return h;
        };

        // Stage 1: Early Game (Max < 512)
        // Focus: Build solid foundation - monotonicity is CRITICAL even early
        heuristicTableEarly[row] = calcHeuristic(
            1000, // Empty (baseline - proven to work)
            500,  // Merges (moderate)
            15.0, // Monotonicity (ORIGINAL VALUE - must not lower!)
            1.0   // Edge bonus (normal)
        );

        // Stage 2: Mid Game (512 <= Max < 2048)
        // Focus: Strengthen structure, prepare for endgame
        heuristicTableMid[row] = calcHeuristic(
            1000, // Empty (same baseline)
            600,  // Merges (higher)
            20.0, // Monotonicity (increasing pressure)
            1.5   // Edge bonus (stronger)
        );

        // Stage 3: Late Game (Max >= 2048)
        // Focus: Survival mode - strict order, maximize merges
        heuristicTableLate[row] = calcHeuristic(
            800,   // Empty (slightly lower - board naturally fuller)
            800,   // Merges (critical for reaching 4096)
            25.0,  // Monotonicity (very high - no chaos allowed)
            2.0    // Edge bonus (must lock corner)
        );
    }
    console.timeEnd('AI Table Initialization');
};

// Helper: Transpose 4x4 board (16-bit rows)
// This is used to convert columns to rows so we can use the row move table for Up/Down moves
export const transpose = (r0: number, r1: number, r2: number, r3: number): [number, number, number, number] => {


    // This looks magic, but it's just extracting nibbles and repacking them
    // A row is: [3][2][1][0] (nibbles)
    // We want:
    // Row 0: r0[0], r1[0], r2[0], r3[0]
    // Row 1: r0[1], r1[1], r2[1], r3[1]
    // ...

    return [
        ((r0 & 0xF) << 0) | ((r1 & 0xF) << 4) | ((r2 & 0xF) << 8) | ((r3 & 0xF) << 12),
        ((r0 >> 4 & 0xF) << 0) | ((r1 >> 4 & 0xF) << 4) | ((r2 >> 4 & 0xF) << 8) | ((r3 >> 4 & 0xF) << 12),
        ((r0 >> 8 & 0xF) << 0) | ((r1 >> 8 & 0xF) << 4) | ((r2 >> 8 & 0xF) << 8) | ((r3 >> 8 & 0xF) << 12),
        ((r0 >> 12 & 0xF) << 0) | ((r1 >> 12 & 0xF) << 4) | ((r2 >> 12 & 0xF) << 8) | ((r3 >> 12 & 0xF) << 12)
    ];
};

// Helper: Reverse bits in each nibble? No, reverse the order of nibbles in a row
// Used for Right moves (Reverse -> Left Move -> Reverse)
export const reverseRow = (row: number): number => {
    return ((row & 0xF) << 12) | ((row & 0xF0) << 4) | ((row & 0xF00) >> 4) | ((row & 0xF000) >> 12);
};
