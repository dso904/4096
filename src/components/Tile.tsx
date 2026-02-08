import { motion } from 'framer-motion';
import type { Tile as TileType } from '../types';

interface TileProps {
    tile: TileType;
}

// Color map based on tile value - warm gradient with purple victory tile
const getTileStyle = (value: number): { background: string; color: string } => {
    const styles: Record<number, { background: string; color: string }> = {
        2: { background: 'hsl(45, 30%, 85%)', color: '#776e65' },      // Light cream
        4: { background: 'hsl(45, 40%, 78%)', color: '#776e65' },      // Warm beige
        8: { background: 'hsl(30, 80%, 60%)', color: '#f9f6f2' },      // Orange
        16: { background: 'hsl(25, 90%, 55%)', color: '#f9f6f2' },     // Deep orange
        32: { background: 'hsl(15, 95%, 50%)', color: '#f9f6f2' },     // Red-orange
        64: { background: 'hsl(5, 90%, 50%)', color: '#f9f6f2' },      // Red
        128: { background: 'hsl(50, 90%, 50%)', color: '#f9f6f2' },    // Yellow
        256: { background: 'hsl(45, 95%, 50%)', color: '#f9f6f2' },    // Gold
        512: { background: 'hsl(40, 100%, 48%)', color: '#f9f6f2' },   // Amber
        1024: { background: 'hsl(35, 100%, 45%)', color: '#f9f6f2' },  // Deep amber
        2048: { background: 'hsl(30, 100%, 42%)', color: '#f9f6f2' },  // Bronze
        4096: { background: 'hsl(280, 80%, 55%)', color: '#f9f6f2' },  // Purple (victory!)
    };
    return styles[value] || { background: 'hsl(280, 80%, 55%)', color: '#f9f6f2' };
};

const Tile: React.FC<TileProps> = ({ tile }) => {
    const { background, color } = getTileStyle(tile.value);
    const fontSize = tile.value >= 1000 ? '1.5rem' : tile.value >= 100 ? '1.8rem' : '2rem';

    return (
        <motion.div
            layout
            initial={tile.isNew ? { scale: 0 } : tile.mergedFrom ? { scale: 1.1 } : false}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
                position: 'absolute',
                width: 'calc(25% - 6px)',
                height: 'calc(25% - 6px)',
                left: `calc(${tile.position.col * 25}% + ${tile.position.col * 2}px)`,
                top: `calc(${tile.position.row * 25}% + ${tile.position.row * 2}px)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background,
                color,
                fontSize,
                fontWeight: 700,
                borderRadius: '12px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                zIndex: tile.mergedFrom ? 10 : 1,
            }}
        >
            {tile.value}
        </motion.div>
    );
};

export default Tile;
