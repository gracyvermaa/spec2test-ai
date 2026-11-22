const USER_KEY = "spec2test-auth-user";

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function getUserStoragePrefix() {
  const user = getCurrentUser();

  if (!user?.email) return "spec2test_guest_";

  const normalizedEmail = user.email.trim().toLowerCase();
  const safeEmail = normalizedEmail.replace(/[^a-z0-9]/g, "_");

  return `spec2test_user_${safeEmail}_`;
}

export function getUserStorageKey(key) {
  return `${getUserStoragePrefix()}${key}`;
}

export function getUserItem(key, fallback = null) {
  try {
    const value = localStorage.getItem(getUserStorageKey(key));
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

export function getUserJSON(key, fallback = null) {
  try {
    const value = getUserItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function setUserItem(key, value) {
  localStorage.setItem(getUserStorageKey(key), value);
}

export function setUserJSON(key, value) {
  setUserItem(key, JSON.stringify(value));
}

export function removeUserItem(key) {
  localStorage.removeItem(getUserStorageKey(key));
}

export function migrateLegacyData(keys, ownerEmail) {
  const normalizedOwner = ownerEmail?.trim().toLowerCase();
  const currentUser = getCurrentUser();

  if (!normalizedOwner || currentUser?.email?.toLowerCase() !== normalizedOwner) {
    return false;
  }

  const migrationKey = `spec2test_migration_${normalizedOwner}`;

  if (localStorage.getItem(migrationKey)) return false;

  keys.forEach((key) => {
    const legacyValue = localStorage.getItem(key);
    const newKey = getUserStorageKey(key.replace(/^spec2test_/, ""));

    if (legacyValue !== null && localStorage.getItem(newKey) === null) {
      localStorage.setItem(newKey, legacyValue);
    }
  });

  localStorage.setItem(migrationKey, "completed");
  return true;
}
