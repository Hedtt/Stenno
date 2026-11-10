#!/usr/bin/env python3
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
web=root/'web'
s=(web/'index.template.html').read_text()
s=s.replace('/*STYLE*/',(web/'style.css').read_text()).replace('/*CONTENT*/',(web/'content.json').read_text()).replace('/*APP*/',(web/'app.js').read_text())
target=root/'app/src/main/assets/index.html';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(s)
(root/'Stenopfad.html').write_text(s)
print('Offline-App erstellt:',target)
