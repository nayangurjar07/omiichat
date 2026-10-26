/**
 * Unified endpoint configuration for Omii.
 * Single source of truth for REST API base, Socket.IO URL, and media resolution.
 */

function computeApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    // Local development mode: frontend on :3000, backend on :3001
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:3001`;
    }
    // LAN IP access (e.g. 192.168.x.x:3000 in local dev)
    if (port === '3000') {
      return `${protocol}//${hostname}:3001`;
    }
    // Behind reverse proxy / production deployment on same origin
    return window.location.origin;
  }

  return 'http://localhost:3001';
}

function computeSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    // Local development mode
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:3001`;
    }
    // LAN IP access in local dev
    if (port === '3000') {
      return `${protocol}//${hostname}:3001`;
    }
    // Behind reverse proxy / production deployment on same origin
    return window.location.origin;
  }

  return 'http://localhost:3001';
}

export const API_BASE = computeApiBase();
export const SOCKET_URL = computeSocketUrl();

export function getApiBase(): string {
  return typeof window !== 'undefined' ? computeApiBase() : API_BASE;
}

export function getSocketUrl(): string {
  return typeof window !== 'undefined' ? computeSocketUrl() : SOCKET_URL;
}

/**
 * Resolves uploaded media paths (images, audio) to absolute URLs
 */
export function resolveMediaUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://') || pathOrUrl.startsWith('blob:')) {
    return pathOrUrl;
  }
  const base = getApiBase();
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${cleanPath}`;
}
