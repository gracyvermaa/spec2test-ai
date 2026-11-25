import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import App from "../App";
import { getUserStorageKey } from "../utils/userStorage";
import { GRACY, KINJAL, GRACY_PROJECTS, seedLegacy, snapshotLegacy } from "../test/fixtures";

/* ----------------------------- UI helpers ----------------------------- */

const goTo = (path) =>
  act(() => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

const waitForUserMenu = () => waitFor(() => expect(document.querySelector(".user-button")).not.toBeNull());

// A redirect from a protected page leaves the login modal open; close it first.
const closeAuthModal = () => {
  if (document.querySelector(".auth-modal")) fireEvent.keyDown(window, { key: "Escape" });
};

async function logIn({ email, password }) {
  await goTo("/");
  closeAuthModal();
  await waitFor(() => expect(document.querySelector(".login-btn")).not.toBeNull());
  fireEvent.click(document.querySelector(".login-btn"));
  fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: password } });
  fireEvent.submit(document.querySelector(".auth-modal form"));
  await waitForUserMenu();
}

async function signUp({ name, email, password }) {
  await goTo("/");
  closeAuthModal();
  await waitFor(() => expect(document.querySelector(".signup-btn")).not.toBeNull());
  fireEvent.click(document.querySelector(".signup-btn"));
  fireEvent.change(screen.getByPlaceholderText("Your full name"), { target: { value: name } });
  fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: password } });
  fireEvent.change(screen.getByPlaceholderText("Confirm your password"), { target: { value: password } });
  fireEvent.submit(document.querySelector(".auth-modal form"));
  await waitForUserMenu();
}

async function logOut() {
  await goTo("/");
  fireEvent.click(document.querySelector(".user-button"));
  fireEvent.click(await screen.findByRole("button", { name: "Logout" }));
  await waitFor(() => expect(document.querySelector(".login-btn")).not.toBeNull());
}

const textCount = (text) => screen.queryAllByText(text).length;
const visit = async (path) => goTo(path);
const authUser = () => JSON.parse(localStorage.getItem("spec2test-auth-user") || "null");

async function expectOnPage(path, text) {
  await visit(path);
  await waitFor(() => expect(textCount(text)).toBeGreaterThan(0));
}
async function expectAbsent(path, text, settleOn) {
  await visit(path);
  if (settleOn) await waitFor(() => expect(textCount(settleOn)).toBeGreaterThan(0));
  expect(textCount(text)).toBe(0);
}

/* --------------------------------- tests --------------------------------- */

describe("multi-account isolation (real app, real pages)", () => {
  it("runs the full Gracy -> Kinjal -> Gracy scenario with no data leaking", async () => {
    seedLegacy();
    const legacyBefore = snapshotLegacy();
    render(<App />);

    /* 1. Gracy logs in -> her existing projects appear */
    await logIn(GRACY);
    await expectOnPage("/dashboard", "Banking AI Test Project");
    expect(textCount("Gracy Payments Portal")).toBeGreaterThan(0);
    expect(document.querySelector(".dash-name").textContent).toBe("Gracy Verma");

    // notifications (derived from her projects, read-state from her storage)
    fireEvent.click(screen.getByLabelText("Notifications"));
    expect(textCount("Gracy Payments Portal was added to your workspace.")).toBe(1);

    // every other page shows HER data
    await expectOnPage("/projects", "Gracy Payments Portal");
    await expectOnPage("/test-cases", "Login with valid credentials");
    await expectOnPage("/execution", "DEF-001");
    await expectOnPage("/reports", "Secure User Authentication"); // Reports lists projects by requirement title
    await visit("/settings");
    await waitFor(() => expect(document.querySelectorAll("button[aria-pressed]").length).toBeGreaterThan(0));
    expect(document.querySelectorAll("button[aria-pressed]")[0].getAttribute("aria-pressed")).toBe("false"); // her saved setting
    await visit("/profile");
    await waitFor(() => expect(document.querySelector('input[name="role"]')).not.toBeNull());
    expect(document.querySelector('input[name="role"]').value).toBe("AI Engineer");
    expect(document.querySelector('textarea[name="bio"]').value).toBe("Gracy's own bio text.");

    /* 2. Gracy logs out -> protected pages are closed */
    await logOut();
    expect(authUser()).toBeNull();
    await visit("/dashboard");
    await waitFor(() => expect(document.querySelector(".auth-modal")).not.toBeNull()); // sent to login
    expect(textCount("Banking AI Test Project")).toBe(0);

    /* 3. Kinjal signs up -> completely clean workspace */
    await signUp(KINJAL);
    await visit("/dashboard");
    await waitFor(() => expect(document.querySelector(".dash-name")).not.toBeNull());
    expect(document.querySelector(".dash-name").textContent).toBe("Kinjal Shah");
    expect(textCount("Banking AI Test Project")).toBe(0);
    expect(textCount("Gracy Payments Portal")).toBe(0);
    expect(document.body.textContent).not.toContain("Gracy");
    expect(screen.getByLabelText("Notifications").textContent).toBe(""); // no unread badge

    await expectAbsent("/projects", "Banking AI Test Project");
    await expectAbsent("/test-cases", "Login with valid credentials");
    await expectAbsent("/execution", "DEF-001");
    await expectAbsent("/reports", "Secure User Authentication");
    await visit("/settings");
    await waitFor(() => expect(document.querySelectorAll("button[aria-pressed]").length).toBeGreaterThan(0));
    expect(document.querySelectorAll("button[aria-pressed]")[0].getAttribute("aria-pressed")).toBe("true"); // defaults, not Gracy's
    await visit("/profile");
    await waitFor(() => expect(document.querySelector('input[name="name"]')).not.toBeNull());
    expect(document.querySelector('input[name="name"]').value).toBe("Kinjal Shah");
    expect(document.querySelector('input[name="email"]').value).toBe("kinjal@example.com");
    expect(document.querySelector('input[name="role"]').value).toBe("");
    expect(document.querySelector('textarea[name="bio"]').value).toBe("");
    expect(document.body.textContent).not.toContain("Gracy");

    /* 4. Kinjal creates a project -> it is hers alone */
    await visit("/new-project");
    await waitFor(() => expect(document.querySelector("form")).not.toBeNull());
    const [nameInput, titleInput] = document.querySelectorAll("form input");
    fireEvent.change(nameInput, { target: { value: "Kinjal Test Project" } });
    fireEvent.change(titleInput, { target: { value: "Kinjal requirement" } });
    fireEvent.change(document.querySelector("form textarea"), { target: { value: "Kinjal description" } });
    fireEvent.submit(document.querySelector("form"));
    await waitFor(() => expect(window.location.pathname).toBe("/dashboard"));
    await waitFor(() => expect(textCount("Kinjal Test Project")).toBeGreaterThan(0));
    expect(textCount("Banking AI Test Project")).toBe(0);

    // Kinjal changes her own settings + profile + sends a support request
    await visit("/settings");
    await waitFor(() => expect(document.querySelectorAll("button[aria-pressed]").length).toBeGreaterThan(0));
    fireEvent.click(document.querySelectorAll("button[aria-pressed]")[0]);
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await visit("/profile");
    await waitFor(() => expect(document.querySelector('input[name="role"]')).not.toBeNull());
    fireEvent.change(document.querySelector('input[name="role"]'), { target: { value: "QA Lead" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
    await visit("/help-support");
    await waitFor(() => expect(document.querySelector("form")).not.toBeNull());
    fireEvent.change(document.querySelector("form input"), { target: { value: "kinjal@example.com" } });
    fireEvent.change(document.querySelector("form textarea"), { target: { value: "Kinjal needs help" } });
    fireEvent.submit(document.querySelector("form"));

    /* storage-level proof: Kinjal's data is in her namespace only */
    const kinjalKey = (name) => { localStorage.setItem("spec2test-auth-user", JSON.stringify(KINJAL)); return getUserStorageKey(name); };
    const kinjalProjects = JSON.parse(localStorage.getItem(kinjalKey("projects")));
    expect(kinjalProjects.map((p) => p.projectName)).toEqual(["Kinjal Test Project"]);
    expect(JSON.parse(localStorage.getItem(kinjalKey("profile"))).role).toBe("QA Lead");
    expect(JSON.parse(localStorage.getItem(kinjalKey("settings"))).notifications).toBe(false);
    expect(JSON.parse(localStorage.getItem(kinjalKey("support")))[0].message).toBe("Kinjal needs help");

    /* 5. Kinjal logs out; Gracy logs back in -> original data restored, nothing of Kinjal's */
    await logOut();
    await logIn(GRACY);
    await expectOnPage("/dashboard", "Banking AI Test Project");
    expect(textCount("Gracy Payments Portal")).toBeGreaterThan(0);
    expect(textCount("Kinjal Test Project")).toBe(0);
    expect(document.querySelector(".dash-name").textContent).toBe("Gracy Verma");
    await expectOnPage("/test-cases", "Login with valid credentials");
    await expectOnPage("/execution", "DEF-001");
    await expectOnPage("/reports", "Secure User Authentication"); // Reports lists projects by requirement title
    await visit("/settings");
    await waitFor(() => expect(document.querySelectorAll("button[aria-pressed]").length).toBeGreaterThan(0));
    expect(document.querySelectorAll("button[aria-pressed]")[0].getAttribute("aria-pressed")).toBe("false"); // still hers
    await visit("/profile");
    await waitFor(() => expect(document.querySelector('input[name="role"]')).not.toBeNull());
    expect(document.querySelector('input[name="role"]').value).toBe("AI Engineer"); // not Kinjal's "QA Lead"
    await expectAbsent("/projects", "Kinjal Test Project", "Gracy Payments Portal");

    /* 6. Gracy's stored data is exactly her original data; legacy keys were never touched */
    localStorage.setItem("spec2test-auth-user", JSON.stringify(GRACY));
    const gracyProjects = JSON.parse(localStorage.getItem(getUserStorageKey("projects")));
    expect(gracyProjects).toEqual(GRACY_PROJECTS);
    expect(snapshotLegacy()).toEqual(legacyBefore);
  }, 60000);

  it("switches accounts WITHOUT a page reload: a mounted page never keeps the old account's data", async () => {
    seedLegacy();
    localStorage.setItem("spec2test-users", JSON.stringify([GRACY, KINJAL]));
    render(<App />);
    await logIn(GRACY);
    await expectOnPage("/projects", "Gracy Payments Portal");

    // account changes in the background (another tab / session switch) while /projects is open
    act(() => {
      localStorage.setItem("spec2test-auth-user", JSON.stringify({ name: KINJAL.name, email: KINJAL.email }));
      window.dispatchEvent(new Event("spec2test-auth-updated"));
    });
    await waitFor(() => expect(textCount("Gracy Payments Portal")).toBe(0));
    expect(textCount("Banking AI Test Project")).toBe(0);

    // ...and a cross-tab "storage" event does the same in the other direction
    act(() => {
      localStorage.setItem("spec2test-auth-user", JSON.stringify({ name: GRACY.name, email: GRACY.email }));
      window.dispatchEvent(new StorageEvent("storage", { key: "spec2test-auth-user" }));
    });
    await waitFor(() => expect(textCount("Gracy Payments Portal")).toBeGreaterThan(0));
  }, 30000);

  it("closes every app page to logged-out visitors", async () => {
    seedLegacy();
    render(<App />);
    for (const path of ["/dashboard", "/projects", "/project/1001", "/new-project", "/test-cases", "/execution", "/reports", "/profile", "/settings", "/help-support"]) {
      await visit(path);
      await waitFor(() => expect(window.location.pathname).toBe("/"));
      expect(textCount("Banking AI Test Project")).toBe(0);
    }
  }, 30000);

  it("does not let router history state show another account's project", async () => {
    seedLegacy();
    localStorage.setItem("spec2test-users", JSON.stringify([GRACY, KINJAL]));
    render(<App />);
    await signUp({ name: "New Person", email: "new@example.com", password: "secret1" });

    // a history entry that still carries Gracy's project in its state (e.g. via the Back button)
    await act(async () => {
      window.history.pushState({ usr: { project: GRACY_PROJECTS[0] }, key: "abc", idx: 5 }, "", "/project/1001");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await waitFor(() => expect(textCount("Project not found")).toBeGreaterThan(0));
    expect(textCount("Banking AI Test Project")).toBe(0);
    expect(textCount("Secure User Authentication")).toBe(0);
  }, 30000);

  it("gives Kinjal a clean account even if she signs up BEFORE Gracy ever logs in", async () => {
    seedLegacy({ withGracyAccount: false });
    localStorage.setItem("spec2test-users", JSON.stringify([GRACY]));
    render(<App />);
    await signUp(KINJAL);
    await visit("/dashboard");
    await waitFor(() => expect(document.querySelector(".dash-name")).not.toBeNull());
    expect(textCount("Banking AI Test Project")).toBe(0);
    await logOut();
    await logIn(GRACY);
    await expectOnPage("/dashboard", "Banking AI Test Project");
  }, 30000);
});
