import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Tag, Plus, Edit, Trash2, Search, Smartphone, Laptop, Tablet, Watch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PricingManager() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-pricing'],
    queryFn: async () => {
      const res = await api.get('/pricing');
      return res.data;
    },
  });

  const prices = response?.data || [];

  const filteredPrices = prices.filter((p: any) => 
    p.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/pricing', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Price added successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-pricing'] });
      setIsAdding(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add price');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/pricing/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Price updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-pricing'] });
      setEditingId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update price');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/pricing/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Price deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-pricing'] });
    },
    onError: () => {
      toast.error('Failed to delete price');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, id?: string, category?: string, status?: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Since Shadcn Select doesn't natively write to FormData, append them
    if (category) formData.set('category', category);
    if (status) formData.set('status', status);

    if (id) {
      updateMutation.mutate({ id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mobile':
      case 'smartphone':
        return <Smartphone className="w-5 h-5 text-blue-500" />;
      case 'laptop':
        return <Laptop className="w-5 h-5 text-purple-500" />;
      case 'tablet':
        return <Tablet className="w-5 h-5 text-indigo-500" />;
      default:
        return <Watch className="w-5 h-5 text-slate-500" />;
    }
  };

  const PriceForm = ({ initialData, isEdit = false }: { initialData?: any, isEdit?: boolean }) => {
    const [category, setCategory] = useState(initialData?.category || 'Smartphone');
    const [status, setStatus] = useState(initialData?.status || 'Active');
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <form onSubmit={(e) => handleSubmit(e, initialData?._id, category, status)} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6 space-y-4">
        <h3 className="font-bold text-lg text-slate-900 mb-4">{isEdit ? 'Edit Price Entry' : 'Add New Price Entry'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Device Name</label>
            <Input required name="deviceName" defaultValue={initialData?.deviceName} placeholder="e.g. iPhone 13 Pro" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Smartphone">Smartphone</SelectItem>
                <SelectItem value="Laptop">Laptop</SelectItem>
                <SelectItem value="Tablet">Tablet</SelectItem>
                <SelectItem value="Smartwatch">Smartwatch</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Service Type</label>
            <Input required name="serviceType" defaultValue={initialData?.serviceType} placeholder="e.g. Screen Replacement" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Price (NPR)</label>
            <Input required type="number" min="0" name="price" defaultValue={initialData?.price} placeholder="e.g. 15000" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Estimated Time</label>
            <Input required name="estimatedTime" defaultValue={initialData?.estimatedTime} placeholder="e.g. 2 Hours" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Device Image</label>
            <div className="flex items-center gap-4">
              <Input type="file" name="image" accept="image/*" onChange={handleImageChange} className="cursor-pointer" />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => isEdit ? setEditingId(null) : setIsAdding(false)}>Cancel</Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            {isEdit ? 'Save Changes' : 'Add Price'}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pricing Manager</h1>
            <p className="text-slate-500">Manage repair services and their prices</p>
          </div>
        </div>
        <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isAdding}>
          <Plus className="w-4 h-4 mr-2" /> Add New Price
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
        <Search className="w-5 h-5 text-slate-400" />
        <Input 
          placeholder="Search by device name or service..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-none shadow-none focus-visible:ring-0 text-base"
        />
      </div>

      {isAdding && <PriceForm />}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredPrices.length === 0 && !isAdding ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
          <Tag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700">No Prices Found</h2>
          <p className="text-slate-500 mt-2">Add your first repair service price to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredPrices.map((price: any) => (
            editingId === price._id ? (
              <div key={`edit-${price._id}`} className="xl:col-span-2">
                 <PriceForm initialData={price} isEdit={true} />
              </div>
            ) : (
              <div key={price._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="p-0.5 bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                    {price.image ? (
                      <img src={price.image} alt={price.deviceName} className="w-11 h-11 object-cover rounded-lg" />
                    ) : (
                      <div className="p-2.5">
                        {getCategoryIcon(price.category)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-slate-900">{price.deviceName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${price.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {price.status}
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium mb-1">{price.serviceType}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="font-bold text-blue-600">NPR {price.price.toLocaleString()}</span>
                      <span>•</span>
                      <span>{price.estimatedTime}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingId(price._id)} className="h-8 w-8 p-0">
                    <Edit className="w-4 h-4 text-slate-600" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    if (window.confirm('Are you sure you want to delete this price entry?')) {
                      deleteMutation.mutate(price._id);
                    }
                  }} className="h-8 w-8 p-0 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
