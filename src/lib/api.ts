const BASE_URL = 'http://127.0.0.1:8000';

export interface Client {
  id: number;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  archived?: boolean;
  created_at?: string;
}

export interface Gig {
  id: number;
  title: string;
  description?: string;
  client_id: number;
  status: 'active' | 'completed' | 'cancelled';
  rate?: number;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

export interface Invoice {
  id: number;
  gig_id: number;
  client_id: number;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  due_date?: string;
  issued_date?: string;
  created_at?: string;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}

// Clients API
export const clientsApi = {
  getAll: () => fetchApi<Client[]>('/clients'),
  getById: (id: number) => fetchApi<Client>(`/clients/${id}`),
  create: (data: Omit<Client, 'id'>) => 
    fetchApi<Client>('/clients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Client>) => 
    fetchApi<Client>(`/clients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// Gigs API
export const gigsApi = {
  getAll: () => fetchApi<Gig[]>('/gigs'),
  getById: (id: number) => fetchApi<Gig>(`/gigs/${id}`),
  create: (data: Omit<Gig, 'id'>) => 
    fetchApi<Gig>('/gigs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Gig>) => 
    fetchApi<Gig>(`/gigs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// Invoices API
export const invoicesApi = {
  getAll: () => fetchApi<Invoice[]>('/invoices'),
  getById: (id: number) => fetchApi<Invoice>(`/invoices/${id}`),
  create: (data: Omit<Invoice, 'id'>) => 
    fetchApi<Invoice>('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Invoice>) => 
    fetchApi<Invoice>(`/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};
