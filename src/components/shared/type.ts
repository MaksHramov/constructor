export type Tool = 'cursor' | 'figures' | 'pencil' | 'text' | 'smiles';
export type FigureType = 'square' | 'triangle' | 'circle' | 'rhombus';
export type ElementType = 'rect' | 'text' | 'smile' | 'line' | 'triangle' | 'circle' | 'rhombus';

export interface IElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  sides?: number;
  text?: string;
  shapeText?: string;
  points?: number[];
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
  fontSize?: number;
}

export interface Tbutton {
  id: Tool;
  icon: string;
  alt: string;
}
