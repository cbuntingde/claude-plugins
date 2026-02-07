#!/usr/bin/env bash
#
# Agent Swarm Command
#
# Launches multiple parallel AI agents for code analysis.
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node "$SCRIPT_DIR/run-agent-swarm.js" "$@"
