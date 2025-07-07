'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
  const [apiUsage, setApiUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchApiUsage() {
      try {
        const { data, error } = await supabase
          .from('api_usage_logs')
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          throw error;
        }
        setApiUsage(data);
      } catch (err) {
        console.error('Error fetching API usage:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchApiUsage();
  }, [supabase]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">API Usage Statistics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">API Usage Statistics</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">API Usage Statistics</h1>
      {apiUsage.length === 0 ? (
        <p>No API usage data available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apiUsage.map((log) => (
            <Card key={log.id}>
              <CardHeader>
                <CardTitle>{log.api_name} - {log.endpoint}</CardTitle>
                <p className="text-sm text-muted-foreground">Date: {new Date(log.date).toLocaleDateString()}</p>
              </CardHeader>
              <CardContent>
                <p>Requests: {log.requests_count}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
