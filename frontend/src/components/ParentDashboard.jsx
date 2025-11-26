import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ParentDashboard({ user }) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const token = await user.getIdToken();
      const res = await axios.get(// Use this variable instead of the hardcoded string
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/activities` 
  : '/api/activities'; 

// Example usage in axios:
// await axios.get(API_URL, ...);, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActivities(res.data);
    };
    fetchActivities();
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Student Activity Feed</h2>
      <div className="space-y-3">
        {activities.map(act => (
          <div key={act._id} className="p-4 bg-white border-l-4 border-blue-500 shadow rounded">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-lg">{act.studentName}</span>
              <span className="text-xs text-gray-500">{new Date(act.timestamp).toLocaleDateString()}</span>
            </div>
            <span className={`inline-block px-2 py-1 text-xs rounded text-white mb-2 ${act.type === 'Attendance' ? 'bg-green-500' : act.type === 'Task' ? 'bg-purple-500' : 'bg-yellow-500'}`}>
              {act.type}
            </span>
            <p className="text-gray-700">{act.details}</p>
          </div>
        ))}
        {activities.length === 0 && <p className="text-center text-gray-500">No recent updates.</p>}
      </div>
    </div>
  );
}