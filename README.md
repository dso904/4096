# 🎮 4096 - AI-Powered Puzzle Game

<div align="center">

![4096 Game](https://img.shields.io/badge/Game-4096-4caf50?style=for-the-badge&logo=gamepad&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**A beautifully crafted 4096 puzzle game featuring a high-performance AI with Bitboard optimization and Web Worker architecture.**

[▶️ Play Now](#-quick-start) • [🤖 AI Deep Dive](#-ai-architecture) • [🎨 Design](#-design-philosophy)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎯 **Human Mode** | Classic gameplay with arrow keys or WASD |
| 🤖 **AI Mode** | Watch an optimized AI solve the puzzle |
| 🎚️ **Speed Control** | Adjustable AI speed slider (100-400ms) |
| 🎨 **Cream & Green Theme** | Soothing, modern color palette |
| ✨ **Smooth Animations** | Framer Motion powered tile transitions |
| 💾 **Persistent High Score** | Local storage saves your best |
| ⚡ **Non-Blocking UI** | AI runs in Web Worker |

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/4096.git
cd 4096

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗️ Project Structure

```
📦 4096/
├── 📂 src/
│   ├── 📂 ai/
│   │   ├── 🧠 bitboard.ts      # O(1) lookup tables (65KB)
│   │   └── ⚙️ aiWorker.ts      # Background AI thread
│   ├── 📂 components/
│   │   ├── 🎲 Board.tsx        # 4x4 game grid
│   │   ├── 🟩 Tile.tsx         # Animated tiles
│   │   ├── 📊 Header.tsx       # Score display
│   │   └── 🏆 Overlay.tsx      # Win/lose screens
│   ├── 🎮 gameEngine.ts        # Core game logic
│   ├── 📝 types.ts             # TypeScript interfaces
│   └── 🎨 index.css            # Global styles
├── 📄 package.json
└── 📄 README.md
```

---

## 🤖 AI Architecture

The AI uses **Expectimax Search** with multiple optimizations to achieve near-optimal play.

### 🧬 Bitboard Representation

Instead of 2D arrays, the board is represented as **four 16-bit integers** (one per row).

```
Row Encoding: [tile3][tile2][tile1][tile0] = 16 bits
              (4 bits each, values 0-15 represent 0-32768)
```

**Pre-computed Lookup Tables:**
| Table | Size | Purpose |
|-------|------|---------|
| `moveTable` | 128 KB | O(1) move results |
| `scoreTable` | 256 KB | O(1) score lookup |
| `heuristicTable` | 512 KB | O(1) evaluation |

### 🔍 Search Algorithm

```
            Iterative Deepening
                    │
                    ▼
    ┌───────────────────────────────┐
    │     Expectimax (depth 8+)     │
    │  ┌─────────┬─────────────────┐│
    │  │  MAX    │ Player's turn   ││
    │  ├─────────┼─────────────────┤│
    │  │ EXPECT  │ Random tile     ││
    │  │         │ (90% 2, 10% 4)  ││
    │  └─────────┴─────────────────┘│
    └───────────────────────────────┘
```

### 🗃️ Transposition Table

A **1 million entry** cache stores previously evaluated board states.

```typescript
const TT_SIZE = 1048576; // 2^20
const ttKeys = new BigUint64Array(TT_SIZE);   // 64-bit board keys
const ttValues = new Float64Array(TT_SIZE);   // Cached scores
const ttDepths = new Uint8Array(TT_SIZE);     // Search depths
```

### ⚖️ Heuristic Weights

| Factor | Weight | Purpose |
|--------|--------|---------|
| **Empty Cells** | 1000× | Keep the board open |
| **Merge Potential** | 600× | Set up combos |
| **Monotonicity** | 15× | Maintain "snake" chain |
| **Corner Bias** | val³ | Keep max tile at edge |

---

## 🎨 Design Philosophy

### Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| 🟫 Background | Cream | `#FAF3E0` |
| 🟤 Board | Warm Beige | `#D7CCC8` |
| 🟩 Tiles | Green Gradient | `#E8F5E9` → `#0D3D0D` |
| 🟤 Text | Dark Brown | `#5D4037` |

### Animation System

- **Tile Spawn**: Scale from 0 → 1 with spring physics
- **Tile Merge**: Scale pop to 1.1 → 1
- **AI Speed Slider**: Adjustable 100ms (fast) to 400ms (slow)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI components |
| **TypeScript** | Type safety |
| **Vite** | Build tool |
| **Framer Motion** | Animations |
| **Web Workers** | Background AI |
| **Typed Arrays** | High-performance AI |

---

## 📈 Performance

| Metric | Value |
|--------|-------|
| **Move Generation** | O(1) |
| **Search Depth** | 8-10+ moves |
| **Time per Move** | ~150ms |
| **Table Init** | ~50ms (one-time) |
| **UI Blocking** | None (Web Worker) |

---

## 🎮 Controls

| Key | Action |
|-----|--------|
| `↑` / `W` | Move Up |
| `↓` / `S` | Move Down |
| `←` / `A` | Move Left |
| `→` / `D` | Move Right |

---

## 📜 License

MIT © 2026

---

<div align="center">

**Made with 💚 and a lot of bitwise operations**

</div>
