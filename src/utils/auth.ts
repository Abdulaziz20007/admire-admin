export const getUserIdFromToken = (token: string | null): number | null => {
  if (!token) return null;
  try {
    const payloadBase64 = token.split(".")[1];
    // Replace URL-safe chars
    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(atob(base64));
    const idField = decodedPayload.sub ?? decodedPayload.id ?? null;
    return idField !== null ? Number(idField) : null;
  } catch {
    return null;
  }
};

export const isSuperAdmin = (token: string | null): boolean => {
  return getUserIdFromToken(token) === 1;
};
