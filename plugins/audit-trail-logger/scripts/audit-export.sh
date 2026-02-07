#!/bin/bash
# Audit Trail Logger - Export Audit Log
# Command to export audit log in various formats for compliance reporting

set -euo pipefail

# Validate CLAUDE_PLUGIN_ROOT
if [ -z "${CLAUDE_PLUGIN_ROOT:-}" ]; then
    echo "Error: CLAUDE_PLUGIN_ROOT not set" >&2
    exit 1
fi

# Ensure path is absolute
case "$CLAUDE_PLUGIN_ROOT" in
    /*) ;;
    *)  echo "Error: CLAUDE_PLUGIN_ROOT must be absolute path" >&2
        exit 1
        ;;
esac

AUDIT_DIR="${CLAUDE_PLUGIN_ROOT}/data"
AUDIT_LOG_FILE="${AUDIT_DIR}/audit.jsonl"
EXPORT_DIR="${AUDIT_DIR}/exports"

# Validate directory (path traversal prevention)
case "$AUDIT_DIR" in
    "${CLAUDE_PLUGIN_ROOT}/data"|"${CLAUDE_PLUGIN_ROOT}/data/"*) ;;
    *)  echo "Error: Invalid audit directory" >&2
        exit 1
        ;;
esac

case "$EXPORT_DIR" in
    "${CLAUDE_PLUGIN_ROOT}/data/exports"|"${CLAUDE_PLUGIN_ROOT}/data/exports/"*) ;;
    *)  echo "Error: Invalid export directory" >&2
        exit 1
        ;;
esac

# Check if log file exists
if [ ! -f "$AUDIT_LOG_FILE" ]; then
    echo "No audit log found to export."
    exit 0
fi

# Create export directory
if ! mkdir -p "$EXPORT_DIR"; then
    echo "Error: Failed to create export directory" >&2
    exit 1
fi

# Default export format
FORMAT="json"
COMPRESS=false

# Parse arguments
while [ $# -gt 0 ]; do
    case "$1" in
        --format)
            FORMAT="$2"
            shift 2
            ;;
        --compress)
            COMPRESS=true
            shift
            ;;
        *)
            echo "Usage: $0 [--format json|csv|txt] [--compress]" >&2
            exit 1
            ;;
    esac
done

# Validate format
case "$FORMAT" in
    json|csv|txt) ;;
    *)
        echo "Error: Invalid format. Use json, csv, or txt" >&2
        exit 1
        ;;
esac

# Generate export filename with timestamp
timestamp=$(date -u +"%Y%m%d_%H%M%S")
export_file="${EXPORT_DIR}/audit_export_${timestamp}.${FORMAT}"

# Perform export
case "$FORMAT" in
    json)
        # Export as JSON array
        echo "[" > "$export_file"
        first=true
        while IFS= read -r line; do
            [ -z "$line" ] && continue
            if [ "$first" = true ]; then
                echo "  $line" >> "$export_file"
                first=false
            else
                echo ", $line" >> "$export_file"
            fi
        done < "$AUDIT_LOG_FILE"
        echo "]" >> "$export_file"
        ;;

    csv)
        # Export as CSV
        echo "timestamp,session_id,event_type,tool,target" > "$export_file"
        while IFS= read -r line; do
            [ -z "$line" ] && continue
            # Extract and escape CSV values
            ts=$(printf '%s' "$line" | sed -n 's/.*"timestamp":"\([^"]*\)".*/\1/p')
            sid=$(printf '%s' "$line" | sed -n 's/.*"session_id":"\([^"]*\)".*/\1/p')
            et=$(printf '%s' "$line" | sed -n 's/.*"event_type":"\([^"]*\)".*/\1/p')
            tl=$(printf '%s' "$line" | sed -n 's/.*"tool":"\([^"]*\)".*/\1/p')
            tgt=$(printf '%s' "$line" | sed -n 's/.*"target":"\([^"]*\)".*/\1/p')

            # Escape CSV values (quote if contains comma or quote)
            escape_csv() {
                local val="$1"
                if printf '%s' "$val" | grep -q '[,"]'; then
                    val=$(printf '%s' "$val" | sed 's/"/""/g')
                    echo "\"$val\""
                else
                    echo "$val"
                fi
            }

            ts=$(escape_csv "$ts")
            sid=$(escape_csv "$sid")
            et=$(escape_csv "$et")
            tl=$(escape_csv "$tl")
            tgt=$(escape_csv "$tgt")

            echo "$ts,$sid,$et,$tl,$tgt" >> "$export_file"
        done < "$AUDIT_LOG_FILE"
        ;;

    txt)
        # Export as formatted text
        {
            echo "==================================================================="
            echo "                    AUDIT TRAIL EXPORT"
            echo "==================================================================="
            echo "Exported: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
            echo "==================================================================="
            echo ""
            while IFS= read -r line; do
                [ -z "$line" ] && continue
                ts=$(printf '%s' "$line" | sed -n 's/.*"timestamp":"\([^"]*\)".*/\1/p')
                sid=$(printf '%s' "$line" | sed -n 's/.*"session_id":"\([^"]*\)".*/\1/p')
                et=$(printf '%s' "$line" | sed -n 's/.*"event_type":"\([^"]*\)".*/\1/p')
                tl=$(printf '%s' "$line" | sed -n 's/.*"tool":"\([^"]*\)".*/\1/p')
                tgt=$(printf '%s' "$line" | sed -n 's/.*"target":"\([^"]*\)".*/\1/p')

                echo "[$ts]"
                echo "  Session: $sid"
                echo "  Type: $et"
                echo "  Tool: $tl"
                echo "  Details: $tgt"
                echo "  ---"
            done < "$AUDIT_LOG_FILE"
        } > "$export_file"
        ;;
esac

# Compress if requested
if [ "$COMPRESS" = true ]; then
    if command -v gzip >/dev/null 2>&1; then
        if ! gzip -c "$export_file" > "${export_file}.gz"; then
            echo "Warning: Compression failed" >&2
        else
            export_file="${export_file}.gz"
        fi
    else
        echo "Warning: gzip not found, skipping compression" >&2
    fi
fi

# Set restrictive permissions
chmod 600 "$export_file" 2>/dev/null || true

echo "Audit log exported to: $export_file"
exit 0
