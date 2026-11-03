export const getIdentity = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);

  if (typeof value === "object") {
    if (value._id !== undefined) return getIdentity(value._id);
    if (value.id !== undefined) return getIdentity(value.id);
    if (value.$oid !== undefined) return getIdentity(value.$oid);
    if (typeof value.toHexString === "function") return value.toHexString();
  }

  const stringValue = String(value);
  return stringValue === "[object Object]" ? "" : stringValue;
};

export const sameIdentity = (left, right) => {
  const leftId = getIdentity(left);
  const rightId = getIdentity(right);
  return Boolean(leftId && rightId && leftId === rightId);
};

export const sameUser = (memberUser, currentUser) => {
  if (sameIdentity(memberUser, currentUser)) return true;

  const memberEmail = memberUser?.email?.trim?.().toLowerCase?.();
  const currentEmail = currentUser?.email?.trim?.().toLowerCase?.();
  return Boolean(memberEmail && currentEmail && memberEmail === currentEmail);
};
