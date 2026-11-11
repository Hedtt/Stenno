# Umsetzungsplan

## Ziel und Architektur

Eine offline nutzbare Android-App für einen Anfänger, mit variabler Tagesdauer und Schreiben direkt auf dem Display. Gemeinsame Lernoberfläche als eigenständiges HTML/CSS/JavaScript-Paket, eingebettet in eine native Java-Activity. Kein Backend, kein Login und keine Betriebskosten.

## Realisierte Lernschleife

- Geführtes Kennenlernen mit amtlicher Schriftvorlage und kurzem Hinweis.
- Nachzeichnen auf einer Pointer-Events-Schreibfläche mit Finger und Stift.
- Lesen mit mehreren Antwortmöglichkeiten und unmittelbarer Rückmeldung.
- Aus dem Gedächtnis schreiben; Vorlage einblenden; explizite Selbstbewertung.
- Lernfortschritt, XP und Wiederholungsstatus erst nach abgeschlossener Sitzung speichern.
- Unterbrochene Einheiten sicher pausieren und bei der nächsten Aufgabe fortsetzen; die aktuelle Zeichnung bleibt dabei flüchtig.
- Einzelne Vorlagen aus dem Nachschlagebuch als separate, pausierbare Übung öffnen, ohne den geführten Kurs oder seine Freischaltungen zu umgehen.
- Weitere Einheit freischalten, wenn alle Formen des Abschnitts erfolgreich bearbeitet wurden.

Die Tagesdauer verändert die Zahl der Formen. Fehlgeschlagene Leseaufgaben verhindern, dass dieselbe Form in dieser Sitzung als gelernt zählt. Eine sichere Schreib-Selbstbewertung allein überschreibt einen Lesefehler nicht.

## Technische Entscheidungen

- Canvas mit normalisierten Schreibpunkten erhält Striche bei Größenänderungen.
- Zwei Strichbreiten, Rückgängig und Leeren; keine fingierte Stiftdruckerkennung.
- Originalausschnitte statt rekonstruierter, möglicherweise falscher Stenozeichen. Wo eine einzelne gemeinfreie SVG-Datei eindeutig passt, ergänzt eine lokal eingebettete, kontraststarke Vorschau die mobile Darstellung; der Originalausschnitt bleibt in der Entdecken-Ansicht überprüfbar und für alle übrigen Karten der Fallback.
- Quellenhierarchie: Amtliche Wiener Urkunde als einzig maßgebliche Regel- und Vorlagenquelle; weitere amtliche Fassungen dienen dem Abgleich. Archive, Fachinstitutionen, Wikipedia, Vereine und technische Werkzeuge liefern ausschließlich Kontext, Didaktik oder Vergleichsmöglichkeiten.
- Lokaler Speicher, versionierte validierte Textsicherung und bewusste Bestätigung beim Ersetzen. Das Zustandsfeld `introduced` trennt bereits bewertete bzw. falsch beantwortete Formen von tatsächlich gelernten Formen; damit bleiben Fehler sofort wiederholbar, ohne neue Formen über eine Sicherung freizuschalten. Ältere Sicherungen werden beim Laden auf dieses Schema migriert.
- Kein Netzwerkrecht, keine unkontrollierte Navigation, JavaScript-Brücke ausschließlich für Kopieren und App-Schließen.
- Direkter SDK-Build für die APK; zusätzliche Gradle-Konfiguration für Android Studio.

## Nächste Ausbaustufe

1. Android-Gerätetest für Schreibgefühl, Stift, Rotation, Zurücknavigation, Systemleisten und Datenhaltung.
2. Fachliche Prüfung durch eine DEK-Lehrkraft: Ausschnitte, Reihenfolge, Bewegungsrichtung und Regelhinweise.
3. Geführte Darstellung sinnbildlicher Vokale mit geprüften Wortpaaren.
4. Verbindungsübungen und Wortbildung mit kuratierten Wortvorlagen, anschließend kurze Diktate.
5. Erst nach einem belastbaren Beispieldatensatz optionale geometrische Schreibhilfe; Form, Lage und Richtung getrennt erklären. Keine pauschale KI-Punktzahl ohne nachgewiesene Qualität.
6. Automatische Gerätekontrollen ergänzen und signierte Updates auf echten Geräten testen.

Nicht enthalten sind Benachrichtigungen, Cloud-Synchronisierung und eine Play-Store-Veröffentlichung.
