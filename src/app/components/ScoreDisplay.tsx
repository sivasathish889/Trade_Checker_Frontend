import React from 'react';
import { Progress } from './ui/progress';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { ChecklistItem, ChecklistResult } from '../types';

interface ScoreDisplayProps {
  score: number;
  checkedCount: number;
  totalCount: number;
  checklistItems: ChecklistItem[];
  checklistResults: ChecklistResult[];
}

export function ScoreDisplay({ score, checkedCount, totalCount, checklistItems, checklistResults }: ScoreDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getIcon = () => {
    if (score >= 80) return <TrendingUp className="w-8 h-8" />;
    if (score >= 50) return <Minus className="w-8 h-8" />;
    return <TrendingDown className="w-8 h-8" />;
  };

  const getMessage = () => {
    if (score >= 80) return 'Excellent Trade Setup';
    if (score >= 50) return 'Acceptable Setup';
    return 'High Risk Setup';
  };

  // Get unfilled mandatory items
  const unfilledMandatory = checklistItems.filter(item => {
    if (!item.isMandatory) return false;
    const result = checklistResults.find(r => r.itemId === item.id);
    return !result?.checked;
  });

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Trade Quality Score</h3>
      
      <div className="flex items-center gap-6 mb-4">
        <div className={`${getScoreColor(score)}`}>
          {getIcon()}
        </div>
        
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-5xl font-bold ${getScoreColor(score)}`}>
              {score.toFixed(0)}%
            </span>
          </div>
          <p className={`text-sm font-medium ${getScoreColor(score)}`}>
            {getMessage()}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`absolute h-full ${getProgressColor(score)} transition-all duration-500 rounded-full`}
            style={{ width: `${score}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>{checkedCount} of {totalCount} items completed</span>
          <span>{totalCount - checkedCount} remaining</span>
        </div>
      </div>

      {/* Unfilled Mandatory Items */}
      {unfilledMandatory.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-start gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-400 mb-2">
                Mandatory Items Not Completed ({unfilledMandatory.length})
              </h4>
              <ul className="space-y-1">
                {unfilledMandatory.map(item => (
                  <li key={item.id} className="text-xs text-red-400/80 flex items-start gap-2">
                    <span className="text-red-500 flex-shrink-0">•</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex gap-4 text-center">
          <div className="flex-1">
            <div className="text-2xl font-bold text-emerald-400">80%+</div>
            <div className="text-xs text-gray-500">Target</div>
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-amber-400">50-79%</div>
            <div className="text-xs text-gray-500">Caution</div>
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-red-400">&lt;50%</div>
            <div className="text-xs text-gray-500">Avoid</div>
          </div>
        </div>
      </div>
    </div>
  );
}