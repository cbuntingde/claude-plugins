#!/bin/bash
# Check if performance baseline exists

if [ -f .claude/performance-baseline.json ]; then
    echo "Performance baseline detected"
else
    echo "No performance baseline found"
fi