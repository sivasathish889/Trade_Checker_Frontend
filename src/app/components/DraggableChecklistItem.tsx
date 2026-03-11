import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Checkbox } from './ui/checkbox';
import { GripVertical, Trash2, AlertCircle } from 'lucide-react';
import { ChecklistItem } from '../types';

interface DraggableChecklistItemProps {
  item: ChecklistItem;
  index: number;
  checked: boolean;
  onCheck: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  isEditing?: boolean;
}

const ItemType = 'CHECKLIST_ITEM';

export function DraggableChecklistItem({
  item,
  index,
  checked,
  onCheck,
  onDelete,
  onMove,
  isEditing = false,
}: DraggableChecklistItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: true,
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  preview(drop(ref));

  const categoryColors = {
    entry: 'text-blue-400',
    confirmation: 'text-purple-400',
    risk: 'text-red-400',
    psychology: 'text-amber-400',
  };

  return (
    <div
      ref={ref}
      className={`group flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700 transition-all ${
        isDragging ? 'opacity-50' : ''
      } ${checked ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}
    >
      <div ref={drag as any} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-gray-500" />
      </div>

      <Checkbox
        id={item.id}
        checked={checked}
        onCheckedChange={(value) => onCheck(item.id, value as boolean)}
        className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
      />

      <label
        htmlFor={item.id}
        className={`flex-1 text-sm cursor-pointer ${
          checked ? 'text-gray-400 line-through' : 'text-gray-200'
        }`}
      >
        {item.text}
      </label>

      <div className="flex items-center gap-2">
        {item.isMandatory && (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 border border-red-500/30">
            <AlertCircle className="w-3 h-3 text-red-400" />
            <span className="text-xs text-red-400 font-medium">Required</span>
          </div>
        )}
        
        <span className={`text-xs font-medium ${categoryColors[item.category]}`}>
          {item.category.toUpperCase()}
        </span>

        {isEditing && (
          <button
            onClick={() => onDelete(item.id)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded transition-opacity"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
}
