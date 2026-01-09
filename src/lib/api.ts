const BASE_URL = 'http://127.0.0.1:8000';

export interface Client {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive' |'archived';
  phone?: string;
  business_id?: string;
  note?: string;
}

export interface Gig {
  id: number;
  client_id: number;
  title: string;
  wage: number;
  location?: string;
  date: string;
  description?: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface Invoice {
  id: number;
  gig_id: number;
  client_id: number;
  issue_date: string;
  due_date: string;
  status: 'draft' |'created'| 'sent' | 'paid' | 'void';
  toal_amount: number;
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
