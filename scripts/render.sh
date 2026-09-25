#!/bin/bash
# Editor Pro Max - Render Helper
# Usage: ./scripts/render.sh <composition-id> [platform]
#
# Examples:
#   ./scripts/render.sh Showcase
#   ./scripts/render.sh TikTok tiktok
#   ./scripts/render.sh Presentation youtube

COMP_ID=${1:-"Showcase"}
PLATFORM=${2:-"default"}

case $PLATFORM in
  tiktok|instagram_reel|instagram_story|youtube_short)
    WIDTH=1080
    HEIGHT=1920
    ;;
  instagram_post|twitter|facebook|square)
    WIDTH=1080
    HEIGHT=1080
    ;;
  youtube|linkedin|landscape)
    WIDTH=1920
    HEIGHT=1080
    ;;
  cinematic)
    WIDTH=1920
    HEIGHT=800
    ;;
  *)
    WIDTH=""
    HEIGHT=""
    ;;
esac

OUTPUT_DIR="out"
mkdir -p "$OUTPUT_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="${OUTPUT_DIR}/${COMP_ID}_${PLATFORM}_${TIMESTAMP}.mp4"

echo "Rendering: ${COMP_ID}"
echo "Platform: ${PLATFORM}"
echo "Output: ${OUTPUT_FILE}"
echo ""

CMD=(npx remotion render "${COMP_ID}" "${OUTPUT_FILE}")

if [ -n "$WIDTH" ]; then
  CMD+=(--width "${WIDTH}" --height "${HEIGHT}")
fi

# A bash array + direct invocation (no eval) means each argument is passed
# through exactly once and never re-parsed by a shell — a COMP_ID like
# `Showcase; rm -rf ~` stays a single literal argument instead of being
# able to inject and run a second command.
echo "Running: ${CMD[@]}"
"${CMD[@]}"

echo ""
echo "Done! Output: ${OUTPUT_FILE}"
