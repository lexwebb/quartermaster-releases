// Turns the releases repo's latest GitHub release into download links. Plain ES module: the page
// imports it in the browser and test/release.test.js imports it under node — no build step.

export const RELEASES_REPO = "lexwebb/quartermaster-releases";
export const LATEST_API = `https://api.github.com/repos/${RELEASES_REPO}/releases/latest`;
export const RELEASES_PAGE = `https://github.com/${RELEASES_REPO}/releases`;

/** @typedef {"mac" | "windows" | "linux"} Os */
/** @typedef {{ os: Os, label: string, rank: number }} Kind */

/**
 * What an installer is, from its file name (`Quartermaster_<version>_<arch>.<ext>`). Updater
 * payloads (`.app.tar.gz`, `.sig`, `latest.json`) aren't for people, so they return null.
 * `rank` orders the files within an OS; the lowest is the one the big button offers.
 * @param {string} name
 * @returns {Kind | null}
 */
export function classify(name) {
  const n = name.toLowerCase();
  if (n.endsWith(".sig") || n.endsWith(".tar.gz") || n.endsWith(".json")) return null;
  if (n.endsWith(".dmg")) {
    return /aarch64|arm64/.test(n)
      ? { os: "mac", label: "macOS · Apple silicon", rank: 0 }
      : { os: "mac", label: "macOS · Intel", rank: 1 };
  }
  if (n.endsWith("-setup.exe")) return { os: "windows", label: "Windows · installer", rank: 0 };
  if (n.endsWith(".msi")) return { os: "windows", label: "Windows · MSI", rank: 1 };
  if (n.endsWith(".appimage")) return { os: "linux", label: "Linux · AppImage", rank: 0 };
  if (n.endsWith(".deb")) return { os: "linux", label: "Linux · .deb", rank: 1 };
  if (n.endsWith(".rpm")) return { os: "linux", label: "Linux · .rpm", rank: 2 };
  return null;
}

/**
 * The visitor's OS, from what the browser reports. Null for phones and anything unrecognised;
 * the page then shows every file with no preferred one.
 * @param {{ userAgent?: string, platform?: string, userAgentData?: { platform?: string } }} nav
 * @returns {Os | null}
 */
export function detectOs(nav) {
  const ua = nav.userAgent ?? "";
  if (/android|iphone|ipad|ipod/i.test(ua)) return null;
  const p = `${nav.userAgentData?.platform ?? ""} ${nav.platform ?? ""} ${ua}`.toLowerCase();
  if (p.includes("mac")) return "mac";
  if (p.includes("win")) return "windows";
  if (p.includes("linux") || p.includes("x11")) return "linux";
  return null;
}

/**
 * @typedef {{ name: string, browser_download_url: string, size: number }} Asset
 * @typedef {{ tag_name: string, published_at?: string | null, html_url: string, assets: Asset[] }} Release
 * @typedef {Kind & { name: string, url: string, size: number }} Download
 */

/**
 * Every installer in a release, grouped by OS in mac → windows → linux order, best first.
 * @param {Release} release
 * @returns {Download[]}
 */
export function downloads(release) {
  const order = { mac: 0, windows: 1, linux: 2 };
  /** @type {Download[]} */
  const out = [];
  for (const a of release.assets ?? []) {
    const kind = classify(a.name);
    if (kind) out.push({ ...kind, name: a.name, url: a.browser_download_url, size: a.size });
  }
  return out.sort((x, y) => order[x.os] - order[y.os] || x.rank - y.rank);
}

/**
 * The file the big button offers: the best installer for the visitor's OS, if there is one.
 * @param {Download[]} files
 * @param {Os | null} os
 */
export function primary(files, os) {
  return os ? files.find((f) => f.os === os) ?? null : null;
}

/** @param {number} bytes */
export function formatSize(bytes) {
  return bytes >= 1e9 ? `${(bytes / 1e9).toFixed(1)} GB` : `${Math.max(1, Math.round(bytes / 1e6))} MB`;
}
