import { useEffect, useState, useCallback, useRef } from 'react';
import { Board, Header, Overlay, OnboardingModal } from './components';
import type { Direction, GameMode, Tile, Grid } from './types';
import { initializeGame, move, addRandomTile, checkWin, canMove } from './gameEngine';
import './App.css';

const STORAGE_KEY = '4096-best-score';

function App() {
  const [grid, setGrid] = useState<Grid>([]);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [won, setWon] = useState(false);
  const [over, setOver] = useState(false);
  const [mode, setMode] = useState<GameMode>('human');
  const [isAIRunning, setIsAIRunning] = useState(false);
  const [aiSpeed, setAiSpeed] = useState(300); // 100-400ms range
  const [showOnboarding, setShowOnboarding] = useState(true); // Show on every page load

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };


  // Initialize game
  const startNewGame = useCallback(() => {
    const { grid: newGrid, tiles: newTiles } = initializeGame();
    setGrid(newGrid);
    setTiles(newTiles);
    setScore(0);
    setWon(false);
    setOver(false);
    setIsAIRunning(false);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Update best score
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem(STORAGE_KEY, score.toString());
    }
  }, [score, bestScore]);

  // Handle move
  const handleMove = useCallback(
    (direction: Direction) => {
      if (won || over) return;

      const result = move(grid, direction);
      if (!result.moved) return;

      // Add random tile after move
      const { grid: newGrid, tile: newTile } = addRandomTile(result.grid);
      const newTiles = newTile ? [...result.tiles, newTile] : result.tiles;

      setGrid(newGrid);
      setTiles(newTiles);
      setScore((prev) => prev + result.score);

      // Check win
      if (checkWin(newTiles)) {
        setWon(true);
        setIsAIRunning(false);
      }
      // Check game over
      else if (!canMove(newGrid)) {
        setOver(true);
        setIsAIRunning(false);
      }
    },
    [grid, won, over]
  );

  // Keyboard controls
  useEffect(() => {
    if (mode !== 'human') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      };

      const direction = keyMap[e.key];
      if (direction) {
        e.preventDefault();
        handleMove(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, handleMove]);

  // AI mode with Web Worker
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize worker
    workerRef.current = new Worker(new URL('./ai/aiWorker.ts', import.meta.url), {
      type: 'module',
    });

    workerRef.current.onmessage = (e) => {
      const { move: bestMove } = e.data;
      if (bestMove) {
        handleMove(bestMove);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [handleMove]);

  // Trigger AI
  useEffect(() => {
    if (mode === 'ai' && isAIRunning && !won && !over) {
      // Send current grid to worker
      // Small delay to allow UI to render (animation)
      const timer = setTimeout(() => {
        workerRef.current?.postMessage({ grid });
      }, aiSpeed); // Dynamic speed from slider

      return () => clearTimeout(timer);
    }
  }, [mode, isAIRunning, grid, won, over, aiSpeed]);
  const handleModeChange = (newMode: GameMode) => {
    setMode(newMode);
    setIsAIRunning(false);
    startNewGame();
  };

  const handleToggleAI = () => {
    setIsAIRunning((prev) => !prev);
  };

  const overlayType = won ? 'win' : over ? 'lose' : null;

  return (
    <div className="app">
      <Header
        score={score}
        bestScore={bestScore}
        mode={mode}
        isAIRunning={isAIRunning}
        aiSpeed={aiSpeed}
        onModeChange={handleModeChange}
        onNewGame={startNewGame}
        onToggleAI={handleToggleAI}
        onAiSpeedChange={setAiSpeed}
      />
      <div className="game-wrapper">
        <Board tiles={tiles} />
        <Overlay type={overlayType} onNewGame={startNewGame} />
      </div>
      {mode === 'human' && (
        <p className="instructions">
          Use <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> or <kbd>W</kbd>{' '}
          <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> to move
        </p>
      )}
      {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}
    </div>
  );
}

export default App;
