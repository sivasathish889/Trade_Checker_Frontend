import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChecklistItem, Trade, ChecklistTemplate, AppSettings } from '../types';
import { useAuth } from './AuthContext';
import { API_URL } from '../config/apiConfig';

interface AppContextType {
  checklistItems: ChecklistItem[];
  setChecklistItems: (items: ChecklistItem[]) => void;
  trades: Trade[];
  addTrade: (trade: Trade) => void;
  deleteTrade: (id: string) => void;
  templates: ChecklistTemplate[];
  addTemplate: (template: ChecklistTemplate) => void;
  deleteTemplate: (id: string) => void;
  loadTemplate: (templateId: string) => void;
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = {
  customSessions: ['Asian Session', 'London Session', 'New York Session', 'London/NY Overlap'],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [checklistItems, setChecklistItemsState] = useState<ChecklistItem[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from Backend on mount or token change
  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Clear local states if not logged in
      setChecklistItemsState([]);
      setTrades([]);
      setTemplates([]);
      setSettings(DEFAULT_SETTINGS);
      setIsLoaded(true);
      return;
    }

    fetch(`${API_URL}/data`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then(data => {
        if (data.checklistItems?.length) setChecklistItemsState(data.checklistItems);
        if (data.trades) setTrades(data.trades);
        if (data.templates) setTemplates(data.templates);
        if (data.settings) setSettings(data.settings);
        setIsLoaded(true);
      })
      .catch(err => {
        console.error('Failed to load data from backend:', err);
        setIsLoaded(true);
      });
  }, [isAuthenticated, token]);

  const setChecklistItems = (items: ChecklistItem[]) => {
    setChecklistItemsState(items);
    if (!token) return;
    fetch(`${API_URL}/checklistItems`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(items)
    }).catch(console.error);
  };

  const addTrade = (trade: Trade) => {
    setTrades(prev => [trade, ...prev]);
    if (!token) return;
    fetch(`${API_URL}/trades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(trade)
    }).catch(console.error);
  };

  const deleteTrade = (id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id));
    if (!token) return;
    fetch(`${API_URL}/trades/${id}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).catch(console.error);
  };

  const addTemplate = (template: ChecklistTemplate) => {
    setTemplates(prev => [...prev, template]);
    if (!token) return;
    fetch(`${API_URL}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(template)
    }).catch(console.error);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    if (!token) return;
    fetch(`${API_URL}/templates/${id}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).catch(console.error);
  };

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setChecklistItems(template.items);
    }
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (!token) return;
    fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newSettings)
    }).catch(console.error);
  };

  if (!isLoaded) {
    return null; // or a loading spinner
  }

  return (
    <AppContext.Provider
      value={{
        checklistItems,
        setChecklistItems,
        trades,
        addTrade,
        deleteTrade,
        templates,
        addTemplate,
        deleteTemplate,
        loadTemplate,
        settings,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}