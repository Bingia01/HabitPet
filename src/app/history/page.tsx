'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Calendar } from 'lucide-react';
import { useDemo } from '@/contexts/DemoContext';
import { FoodLog } from '@/types';

type HistoryFilter = 'today' | 'week' | 'all';

export default function HistoryPage() {
  const router = useRouter();
  const { state } = useDemo();
  const [filter, setFilter] = useState<HistoryFilter>('today');

  const filterLogs = (logs: FoodLog[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (filter) {
      case 'today':
        return logs.filter(log => new Date(log.logged_at) >= today);
      case 'week':
        return logs.filter(log => new Date(log.logged_at) >= weekAgo);
      case 'all':
      default:
        return logs;
    }
  };

  const groupLogsByDate = (logs: FoodLog[]) => {
    const grouped: { [date: string]: FoodLog[] } = {};
    logs.forEach(log => {
      const date = new Date(log.logged_at).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(log);
    });
    return grouped;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const calculateDayTotal = (logs: FoodLog[]) => {
    return logs.reduce((total, log) => total + log.calories, 0);
  };

  const filteredLogs = filterLogs(state.foodLogs);
  const groupedLogs = groupLogsByDate(filteredLogs);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold text-green-600">Food History</h1>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex gap-2">
          {[
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'Week' },
            { value: 'all', label: 'All' },
          ].map((tab) => (
            <Button
              key={tab.value}
              variant={filter === tab.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(tab.value as HistoryFilter)}
              className="flex-1"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Food Logs */}
      <div className="max-w-md mx-auto px-4 pb-24">
        {Object.keys(groupedLogs).length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No food logs yet</h3>
              <p className="text-gray-500 mb-4">Start logging your meals to see your history!</p>
              <Button onClick={() => router.push('/add-food')} className="bg-green-500 hover:bg-green-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Food
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedLogs)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, logs]) => {
                const dayTotal = calculateDayTotal(logs);
                const isToday = new Date(date).toDateString() === new Date().toDateString();

                return (
                  <Card key={date}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{isToday ? 'Today' : new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })}</span>
                        <span className="text-sm font-normal text-green-600">
                          {dayTotal} cal
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {logs
                        .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime())
                        .map((log) => (
                          <div key={log.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{log.emoji}</span>
                                <div>
                                  <p className="font-medium">{log.food_type}</p>
                                  <p className="text-sm text-gray-500">{log.portion_size} • {formatTime(log.logged_at)}</p>
                                </div>
                              </div>
                              <span className="font-semibold text-green-600">{log.calories} cal</span>
                            </div>
                            {log.protein_g !== undefined && log.carbs_g !== undefined && log.fat_g !== undefined && (
                              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
                                <div className="text-center">
                                  <p className="text-xs text-gray-600">Protein</p>
                                  <p className="text-sm font-bold text-blue-600">{log.protein_g}g</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-600">Carbs</p>
                                  <p className="text-sm font-bold text-green-600">{log.carbs_g}g</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-600">Fat</p>
                                  <p className="text-sm font-bold text-yellow-600">{log.fat_g}g</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-20 right-4">
        <Button
          size="lg"
          className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 shadow-lg"
          onClick={() => router.push('/add-food')}
        >
          <Plus className="w-8 h-8" />
        </Button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-md mx-auto flex">
          <Button variant="ghost" className="flex-1 py-4 flex flex-col gap-1" onClick={() => router.push('/')}>
            <div className="w-6 h-6 rounded"></div>
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" className="flex-1 py-4 flex flex-col gap-1">
            <Calendar className="w-6 h-6 text-green-500" />
            <span className="text-xs text-green-500">History</span>
          </Button>
          <Button variant="ghost" className="flex-1 py-4 flex flex-col gap-1" onClick={() => router.push('/settings')}>
            <div className="w-6 h-6 rounded"></div>
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}