import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  description: string;
  sampleBody?: string;
  note?: string;
}

interface EndpointGroup {
  label: string;
  color: string;
  endpoints: Endpoint[];
}

const ENDPOINT_GROUPS: EndpointGroup[] = [
  {
    label: '🔐 Auth',
    color: 'purple',
    endpoints: [
      { method: 'POST', url: '/auth/register', description: 'Register a new client', sampleBody: '{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"9800000000","currentAddress":"KTM"}' },
      { method: 'POST', url: '/auth/verify-otp', description: 'Verify OTP after registration', sampleBody: '{"email":"test@example.com","otp":"123456","password":"Test@1234"}' },
      { method: 'POST', url: '/auth/login', description: 'Login and get token', sampleBody: '{"email":"test@example.com","password":"Test@1234"}' },
      { method: 'POST', url: '/auth/forgot-password', description: 'Send password reset OTP', sampleBody: '{"email":"test@example.com"}' },
      { method: 'POST', url: '/auth/reset-password', description: 'Reset password with OTP', sampleBody: '{"email":"test@example.com","otp":"123456","newPassword":"NewPass@1234"}' },
    ],
  },
  {
    label: '👤 Users (Auth Required)',
    color: 'blue',
    endpoints: [
      { method: 'GET', url: '/users/me', description: 'Get my profile' },
      { method: 'PUT', url: '/users/me', description: 'Update my profile', sampleBody: '{"firstName":"Updated","lastName":"Name","phone":"9800000001","currentAddress":"Lalitpur"}' },
      { method: 'PUT', url: '/users/change-password', description: 'Change password', sampleBody: '{"currentPassword":"Test@1234","newPassword":"NewPass@1234"}' },
      { method: 'GET', url: '/users/admin', description: 'Get admin user ID (for chat)' },
    ],
  },
  {
    label: '🔧 Bookings (Auth Required)',
    color: 'green',
    endpoints: [
      { method: 'GET', url: '/booking', description: 'Get all my bookings' },
      { method: 'GET', url: '/booking/BOOKING_ID_HERE', description: 'Get a single booking by ID', note: 'Replace BOOKING_ID_HERE with a real ID' },
      { method: 'POST', url: '/booking', description: 'Create a booking (no file upload via this tester)', sampleBody: '{"deviceType":"smartphone","deviceBrand":"Apple","deviceModel":"iPhone 13","issueDescription":"Cracked screen"}' },
    ],
  },
  {
    label: '📊 Tracking (Public)',
    color: 'teal',
    endpoints: [
      { method: 'GET', url: '/tracking/WFX-XXXXXXXX', description: 'Track repair by tracking ID (public)', note: 'Replace WFX-XXXXXXXX with a real tracking ID' },
    ],
  },
  {
    label: '🌍 Public Booking (Guest)',
    color: 'indigo',
    endpoints: [
      { 
        method: 'POST', 
        url: '/booking', 
        description: 'Create a booking as a guest (Public)', 
        sampleBody: '{"deviceType":"smartphone","deviceBrand":"Apple","deviceModel":"iPhone 13","issueDescription":"Cracked screen and battery draining fast","customerFirstName":"John","customerLastName":"Doe","customerEmail":"johndoe@example.com","customerPhone":"9800000000","customerAddress":"Kathmandu, Nepal"}' 
      },
    ],
  },
  {
    label: '🧾 Invoices (Auth Required)',
    color: 'orange',
    endpoints: [
      { method: 'GET', url: '/invoices', description: 'Get all my invoices' },
    ],
  },
  {
    label: '🔔 Notifications (Auth Required)',
    color: 'yellow',
    endpoints: [
      { method: 'GET', url: '/notifications', description: 'Get all my notifications' },
      { method: 'PUT', url: '/notifications/NOTIFICATION_ID_HERE/read', description: 'Mark notification as read', note: 'Replace NOTIFICATION_ID_HERE with a real ID' },
    ],
  },
  {
    label: '💬 Chat (Auth Required)',
    color: 'pink',
    endpoints: [
      { method: 'GET', url: '/chat/PARTNER_USER_ID', description: 'Get chat history with a user', note: 'Replace PARTNER_USER_ID with the admin or client ID' },
    ],
  },
  {
    label: '🤖 AI Chatbot',
    color: 'violet',
    endpoints: [
      { method: 'POST', url: '/chatbot/query', description: 'Send message to AI chatbot', sampleBody: '{"message":"How do I track my repair?"}' },
    ],
  },
  {
    label: '🛡️ Admin — Dashboard',
    color: 'red',
    endpoints: [
      { method: 'GET', url: '/admin/dashboard', description: 'Get dashboard stats (Admin only)' },
      { method: 'GET', url: '/admin/users', description: 'Get all users (Admin only)' },
      { method: 'DELETE', url: '/admin/users/USER_ID_HERE', description: 'Delete a user (Admin only)', note: 'Replace USER_ID_HERE with a real ID' },
    ],
  },
  {
    label: '🛡️ Admin — Bookings',
    color: 'red',
    endpoints: [
      { method: 'GET', url: '/admin/bookings', description: 'Get all bookings (Admin only)' },
      { method: 'PUT', url: '/admin/booking/BOOKING_ID_HERE', description: 'Update booking status', sampleBody: '{"status":"diagnosing","price":2500}', note: 'Replace BOOKING_ID_HERE' },
      { method: 'PUT', url: '/admin/tracking/BOOKING_ID_HERE', description: 'Add tracking timeline entry', sampleBody: '{"status":"repairing","notes":"Screen replacement in progress","price":2500}', note: 'Replace BOOKING_ID_HERE' },
    ],
  },
  {
    label: '🛡️ Admin — Invoices & Notifications',
    color: 'red',
    endpoints: [
      { method: 'POST', url: '/admin/invoice', description: 'Generate invoice for a booking', sampleBody: '{"bookingId":"BOOKING_ID_HERE"}' },
      { method: 'PUT', url: '/admin/invoice/INVOICE_ID_HERE/verify', description: 'Verify payment', note: 'Replace INVOICE_ID_HERE' },
      { method: 'POST', url: '/admin/send-notification', description: 'Send notification to user', sampleBody: '{"userId":"USER_ID_HERE","title":"Update","message":"Your device is ready!","type":"success"}' },
    ],
  },
  {
    label: '⭐ Testimonials',
    color: 'yellow',
    endpoints: [
      { method: 'POST', url: '/testimonials', description: 'Submit a new testimonial', sampleBody: '{"name":"John Doe","message":"Great service, fixed my phone fast!","rating":5}' },
      { method: 'GET', url: '/testimonials', description: 'Get all approved testimonials (Public)' },
      { method: 'GET', url: '/testimonials/admin', description: 'Get all testimonials (Admin)' },
      { method: 'PUT', url: '/testimonials/admin/TESTIMONIAL_ID_HERE', description: 'Update testimonial status', sampleBody: '{"status":"approved"}', note: 'Replace TESTIMONIAL_ID_HERE' },
      { method: 'DELETE', url: '/testimonials/admin/TESTIMONIAL_ID_HERE', description: 'Delete a testimonial', note: 'Replace TESTIMONIAL_ID_HERE' },
    ],
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-700 border-blue-200',
  POST: 'bg-green-100 text-green-700 border-green-200',
  PUT: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  DELETE: 'bg-red-100 text-red-700 border-red-200',
};

type EndpointRowProps = {
  endpoint: Endpoint;
};

function EndpointRow(props: EndpointRowProps) {
  const { endpoint } = props;
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState(endpoint.sampleBody ? endpoint.sampleBody : '');
  const [url, setUrl] = useState(endpoint.url);
  const [result, setResult] = useState<{ status: number; data: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let res;
      const config = body.trim() ? { headers: { 'Content-Type': 'application/json' } } : {};
      const parsedBody = body.trim() ? JSON.parse(body) : undefined;

      switch (endpoint.method) {
        case 'GET': res = await api.get(url); break;
        case 'POST': res = await api.post(url, parsedBody, config); break;
        case 'PUT': res = await api.put(url, parsedBody, config); break;
        case 'DELETE': res = await api.delete(url); break;
      }
      setResult({ status: res!.status, data: res!.data });
    } catch (err: any) {
      const status = err.response?.status;
      const data = err.response?.data;
      if (status && data) {
        setResult({ status, data });
      } else {
        setError(err.message || 'Network error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition-colors"
        onClick={() => setOpen(!open)}
      >
        <Badge className={`${METHOD_COLORS[endpoint.method]} border text-xs font-mono min-w-[56px] justify-center`}>
          {endpoint.method}
        </Badge>
        <code className="text-sm text-slate-700 flex-1 font-mono">{endpoint.url}</code>
        <span className="text-xs text-slate-500 hidden sm:block mr-2">{endpoint.description}</span>
        {open ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="border-t bg-slate-50 p-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">URL (editable)</label>
            <input
              className="w-full mt-1 font-mono text-sm border rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          {endpoint.note && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              ⚠️ {endpoint.note}
            </p>
          )}
          {(endpoint.method === 'POST' || endpoint.method === 'PUT') && (
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Request Body (JSON)</label>
              <textarea
                className="w-full mt-1 font-mono text-xs border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="{}"
              />
            </div>
          )}
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={execute}
            disabled={loading}
          >
            {loading ? <RefreshCw className="w-3 h-3 mr-2 animate-spin" /> : <Send className="w-3 h-3 mr-2" />}
            {loading ? 'Sending...' : 'Send Request'}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                {result.status < 400 ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-mono font-semibold ${result.status < 400 ? 'text-green-700' : 'text-red-700'}`}>
                  {result.status}
                </span>
                <span className="text-xs text-slate-500">{result.status < 400 ? 'Success' : 'Error'}</span>
              </div>
              <pre className="text-xs bg-slate-900 text-green-400 p-3 rounded-md overflow-auto max-h-72 whitespace-pre-wrap">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function APITestPage() {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['🔐 Auth']));

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">API Test Console</h2>
        <p className="text-slate-500">
          Test every backend endpoint directly from the browser. Uses your current login token automatically.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
        🔑 <strong>Token:</strong> Automatically injected from your session. Log in as admin for admin endpoints.
      </div>

      <div className="space-y-4">
        {ENDPOINT_GROUPS.map((group) => (
          <div key={group.label} className="border rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 hover:bg-slate-200 transition-colors text-left"
              onClick={() => toggleGroup(group.label)}
            >
              <span className="font-semibold text-slate-800">{group.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{group.endpoints.length} endpoint{group.endpoints.length > 1 ? 's' : ''}</span>
                {openGroups.has(group.label) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </button>
            {openGroups.has(group.label) && (
              <div className="p-3 space-y-2 bg-white">
                {group.endpoints.map((ep, i) => (
                  <div key={`${ep.method}-${ep.url}-${i}`}>
                    <EndpointRow endpoint={ep} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
