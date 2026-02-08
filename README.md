# 🎮 4096 - AI-Powered Puzzle Game

<div align="center">

![4096 Game](https://img.shields.io/badge/Game-4096-f5b041?style=for-the-badge&logo=gamepad&logoColor=white)
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
| 🤖 **AI Mode** | Watch an optimized Expectimax AI solve the puzzle |
| 🎚️ **Speed Control** | Adjustable AI speed slider (100-400ms) |
| 🌙 **Dark Theme** | Sleek, modern dark color palette |
| 🎨 **Warm Tile Colors** | Classic beige → orange → red → gold gradient |
| ✨ **Smooth Animations** | Framer Motion powered tile transitions |
| 📖 **Onboarding Modal** | Interactive tutorial on every page load |
| 💾 **Persistent High Score** | Local storage saves your best (human mode only) |
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
│   │   ├── 🧠 bitboard.ts        # O(1) lookup tables + multi-stage heuristics
│   │   └── ⚙️ aiWorker.ts        # Background AI thread with 4M TT
│   ├── 📂 components/
│   │   ├── 🎲 Board.tsx          # 4x4 game grid
│   │   ├── 🟩 Tile.tsx           # Animated tiles
│   │   ├── 📊 Header.tsx         # Title, scores, controls
│   │   ├── 🏆 Overlay.tsx        # Win/lose screens
│   │   └── 📖 OnboardingModal.tsx # Tutorial modal
│   ├── 🎮 gameEngine.ts          # Core game logic
│   ├── 📝 types.ts               # TypeScript interfaces
│   └── 🎨 index.css              # Dark theme styles
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
| `heuristicTables` | 1.5 MB | O(1) evaluation (3 stages) |

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

A **4 million entry** cache stores previously evaluated board states (~64MB RAM).

```typescript
const TT_SIZE = 4194304; // 2^22
const TT_MASK = 0x3FFFFFn;
const ttKeys = new BigUint64Array(TT_SIZE);
const ttValues = new Float64Array(TT_SIZE);
const ttDepths = new Uint8Array(TT_SIZE);
```

### ⚖️ Multi-Stage Heuristics

The AI adapts its strategy based on the game phase (max tile value).

| Factor | Early (<512) | Mid (<2048) | Late (2048+) | Purpose |
|--------|--------------|-------------|--------------|---------|
| **Empty Cells** | 1000× | 1000× | 800× | Keep board open |
| **Merges** | 500× | 600× | 800× | Enable combos |
| **Monotonicity** | 15× | 20× | **25×** | Maintain snake pattern |
| **Corner Bias** | 1.0× | 1.5× | 2.0× | Lock max tile at edge |

---

## 🎨 Design Philosophy

### Color Palette (Dark Theme)

| Element | Color | Hex |
|---------|-------|-----|
| 🌑 Background | Deep Navy | `#1A1A2E` |
| 🎯 Board | Dark Slate | `#2D3047` |
| ⭐ Accent | Gold | `#F5B041` |
| 📝 Text | Light Gray | `#EAEAEA` |

### Tile Colors (HSL Gradient)

| Tile | Color | HSL |
|------|-------|-----|
| 2 | Light Cream | `45, 30%, 85%` |
| 4 | Warm Beige | `45, 40%, 78%` |
| 8 | Orange | `30, 80%, 60%` |
| 16 | Deep Orange | `25, 90%, 55%` |
| 32 | Red-Orange | `15, 95%, 50%` |
| 64 | Red | `5, 90%, 50%` |
| 128 | Yellow | `50, 90%, 50%` |
| 256 | Gold | `45, 95%, 50%` |
| 512 | Amber | `40, 100%, 48%` |
| 1024 | Deep Amber | `35, 100%, 45%` |
| 2048 | Bronze | `30, 100%, 42%` |
| 4096 | **Purple** 🎉 | `280, 80%, 55%` |

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
| **Lucide React** | Icons |

---

## 📈 Performance

| Metric | Value |
|--------|-------|
| **Move Generation** | O(1) |
| **Search Depth** | 8-10+ moves |
| **Time per Move** | ~150ms |
| **TT Size** | 4M entries (~64MB) |
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

**Made with 💛 and a lot of bitwise operations**

</div>
