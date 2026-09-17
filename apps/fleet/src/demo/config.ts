export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

// Fixed demo tokens so marketing links like /fleet/#/t/demo stay stable.
export const DEMO_DRIVER_TOKEN = 'demo';
export const DEMO_TRACK_TOKEN = 'demo';
