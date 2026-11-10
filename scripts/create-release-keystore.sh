#!/usr/bin/env bash
set -euo pipefail

OUTPUT="${1:-stenopfad-release.p12}"
ALIAS="${2:-stenopfad}"

command -v keytool >/dev/null || { echo 'JDK mit keytool erforderlich.' >&2; exit 1; }
[ ! -e "$OUTPUT" ] || { echo "Datei existiert bereits: $OUTPUT" >&2; exit 1; }

read -r -s -p 'Passwort für den neuen Signaturschlüssel: ' password
echo
[ "${#password}" -ge 12 ] || { echo 'Bitte mindestens 12 Zeichen verwenden.' >&2; exit 1; }
read -r -s -p 'Passwort wiederholen: ' confirmation
echo
[ "$password" = "$confirmation" ] || { echo 'Passwörter stimmen nicht überein.' >&2; exit 1; }

keytool -genkeypair -storetype PKCS12 -keystore "$OUTPUT" -storepass "$password" -keypass "$password" -alias "$ALIAS" -dname 'CN=Stenopfad,O=Personal,C=DE' -keyalg RSA -keysize 4096 -validity 10000
echo "Signaturschlüssel erstellt: $OUTPUT"
echo 'Diese Datei und ihr Passwort sicher und getrennt sichern. Sie werden für jedes App-Update benötigt.'
