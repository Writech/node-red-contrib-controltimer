#!/bin/bash

if ! command -v docker > /dev/null 2>&1; then
    cat >&2 <<'MSG'
Error: Docker is required but the "docker" command was not found.

Install Docker:
  - Windows/macOS: https://docs.docker.com/desktop/
                   (on WSL2 also enable Settings > Resources > WSL Integration for your distro)
  - Linux:         https://docs.docker.com/engine/install/

Then open a new terminal and verify with: docker ps
MSG
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
    echo 'Error: Docker is installed but the daemon is not running or not reachable. Start Docker and try again.' >&2
    exit 1
fi
