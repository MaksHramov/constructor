import React, { useState, useEffect, useRef } from 'react';
import type { IElement } from '../shared/type';
import styles from '../../Shape/Shape.module.css';

interface ShapeModalProps {
  isOpen: boolean;
  element: IElement | null;
  onClose: () => void;
  onSave: (updatedElement: Partial<IElement>) => void;
}

export const ShapeModal: React.FC<ShapeModalProps> = ({ 
  isOpen, 
  element, 
  onClose, 
  onSave 
}) => {
  const [localValues, setLocalValues] = useState({
    width: 0,
    height: 0,
    text: '',
    shapeText: '',
    fill: '#ffffff',
    rotation: 0,
    fontSize: 16,
  });

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && element) {
      setLocalValues({
        width: element.width || 0,
        height: element.height || 0,
        text: element.text || '',
        shapeText: element.shapeText || '',
        fill: element.fill || '#ffffff',
        rotation: element.rotation || 0,
        fontSize: element.fontSize || 16,
      });
    }
  }, [isOpen, element]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof localValues) => {
    const value = field === 'fill' 
      ? e.target.value 
      : ['rotation', 'width', 'height', 'fontSize'].includes(field) 
        ? Number(e.target.value) 
        : e.target.value;
    
    setLocalValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave(localValues);
    onClose();
  };

  if (!isOpen || !element) return null;

  return (
    <div
      ref={modalRef}
      className={styles.modalContent}
      style={{
        position: 'absolute',
        top: '100px',
        right: '20px',
        zIndex: 100,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h3>Edit Shape Properties</h3>

      <div className={styles.formGroup}>
        <label>Width:</label>
        <input
          type="number"
          value={localValues.width}
          onChange={(e) => handleInputChange(e, 'width')}
          min="1"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Height:</label>
        <input
          type="number"
          value={localValues.height}
          onChange={(e) => handleInputChange(e, 'height')}
          min="1"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Rotation:</label>
        <input
          type="number"
          value={localValues.rotation}
          onChange={(e) => handleInputChange(e, 'rotation')}
          min="0"
          max="360"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Font Size:</label>
        <input
          type="number"
          value={localValues.fontSize}
          onChange={(e) => handleInputChange(e, 'fontSize')}
          min="8"
          max="72"
        />
      </div>

      {element.type === 'text' && (
        <div className={styles.formGroup}>
          <label>Text:</label>
          <input
            type="text"
            value={localValues.text}
            onChange={(e) => handleInputChange(e, 'text')}
          />
        </div>
      )}

      {element.type !== 'text' && element.type !== 'line' && (
        <div className={styles.formGroup}>
          <label>Shape Text:</label>
          <input
            type="text"
            value={localValues.shapeText}
            onChange={(e) => handleInputChange(e, 'shapeText')}
          />
        </div>
      )}

      <div className={styles.formGroup}>
        <label>Fill Color:</label>
        <input
          type="color"
          value={localValues.fill}
          onChange={(e) => handleInputChange(e, 'fill')}
        />
      </div>

      <div className={styles.modalButtons}>
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};