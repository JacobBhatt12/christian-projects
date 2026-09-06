const CLIENT_ID_KEY = "costbridge:v1:client-id";
let cachedClientId: string | null = null;

export function getClientId() {
  if (cachedClientId) return cachedClientId;
  const saved = window.localStorage.getItem(CLIENT_ID_KEY);
  if (saved) {
    cachedClientId = saved;
    return saved;
  }
  const created = crypto.randomUUID();
  window.localStorage.setItem(CLIENT_ID_KEY, created);
  cachedClientId = created;
  return created;
}
