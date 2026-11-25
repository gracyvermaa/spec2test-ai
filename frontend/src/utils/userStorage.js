/**
 * Per-account storage for Spec2Test AI.
 *
 * Every piece of user data is stored under a key that contains the signed-in
 * account's e-mail, e.g.  spec2test_user_<encoded-email>_projects.
 * Pages use the drop-in `userStorage` object (getItem / setItem / removeItem) with
 * the same key names they always used ("spec2test_projects", ...); the key is
 * scoped here, in one place.
 *
 * RULES
 *  - No signed-in user  => reads return null, writes are ignored. The old global
 *    keys and a shared "guest" bucket are never used for user data.
 *  - Legacy (pre-accounts) global data is COPIED / merged into the legacy owner's
 *    account only. The old global keys are never modified or deleted.
 */

const USER_KEY = "spec2test-auth-user";

/** The account that owns the data created before accounts existed. */
export const LEGACY_OWNER_EMAIL = "gracyverma962@gmail.com";

/* ------------------------------ current user ----------------------------- */

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

/**
 * Injective encoding of an e-mail into a key-safe string. Every character other
 * than a-z / 0-9 becomes _<hex>, and "_" itself is encoded too, so two different
 * e-mails can never share a prefix (the previous scheme mapped both a.b@x.com and
 * a_b@x.com to the same prefix).
 */
function encodeEmail(email) {
  return normalizeEmail(email).replace(
    /[^a-z0-9]/g,
    (char) => `_${char.charCodeAt(0).toString(16)}_`
  );
}

/** The scheme used by the previous version of this helper (kept for migration only). */
function previousSchemePrefix(email) {
  return `spec2test_user_${normalizeEmail(email).replace(/[^a-z0-9]/g, "_")}_`;
}

export function getUserStoragePrefix() {
  const user = getCurrentUser();
  if (!user?.email) return "spec2test_guest_";
  return `spec2test_user_${encodeEmail(user.email)}__`;
}

export function getUserStorageKey(key) {
  return `${getUserStoragePrefix()}${key}`;
}

/** "spec2test_projects" / "spec2test-profile" -> "projects" / "profile" */
export function scopedName(key) {
  return String(key).replace(/^spec2test[_-]/, "");
}

/* ------------------------- legacy data -> legacy owner ------------------------- */

// Global keys the app used before accounts existed.
const LEGACY_EXACT_KEYS = [
  "spec2test_projects",
  "spec2test_read_notifications",
  "spec2test_execution_runs",
  "spec2test_defects",
  "spec2test_expanded_defects",
  "spec2test-profile",
  "spec2test_profile",
  "spec2test-settings",
  "spec2test_settings",
  "spec2test-support",
];
const LEGACY_PREFIXES = ["spec2test_status_"];

// What the old Profile page displayed to everyone when nothing had been saved.
// Preserved for the legacy owner only, so her profile looks exactly as before.
const LEGACY_DEFAULT_PROFILE = {
  name: "Gracy Verma",
  email: LEGACY_OWNER_EMAIL,
  role: "AI Engineer",
  bio: "Building intelligent solutions with AI, machine learning, and software development.",
};

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function parseJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/** Merge two parsed JSON values. `incoming` wins on conflicts; nothing is dropped. */
function mergeJSON(existing, incoming) {
  if (Array.isArray(existing) && Array.isArray(incoming)) {
    const seen = new Set();
    const merged = [];
    const identity = (item) =>
      item && typeof item === "object" && item.id !== undefined
        ? `id:${item.id}`
        : `json:${JSON.stringify(item)}`;

    [...incoming, ...existing].forEach((item) => {
      const id = identity(item);
      if (!seen.has(id)) {
        seen.add(id);
        merged.push(item);
      }
    });
    return merged;
  }

  if (isPlainObject(existing) && isPlainObject(incoming)) {
    return { ...existing, ...incoming };
  }

  return incoming;
}

function mergeIntoKey(targetKey, incomingRaw) {
  const existingRaw = localStorage.getItem(targetKey);

  if (existingRaw === null) {
    localStorage.setItem(targetKey, incomingRaw);
    return;
  }

  const existing = parseJSON(existingRaw);
  const incoming = parseJSON(incomingRaw);
  if (existing === undefined || incoming === undefined) return; // keep what the account already has

  localStorage.setItem(targetKey, JSON.stringify(mergeJSON(existing, incoming)));
}

function allKeys() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i += 1) keys.push(localStorage.key(i));
  return keys.filter(Boolean);
}

/**
 * One-time, idempotent, non-destructive migration for an account. Runs lazily the
 * first time the account's storage is touched (so it works however the user logged
 * in, with or without a page reload).
 *   1. Data the previous helper version already copied for this e-mail.
 *   2. Legacy global data - ONLY for the legacy owner account.
 */
export function ensureLegacyMigration(user) {
  const email = normalizeEmail(user?.email);
  if (!email) return;

  // The marker lives in localStorage (not in memory) so this stays correct across
  // tabs and if storage is cleared or changed behind our back.
  const marker = `spec2test_migration_v2_${encodeEmail(email)}`;
  if (localStorage.getItem(marker)) return;

  try {
    const targetPrefix = `spec2test_user_${encodeEmail(email)}__`;
    const keys = allKeys();

    const oldPrefix = previousSchemePrefix(email);
    keys
      .filter((key) => key.startsWith(oldPrefix))
      .forEach((key) => mergeIntoKey(targetPrefix + key.slice(oldPrefix.length), localStorage.getItem(key)));

    if (email === LEGACY_OWNER_EMAIL) {
      keys
        .filter(
          (key) =>
            LEGACY_EXACT_KEYS.includes(key) ||
            LEGACY_PREFIXES.some((prefix) => key.startsWith(prefix))
        )
        .forEach((key) => mergeIntoKey(targetPrefix + scopedName(key), localStorage.getItem(key)));

      if (localStorage.getItem(`${targetPrefix}profile`) === null) {
        localStorage.setItem(`${targetPrefix}profile`, JSON.stringify(LEGACY_DEFAULT_PROFILE));
      }
    }

    localStorage.setItem(marker, new Date().toISOString());
  } catch (error) {
    // Nothing is marked as done, so it is retried next time. Legacy data is untouched.
    console.error("Spec2Test: legacy data migration failed; it will be retried.", error);
  }
}

/* ------------------------------- public API ------------------------------- */

/** Drop-in replacement for the parts of localStorage the pages use. */
export const userStorage = {
  getItem(key) {
    const user = getCurrentUser();
    if (!user?.email) return null;
    ensureLegacyMigration(user);
    return localStorage.getItem(getUserStorageKey(scopedName(key)));
  },

  setItem(key, value) {
    const user = getCurrentUser();
    if (!user?.email) {
      console.error("userStorage.setItem ignored: no user is signed in.", key);
      return;
    }
    ensureLegacyMigration(user);
    localStorage.setItem(getUserStorageKey(scopedName(key)), value);
  },

  removeItem(key) {
    const user = getCurrentUser();
    if (!user?.email) return;
    localStorage.removeItem(getUserStorageKey(scopedName(key)));
  },
};

/* Existing helpers (same signatures as before). */

export function getUserItem(key, fallback = null) {
  const value = userStorage.getItem(key);
  return value === null ? fallback : value;
}

export function getUserJSON(key, fallback = null) {
  try {
    const value = userStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function setUserItem(key, value) {
  userStorage.setItem(key, value);
}

export function setUserJSON(key, value) {
  userStorage.setItem(key, JSON.stringify(value));
}

export function removeUserItem(key) {
  userStorage.removeItem(key);
}

/**
 * Kept for backward compatibility with the earlier main.jsx. Migration now happens
 * automatically (ensureLegacyMigration), so this simply triggers it.
 */
export function migrateLegacyData(_keys, ownerEmail) {
  const user = getCurrentUser();
  if (!user || normalizeEmail(user.email) !== normalizeEmail(ownerEmail)) return false;
  ensureLegacyMigration(user);
  return true;
}
