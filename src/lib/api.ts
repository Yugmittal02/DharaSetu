const BASE_URL = '';

let dbErrorCount = 0;
const MAX_DB_ERRORS = 3;

export async function apiRequest(
  endpoint: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string | null;
  } = {}
) {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, fetchOptions);
  } catch (networkErr) {
    throw new Error('Network error. Please check your internet connection.');
  }
  
  // Handle blob responses (exports)
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('spreadsheet') || contentType?.includes('octet-stream')) {
    if (!response.ok) throw new Error('Export failed');
    const blob = await response.blob();
    const disposition = response.headers.get('content-disposition');
    const filename = disposition?.match(/filename="?(.+)"?/)?.[1] || `export_${Date.now()}.xlsx`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    return { success: true };
  }

  const data = await response.json();

  if (!response.ok) {
    // Track DB connection errors to avoid flooding
    if (response.status === 503) {
      dbErrorCount++;
      throw new Error('Database connection failed. Please wait and try again, or contact Admin to whitelist your IP on MongoDB Atlas.');
    }
    const errorMsg = data.details ? `${data.error}: ${data.details}` : data.error || 'Something went wrong';
    throw new Error(errorMsg);
  }

  // Reset error count on success
  dbErrorCount = 0;
  return data;
}

// Check if we've hit too many DB errors (used by polling functions)
export function isDbUnreachable(): boolean {
  return dbErrorCount >= MAX_DB_ERRORS;
}

export function resetDbErrorCount(): void {
  dbErrorCount = 0;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-800',
    suspended: 'bg-red-100 text-red-800',
    pending: 'bg-amber-100 text-amber-800',
    verified: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
    under_review: 'bg-blue-100 text-blue-800',
    submitted_to_bank: 'bg-indigo-100 text-indigo-800',
    submitted_to_warehouse: 'bg-purple-100 text-purple-800',
    completed: 'bg-teal-100 text-teal-800',
    credit: 'bg-emerald-100 text-emerald-800',
    debit: 'bg-red-100 text-red-800',
    approved: 'bg-emerald-100 text-emerald-800',
    paid: 'bg-teal-100 text-teal-800',
    hold: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
