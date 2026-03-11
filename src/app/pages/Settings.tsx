import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChecklistItem, ChecklistCategory } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { Plus, Trash2, GripVertical, Clock } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'sonner';

const ITEM_TYPE = 'SETTINGS_ITEM';

interface DraggableItemProps {
  item: ChecklistItem;
  index: number;
  onUpdate: (id: string, updates: Partial<ChecklistItem>) => void;
  onDelete: (id: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}

function DraggableSettingsItem({ item, index, onUpdate, onDelete, onMove }: DraggableItemProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
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

  return (
    <div
      ref={ref as any}
      className={`bg-gray-800 border border-gray-700 rounded-lg p-4 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div ref={drag as any} className="cursor-grab active:cursor-grabbing pt-2">
          <GripVertical className="w-5 h-5 text-gray-500" />
        </div>

        <div className="flex-1 space-y-3">
          <Input
            value={item.text}
            onChange={(e) => onUpdate(item.id, { text: e.target.value })}
            placeholder="Checklist item text"
            className="bg-gray-900 border-gray-700"
          />

          <div className="flex items-center gap-4">
            <Select
              value={item.category}
              onValueChange={(value) => onUpdate(item.id, { category: value as ChecklistCategory })}
            >
              <SelectTrigger className="bg-gray-900 border-gray-700 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="entry">Entry</SelectItem>
                <SelectItem value="confirmation">Confirmation</SelectItem>
                <SelectItem value="risk">Risk</SelectItem>
                <SelectItem value="psychology">Psychology</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Switch
                id={`mandatory-${item.id}`}
                checked={item.isMandatory}
                onCheckedChange={(checked) => onUpdate(item.id, { isMandatory: checked })}
              />
              <Label htmlFor={`mandatory-${item.id}`} className="text-sm text-gray-400">
                Mandatory
              </Label>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(item.id)}
          className="text-red-400 border-red-500/30 hover:bg-red-500/10 flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function Settings() {
  const { checklistItems, setChecklistItems, settings, updateSettings } = useApp();
  const [items, setItems] = useState(checklistItems);
  const [sessions, setSessions] = useState(settings.customSessions);
  const [newSession, setNewSession] = useState('');

  const handleAddItem = () => {
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: 'New checklist item',
      isMandatory: false,
      category: 'entry',
      order: items.length,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, updates: Partial<ChecklistItem>) => {
    setItems(items.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleMoveItem = (dragIndex: number, hoverIndex: number) => {
    const newItems = [...items];
    const [draggedItem] = newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, draggedItem);
    setItems(newItems.map((item, index) => ({ ...item, order: index })));
  };

  const handleAddSession = () => {
    if (!newSession.trim()) {
      toast.error('Please enter a session name');
      return;
    }
    if (sessions.includes(newSession)) {
      toast.error('Session already exists');
      return;
    }
    setSessions([...sessions, newSession]);
    setNewSession('');
    toast.success('Session added');
  };

  const handleDeleteSession = (sessionToDelete: string) => {
    setSessions(sessions.filter(s => s !== sessionToDelete));
    toast.success('Session deleted');
  };

  const handleSave = () => {
    setChecklistItems(items);
    updateSettings({ customSessions: sessions });
    toast.success('Settings saved successfully!');
  };

  const handleReset = () => {
    setItems(checklistItems);
    setSessions(settings.customSessions);
    toast.info('Changes discarded');
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Customize your checklist and trading preferences</p>
        </div>

        {/* Trading Sessions */}
        <Card className="bg-gray-800 border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Trading Sessions</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Customize the trading sessions available when logging trades
          </p>

          <div className="space-y-3 mb-4">
            {sessions.map((session, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700"
              >
                <span className="text-gray-300">{session}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteSession(session)}
                  className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newSession}
              onChange={(e) => setNewSession(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSession()}
              placeholder="e.g., Frankfurt Session, Pre-Market"
              className="bg-gray-900 border-gray-700"
            />
            <Button onClick={handleAddSession} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </Card>

        {/* Checklist Items */}
        <Card className="bg-gray-800 border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Checklist Items</h2>
            <Button onClick={handleAddItem} className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="space-y-3 mb-6">
            {items.map((item, index) => (
              <DraggableSettingsItem
                key={item.id}
                item={item}
                index={index}
                onUpdate={handleUpdateItem}
                onDelete={handleDeleteItem}
                onMove={handleMoveItem}
              />
            ))}
          </div>

          {items.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-lg">
              <p className="text-gray-400 mb-4">No checklist items</p>
              <Button onClick={handleAddItem} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add First Item
              </Button>
            </div>
          )}
        </Card>

        {/* Save/Discard Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleSave} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
            Save All Changes
          </Button>
          <Button onClick={handleReset} variant="outline" className="flex-1">
            Discard Changes
          </Button>
        </div>

        <Card className="bg-gray-800 border-gray-700 p-6 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">Settings Guide</h2>
          
          <div className="space-y-4 text-sm text-gray-400">
            <div>
              <h3 className="text-white font-medium mb-2">Trading Sessions</h3>
              <p>
                Add custom trading sessions to categorize your trades by market hours. 
                Examples: Asian, London, New York, or overlaps between sessions.
              </p>
            </div>

            <div>
              <h3 className="text-white font-medium mb-2">Categories</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><span className="text-blue-400">Entry</span> - Market structure and entry points</li>
                <li><span className="text-purple-400">Confirmation</span> - Trade confirmation signals</li>
                <li><span className="text-red-400">Risk</span> - Risk management rules</li>
                <li><span className="text-amber-400">Psychology</span> - Mental state and discipline</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-medium mb-2">Mandatory Items</h3>
              <p>
                Items marked as mandatory must be checked before you can save a trade. 
                Use this for your non-negotiable trading rules.
              </p>
            </div>

            <div>
              <h3 className="text-white font-medium mb-2">Drag & Drop</h3>
              <p>
                Click and drag items using the grip icon to reorder them. 
                The order will be reflected in your trade checklist.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DndProvider>
  );
}