#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
: "${ANDROID_HOME:?Setze ANDROID_HOME auf ein Android SDK mit API 35 und Build Tools 35.0.0}"
SDK_TOOLS="$ANDROID_HOME/build-tools/35.0.0"
PLATFORM_JAR="$ANDROID_HOME/platforms/android-35/android.jar"
BUILD_DIR="$PWD/build/manual"
mkdir -p "$BUILD_DIR/classes" "$BUILD_DIR/dex" "$PWD/dist"
python3 scripts/assemble.py
python3 - "$BUILD_DIR/AndroidManifest.xml" <<'PYCODE'
from pathlib import Path
import sys
s=Path('app/src/main/AndroidManifest.xml').read_text().replace('<manifest ', '<manifest package="de.stenopfad.app" android:versionCode="1" android:versionName="0.1.0" ',1)
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
# Debug key is intentionally not stored in git. Use a stable private release key for updates.
KEYSTORE_PATH="${STENOPFAD_KEYSTORE:-$PWD/build/stenopfad-debug.keystore}"
if [ ! -f "$KEYSTORE_PATH" ]; then
 keytool -genkeypair -keystore "$KEYSTORE_PATH" -storepass android -keypass android -alias androiddebugkey -dname 'CN=Stenopfad Debug,O=Development,C=DE' -keyalg RSA -keysize 2048 -validity 10000 >/dev/null 2>&1
fi
"$SDK_TOOLS/apksigner" sign --ks "$KEYSTORE_PATH" --ks-pass pass:android --key-pass pass:android --ks-key-alias androiddebugkey --out dist/Stenopfad.apk "$BUILD_DIR/aligned.apk"
"$SDK_TOOLS/apksigner" verify --verbose dist/Stenopfad.apk
"$SDK_TOOLS/aapt2" dump badging dist/Stenopfad.apk | head -8
