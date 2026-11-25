import { Fragment, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "../utils/userStorage";

const accountKeyOf = () => {
  const email = getCurrentUser()?.email;
  return email ? String(email).trim().toLowerCase() : "guest";
};

/**
 * Remounts everything inside it whenever the signed-in account changes
 * (login, sign-up, logout, or a change made in another browser tab).
 * Without this, pages that were already mounted keep their React state - and the
 * previous account's data - after an account switch.
 */
export function AccountBoundary({ children }) {
  const [accountKey, setAccountKey] = useState(accountKeyOf);

  useEffect(() => {
    const sync = () => setAccountKey(accountKeyOf());
    window.addEventListener("spec2test-auth-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("spec2test-auth-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return <Fragment key={accountKey}>{children}</Fragment>;
}

/** App pages need a signed-in account; otherwise go to the landing page login. */
export function RequireAuth({ children }) {
  const location = useLocation();

  if (!getCurrentUser()?.email) {
    return <Navigate to="/" replace state={{ requireLogin: true, from: location.pathname }} />;
  }
  return children;
}
