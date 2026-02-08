import { X, Keyboard, Bot, Target, Sparkles } from 'lucide-react';
import './OnboardingModal.css';

interface OnboardingModalProps {
    onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="modal-header">
                    <Sparkles className="modal-icon" size={32} />
                    <h2>Welcome to 4096!</h2>
                </div>

                <div className="modal-content">
                    <section className="modal-section">
                        <div className="section-icon">
                            <Target size={20} />
                        </div>
                        <div className="section-content">
                            <h3>What is 4096?</h3>
                            <p>
                                A sliding puzzle game where you combine tiles with the same number.
                                Merge tiles to create larger numbers and reach the ultimate goal: <strong>4096!</strong>
                            </p>
                        </div>
                    </section>

                    <section className="modal-section">
                        <div className="section-icon">
                            <Keyboard size={20} />
                        </div>
                        <div className="section-content">
                            <h3>How to Play</h3>
                            <p>Use arrow keys or WASD to slide all tiles in one direction. When two tiles with the same number touch, they merge into one!</p>
                            <div className="key-hints">
                                <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd>
                                <span className="or">or</span>
                                <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd>
                            </div>
                        </div>
                    </section>

                    <section className="modal-section">
                        <div className="section-icon">
                            <Bot size={20} />
                        </div>
                        <div className="section-content">
                            <h3>AI Mode</h3>
                            <p>
                                Switch to <strong>AI Mode</strong> to watch our advanced Expectimax algorithm solve the puzzle.
                                Use the speed slider to control how fast the AI plays.
                            </p>
                            <ul className="feature-list">
                                <li>🧠 Bitboard-optimized search</li>
                                <li>⚡ 8+ moves deep analysis</li>
                                <li>🎚️ Adjustable speed (100-400ms)</li>
                            </ul>
                        </div>
                    </section>
                </div>

                <div className="modal-footer">
                    <button className="modal-start-btn" onClick={onClose}>
                        Let's Play!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
