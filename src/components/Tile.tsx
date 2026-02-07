import { motion } from 'framer-motion';
import type { Tile as TileType } from '../types';

interface TileProps {
    tile: TileType;
}

// Color map based on tile value - shades of green
const getTileStyle = (value: number): { background: string; color: string } => {
    const styles: Record<number, { background: string; color: string }> = {
        2: { background: '#e8f5e9', color: '#2e7d32' },
        4: { background: '#c8e6c9', color: '#2e7d32' },
        8: { background: '#a5d6a7', color: '#1b5e20' },
        16: { background: '#81c784', color: '#1b5e20' },
        32: { background: '#66bb6a', color: '#ffffff' },
        64: { background: '#4caf50', color: '#ffffff' },
        128: { background: '#43a047', color: '#ffffff' },
        256: { background: '#388e3c', color: '#ffffff' },
        512: { background: '#2e7d32', color: '#ffffff' },
        1024: { background: '#1b5e20', color: '#ffffff' },
        2048: { background: '#145214', color: '#ffffff' },
        4096: { background: '#0d3d0d', color: '#ffd700' },
    };
    return styles[value] || { background: '#0d3d0d', color: '#ffd700' };
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
