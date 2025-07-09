import React from 'react';
import { Group, Line, Rect, Circle, RegularPolygon, Text } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { IElement, Tool } from '../shared/type';

interface ShapeRendererProps {
  element: IElement;
  activeTool: Tool;
  isSelected: boolean;
  onClick: (e: KonvaEventObject<MouseEvent>, element: IElement) => void;
  onTextDoubleClick: (e: KonvaEventObject<MouseEvent>, id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onTransformEnd: (id: string, updates: Partial<IElement>) => void;
  onSelect: (id: string) => void;
  innerRef?: React.RefObject<any>;
  onOpenModal?: () => void;
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = ({
  element,
  activeTool,
  isSelected,
  onClick,
  onTextDoubleClick,
  onDragEnd,
  onTransformEnd,
  innerRef,
}) => {
  const getShapeDimensions = () => {
    switch (element.type) {
      case 'rect':
      case 'rhombus':
        return {
          width: element.width || 100,
          height: element.height || 100,
        };
      case 'triangle':
      case 'circle':
        return {
          width: (element.radius || 50) * 2,
          height: (element.radius || 50) * 2,
        };
      default:
        return {
          width: 100,
          height: 100,
        };
    }
  };

  const { width, height } = getShapeDimensions();

  const getTextConfig = () => {
    const baseConfig = {
      width,
      height,
      align: 'center' as const,
      verticalAlign: 'middle' as const,
      fill: 'black',
      fontSize: element.fontSize || 16,
    };

    switch (element.type) {
      case 'rect':
        return {
          ...baseConfig,
          x: width / 2, 
          y: height / 2, 
          offsetX: width / 2,
          offsetY: height / 2,
        };
      case 'circle':
        return {
          ...baseConfig,
          x: 0,
          y: 0,
          offsetX: (element.radius || 50), 
          offsetY: (element.radius || 50),
        };
      case 'triangle':
        return {
          ...baseConfig,
          x: 0,
          y: -height * 0.1,
          offsetX: width / 2,
          offsetY: height / 2,
        };
      case 'rhombus':
        return {
          ...baseConfig,
          x: 0,
          y: 0,
          offsetX: width / 2,
          offsetY: height / 2,
        };
      default:
        return {
          ...baseConfig,
          x: 0,
          y: 0,
          offsetX: width / 2,
          offsetY: height / 2,
        };
    }
  };

  const renderShapeWithText = (shape: React.ReactNode) => {
    const textConfig = getTextConfig();
    
    return (
      <Group
        key={element.id}
        ref={isSelected ? innerRef : null}
        x={element.x}
        y={element.y}
        rotation={element.rotation || 0}
        draggable={activeTool === 'cursor'}
        onClick={(e) => onClick(e, element)}
        onDblClick={(e) => {
          if (element.type !== 'smile' && element.type !== 'line') {
            onTextDoubleClick(e, element.id);
          }
        }}
        onDragEnd={(e) => {
          onDragEnd(element.id, e.target.x(), e.target.y());
        }}
        onTransformEnd={(e) => {
          const node = e.target;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          const updates: Partial<IElement> = {
            x: node.x(),
            y: node.y(),
            fontSize: element.fontSize ? element.fontSize * Math.min(scaleX, scaleY) : undefined,
          };

          if (element.type === 'rect' || element.type === 'rhombus') {
            updates.width = width * scaleX;
            updates.height = height * scaleY;
          } else if (element.type === 'triangle' || element.type === 'circle') {
            updates.radius = (element.radius || 50) * scaleX;
          }

          onTransformEnd(element.id, updates);

          node.scaleX(1);
          node.scaleY(1);
        }}
      >
        {shape}

        {element.shapeText && element.type !== 'smile' && element.type !== 'line' && (
          <Text
            text={element.shapeText}
            {...textConfig}
          />
        )}
      </Group>
    );
  };

  switch (element.type) {
    case 'rect':
      return renderShapeWithText(
        <Rect
          width={width}
          height={height}
          fill={element.fill}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
        />
      );

    case 'triangle':
      return renderShapeWithText(
        <RegularPolygon
          sides={3}
          radius={element.radius || 50}
          fill={element.fill}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
        />
      );

    case 'circle':
      return renderShapeWithText(
        <Circle
          radius={element.radius || 50}
          fill={element.fill}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
        />
      );

    case 'rhombus':
      return renderShapeWithText(
        <Line
          points={[
            0, -height / 2,
            width / 2, 0,
            0, height / 2,
            -width / 2, 0,
          ]}
          closed
          fill={element.fill}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
        />
      );

    case 'line':
      return (
        <Line
          key={element.id}
          points={element.points}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
          lineCap="round"
          lineJoin="round"
          tension={0.5}
          globalCompositeOperation="source-over"
        />
      );

    case 'smile':
      return (
        <Group
          key={element.id}
          x={element.x}
          y={element.y}
          rotation={element.rotation || 0}
          draggable={activeTool === 'cursor'}
          onClick={(e) => onClick(e, element)}
          onDragEnd={(e) => {
            onDragEnd(element.id, e.target.x(), e.target.y());
          }}
          onTransformEnd={(e) => {
            const node = e.target;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            onTransformEnd(element.id, {
              x: node.x(),
              y: node.y(),
              width: (element.width || 50) * scaleX,
              height: (element.height || 50) * scaleY,
            });

            node.scaleX(1);
            node.scaleY(1);
          }}
          ref={isSelected ? innerRef : null}
        >
          <Circle
            radius={25}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
          <Circle radius={5} x={-10} y={-10} fill="black" />
          <Circle radius={5} x={10} y={-10} fill="black" />
          <Line
            points={[-15, 10, 15, 10]}
            stroke="black"
            strokeWidth={2}
            lineCap="round"
          />
        </Group>
      );

    default:
      return null;
  }
};
