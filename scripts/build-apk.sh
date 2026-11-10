#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
: "${ANDROID_HOME:?Setze ANDROID_HOME auf ein Android SDK mit API 35 und Build Tools 35.0.0}"
SDK_TOOLS="$ANDROID_HOME/build-tools/35.0.0"
PLATFORM_JAR="$ANDROID_HOME/platforms/android-35/android.jar"
BUILD_DIR="$PWD/build/manual"
VERSION_FILE="$PWD/version.properties"
VERSION_CODE="$(sed -n 's/^VERSION_CODE=//p' "$VERSION_FILE" | head -n 1)"
VERSION_NAME="$(sed -n 's/^VERSION_NAME=//p' "$VERSION_FILE" | head -n 1)"
case "$VERSION_CODE" in ''|*[!0-9]*) echo 'VERSION_CODE muss eine positive Ganzzahl sein.' >&2; exit 1;; esac
case "$VERSION_NAME" in ''|*[!0-9A-Za-z._-]*) echo 'VERSION_NAME enthält ungültige Zeichen.' >&2; exit 1;; esac
export VERSION_CODE VERSION_NAME
mkdir -p "$BUILD_DIR/classes" "$BUILD_DIR/dex" "$PWD/dist"
python3 scripts/assemble.py
python3 - "$BUILD_DIR/AndroidManifest.xml" <<'PYCODE'
from pathlib import Path
import os
import sys
s=Path('app/src/main/AndroidManifest.xml').read_text().replace('<manifest ', f'<manifest package="de.stenopfad.app" android:versionCode="{os.environ["VERSION_CODE"]}" android:versionName="{os.environ["VERSION_NAME"]}" ',1)
Path(sys.argv[1]).write_text(s)
PYCODE
"$SDK_TOOLS/aapt2" compile --dir app/src/main/res -o "$BUILD_DIR/resources.zip"
"$SDK_TOOLS/aapt2" link -o "$BUILD_DIR/base.apk" --manifest "$BUILD_DIR/AndroidManifest.xml" -I "$PLATFORM_JAR" -A app/src/main/assets "$BUILD_DIR/resources.zip" --min-sdk-version 26 --target-sdk-version 35
if command -v javac >/dev/null; then
 javac --release 8 -classpath "$PLATFORM_JAR" -d "$BUILD_DIR/classes" app/src/main/java/de/stenopfad/app/MainActivity.java
elif [ -n "${ECJ_JAR:-}" ]; then
 java -jar "$ECJ_JAR" -8 -warn:none -bootclasspath "$PLATFORM_JAR" -d "$BUILD_DIR/classes" app/src/main/java/de/stenopfad/app/MainActivity.java
else
 echo "JDK mit javac erforderlich (alternativ ECJ_JAR)." >&2; exit 1
fi
find "$BUILD_DIR/classes" -name '*.class' -print0 | xargs -0 "$SDK_TOOLS/d8" --lib "$PLATFORM_JAR" --min-api 26 --output "$BUILD_DIR/dex"
cp "$BUILD_DIR/base.apk" "$BUILD_DIR/unsigned.apk"
(cd "$BUILD_DIR/dex" && zip -q "$BUILD_DIR/unsigned.apk" classes.dex)
"$SDK_TOOLS/zipalign" -f -p 4 "$BUILD_DIR/unsigned.apk" "$BUILD_DIR/aligned.apk"
# Debug key is intentionally not stored in git. Releases provide a stable private key through environment variables.
KEYSTORE_PATH="${STENOPFAD_KEYSTORE:-$PWD/build/stenopfad-debug.keystore}"
KEYSTORE_PASSWORD="${STENOPFAD_KEYSTORE_PASSWORD:-android}"
KEY_ALIAS="${STENOPFAD_KEY_ALIAS:-androiddebugkey}"
KEY_PASSWORD="${STENOPFAD_KEY_PASSWORD:-$KEYSTORE_PASSWORD}"
if [ ! -f "$KEYSTORE_PATH" ]; then
 if [ -n "${STENOPFAD_KEYSTORE:-}" ]; then
  echo "Der angegebene Release-Schlüssel fehlt: $KEYSTORE_PATH" >&2; exit 1
 fi
 keytool -genkeypair -keystore "$KEYSTORE_PATH" -storepass "$KEYSTORE_PASSWORD" -keypass "$KEY_PASSWORD" -alias "$KEY_ALIAS" -dname 'CN=Stenopfad Debug,O=Development,C=DE' -keyalg RSA -keysize 2048 -validity 10000 >/dev/null 2>&1
fi
"$SDK_TOOLS/apksigner" sign --ks "$KEYSTORE_PATH" --ks-pass "pass:$KEYSTORE_PASSWORD" --key-pass "pass:$KEY_PASSWORD" --ks-key-alias "$KEY_ALIAS" --out dist/Stenopfad.apk "$BUILD_DIR/aligned.apk"
"$SDK_TOOLS/apksigner" verify --verbose dist/Stenopfad.apk
"$SDK_TOOLS/aapt2" dump badging dist/Stenopfad.apk | head -8
