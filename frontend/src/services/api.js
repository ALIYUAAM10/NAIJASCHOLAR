import { getAuthToken } from './firebase';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiRequestError extends Error {
    constructor(message, { status, code, details, requestId } = {}) {
        super(message);
        this.name = 'ApiRequestError';
        this.status = status;
        this.code = code;
        this.details = details;
        this.requestId = requestId;
    }
}

function createClientId() {
    const cryptoApi = window.crypto;

    if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();

    const bytes = new Uint8Array(16);
    cryptoApi.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function request(path, options = {}, allowRetry = true) {
    const token = await getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    const payload = await response.json().catch(() => ({}));

    if (response.status === 401 && token && allowRetry) {
        await getAuthToken(true);
        return request(path, options, false);
    }

    if (!response.ok) {
        const error = payload?.error || {};
        throw new ApiRequestError(error.message || 'Request failed.', {
            status: response.status,
            code: error.code,
            details: error.details,
            requestId: error.requestId,
        });
    }

    return payload;
}

export const api = {
    getMe: () => request('/me'),
    updateProfile: (data) =>
        request('/me', { method: 'PATCH', body: JSON.stringify(data) }),
    getExams: () => request('/exams'),
    startMock: (examId) =>
        request('/mock-sessions', {
            method: 'POST',
            body: JSON.stringify({ examId, sessionId: createClientId() }),
        }),
    submitMock: (sessionId, answers) =>
        request(`/mock-sessions/${encodeURIComponent(sessionId)}/submit`, {
            method: 'POST',
            body: JSON.stringify({ answers }),
        }),
};
