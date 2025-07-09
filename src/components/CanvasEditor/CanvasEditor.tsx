import { useRef, useState, useEffect, type SetStateAction } from 'react';
import { Stage, Layer, Group, Transformer, Text } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { Toolbar } from './Toolbar';
import { ShapeModal } from './ShapeModal';
import { ShapeRenderer } from './ShapeRenderer'
import { GridLayer } from './GridLayer';
import { TOOLBAR_BUTTONS, MIN_SCALE, MAX_SCALE } from '../shared/constants';
import type { IElement, Tool, FigureType, Tbutton } from '../shared/type';
import Figures from '../Figures/Figures';
import type Konva from 'konva';

function CanvasEditor() {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [elements, setElements] = useState<IElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>('cursor');
  const [selectedFigure, setSelectedFigure] = useState<FigureType>('square');
  const [showFigures, setShowFigures] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<IElement | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [textValue, setTextValue] = useState('');

  const trRef = useRef<any>(null);
  const selectedRef = useRef<any>(null);
  const stageRef = useRef<any>(null);
  const textRef = useRef<any>(null);

  useEffect(() => {
    if (selectedId !== null && trRef.current && selectedRef.current) {
      trRef.current.nodes([selectedRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId]);

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const oldScale = scale;
    const pointer = stage?.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.05;
    const direction = e.evt.deltaY > 0 ? 1 : -1;
    let newScale = direction > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setScale(newScale);
    setPosition(newPos);
  };

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      const stage = e.target.getStage();
      const pointer = stage?.getPointerPosition();
      if (!pointer) return;

      const x = (pointer.x - position.x) / scale;
      const y = (pointer.y - position.y) / scale;

      switch (activeTool) {
        case 'figures':
          const commonProps = {
            id: Math.random().toString(36).substr(2, 9),
            x,
            y,
            fill: 'skyblue',
            stroke: 'black',
            strokeWidth: 1,
            rotation: 0,
            fontSize: 16,
          };

          let newElement: IElement;

          switch (selectedFigure) {
            case 'square':
              newElement = { 
                ...commonProps, 
                type: 'rect', 
                width: 100, 
                height: 100,
                text: undefined,
                points: undefined,
                radius: undefined,
                sides: undefined,
              };
              break;
            case 'triangle':
              newElement = { 
                ...commonProps, 
                type: 'triangle', 
                sides: 3, 
                radius: 50,
                width: undefined,
                height: undefined,
                text: undefined,
                points: undefined,
              };
              break;
            case 'circle':
              newElement = { 
                ...commonProps, 
                type: 'circle', 
                radius: 50,
                width: undefined,
                height: undefined,
                text: undefined,
                points: undefined,
                sides: undefined,
              };
              break;
            case 'rhombus':
              newElement = { 
                ...commonProps, 
                type: 'rhombus', 
                width: 80, 
                height: 80,
                text: undefined,
                points: undefined,
                radius: undefined,
                sides: undefined,
              };
              break;
            default:
              return;
          }

          setElements((prev) => [...prev, newElement]);
          setSelectedId(newElement.id);
          setShowFigures(false);
          break;

        case 'smiles':
          const newSmile: IElement = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'smile',
            x,
            y,
            width: 50,
            height: 50,
            fill: 'yellow',
            stroke: 'black',
            strokeWidth: 2,
            rotation: 0,
            fontSize: 16,
            text: undefined,
            points: undefined,
            radius: undefined,
            sides: undefined,
          };
          setElements((prev) => [...prev, newSmile]);
          setSelectedId(newSmile.id);
          break;

        case 'text':
          const newText: IElement = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'text',
            x,
            y,
            text: 'Кликните для редактирования',
            fill: 'black',
            fontSize: 16,
            rotation: 0,
            width: undefined,
            height: undefined,
            stroke: undefined,
            strokeWidth: undefined,
            points: undefined,
            radius: undefined,
            sides: undefined,
          };
          setElements((prev) => [...prev, newText]);
          setSelectedId(newText.id);
          setEditingTextId(newText.id);
          setTextValue(newText.text || '');
          break;

        default:
          setSelectedId(null);
          setEditingTextId(null);
          break;
      }
    }
  };

  const handleShapeClick = (e: KonvaEventObject<MouseEvent>, element: IElement) => {
    if (activeTool !== 'cursor') return;
    e.cancelBubble = true;
    
    setSelectedId(element.id);
    
    if (element.type === 'text') {
      setEditingTextId(element.id);
      setTextValue(element.text || '');
    } else {
      setEditingElement(element);
      setModalOpen(true);
    }
  };

  const handleTextDoubleClick = (_e: KonvaEventObject<MouseEvent>, id: string) => {
    if (activeTool !== 'cursor') return;
    
    const textElement = elements.find(el => el.id === id);
    if (!textElement) return;

    setEditingTextId(id);
    setTextValue(textElement.text || '');
    setSelectedId(id);
  };

  const handleTextChange = (e: any) => {
    const newText = e.currentTarget.value;
    setTextValue(newText);
    
    setElements(prev =>
      prev.map(el =>
        el.id === editingTextId ? { ...el, text: newText } : el
      )
    );
  };

  const handleTextBlur = () => {
    setEditingTextId(null);
    setTextValue('');
  };

  const handlePencilStart = (e: KonvaEventObject<MouseEvent>) => {
    if (activeTool !== 'pencil') return;

    const stage = e.target.getStage();
    const pointer = stage?.getPointerPosition();
    if (!pointer) return;

    const x = (pointer.x - position.x) / scale;
    const y = (pointer.y - position.y) / scale;

    const newLine: IElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'line',
      points: [x, y],
      stroke: 'black',
      strokeWidth: 3,
      x: 0,
      y: 0,
      fill: undefined,
      rotation: 0,
      fontSize: 16,
      width: undefined,
      height: undefined,
      radius: undefined,
      sides: undefined,
      text: undefined,
    };

    setElements((prev) => [...prev, newLine]);
    setIsDrawing(true);
  };

  const handlePencilMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || activeTool !== 'pencil') return;

    const stage = e.target.getStage();
    const pointer = stage?.getPointerPosition();
    if (!pointer) return;

    const x = (pointer.x - position.x) / scale;
    const y = (pointer.y - position.y) / scale;

    setElements((prev) => {
      const lastLine = prev[prev.length - 1];
      if (lastLine.type === 'line') {
        const newPoints = lastLine.points ? [...lastLine.points, x, y] : [x, y];
        return [
          ...prev.slice(0, -1),
          {
            ...lastLine,
            points: newPoints,
          },
        ];
      }
      return prev;
    });
  };

  const handlePencilEnd = () => {
    setIsDrawing(false);
  };

  const handleSaveChanges = (updatedElement: Partial<IElement>) => {
    if (!editingElement) return;

    setElements(prev => 
      prev.map(el => 
        el.id === editingElement.id ? { ...el, ...updatedElement } : el
      )
    );
    setModalOpen(false);
  };

  const renderTextElement = (element: IElement) => {    
    return (
      <Text
        key={element.id}
        ref={element.id === editingTextId ? textRef : null}
        x={element.x}
        y={element.y}
        text={element.text}
        fill={element.fill}
        fontSize={element.fontSize}
        rotation={element.rotation}
        draggable={activeTool === 'cursor'}
        onClick={(e) => handleShapeClick(e, element)}
        onDblClick={(e) => handleTextDoubleClick(e, element.id)}
        onTransformEnd={(e) => {
          const node = e.target;
          const textNode = node as Konva.Text;
          setElements(prev =>
            prev.map(el =>
              el.id === element.id
                ? {
                    ...el,
                    x: textNode.x(),
                    y: textNode.y(),
                    rotation: textNode.rotation(),
                    fontSize: Math.max(5, textNode.fontSize() * textNode.scaleX()),
                    width: textNode.width() * textNode.scaleX(),
                    height: textNode.height() * textNode.scaleY(),
                  }
                : el
            )
          );
          textNode.scaleX(1);
          textNode.scaleY(1);
        }}
        onDragEnd={(e) => {
          const node = e.target;
          setElements(prev =>
            prev.map(el =>
              el.id === element.id
                ? {
                    ...el,
                    x: node.x(),
                    y: node.y(),
                  }
                : el
            )
          );
        }}
      />
    );
  };

  return (
    <>
      <Toolbar
        activeTool={activeTool}
        buttons={TOOLBAR_BUTTONS as Tbutton[]}
        onToolSelect={setActiveTool}
        showFigures={showFigures}
        setShowFigures={setShowFigures}
      />

      {showFigures && (
        <Figures 
          onSelectFigure={(figure) => {
            setSelectedFigure(figure);
            setShowFigures(false);
          }} 
        />
      )}

      <ShapeModal
        isOpen={modalOpen}
        element={editingElement}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveChanges}
      />

      {editingTextId && (
        <div style={{
          position: 'absolute',
          top: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
        }}>
          <input
            type="text"
            value={textValue}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            style={{
              padding: '8px',
              fontSize: '16px',
              border: '2px solid #3498db',
              borderRadius: '4px',
              outline: 'none',
            }}
            autoFocus
          />
        </div>
      )}

      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onWheel={handleWheel}
        onClick={activeTool !== 'pencil' ? handleStageClick : undefined}
        onMouseDown={handlePencilStart}
        onMouseMove={handlePencilMove}
        onMouseUp={handlePencilEnd}
      >
        <GridLayer width={window.innerWidth} height={window.innerHeight} />

        <Layer>
          <Group scale={{ x: scale, y: scale }} x={position.x} y={position.y}>
            {elements.map((element) => {
              if (element.type === 'text') {
                return renderTextElement(element);
              }
              
              return (
                <ShapeRenderer
                  key={element.id}
                  element={element}
                  activeTool={activeTool}
                  isSelected={selectedId === element.id}
                  onClick={handleShapeClick}
                  onTextDoubleClick={handleTextDoubleClick}
                  onDragEnd={(id, x, y) => {
                    setElements(prev => prev.map(el => (el.id === id ? { ...el, x, y } : el))
                    );
                  } }
                  onTransformEnd={(id, updates) => {
                    setElements(prev => prev.map(el => (el.id === id ? { ...el, ...updates } : el))
                    );
                  } }
                  onSelect={(id: SetStateAction<string | null>) => setSelectedId(id)}
                  innerRef={selectedId === element.id ? selectedRef : undefined} onOpenModal={function (): void {
                    throw new Error('Function not implemented.');
                  } }                />
              );
            })}
          </Group>
          
          {selectedId && (
            <Transformer
              ref={trRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
    </>
  );
};

export default CanvasEditor;