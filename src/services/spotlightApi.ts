import { PlayerSpotlight } from '../types/spotlight';
import { INITIAL_PLAYER_SPOTLIGHT } from '../data/playerSpotlights';

export async function fetchActiveSpotlight(): Promise<PlayerSpotlight> {
  try {
    const res = await fetch('/api/spotlight');
    if (res.ok) {
      const data = await res.json();
      if (data && data.headline && data.options) {
        return data as PlayerSpotlight;
      }
    }
  } catch (err) {
    console.warn('[Spotlight API] Falling back to bundled player spotlight:', err);
  }
  return INITIAL_PLAYER_SPOTLIGHT;
}

export async function saveSpotlightToD1(
  spotlight: PlayerSpotlight,
  adminKey?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (adminKey) {
      headers['x-admin-key'] = adminKey;
    }

    const res = await fetch('/api/admin/spotlight', {
      method: 'POST',
      headers,
      credentials: 'include', // Includes Cloudflare Access OTP JWT session cookie
      body: JSON.stringify(spotlight),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to update spotlight' };
    }
    return { success: true, message: data.message };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error connecting to /api/admin/spotlight' };
  }
}
