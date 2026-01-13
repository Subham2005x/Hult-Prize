const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiOptions {
    method?: string;
    body?: any;
    token?: string;
}

async function apiRequest(endpoint: string, options: ApiOptions = {}) {
    const { method = 'GET', body, token } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method,
        headers,
    };

    if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || 'Request failed');
    }

    return response.json();
}

export const api = {
    // Auth
    verifyToken: (token: string, role: string) =>
        apiRequest('/api/auth/verify-token', {
            method: 'POST',
            body: { role },
            token
        }),

    getCurrentUser: (token: string) =>
        apiRequest('/api/auth/me', { token }),

    // Worker endpoints
    worker: {
        getProfile: (token: string) =>
            apiRequest('/api/workers/me', { token }),

        getBalance: (token: string) =>
            apiRequest('/api/workers/me/balance', { token }),

        getWithdrawals: (token: string) =>
            apiRequest('/api/workers/me/withdrawals', { token }),

        requestWithdrawal: (token: string, data: { amount: number; upi_id: string }) =>
            apiRequest('/api/workers/me/withdraw', {
                method: 'POST',
                body: data,
                token,
            }),

        updateUPI: (token: string, upiId: string) =>
            apiRequest('/api/workers/me/upi', {
                method: 'PUT',
                body: { upi_id: upiId },
                token,
            }),

        updatePassword: (token: string, password: string) =>
            apiRequest('/api/workers/me/password', {
                method: 'PUT',
                body: { password },
                token,
            }),
    },

    // Employer endpoints
    employer: {
        getDashboard: (token: string) =>
            apiRequest('/api/employers/me/dashboard', { token }),
        getWorkers: (token: string) =>
            apiRequest('/api/employers/me/workers', { token }),
        addWorker: (token: string, data: any) =>
            apiRequest('/api/employers/me/workers', {
                method: 'POST',
                body: data,
                token,
            }),
        submitAttendance: (token: string, data: any) =>
            apiRequest('/api/employers/attendance', {
                method: 'POST',
                body: data,
                token,
            }),
        getProfile: (token: string) =>
            apiRequest('/api/employers/me', { token }),
        updateProfile: (token: string, data: any) =>
            apiRequest('/api/employers/me', {
                method: 'PUT',
                body: data,
                token,
            }),
    },

    // Settlements
    settlements: {
        getHistory: (token: string) =>
            apiRequest('/api/settlements/', { token }),

        processSettlement: (token: string, month: string) =>
            apiRequest('/api/settlements/process', {
                method: 'POST',
                body: { month },
                token,
            }),
    },
};
