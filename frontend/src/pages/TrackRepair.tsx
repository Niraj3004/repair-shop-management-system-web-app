import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TrackingTimeline {
  status: string;
  notes: string;
  date: string;
}

interface TrackingData {
  booking: {
    _id: string;
    trackingId: string;
    deviceType: string;
    deviceModel: string;
    issueDescription: string;
    currentStatus: string;
    price?: number;
  };
  timeline: {
    status: string;
    notes: string;
    createdAt: string;
  }[];
}

export default function TrackRepair() {
  const [trackingId, setTrackingId] = useState('');
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);

  const trackMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.get(`/tracking/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      setTrackingData(data.data);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Tracking ID not found');
      setTrackingData(null);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    trackMutation.mutate(trackingId.trim());
  };

  const getStatusIcon = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('completed')) return <CheckCircle2 className="w-6 h-6 text-green-600" />;
    if (s.includes('cancelled')) return <XCircle className="w-6 h-6 text-red-600" />;
    if (s.includes('pending')) return <Clock className="w-6 h-6 text-yellow-500" />;
    return <AlertCircle className="w-6 h-6 text-blue-600" />;
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('completed')) return 'text-green-600 bg-green-50 border-green-200';
    if (s.includes('cancelled')) return 'text-red-600 bg-red-50 border-red-200';
    if (s.includes('pending')) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Track Your Repair</h1>
          <p className="text-slate-600">Enter your tracking ID to see the real-time status of your device repair.</p>
        </div>

        <Card className="mb-8 shadow-md">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                placeholder="e.g. WF-ABC123"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="text-lg py-6"
              />
              <Button 
                type="submit" 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 px-8 h-auto"
                disabled={trackMutation.isPending}
              >
                {trackMutation.isPending ? 'Searching...' : <><Search className="w-5 h-5 mr-2" /> Track</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        {trackingData && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <Card className="shadow-md border-t-4 border-t-blue-600">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{trackingData.booking.deviceModel}</CardTitle>
                    <p className="text-slate-500 capitalize">{trackingData.booking.deviceType}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full border font-semibold flex items-center gap-2 ${getStatusColor(trackingData.booking.currentStatus)}`}>
                    {getStatusIcon(trackingData.booking.currentStatus)}
                    <span className="capitalize">{trackingData.booking.currentStatus}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Issue Description</h4>
                    <p className="text-slate-800">{trackingData.booking.issueDescription}</p>
                  </div>
                  {trackingData.booking.price && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Estimated Price</h4>
                      <p className="text-2xl font-bold text-slate-900">Rs. {trackingData.booking.price}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Repair Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
                  {trackingData.timeline.map((item, index) => (
                    <div key={index} className="relative pl-8">
                      <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-4 border-blue-600"></div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                        <h4 className="text-lg font-semibold text-slate-900 capitalize">{item.status}</h4>
                        <time className="text-sm text-slate-500">
                          {new Date(item.createdAt).toLocaleString()}
                        </time>
                      </div>
                      <p className="text-slate-600">{item.notes}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
