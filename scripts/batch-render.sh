#!/bin/bash
# Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
# SPDX-License-Identifier: MIT
# id: er-be2c9690
# Editor Pro Max - Batch Render
# Renders a composition for multiple platforms at once
#
# Usage: ./scripts/batch-render.sh <composition-id> [platforms...]
#
# Examples:
#   ./scripts/batch-render.sh TikTok tiktok instagram_reel youtube_short
#   ./scripts/batch-render.sh Announcement youtube tiktok twitter

COMP_ID=${1:-"Showcase"}
shift
PLATFORMS=${@:-"youtube tiktok square"}

OUTPUT_DIR="out"
mkdir -p "$OUTPUT_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=== Batch Render: ${COMP_ID} ==="
echo "Platforms: ${PLATFORMS}"
echo ""

for PLATFORM in $PLATFORMS; do
  case $PLATFORM in
    tiktok|instagram_reel|instagram_story|youtube_short)
      WIDTH=1080; HEIGHT=1920 ;;
    instagram_post|twitter|facebook|square)
      WIDTH=1080; HEIGHT=1080 ;;
    youtube|linkedin|landscape)
      WIDTH=1920; HEIGHT=1080 ;;
    *)
      echo "Unknown platform: ${PLATFORM}, skipping..."
      continue ;;
  esac

  OUTPUT_FILE="${OUTPUT_DIR}/${COMP_ID}_${PLATFORM}_${TIMESTAMP}.mp4"
  echo "--- Rendering for ${PLATFORM} (${WIDTH}x${HEIGHT}) ---"
  npx remotion render "${COMP_ID}" "${OUTPUT_FILE}" --width ${WIDTH} --height ${HEIGHT}
  echo "Output: ${OUTPUT_FILE}"
  echo ""
done

echo "=== Batch render complete ==="
