# Stenopfad

Eine erste Android-App zum täglichen Lernen der Deutschen Einheitskurzschrift (DEK), Verkehrsschrift nach der Wiener Urkunde von 1968. Ohne Konto, Werbung, Server und Internetberechtigung.

## Start auf Android

1. `Stenopfad.apk` auf das Smartphone laden und öffnen.
2. Falls Android danach fragt, dieser Download-App die Installation dieser Datei erlauben.
3. Stenopfad öffnen, 3, 7 oder 15 Minuten auswählen und mit der ersten Einheit beginnen.

Android 8.0 oder neuer und eine aktuelle Version von Android System WebView werden benötigt. Die APK ist keine Play-Store-Veröffentlichung. Für fortlaufende Aktualisierungen dient ein signierter GitHub-Release zusammen mit Obtainium als Update-Kanal (siehe unten). Ein Start auf einem echten Android-Gerät wurde hier noch nicht geprüft.

## Was enthalten ist

- 26 aufeinander aufbauende Einheiten mit 105 Originalvorlagen.
- Entdecken, mit Finger oder Stift nachzeichnen, Lesen mit Antwortauswahl und Schreiben aus dem Gedächtnis.
- Vorlagenvergleich und ausdrückliche Selbsteinschätzung beim Schreiben. Keine automatische Bewertung von Handschrift, Strichrichtung oder Stiftdruck.
- Automatisch fällige Wiederholungen mit 1, 3, 7, 14 und 30 Tagen Abstand. Fehlerhafte Formen bleiben sofort fällig.
- XP, Lerntage, Freischaltungen und lokaler Fortschritt. Eine kurze Sitzung behandelt einen Teil der Einheit; nichts muss in einer bestimmten Tagesdauer abgeschlossen werden.
- Unterbrochene Einheiten setzen bei der nächsten Aufgabe fort. Die aktuelle Zeichnung bleibt bewusst nur während der geöffneten Aufgabe erhalten.
- Freie Schreibfläche, drei kleine Lesesätze aus Wortkürzeln und eine durchsuchbare Sammlung mit pausierbaren Einzelübungen. Diese verfälschen weder Kursfortschritt noch Freischaltungen.
- Seiten 2–10 der amtlichen Verkehrsschrift als Offline-Referenz.
- Fortschritt über Textsicherung kopieren und mit Bestätigung wiederherstellen.

Das ist ein **Grundlagenkurs**, kein vollständiger Lehrgang bis zur sicheren DEK-Wortschrift. Die sinnbildliche Vokaldarstellung, Wortverbindungen, Sonderfälle und längere Diktate benötigen noch geführte Übungen. Das Nachschlagewerk allein ersetzt diese Übungen nicht. Die Selbstlautkarten zeigen ausdrücklich die buchstäblichen Formen, die bei fehlendem nachfolgendem Mitlaut verwendet werden. Sie sind kein alphabetischer Wortkonverter.

Den täglichen Ablauf und die Lernziele findest du in [docs/LERNPLAN.md](docs/LERNPLAN.md). Der Umsetzungsplan und weitere Schritte stehen in [docs/PLAN.md](docs/PLAN.md). Die Quellenhierarchie und alle externen Fundstellen dokumentiert [docs/QUELLEN.md](docs/QUELLEN.md).

## Fortschritt behalten

Unter **Fortschritt → Sicherung erstellen** die Sicherung kopieren und außerhalb der App speichern. Android speichert den Lernstand nur im privaten Speicher dieser Installation. Beim Deinstallieren geht dieser Speicher verloren. Die freien Schreibspuren werden nicht dauerhaft gespeichert.

Die Sicherung unterscheidet gelernte Formen von bereits **eingeführten** Formen: Letztere wurden in einer abgeschlossenen Aufgabe bereits bewertet oder falsch beantwortet und dürfen deshalb sofort wiederholt werden, ohne den Lernpfad freizuschalten. Sicherungen des früheren Formats werden beim Laden automatisch in dieses Format überführt; unbekannte oder widersprüchliche Einträge weist die App ab.

Eine pausierte Einheit ist ebenfalls Teil des lokalen Fortschritts und einer erstellten Sicherung. Beim Fortsetzen beginnt die offene Aufgabe erneut; unfertige Schreibspuren werden aus Datenschutz- und Speichergründen nicht gesichert.

Für neue APK-Versionen muss derselbe private Signaturschlüssel benutzt werden, damit Android ein Update akzeptiert. Der mitgelieferte Quellcode enthält keinen privaten Schlüssel. Falls eine frühere Test-APK installiert ist, kann sie nicht auf die erste regulär signierte Release-APK aktualisiert werden: zuerst die Sicherung kopieren, die Test-App einmalig deinstallieren, die Release-APK installieren und die Sicherung wiederherstellen.

## Quellcode und GitHub

Der vollständige Quellcode liegt unter [Hedtt/Stenno](https://github.com/Hedtt/Stenno). Kein Build-Verzeichnis und keinen privaten Signaturschlüssel hochladen.

Die Pipeline `.github/workflows/android.yml` führt die Tests aus und stellt auf `main` eine temporäre Test-APK als Actions-Artefakt bereit. Für einen Git-Tag `v<VERSION_NAME>` baut sie zusätzlich eine dauerhaft signierte APK und veröffentlicht sie als GitHub Release. Der Tag muss genau zur zentralen Android-Version in `version.properties` passen; für jedes weitere Update muss `VERSION_CODE` höher sein.

`npm test` prüft zusätzlich, dass Paketversion, Gradle-Konfiguration und Direkt-Build dieselbe Version aus `version.properties` verwenden.

### Update-Kanal einmalig einrichten

Der private Signaturschlüssel ist das entscheidende Element: dieselbe Schlüsseldatei und dasselbe Passwort werden für **jedes** zukünftige Android-Update benötigt. Niemals in Git hochladen, nicht per E-Mail versenden und getrennt von seinem Passwort sichern.

1. Auf einem vertrauenswürdigen Rechner mit JDK (etwa dem von Android Studio) in Git Bash einen Schlüssel anlegen:

   ```bash
   bash scripts/create-release-keystore.sh
   ```

   Das Skript fragt nach einem mindestens zwölf Zeichen langen Passwort und erzeugt `stenopfad-release.p12`. Diese Datei ist durch `.gitignore` geschützt, muss aber zusätzlich an einem sicheren Ort gesichert werden.

2. In PowerShell die Schlüsseldatei Base64-kodiert in die Zwischenablage kopieren:

   ```powershell
   [Convert]::ToBase64String([System.IO.File]::ReadAllBytes((Resolve-Path .\stenopfad-release.p12))) | Set-Clipboard
   ```

3. Im GitHub-Repository unter **Settings → Secrets and variables → Actions** diese vier Repository-Secrets anlegen:

   | Secret | Wert |
   | --- | --- |
   | `STENOPFAD_KEYSTORE_BASE64` | Inhalt der Zwischenablage aus Schritt 2 |
   | `STENOPFAD_KEYSTORE_PASSWORD` | das eben vergebene Passwort |
   | `STENOPFAD_KEY_ALIAS` | `stenopfad` (oder der beim Skript gewählte Alias) |
   | `STENOPFAD_KEY_PASSWORD` | dasselbe Passwort |

4. Erst danach den ersten Release-Tag passend zur aktuellen Version erstellen, zum Beispiel für `VERSION_NAME=0.3.0`:

   ```bash
   git tag v0.3.0
   git push origin v0.3.0
   ```

   GitHub baut daraus die signierte APK und legt sie unter **Releases** ab. Ein Tag ohne Secrets oder mit einer abweichenden Versionsnummer bricht bewusst ab, statt eine nicht aktualisierbare APK zu veröffentlichen.

5. Auf dem Smartphone [Obtainium](https://obtainium.imranr.dev/) installieren, eine App über **Add App** hinzufügen und als Quelle `https://github.com/Hedtt/Stenno` eintragen. Die erste Release-APK einmal installieren und in Android das Installieren aus Obtainium erlauben. Danach prüft Obtainium neue GitHub-Releases und benachrichtigt bzw. lädt sie; Android fragt für die eigentliche Installation normalerweise noch nach Bestätigung.

## Lokal entwickeln

```bash
npm ci
python3 scripts/assemble.py
npm test
```

`Stenopfad.html` ist eine eigenständige Offline-Browserversion zum Ausprobieren. Die Android-App verwendet denselben Inhalt in einer nativen WebView. Der Browser benötigt ebenfalls eine aktuelle Version; die Speicherbehandlung lokal geöffneter HTML-Dateien kann je nach Browser variieren. Für den täglichen Gebrauch ist die Android-App vorgesehen.

### APK bauen

JDK 17 oder 21, Python 3, `zip` sowie Android SDK Platform 35 und Build Tools 35.0.0 installieren. `ANDROID_HOME` muss auf das SDK zeigen.

```bash
bash scripts/build-apk.sh
```

Ergebnis: `dist/Stenopfad.apk`. Der Build nutzt Android SDK-Werkzeuge direkt. Alternativ kann das Gradle-Projekt mit Android Studio geöffnet werden; `python3 scripts/assemble.py` muss davor ausgeführt werden. Die Gradle-Konfiguration verwendet AGP 8.7.3; bei manueller Gradle-Nutzung ist Gradle 8.9 passend. Ein Gradle-Wrapper ist noch nicht enthalten. Die hier ausgelieferte APK wurde über den direkten SDK-Build erstellt.

Für Umgebungen ohne `javac` unterstützt der direkte Build alternativ eine über `ECJ_JAR` angegebene Eclipse-JDT-Compilerdatei. Für lokale Release-Builds akzeptiert das Skript `STENOPFAD_KEYSTORE`, `STENOPFAD_KEYSTORE_PASSWORD`, `STENOPFAD_KEY_ALIAS` und `STENOPFAD_KEY_PASSWORD`; ohne diese Angaben erzeugt es weiterhin einen lokalen Testschlüssel.

## Quellen

Schriftvorlagen: **Systemurkunde der Deutschen Einheitskurzschrift, Wiener Urkunde, 1. August 1968**, amtliche Veröffentlichung in GMBl. 1968 Nr. 15, Anlage, Verkehrsschrift Seiten 2–10.

Original: https://media.frag-den-staat.de/files/docs/06/28/25/06282512a3b140d99e993ed6979109ea/gmbl-ausgabe-1968-15.pdf

Die App verwendet Ausschnitte der amtlichen Zeichenbilder und Scans dieser Seiten. Keine Bilder aus einem kommerziellen Lehrbuch, keine KI-erfundenen Schriftzeichen. Zeilen und Rasterrauschen des Originalscans bleiben erhalten. Die Ausschnitte wurden visuell mit der Vorlage abgeglichen; eine fachliche Prüfung des gesamten Lernkonzepts durch eine DEK-Lehrkraft steht aus.

`web/content.json` enthält alle Vorlagen offline. `scripts/extract-content.py PFAD_ZUR_ORIGINAL_PDF` reproduziert sie mit PyMuPDF; die Koordinaten beziehen sich auf die hier dokumentierte Originaldatei. Die Android-App selbst lädt nichts herunter.

## Prüfung

Siehe [docs/VALIDIERUNG.md](docs/VALIDIERUNG.md) für ausgeführte Tests und offene Gerätekontrollen.
