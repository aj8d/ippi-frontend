import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config';

export function useStats(userCustomId) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!userCustomId) return;

    const fetchStats = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.USER_STATS.DAILY_ACTIVITY(userCustomId), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        } else {
          console.error('Failed to fetch stats');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [userCustomId]);

  return stats;
}
