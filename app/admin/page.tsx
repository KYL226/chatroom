'use client';

import React from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
        <p className="text-gray-600">
          Bienvenue dans l&apos;interface d&apos;administration de ChatRoom
        </p>
      </div>
      
      <AdminDashboard />
    </div>
  );
} 