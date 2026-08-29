#!/usr/bin/env bash
set -euo pipefail

# Repository bootstrap for Cloud Agents.
# Installs the pinned Bun toolchain (idempotently) and project dependencies.

BUN_VERSION="1.4.0"
export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"

install_bun() {
  echo "Installing Bun v${BUN_VERSION}..."
  curl -fsSL https://bun.sh/install | bash -s "bun-v${BUN_VERSION}"
}

if [ ! -x "$BUN_INSTALL/bin/bun" ]; then
  install_bun
elif [ "$("$BUN_INSTALL/bin/bun" --version 2>/dev/null)" != "$BUN_VERSION" ]; then
  install_bun
else
  echo "Bun v${BUN_VERSION} already installed."
fi

# Expose bun/bunx on a stable PATH for install, start, terminals, and agent shells.
sudo ln -sf "$BUN_INSTALL/bin/bun" /usr/local/bin/bun
sudo ln -sf "$BUN_INSTALL/bin/bunx" /usr/local/bin/bunx

bun --version

# Install project dependencies against the committed lockfile.
bun install --frozen-lockfile
