import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { MessageSquare, Star, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminTestimonials() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-testimonials', statusFilter],
    queryFn: async () => {
      const url = statusFilter === 'all' 
        ? '/testimonials/admin' 
        : `/testimonials/admin?status=${statusFilter}`;
      const res = await api.get(url);
      return res.data;
    },
  });

  const testimonials = response?.data || [];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.put(`/testimonials/admin/${id}`, { status });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Testimonial status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/testimonials/admin/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Testimonial deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
    },
    onError: () => {
      toast.error('Failed to delete testimonial');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Testimonials</h1>
            <p className="text-slate-500">Manage customer reviews and feedback</p>
          </div>
        </div>
        <div className="w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Testimonials</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
          <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700">No Testimonials Found</h2>
          <p className="text-slate-500 mt-2">There are no testimonials matching the current filter.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {testimonials.map((testimonial: any) => (
            <div key={testimonial._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  {testimonial.profileImage ? (
                    <img src={testimonial.profileImage} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg uppercase border border-blue-200">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{testimonial.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-slate-500">
                      {new Date(testimonial.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(testimonial.status)}`}>
                {testimonial.status}
              </div>
            </div>
              
              <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                "{testimonial.message}"
              </p>

              <div className="flex justify-end gap-2 border-t pt-4">
                {testimonial.status !== 'approved' && (
                  <Button
                    variant="outline"
                    className="text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => updateStatusMutation.mutate({ id: testimonial._id, status: 'approved' })}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                  </Button>
                )}
                {testimonial.status !== 'rejected' && (
                  <Button
                    variant="outline"
                    className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                    onClick={() => updateStatusMutation.mutate({ id: testimonial._id, status: 'rejected' })}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this testimonial?')) {
                      deleteMutation.mutate(testimonial._id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
