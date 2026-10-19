import { FeaturedTradeProposal } from '../types/featured';
import { INITIAL_FEATURED_TRADES } from '../data/featuredTrades';

export async function fetchFeaturedTrades(): Promise<FeaturedTradeProposal[]> {
  try {
    const res = await fetch('/api/featured');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Failed to load featured trades from edge API, using bundled fallback:', err);
  }
  return INITIAL_FEATURED_TRADES;
}

export async function saveFeaturedTrade(
  trade: Partial<FeaturedTradeProposal>,
  adminKey?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (adminKey) {
      headers['x-admin-key'] = adminKey;
    }

    const res = await fetch('/api/admin/featured', {
      method: 'POST',
      headers,
      body: JSON.stringify(trade),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || `HTTP ${res.status}` };
    }
    return { success: true, id: data.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteFeaturedTrade(
  id: string,
  adminKey?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const headers: Record<string, string> = {};
    if (adminKey) {
      headers['x-admin-key'] = adminKey;
    }

    const res = await fetch(`/api/admin/featured?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || `HTTP ${res.status}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
