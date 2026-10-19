# Quartermaster releases

Installers for **Quartermaster**, one app per OS. The source lives in a private repo. This repo
only holds the release builds and the updater manifest (`latest.json`) that installed apps check.
Nothing is committed here by hand: CI publishes each release.

## Install

Download the file for your OS from the [latest release](../../releases/latest):

| OS | File |
|---|---|
| macOS (Apple silicon / Intel) | `Quartermaster_<version>_aarch64.dmg` / `_x64.dmg` |
| Windows | `Quartermaster_<version>_x64-setup.exe`: per-user, no admin needed |
| Linux | `Quartermaster_<version>_amd64.AppImage` (updates itself), or the `.deb` / `.rpm` |

- **macOS:** open the `.dmg` and drag Quartermaster to Applications. The build isn't notarized, so
  the first launch needs right-click → **Open** → Open. Updates install without that.
- **Windows:** SmartScreen may warn on the first run: **More info → Run anyway**.
- **Linux:** `chmod +x Quartermaster_*.AppImage` and run it.

Quartermaster updates itself from here. Every update is signed, and the app refuses one that isn't.
