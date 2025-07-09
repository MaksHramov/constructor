import React from 'react';
import type { Tbutton, Tool } from '../shared/type';
import styles from '../../Shape/Shape.module.css';

interface ToolbarProps {
  activeTool: Tool;
  buttons: Tbutton[];
  onToolSelect: (tool: Tool) => void;
  showFigures: boolean;
  setShowFigures: (show: boolean) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  buttons,
  onToolSelect,
  showFigures,
  setShowFigures,
}) => {
  return (
    <div className={styles['left-panel']}>
      {buttons.map((el) => (
        <button
          key={el.id}
          onClick={() => {
            onToolSelect(el.id);
            if (el.id === 'figures') {
              setShowFigures(!showFigures);
            } else {
              setShowFigures(false);
            }
          }}
        >
          <img
            className={activeTool === el.id ? styles['active'] : ''}
            src={el.icon}
            alt={el.alt}
          />
        </button>
      ))}
    </div>
  );
};