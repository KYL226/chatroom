'use client';

import React from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Tableau de bord</h1>
        <p className="text-white/70">Bienvenue dans l&apos;interface d&apos;administration de ChatRoom</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
        <AdminDashboard />
      </div>
    </div>
  );
} 