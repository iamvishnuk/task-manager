import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useTaskSSE() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

    // Create EventSource connection with cookies credentials
    const eventSource = new EventSource(`${apiUrl}/tasks/events`, {
      withCredentials: true
    });

    // Handle incoming task change events
    eventSource.addEventListener('TASK_CHANGED', (event) => {
      try {
        const data = JSON.parse(event.data) as {
          action: string;
          taskId: string;
        };
        console.log('Real-time task update event:', data);

        // 1. Invalidate tasks list query
        queryClient.invalidateQueries({ queryKey: ['tasks'] });

        // 2. Invalidate tasks stats query
        queryClient.invalidateQueries({ queryKey: ['tasks-stats'] });

        // 3. Invalidate specific task detail and history queries if open
        if (data.taskId) {
          queryClient.invalidateQueries({ queryKey: ['task', data.taskId] });
          queryClient.invalidateQueries({
            queryKey: ['task-history', data.taskId]
          });
        }
      } catch (err) {
        console.error('Failed to parse SSE task change data:', err);
      }
    });

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, [queryClient]);
}
