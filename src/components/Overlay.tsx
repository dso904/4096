import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, XCircle, RotateCcw } from 'lucide-react';
import './Overlay.css';

interface OverlayProps {
    type: 'win' | 'lose' | null;
    onNewGame: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ type, onNewGame }) => {
    if (!type) return null;

    const isWin = type === 'win';

    return (
        <AnimatePresence>
            <motion.div
                className="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="overlay-content"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {isWin ? (
                        <Trophy className="overlay-icon win" size={64} />
                    ) : (
                        <XCircle className="overlay-icon lose" size={64} />
                    )}
                    <h2 className="overlay-title">
                        {isWin ? 'You Win!' : 'Game Over'}
                    </h2>
                    <p className="overlay-message">
                        {isWin
                            ? 'Congratulations! You reached 4096!'
                            : 'No more moves available.'}
                    </p>
                    <button className="overlay-btn" onClick={onNewGame}>
                        <RotateCcw size={18} />
                        <span>New Game</span>
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default Overlay;
