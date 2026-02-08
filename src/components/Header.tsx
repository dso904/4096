import { RotateCcw, Play, Pause, User, Bot } from 'lucide-react';
import type { GameMode } from '../types';
import './Header.css';

interface HeaderProps {
    score: number;
    bestScore: number;
    mode: GameMode;
    isAIRunning: boolean;
    aiSpeed: number;
    onModeChange: (mode: GameMode) => void;
    onNewGame: () => void;
    onToggleAI: () => void;
    onAiSpeedChange: (speed: number) => void;
}

const Header: React.FC<HeaderProps> = ({
    score,
    bestScore,
    mode,
    isAIRunning,
    aiSpeed,
    onModeChange,
    onNewGame,
    onToggleAI,
    onAiSpeedChange,
}) => {
    return (
        <div className="header">
            <div className="header-top">
                <div className="title-section">
                    <div className="sparkle">✦</div>
                    <h1 className="game-title">
                        <span className="digit d4">4</span>
                        <span className="digit d0">0</span>
                        <span className="digit d9">9</span>
                        <span className="digit d6">6</span>
                    </h1>
                    <div className="sparkle">✦</div>
                </div>
                <p className="tagline">Join the tiles, get to <strong>4096!</strong></p>
            </div>

            <div className="scores">
                <div className="score-box">
                    <span className="score-label">SCORE</span>
                    <span className="score-value">{score.toLocaleString()}</span>
                </div>
                <div className="score-box">
                    <span className="score-label">BEST</span>
                    <span className="score-value">{bestScore.toLocaleString()}</span>
                </div>
            </div>

            <div className="header-controls">
                <div className="mode-switcher">
                    <button
                        className={`mode-btn ${mode === 'human' ? 'active' : ''}`}
                        onClick={() => onModeChange('human')}
                    >
                        <User size={18} />
                        <span>Human</span>
                    </button>
                    <button
                        className={`mode-btn ${mode === 'ai' ? 'active' : ''}`}
                        onClick={() => onModeChange('ai')}
                    >
                        <Bot size={18} />
                        <span>AI</span>
                    </button>
                </div>

                <div className="action-buttons">
                    {mode === 'ai' && (
                        <button className="action-btn" onClick={onToggleAI}>
                            {isAIRunning ? <Pause size={20} /> : <Play size={20} />}
                        </button>
                    )}
                    <button className="action-btn" onClick={onNewGame}>
                        <RotateCcw size={20} />
                    </button>
                </div>
            </div>

            {mode === 'ai' && (
                <div className="ai-speed-control">
                    <label className="speed-label">
                        Speed: <span className="speed-value">{aiSpeed}ms</span>
                    </label>
                    <input
                        type="range"
                        min="100"
                        max="400"
                        step="50"
                        value={aiSpeed}
                        onChange={(e) => onAiSpeedChange(Number(e.target.value))}
                        className="speed-slider"
                    />
                    <div className="speed-labels">
                        <span>Fast</span>
                        <span>Slow</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Header;
