import styles from './Figures.module.css';
import square from '../../assets/square.svg';
import triangle from '../../assets/trungle.svg';
import circle from '../../assets/circle.svg';
import rhombus from '../../assets/rhombus.svg';
import { useState } from 'react';

interface FiguresProps {
  onSelectFigure: (figure: 'square' | 'triangle' | 'circle' | 'rhombus') => void;
}

function Figures({ onSelectFigure }: FiguresProps) {
    type TFigures = 'square' | 'triangle' | 'circle' | 'rhombus';
    const [figure, setFigure] = useState<TFigures | null>(null);

    const buttons = [
        { type: 'square', icon: square },
        { type: 'triangle', icon: triangle },
        { type: 'circle', icon: circle },
        { type: 'rhombus', icon: rhombus }
    ] as const;

    
    const handleClick = (type: TFigures) => {
            setFigure(type);
            onSelectFigure(type);
    };

    return ( 
        <div className={styles['figures']}>
            {buttons.map(btn => (
                <button
                    key={btn.type}
                    className={`${styles['figures-element']} ${figure === btn.type ? styles.active : ''}`}
                    onClick={() => handleClick(btn.type)}
                >
                    <img src={btn.icon} alt={btn.type} />
                </button>
            ))}
        </div>
    );
}

export default Figures;