#!/bin/sh
# Bygger style.css fra tailwind.css med Tailwinds frittstående program (ingen Node/npm).
# Programmet deles med «Trykk pause» og ligger i INN527/.verktoy/ (publiseres ikke).
# Første gang lastes det ned.
#
#   ./bygg-css.sh          bygg én gang
#   ./bygg-css.sh --watch  bygg på nytt automatisk hver gang du lagrer en fil

set -e
cd "$(dirname "$0")"

VERSJON="v4.3.3"
PROGRAM="../.verktoy/tailwindcss-$VERSJON"

if [ ! -x "$PROGRAM" ]; then
  case "$(uname -s)-$(uname -m)" in
    Darwin-arm64)  FIL="tailwindcss-macos-arm64" ;;
    Darwin-x86_64) FIL="tailwindcss-macos-x64" ;;
    Linux-aarch64) FIL="tailwindcss-linux-arm64" ;;
    Linux-x86_64)  FIL="tailwindcss-linux-x64" ;;
    *) echo "Ukjent maskin: $(uname -s)-$(uname -m). Se README.md."; exit 1 ;;
  esac
  echo "Laster ned Tailwind $VERSJON (bare første gang) ..."
  mkdir -p ../.verktoy
  curl -fsSL -o "$PROGRAM" "https://github.com/tailwindlabs/tailwindcss/releases/download/$VERSJON/$FIL"
  chmod +x "$PROGRAM"
fi

"$PROGRAM" --input tailwind.css --output style.css --minify "$@"
