import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router';
import { DraggableChecklistItem } from '../components/DraggableChecklistItem';
import { ScoreDisplay } from '../components/ScoreDisplay';
import { ImageUpload } from '../components/ImageUpload';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useApp } from '../context/AppContext';
import { ChecklistResult, TradeDirection } from '../types';
import { Save, Edit3, Check, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const SUGGESTED_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD',
  'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'XAU/USD', 'BTC/USD'
];

const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];

export function NewTrade() {
  const navigate = useNavigate();
  const { checklistItems, setChecklistItems, addTrade, settings } = useApp();
  const [isEditingChecklist, setIsEditingChecklist] = useState(false);
  
  // Checklist state
  const [checklistResults, setChecklistResults] = useState<ChecklistResult[]>(
    checklistItems.map(item => ({ itemId: item.id, checked: false }))
  );

  // Trade form state
  const [pair, setPair] = useState('');
  const [showPairSuggestions, setShowPairSuggestions] = useState(false);
  const [direction, setDirection] = useState<TradeDirection>('buy');
  const [timeframe, setTimeframe] = useState('');
  const [session, setSession] = useState('');
  const [risk, setRisk] = useState('');
  const [lotSize, setLotSize] = useState('');
  const [entryReason, setEntryReason] = useState('');
  const [notes, setNotes] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const handleCheckItem = (id: string, checked: boolean) => {
    setChecklistResults(prev =>
      prev.map(item => (item.itemId === id ? { ...item, checked } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    setChecklistItems(checklistItems.filter(item => item.id !== id));
    setChecklistResults(prev => prev.filter(item => item.itemId !== id));
  };

  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    const newItems = [...checklistItems];
    const [draggedItem] = newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, draggedItem);
    const reorderedItems = newItems.map((item, index) => ({ ...item, order: index }));
    setChecklistItems(reorderedItems);
  }, [checklistItems, setChecklistItems]);

  // Calculate score
  const checkedCount = checklistResults.filter(r => r.checked).length;
  const totalCount = checklistItems.length;
  const score = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  // Check mandatory items
  const mandatoryItems = checklistItems.filter(item => item.isMandatory);
  const mandatoryChecked = mandatoryItems.every(item => 
    checklistResults.find(r => r.itemId === item.id)?.checked
  );
  const canSave = mandatoryChecked && pair && timeframe;

  // Filter pair suggestions
  const filteredSuggestions = SUGGESTED_PAIRS.filter(p => 
    p.toLowerCase().includes(pair.toLowerCase())
  );

  const handleSaveTrade = () => {
    if (!canSave) {
      if (!mandatoryChecked) {
        toast.error('Please complete all mandatory checklist items before saving');
      } else {
        toast.error('Please fill in currency pair and timeframe');
      }
      return;
    }

    const newTrade = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      pair: pair.toUpperCase(),
      direction,
      timeframe,
      session: session || undefined,
      risk: parseFloat(risk) || 0,
      lotSize: parseFloat(lotSize) || 0,
      entryReason,
      notes,
      screenshot: screenshot || undefined,
      checklistResults,
      score,
    };

    addTrade(newTrade);
    toast.success('Trade saved successfully!');
    
    // Reset form
    setChecklistResults(checklistItems.map(item => ({ itemId: item.id, checked: false })));
    setPair('');
    setTimeframe('');
    setSession('');
    setRisk('');
    setLotSize('');
    setEntryReason('');
    setNotes('');
    setScreenshot(null);
    
    navigate('/history');
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">New Trade Setup</h1>
          <p className="text-gray-400">Complete your checklist and log your trade details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Checklist */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Trade Checklist</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingChecklist(!isEditingChecklist)}
              >
                {isEditingChecklist ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Done
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              {checklistItems.map((item, index) => (
                <DraggableChecklistItem
                  key={item.id}
                  item={item}
                  index={index}
                  checked={checklistResults.find(r => r.itemId === item.id)?.checked || false}
                  onCheck={handleCheckItem}
                  onDelete={handleDeleteItem}
                  onMove={moveItem}
                  isEditing={isEditingChecklist}
                />
              ))}
            </div>

            {!mandatoryChecked && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-400">Mandatory Items Required</p>
                  <p className="text-xs text-red-400/80 mt-1">
                    You must complete all required checklist items before saving this trade
                  </p>
                </div>
              </div>
            )}

            <ScoreDisplay 
              score={score} 
              checkedCount={checkedCount} 
              totalCount={totalCount}
              checklistItems={checklistItems}
              checklistResults={checklistResults}
            />
          </div>

          {/* Right Column - Trade Form */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Trade Details</h2>

            {/* Direction Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setDirection('buy')}
                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                  direction === 'buy'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                BUY
              </button>
              <button
                onClick={() => setDirection('sell')}
                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                  direction === 'sell'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                SELL
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 relative">
                <Label htmlFor="pair" className="text-gray-300">Currency Pair *</Label>
                <Input
                  id="pair"
                  value={pair}
                  onChange={(e) => {
                    setPair(e.target.value);
                    setShowPairSuggestions(true);
                  }}
                  onFocus={() => setShowPairSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowPairSuggestions(false), 200)}
                  placeholder="e.g. EUR/USD, XAU/USD"
                  className="bg-gray-800 border-gray-700"
                />
                {showPairSuggestions && filteredSuggestions.length > 0 && pair && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredSuggestions.map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setPair(suggestion);
                          setShowPairSuggestions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeframe" className="text-gray-300">Timeframe *</Label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger id="timeframe" className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {TIMEFRAMES.map(tf => (
                      <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="session" className="text-gray-300">Trading Session</Label>
                <Select value={session} onValueChange={setSession}>
                  <SelectTrigger id="session" className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select session (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {settings.customSessions.map(sess => (
                      <SelectItem key={sess} value={sess}>{sess}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk" className="text-gray-300">Risk %</Label>
                <Input
                  id="risk"
                  type="number"
                  step="0.1"
                  value={risk}
                  onChange={(e) => setRisk(e.target.value)}
                  placeholder="e.g. 1.0"
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lotSize" className="text-gray-300">Lot Size</Label>
                <Input
                  id="lotSize"
                  type="number"
                  step="0.01"
                  value={lotSize}
                  onChange={(e) => setLotSize(e.target.value)}
                  placeholder="e.g. 0.10"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entryReason" className="text-gray-300">Entry Reason</Label>
              <Input
                id="entryReason"
                value={entryReason}
                onChange={(e) => setEntryReason(e.target.value)}
                placeholder="Why did you take this trade?"
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-300">Trade Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional observations, market conditions, emotions, etc."
                rows={4}
                className="bg-gray-800 border-gray-700 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Chart Screenshot</Label>
              <ImageUpload image={screenshot} onImageChange={setScreenshot} />
            </div>

            <Button
              onClick={handleSaveTrade}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 text-lg"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Trade to Journal
            </Button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}