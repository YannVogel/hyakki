#!/usr/bin/env bash
# Captures des fiches stores (#46) : iPhone 6,9 pouces (App Store) et téléphone Android (Google Play),
# sur l'état vitrine du hub de développement. Voir docs/store/fiche.md.
#
# Prérequis : Metro lancé (npx expo start), development build iOS construit (npm run ios) et build
# Android installé sur un émulateur démarré (npm run android), Maestro dans le PATH.
# Usage : scripts/store-captures.sh [ios|android|all]   (all par défaut)
set -euo pipefail

TARGET="${1:-all}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/store-captures"
FLOW="$ROOT/e2e/store/captures.yaml"
IOS_DEVICE="iPhone 17" # 6,3 pouces : 1206 × 2622, la taille de base d'App Store Connect
export MAESTRO_CLI_NO_ANALYTICS=1

run_flow() { # device, output folder; keeps the screenshots already taken if the flow fails
  local work status=0
  work="$(mktemp -d)"
  maestro --device "$1" test --test-output-dir "$work" "$FLOW" || status=$?
  mkdir -p "$2"
  find "$work" -path '*takeScreenshot*' -name '*.png' -exec cp {} "$2/" \;
  rm -rf "$work"
  return "$status"
}

capture_ios() {
  local udid app
  udid="$(xcrun simctl list devices available | grep "$IOS_DEVICE (" | head -1 | sed -E 's/.*\(([0-9A-F-]{36})\).*/\1/')"
  if [ -z "$udid" ]; then
    udid="$(xcrun simctl create "$IOS_DEVICE" "com.apple.CoreSimulator.SimDeviceType.iPhone-17")"
  fi
  xcrun simctl boot "$udid" 2>/dev/null || true
  xcrun simctl bootstatus "$udid" -b >/dev/null
  app="$(ls -dt "$HOME"/Library/Developer/Xcode/DerivedData/Hyakki-*/Build/Products/Debug-iphonesimulator/Hyakki.app | head -1)"
  xcrun simctl install "$udid" "$app"
  xcrun simctl status_bar "$udid" override --time 9:41 --dataNetwork wifi --wifiBars 3 \
    --cellularMode active --cellularBars 4 --batteryState charged --batteryLevel 100
  local status=0
  run_flow "$udid" "$OUT/ios" || status=$?
  xcrun simctl status_bar "$udid" clear
  return "$status"
}

capture_android() {
  local serial status=0
  serial="$(adb devices | awk 'NR > 1 && $2 == "device" { print $1; exit }')"
  adb -s "$serial" reverse tcp:8081 tcp:8081 >/dev/null
  demo() { adb -s "$serial" shell am broadcast -a com.android.systemui.demo -e command "$@" >/dev/null; }
  adb -s "$serial" shell settings put global sysui_demo_allowed 1
  demo enter
  demo clock -e hhmm 0941
  demo battery -e level 100 -e plugged false
  demo network -e wifi show -e level 4 -e mobile show -e level 4
  demo notifications -e visible false
  run_flow "$serial" "$OUT/android" || status=$?
  demo exit
  # Google Play exige des captures en 9:16 : on retire la barre d'état et la barre de navigation
  # (24 dp chacune, recadrage centré : sips ignore --cropOffset), puis on ramène l'écran à la
  # hauteur 9:16 et on complète les côtés avec le crème de l'app.
  local bar cream
  bar=$((24 * $(adb -s "$serial" shell wm density | awk 'END { print $NF }' | tr -d '\r') / 160))
  cream="$(node -p "require('$ROOT/design/tokens.json').color.cream['\$value'].slice(1)")"
  for file in "$OUT"/android/*.png; do
    [ -e "$file" ] || continue
    local width height
    width="$(sips -g pixelWidth "$file" | awk '/pixelWidth/ { print $2 }')"
    height="$(sips -g pixelHeight "$file" | awk '/pixelHeight/ { print $2 }')"
    sips -c $((height - 2 * bar)) "$width" "$file" >/dev/null
    if [ $(((height - 2 * bar) * 9)) -gt $((width * 16)) ]; then
      sips --resampleHeight $((width * 16 / 9)) "$file" >/dev/null
      sips -p $((width * 16 / 9)) "$width" --padColor "$cream" "$file" >/dev/null
    fi
  done
  return "$status"
}

case "$TARGET" in
  ios) capture_ios ;;
  android) capture_android ;;
  all) capture_ios && capture_android ;;
  *) echo "Usage : $0 [ios|android|all]" >&2 && exit 1 ;;
esac
echo "Captures dans $OUT"
