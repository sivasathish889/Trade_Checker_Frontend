import React from 'react';
import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { NewTrade } from './pages/NewTrade';
import { TradeHistory } from './pages/TradeHistory';
import { Templates } from './pages/Templates';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { index: true, Component: Dashboard },
      { path: 'new-trade', Component: NewTrade },
      { path: 'history', Component: TradeHistory },
      { path: 'templates', Component: Templates },
      { path: 'settings', Component: Settings },
    ],
  },
]);
