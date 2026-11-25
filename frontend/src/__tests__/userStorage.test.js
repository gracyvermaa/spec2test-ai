import { describe, it, expect, beforeEach } from "vitest";
import {
  userStorage,
  getUserStorageKey,
  getUserStoragePrefix,
  ensureLegacyMigration,
} from "../utils/userStorage";
import { GRACY, KINJAL, GRACY_PROJECTS, seedLegacy, snapshotLegacy } from "../test/fixtures";

const signIn = (user) =>
  localStorage.setItem("spec2test-auth-user", JSON.stringify({ name: user.name, email: user.email }));
const signOut = () => localStorage.removeItem("spec2test-auth-user");

describe("per-account key scoping", () => {
  beforeEach(() => localStorage.clear());

  it("keeps two accounts' data completely separate", () => {
    signIn(GRACY);
    userStorage.setItem("spec2test_projects", JSON.stringify([{ id: 1 }]));
    signIn(KINJAL);
    expect(userStorage.getItem("spec2test_projects")).toBeNull();
    userStorage.setItem("spec2test_projects", JSON.stringify([{ id: 2 }]));
    expect(JSON.parse(userStorage.getItem("spec2test_projects"))).toEqual([{ id: 2 }]);
    signIn(GRACY);
    expect(JSON.parse(userStorage.getItem("spec2test_projects"))).toEqual([{ id: 1 }]);
  });

  it("never reads or writes anything when nobody is signed in (no guest bucket)", () => {
    localStorage.setItem("spec2test_projects", JSON.stringify([{ id: 99 }]));
    signOut();
    expect(userStorage.getItem("spec2test_projects")).toBeNull();
    userStorage.setItem("spec2test_projects", "[1]");
    expect(Object.keys(localStorage).some((key) => key.startsWith("spec2test_guest_"))).toBe(false);
    expect(localStorage.getItem("spec2test_projects")).toBe(JSON.stringify([{ id: 99 }]));
  });

  it("gives e-mails that differ only by punctuation different key prefixes", () => {
    signIn({ name: "A", email: "a.b@example.com" });
    const dot = getUserStoragePrefix();
    signIn({ name: "B", email: "a_b@example.com" });
    const underscore = getUserStoragePrefix();
    signIn({ name: "C", email: "ab@example.com" });
    const plain = getUserStoragePrefix();
    expect(new Set([dot, underscore, plain]).size).toBe(3);
  });

  it("treats e-mail case and whitespace the same", () => {
    signIn({ name: "G", email: "  GracyVerma962@Gmail.com " });
    userStorage.setItem("spec2test_defects", "[1]");
    signIn(GRACY);
    expect(userStorage.getItem("spec2test_defects")).toBe("[1]");
  });

  it("scopes spec2test_ and spec2test- keys to the same readable name", () => {
    signIn(KINJAL);
    userStorage.setItem("spec2test-settings", "{}");
    expect(localStorage.getItem(getUserStorageKey("settings"))).toBe("{}");
  });
});

describe("legacy data migration", () => {
  beforeEach(() => localStorage.clear());

  it("copies ALL legacy keys (incl. profile, settings, support, notifications, statuses) to the legacy owner", () => {
    seedLegacy();
    signIn(GRACY);
    expect(JSON.parse(userStorage.getItem("spec2test_projects"))).toEqual(GRACY_PROJECTS);
    expect(JSON.parse(userStorage.getItem("spec2test_status_1001"))).toEqual({ TC001: "Passed", TC002: "Failed" });
    expect(JSON.parse(userStorage.getItem("spec2test_execution_runs"))).toHaveLength(1);
    expect(JSON.parse(userStorage.getItem("spec2test_defects"))[0].id).toBe("DEF-001");
    expect(JSON.parse(userStorage.getItem("spec2test_expanded_defects"))).toEqual(["DEF-001"]);
    expect(JSON.parse(userStorage.getItem("spec2test_read_notifications"))).toEqual(["project-1001"]);
    expect(JSON.parse(userStorage.getItem("spec2test-profile")).role).toBe("AI Engineer");
    expect(JSON.parse(userStorage.getItem("spec2test-settings")).compactView).toBe(true);
    expect(JSON.parse(userStorage.getItem("spec2test-support"))).toHaveLength(1);
  });

  it("never gives legacy data to any other account", () => {
    seedLegacy();
    signIn(KINJAL);
    ["spec2test_projects", "spec2test_defects", "spec2test-profile", "spec2test-settings", "spec2test_status_1001"].forEach(
      (key) => expect(userStorage.getItem(key)).toBeNull()
    );
  });

  it("does not hand the data to Kinjal even if she signs in first, and Gracy still gets it later", () => {
    seedLegacy();
    signIn(KINJAL);
    userStorage.getItem("spec2test_projects");
    signIn(GRACY);
    expect(JSON.parse(userStorage.getItem("spec2test_projects"))).toHaveLength(2);
  });

  it("never modifies or deletes the legacy global keys", () => {
    seedLegacy();
    const before = snapshotLegacy();
    signIn(GRACY);
    userStorage.getItem("spec2test_projects");
    userStorage.setItem("spec2test_projects", "[]");
    userStorage.removeItem("spec2test_defects");
    expect(snapshotLegacy()).toEqual(before);
  });

  it("is idempotent: runs once and does not overwrite later edits", () => {
    seedLegacy();
    signIn(GRACY);
    userStorage.getItem("spec2test_projects");
    userStorage.setItem("spec2test_projects", JSON.stringify([{ id: 5, projectName: "Edited" }]));
    ensureLegacyMigration(GRACY);
    expect(JSON.parse(userStorage.getItem("spec2test_projects"))).toEqual([{ id: 5, projectName: "Edited" }]);
  });

  it("merges data from the earlier helper's key scheme without losing anything", () => {
    seedLegacy();
    // The previous version of the helper copied a snapshot under this prefix.
    localStorage.setItem(
      "spec2test_user_gracyverma962_gmail_com_projects",
      JSON.stringify([{ id: 777, projectName: "Only in old scheme" }, GRACY_PROJECTS[0]])
    );
    signIn(GRACY);
    const ids = JSON.parse(userStorage.getItem("spec2test_projects")).map((p) => p.id).sort((a, b) => a - b);
    expect(ids).toEqual([777, 1001, 1002]);
  });

  it("keeps the profile Gracy always saw when she never saved one", () => {
    localStorage.setItem("spec2test_projects", JSON.stringify(GRACY_PROJECTS));
    signIn(GRACY);
    const profile = JSON.parse(userStorage.getItem("spec2test-profile"));
    expect(profile).toMatchObject({ name: "Gracy Verma", role: "AI Engineer" });
  });
});
