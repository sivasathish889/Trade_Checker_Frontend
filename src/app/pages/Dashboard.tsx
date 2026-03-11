import React from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  BarChart3,
  PlusCircle,
  Award
} from 'lucide-react';

export function Dashboard() {
  const { trades } = useApp();

  // Calculate statistics
  const totalTrades = trades.length;
  const avgScore = totalTrades > 0
    ? trades.reduce((sum, t) => sum + t.score, 0) / totalTrades
    : 0;
  
  const highQualityTrades = trades.filter(t => t.score >= 80).length;
  const winRate = totalTrades > 0 ? (highQualityTrades / totalTrades) * 100 : 0;

  const recentTrades = trades.slice(0, 5);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Track your trading performance and statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{totalTrades}</div>
          <div className="text-sm text-gray-400">Total Trades</div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{avgScore.toFixed(1)}%</div>
          <div className="text-sm text-gray-400">Avg Quality Score</div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{highQualityTrades}</div>
          <div className="text-sm text-gray-400">High Quality (&gt;80%)</div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{winRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-400">Quality Rate</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Trades */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Trades</h2>
            <Link to="/history">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>

          {recentTrades.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 mb-4">No trades yet</p>
              <Link to="/new-trade">
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create First Trade
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTrades.map(trade => (
                <Link
                  key={trade.id}
                  to="/history"
                  className="block p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-emerald-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">{trade.pair}</span>
                      {trade.direction === 'buy' ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <span className={`text-lg font-bold ${getScoreColor(trade.score)}`}>
                      {trade.score.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{new Date(trade.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{trade.timeframe}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
          
          <div className="space-y-4">
            <Link to="/new-trade">
              <button className="w-full p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg text-left hover:from-emerald-600 hover:to-teal-700 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <PlusCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">New Trade Setup</div>
                    <div className="text-sm text-white/80">Start a new trade checklist</div>
                  </div>
                </div>
              </button>
            </Link>

            <Link to="/history">
              <button className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-left hover:border-gray-600 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">View Trade Journal</div>
                    <div className="text-sm text-gray-400">Review past trades</div>
                  </div>
                </div>
              </button>
            </Link>

            <Link to="/settings">
              <button className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-left hover:border-gray-600 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Customize Checklist</div>
                    <div className="text-sm text-gray-400">Edit your trading rules</div>
                  </div>
                </div>
              </button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Performance Insights */}
      {totalTrades > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-6 mt-8">
          <h2 className="text-xl font-semibold text-white mb-6">Performance Insights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-900 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">Best Score</div>
              <div className="text-2xl font-bold text-emerald-400">
                {Math.max(...trades.map(t => t.score)).toFixed(0)}%
              </div>
            </div>

            <div className="p-4 bg-gray-900 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">Most Traded Pair</div>
              <div className="text-2xl font-bold text-white">
                {trades.reduce((acc, trade) => {
                  acc[trade.pair] = (acc[trade.pair] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>) && 
                  Object.entries(
                    trades.reduce((acc, trade) => {
                      acc[trade.pair] = (acc[trade.pair] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
                }
              </div>
            </div>

            <div className="p-4 bg-gray-900 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">This Week</div>
              <div className="text-2xl font-bold text-blue-400">
                {trades.filter(t => {
                  const tradeDate = new Date(t.date);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return tradeDate >= weekAgo;
                }).length} trades
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
