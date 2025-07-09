import React from 'react';
import { Layer, Line } from 'react-konva';
import { GRID_SIZE } from '../shared/constants';

interface GridLayerProps {
  width: number;
  height: number;
}

export const GridLayer: React.FC<GridLayerProps> = ({ width, height }) => {
  const drawGrid = () => {
    const lines = [];
    for (let i = 0; i < width / GRID_SIZE; i++) {
      const x = i * GRID_SIZE;
      lines.push(
        <Line
          key={`v-${i}`}
          points={[x, 0, x, height]}
          stroke="#acacac"
          strokeWidth={1}
        />
      );
    }

    for (let j = 0; j < height / GRID_SIZE; j++) {
      const y = j * GRID_SIZE;
      lines.push(
        <Line
          key={`h-${j}`}
          points={[0, y, width, y]}
          stroke="#e0e0e0"
          strokeWidth={1}
        />
      );
    }

    return lines;
  };

  return <Layer listening={false}>{drawGrid()}</Layer>;
};