// Configure the frontend with one public backend URL. Vite exposes only VITE_*
// values to the browser, so secrets must remain on the server.
const configuredBackendUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

// Accept either the Render/server origin or an origin that already includes /api.
export const API_URL = /\/api$/i.test(configuredBackendUrl)
  ? configuredBackendUrl
  : `${configuredBackendUrl}/api`;

const backendOrigin = API_URL.replace(/\/api\/?$/, "");
export const WS_URL =
  import.meta.env.VITE_WS_URL || backendOrigin.replace(/^http/, "ws");
