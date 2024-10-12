const { VITE_HOST } = import.meta.env;
export const host = new URL(VITE_HOST);
