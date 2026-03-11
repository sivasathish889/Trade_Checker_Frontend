import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trade } from '../types';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Search, TrendingUp, TrendingDown, Calendar, Trash2, ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

export function TradeHistory() {
  const { trades, deleteTrade } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPair, setFilterPair] = useState('all');
  const [filterScore, setFilterScore] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  // Get unique pairs
  const uniquePairs = Array.from(new Set(trades.map(t => t.pair))).filter(Boolean);

  // Filter and sort trades
  let filteredTrades = trades.filter(trade => {
    const matchesSearch = 
      trade.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.entryReason.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPair = filterPair === 'all' || trade.pair === filterPair;
    
    const matchesScore = 
      filterScore === 'all' ||
      (filterScore === 'high' && trade.score >= 80) ||
      (filterScore === 'medium' && trade.score >= 50 && trade.score < 80) ||
      (filterScore === 'low' && trade.score < 50);

    return matchesSearch && matchesPair && matchesScore;
  });

  // Sort trades
  filteredTrades = [...filteredTrades].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date-asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'score-desc':
        return b.score - a.score;
      case 'score-asc':
        return a.score - b.score;
      default:
        return 0;
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Trade History</h1>
        <p className="text-gray-400">Review your past trades and performance</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trades..."
            className="pl-10 bg-gray-800 border-gray-700"
          />
        </div>

        <Select value={filterPair} onValueChange={setFilterPair}>
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="All Pairs" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">All Pairs</SelectItem>
            {uniquePairs.map(pair => (
              <SelectItem key={pair} value={pair}>{pair}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterScore} onValueChange={setFilterScore}>
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="All Scores" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">All Scores</SelectItem>
            <SelectItem value="high">High (&gt;80%)</SelectItem>
            <SelectItem value="medium">Medium (50-79%)</SelectItem>
            <SelectItem value="low">Low (&lt;50%)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="score-desc">Highest Score</SelectItem>
            <SelectItem value="score-asc">Lowest Score</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Trade Cards Grid */}
      {filteredTrades.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No trades found</h3>
          <p className="text-gray-500">
            {searchQuery || filterPair !== 'all' || filterScore !== 'all'
              ? 'Try adjusting your filters'
              : 'Start by creating your first trade'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrades.map(trade => (
            <div
              key={trade.id}
              onClick={() => setSelectedTrade(trade)}
              className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-all group"
            >
              {trade.screenshot ? (
                <div className="relative h-48 bg-gray-900 overflow-hidden">
                  <img
                    src={trade.screenshot}
                    alt="Trade chart"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                </div>
              ) : (
                <div className="h-48 bg-gray-900 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-700" />
                </div>
              )}

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-lg">{trade.pair}</span>
                    {trade.direction === 'buy' ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full border text-sm font-bold ${getScoreColor(trade.score)}`}>
                    {trade.score.toFixed(0)}%
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{format(new Date(trade.date), 'MMM dd, yyyy')}</span>
                  <span>•</span>
                  <span>{trade.timeframe}</span>
                  {trade.session && (
                    <>
                      <span>•</span>
                      <span>{trade.session}</span>
                    </>
                  )}
                  {trade.risk > 0 && (
                    <>
                      <span>•</span>
                      <span>{trade.risk}% risk</span>
                    </>
                  )}
                </div>

                {trade.entryReason && (
                  <p className="text-sm text-gray-400 line-clamp-2">{trade.entryReason}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trade Detail Modal */}
      <Dialog open={!!selectedTrade} onOpenChange={() => setSelectedTrade(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
          {selectedTrade && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-white">{selectedTrade.pair}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedTrade.direction === 'buy'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {selectedTrade.direction.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full border text-sm font-bold ${getScoreColor(selectedTrade.score)}`}>
                      {selectedTrade.score.toFixed(0)}%
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTrade(selectedTrade.id);
                      setSelectedTrade(null);
                    }}
                    className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {selectedTrade.screenshot && (
                  <img
                    src={selectedTrade.screenshot}
                    alt="Trade chart"
                    className="w-full rounded-lg border border-gray-700"
                  />
                )}

                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date</p>
                    <p className="text-white font-medium">{format(new Date(selectedTrade.date), 'PPpp')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Timeframe</p>
                    <p className="text-white font-medium">{selectedTrade.timeframe}</p>
                  </div>
                  {selectedTrade.session && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Session</p>
                      <p className="text-white font-medium">{selectedTrade.session}</p>
                    </div>
                  )}
                  {selectedTrade.risk > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Risk</p>
                      <p className="text-white font-medium">{selectedTrade.risk}%</p>
                    </div>
                  )}
                  {selectedTrade.lotSize > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Lot Size</p>
                      <p className="text-white font-medium">{selectedTrade.lotSize}</p>
                    </div>
                  )}
                </div>

                {selectedTrade.entryReason && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Entry Reason</h4>
                    <p className="text-gray-200">{selectedTrade.entryReason}</p>
                  </div>
                )}

                {selectedTrade.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Notes</h4>
                    <p className="text-gray-200">{selectedTrade.notes}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Checklist Completion</h4>
                  <div className="space-y-2">
                    {selectedTrade.checklistResults.map(result => {
                      const item = JSON.parse(localStorage.getItem('checklistItems') || '[]')
                        .find((i: any) => i.id === result.itemId);
                      if (!item) return null;
                      
                      return (
                        <div
                          key={result.itemId}
                          className={`flex items-center gap-3 p-2 rounded ${
                            result.checked ? 'bg-emerald-500/10' : 'bg-gray-800'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center ${
                            result.checked ? 'bg-emerald-500' : 'bg-gray-700'
                          }`}>
                            {result.checked && <span className="text-white text-xs">✓</span>}
                          </div>
                          <span className={`text-sm ${result.checked ? 'text-gray-300' : 'text-gray-500'}`}>
                            {item.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}