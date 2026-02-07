import { RotateCcw, Play, Pause, User, Bot } from 'lucide-react';
import type { GameMode } from '../types';
import './Header.css';

interface HeaderProps {
    score: number;
    bestScore: number;
    mode: GameMode;
    isAIRunning: boolean;
    onModeChange: (mode: GameMode) => void;
    onNewGame: () => void;
    onToggleAI: () => void;
}

const Header: React.FC<HeaderProps> = ({
    score,
    bestScore,
    mode,
    isAIRunning,
    onModeChange,
    onNewGame,
    onToggleAI,
}) => {
    return (
        <div className="header">
            <div className="header-top">
                <h1 className="game-title">4096</h1>
                <div className="scores">
                    <div className="score-box">
                        <span className="score-label">SCORE</span>
                        <span className="score-value">{score}</span>
                    </div>
                    <div className="score-box">
                        <span className="score-label">BEST</span>
                        <span className="score-value">{bestScore}</span>
                    </div>
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
        </div>
    );
};

export default Header;
