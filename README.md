# Stenopfad

Eine erste Android-App zum täglichen Lernen der Deutschen Einheitskurzschrift (DEK), Verkehrsschrift nach der Wiener Urkunde von 1968. Ohne Konto, Werbung, Server und Internetberechtigung.

## Start auf Android

1. `Stenopfad.apk` auf das Smartphone laden und öffnen.
2. Falls Android danach fragt, dieser Download-App die Installation dieser Datei erlauben.
3. Stenopfad öffnen, 3, 7 oder 15 Minuten auswählen und mit der ersten Einheit beginnen.

Android 8.0 oder neuer und eine aktuelle Version von Android System WebView werden benötigt. Die APK ist eine eigenständig signierte Testversion, keine Play-Store-Veröffentlichung. Ein Start auf einem echten Android-Gerät wurde hier noch nicht geprüft.

## Was enthalten ist

- 26 aufeinander aufbauende Einheiten mit 105 Originalvorlagen.
- Entdecken, mit Finger oder Stift nachzeichnen, Lesen mit Antwortauswahl und Schreiben aus dem Gedächtnis.
- Vorlagenvergleich und ausdrückliche Selbsteinschätzung beim Schreiben. Keine automatische Bewertung von Handschrift, Strichrichtung oder Stiftdruck.
- Automatisch fällige Wiederholungen mit 1, 3, 7, 14 und 30 Tagen Abstand. Fehlerhafte Formen bleiben sofort fällig.
- XP, Lerntage, Freischaltungen und lokaler Fortschritt. Eine kurze Sitzung behandelt einen Teil der Einheit; nichts muss in einer bestimmten Tagesdauer abgeschlossen werden.
- Freie Schreibfläche, drei kleine Lesesätze aus Wortkürzeln, durchsuchbare Sammlung.
- Seiten 2–10 der amtlichen Verkehrsschrift als Offline-Referenz.
- Fortschritt über Textsicherung kopieren und mit Bestätigung wiederherstellen.

Das ist ein **Grundlagenkurs**, kein vollständiger Lehrgang bis zur sicheren DEK-Wortschrift. Die sinnbildliche Vokaldarstellung, Wortverbindungen, Sonderfälle und längere Diktate benötigen noch geführte Übungen. Das Nachschlagewerk allein ersetzt diese Übungen nicht. Die Selbstlautkarten zeigen ausdrücklich die buchstäblichen Formen, die bei fehlendem nachfolgendem Mitlaut verwendet werden. Sie sind kein alphabetischer Wortkonverter.

Den täglichen Ablauf und die Lernziele findest du in [docs/LERNPLAN.md](docs/LERNPLAN.md). Der Umsetzungsplan und weitere Schritte stehen in [docs/PLAN.md](docs/PLAN.md).

## Fortschritt behalten

Unter **Fortschritt → Sicherung erstellen** die Sicherung kopieren und außerhalb der App speichern. Android speichert den Lernstand nur im privaten Speicher dieser Installation. Beim Deinstallieren geht dieser Speicher verloren. Die freien Schreibspuren werden nicht dauerhaft gespeichert.

Für neue APK-Versionen muss derselbe private Signaturschlüssel benutzt werden, damit Android ein Update akzeptiert. Der mitgelieferte Quellcode enthält keinen privaten Schlüssel. Die GitHub-Testpipeline erzeugt ohne zusätzlich verwalteten Schlüssel neue Testsignaturen. Vor einer deshalb notwendigen Neuinstallation zuerst den Lernstand sichern und danach wiederherstellen.

## Quellcode und GitHub

Repository: https://github.com/Hedtt/Stenno

Kein Build-Verzeichnis und keinen privaten Signaturschlüssel hochladen.

Die Pipeline `.github/workflows/android.yml` führt die Tests aus, baut die APK und stellt sie als Actions-Artefakt bereit. Sie veröffentlicht keine Release-Datei und keine Website.

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

Für Umgebungen ohne `javac` unterstützt der direkte Build alternativ eine über `ECJ_JAR` angegebene Eclipse-JDT-Compilerdatei. Ein vorhandener Testschlüssel kann mit `STENOPFAD_KEYSTORE` angegeben werden; dieser Skriptpfad erwartet Alias `androiddebugkey` und das Standard-Testpasswort `android`. Für eine reguläre Veröffentlichung sind ein eigener Release-Signierprozess und Schlüsselverwaltung nötig.

## Quellen

Schriftvorlagen: **Systemurkunde der Deutschen Einheitskurzschrift, Wiener Urkunde, 1. August 1968**, amtliche Veröffentlichung in GMBl. 1968 Nr. 15, Anlage, Verkehrsschrift Seiten 2–10.

Original: https://media.frag-den-staat.de/files/docs/06/28/25/06282512a3b140d99e993ed6979109ea/gmbl-ausgabe-1968-15.pdf

Die App verwendet Ausschnitte der amtlichen Zeichenbilder und Scans dieser Seiten. Keine Bilder aus einem kommerziellen Lehrbuch, keine KI-erfundenen Schriftzeichen. Zeilen und Rasterrauschen des Originalscans bleiben erhalten. Die Ausschnitte wurden visuell mit der Vorlage abgeglichen; eine fachliche Prüfung des gesamten Lernkonzepts durch eine DEK-Lehrkraft steht aus.

`web/content.json` enthält alle Vorlagen offline. `scripts/extract-content.py PFAD_ZUR_ORIGINAL_PDF` reproduziert sie mit PyMuPDF; die Koordinaten beziehen sich auf die hier dokumentierte Originaldatei. Die Android-App selbst lädt nichts herunter.

## Prüfung

Siehe [docs/VALIDIERUNG.md](docs/VALIDIERUNG.md) für ausgeführte Tests und offene Gerätekontrollen.
