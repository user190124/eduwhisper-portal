import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase';

export default function TeacherDashboard({ user }) {
  const [formData, setFormData] = useState({ studentName: '', type: 'Attendance', details: '' });
  const [status, setStatus] = useState('');

  // Offline Sync Logic
  useEffect(() => {
    const syncOfflineData = async () => {
      const offlineData = JSON.parse(localStorage.getItem('offlineData') || '[]');
      if (offlineData.length > 0 && navigator.onLine) {
        setStatus('Syncing offline data...');
        const token = await user.getIdToken();
        for (const data of offlineData) {
          await axios.post(// Use this variable instead of the hardcoded string
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/activities` 
  : '/api/activities'; 

// Example usage in axios:
// await axios.get(API_URL, ...);, data, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        localStorage.removeItem('offlineData');
        setStatus('Offline data synced successfully!');
      }
    };
    window.addEventListener('online', syncOfflineData);
    return () => window.removeEventListener('online', syncOfflineData);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');
    
    const payload = { ...formData, date: new Date() };

    try {
      const token = await user.getIdToken();
      await axios.post(// Use this variable instead of the hardcoded string
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/activities` 
  : '/api/activities'; 

// Example usage in axios:
// await axios.get(API_URL, ...);, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus('Activity logged successfully (Online).');
      setFormData({ studentName: '', type: 'Attendance', details: '' });
    } catch (error) {
      // Fallback for Offline Mode [cite: 15, 109]
      const currentOffline = JSON.parse(localStorage.getItem('offlineData') || '[]');
      localStorage.setItem('offlineData', JSON.stringify([...currentOffline, payload]));
      setStatus('Network error. Saved offline. Will sync when online.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Teacher Activity Log</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input className="border p-2 rounded" placeholder="Student Name" value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} required />
        
        <select className="border p-2 rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
          <option>Attendance</option>
          <option>Task</option>
          <option>Note</option>
        </select>

        <textarea className="border p-2 rounded" placeholder="Details (e.g., Completed math homework)" value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} required />
        
        <button className="bg-blue-600 text-white p-2 rounded">Log Activity</button>
      </form>
      {status && <p className="mt-2 text-sm font-semibold text-green-700">{status}</p>}
    </div>
  );
}