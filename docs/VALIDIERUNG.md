# Validierung der Version 0.3.0

## Erfolgreich geprüft

- JavaScript-Syntaxprüfung mit Node.
- 105 eindeutige Karten; jede ist einer der 26 Lerneinheiten zugeordnet.
- Vollständiger Lernablauf im DOM-Test: Entdecken, Zeichnen, Lesen, Gedächtnisschreiben und Abschluss.
- Leere Schreibfläche kann nicht als Schreibaufgabe abgeschlossen werden; Rückgängig entfernt den Freigabestatus.
- Fehlerhafte Antworten, sofortige Wiederholungsfälligkeit und erfolgreiche Wiederaufnahme.
- Schrittweises Lernen über mehrere Sitzungen und Freischaltung nach Abschluss aller Formen.
- Abbrechen vergibt keine XP und verliert keinen vorher abgeschlossenen Fortschritt.
- Export und Wiederherstellung; ungültige, unbekannte oder gefährliche Datenschlüssel werden abgelehnt.
- Zustandsmigration älterer Sicherungen: Bereits gelernte und fällige Formen werden verlustfrei in den Status `introduced` überführt. Neue Sicherungen akzeptieren Wiederholungsdaten nur für bereits eingeführte Formen; der Lernpfad bleibt dadurch geschlossen.
- Suche, Referenzansicht und Kalendertagsrechnung an beiden Zeitumstellungen 2026.
- Nativer Java-Code mit Eclipse JDT 3.38.0 gegen Android API 35 kompiliert.
- APK mit AAPT2 und D8 gebaut, ZIP-Ausrichtung geprüft, v2/v3-Signatur erfolgreich verifiziert.
- Paketkennung de.stenopfad.app; Minimum Android 8/API 26; Ziel Android 15/API 35; keine Internetberechtigung.
- Zeichen-Ausschnitte anhand einer Kontaktübersicht visuell mit der amtlichen Vorlage abgeglichen. Bei Kürzeln mit mehreren Varianten wurde eine einzelne Vorlage ausgeschnitten.

## Grenzen dieser Prüfung

DOM-Tests nutzen jsdom mit simuliertem Canvas-Kontext. Sie prüfen Zustände und Eingabeabläufe, aber weder Pixel, echte Touch-Ereignisse noch das Verhalten von Android WebView. Der grafische Browseraufruf wurde durch die verfügbare Browser-Zugriffsrichtlinie blockiert. Daher gibt es keine bestätigte grafische Endkontrolle im Browser und keinen behaupteten Screenshot-Test.

Die APK wurde hier nicht auf einem echten Android-Gerät oder Emulator gestartet. Insbesondere Systemleisten unter Android 15, Finger-/Stiftgefühl, Zoom der Referenz, Zurücknavigation und Datenerhalt nach Prozessende bleiben auf Hardware zu prüfen. Auch die alternative Gradle-Konfiguration wurde hier nicht gebaut.

Eine fachliche Freigabe des gesamten Kurses durch eine DEK-Lehrkraft steht aus. Der Kurs ist eine erste Fassung für Grundlagen, keine vollständige DEK-Ausbildung.

## Lokal wiederholen

```bash
npm ci
python3 scripts/assemble.py
npm test
bash scripts/build-apk.sh
```
