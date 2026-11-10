import fitz,base64,json,io
from PIL import Image
from pathlib import Path
import sys
root=Path(__file__).resolve().parents[1]
doc=fitz.open(sys.argv[1])
def crop(page,box):
 # Coordinates refer to inspected 1.5x rendering; render a larger source crop.
 r=fitz.Rect(*[x/1.5 for x in box]); p=doc[page].get_pixmap(matrix=fitz.Matrix(4,4),clip=r)
 return 'data:image/png;base64,'+base64.b64encode(p.tobytes('png')).decode()
cards=[]
def add(id,label,page,x,y,w=46,h=48,kind='Mitlaut',note='Vergleiche Form, Größe und Lage im Liniennetz. Schreibe langsam und gleichmäßig.'):
 cards.append(dict(id=id,label=label,image=crop(page,(x-w/2,y,x+w/2,y+h)),kind=kind,note=note,source=f'Systemurkunde 1968, Seite {page-3}'))
rows=[(['b','br','c','ch','cht','cr','d','dr','f','fr','g','gr','h','j'],[165,210,250,315,368,416,463,512,559,604,642,688,731,771],306),(['k','kr','l','m','mp','mpf','n','nd','ndr','ng','p','pf','pfr','pr','qu'],[145,190,227,271,316,368,418,462,508,554,591,631,673,723,769],385),(['r','rd','rdr','rr','rs','s','sch','schm','schn','schr','schw','sp','spr','ss/ß'],[144,193,239,283,322,368,410,459,510,564,616,669,714,767],466),(['st','str','t','tr','v','w','wr','x','y','z','zr','zw'],[147,207,272,342,390,439,495,556,607,661,715,765],545)]
for labels,xs,y in rows:
 for label,x in zip(labels,xs):
  if label=='b':
   add('b','b',5,x,y,32,48)
  elif label=='t':
   # The table shows both t forms together; retain both with honest prompt.
   add('t','t (beide Formen)',5,x,y,55,48,note='Die Tabelle zeigt Abstrich-t und Aufstrich-t nebeneinander. Die Verwendung lernst du mit § 2 Ziffer 5 in der Referenz.')
  else: add(label.replace('/','-'),label,5,x,y,42,48)
# Literal vowel forms, not the symbolic vowel table.
for label,x in zip(['e','o','i','ei/ai','a','ö','ü','ä','u','eu','au','äu','y'],[164,214,265,321,378,431,480,535,579,631,684,739,792]):
 add('v-'+label.replace('/','-'),label,6,x,633,46,40,'Selbstlaut (buchstäblich)','Diese Form gilt, wenn kein Mitlaut folgt. Vokale vor Mitlauten werden anders dargestellt; siehe § 3 in der Referenz.')
# Word abbreviations. Ambiguous stems are labelled with exactly the attested meaning.
for label,x,y,w in [('all',164,140,40),('als',214,140,40),('also',267,140,42),('auf',492,140,40),('aus',551,140,40),('bis',690,140,40),('dem',333,220,42),('den',386,220,42),('der',510,220,20),('des',595,220,22),('die',173,299,40),('dies',224,299,42),('doch',273,299,42),('durch',395,299,44),('eine',448,299,42),('es',323,378,40),('für',430,378,42),('ich',510,457,42),('in',570,457,40),('ist',624,457,40),('kann(st)',675,457,46),('nicht',600,536,22),('noch',785,536,39),('nur',171,616,42),('schon',442,616,42),('sich',623,616,40),('sie',674,616,42),('sind',731,616,42),('und',728,696,40),('uns',353,774,40),('unser',409,774,44),('unter',461,774,42),('voll',728,774,42),('vom',170,853,40),('von',224,853,40),('wir',173,932,40),('wo',285,932,40)]:
 add('k-'+label.replace('(st)',''),label,8,x,y,w,38,'Kürzel','Lerne dieses Kürzel als Ganzes. Lies es laut, zeichne es nach und schreibe es danach aus dem Gedächtnis.')
byid={c['id']:c for c in cards}
lessons=[]
def lesson(title,ids,section,tip):
 assert all(i in byid for i in ids),(title,ids)
 lessons.append(dict(id=f'L{len(lessons)+1:02}',title=title,cards=ids,section=section,tip=tip))
lesson('Deine ersten Zeichen',['b','g','n'],1,'Start ohne Zeitdruck. Achte zunächst auf die Größe und die Position zwischen den Linien.')
lesson('Runde und kleine Formen',['r','m','h'],1,'Ähnliche Zeichen unterscheiden sich oft nur in kleinen Merkmalen. Vergleiche bewusst.')
lesson('Die nächsten Mitlaute',['d','f','k'],1,'Übe jedes Zeichen zunächst einzeln. Verbindungen folgen später.')
lesson('Schleifen und Bögen',['l','s','sch'],1,'Betrachte den Verlauf genau. Die Schlussformen von l und s findest du in § 2 Ziffer 4.')
lesson('Weitere Grundformen',['p','pf','pfr','w','v'],1,'Schreibe lieber lesbar als schnell. Tempo entsteht durch Wiederholung.')
lesson('t und Mitlautgruppen',['t','br','gr'],1,'Für t gibt es zwei Formen. Lies dazu die kurze Regel in der Referenz auf Seite 2.')
lesson('Kleine Unterschiede',['ch','cht','ng'],2,'Sprich beim Lesen die Lautgruppe aus, für die das Zeichen steht.')
lesson('Gruppen mit r',['kr','pr','fr','dr'],2,'Diese Zeichen stehen jeweils für eine Mitlautfolge.')
lesson('Weitere r-Gruppen',['rd','rr','wr','tr'],2,'Nutze das Liniennetz, um Größen und Anschlüsse zu vergleichen.')
lesson('Gruppen mit n und m',['nd','ndr','mp','mpf'],2,'Wiederhole nach dieser Einheit die Grundformen n, m und p.')
lesson('s-Verbindungen',['st','str','sp','spr'],2,'st und str haben besondere Regeln. Siehe § 2 Ziffer 6 vor dem Schreiben eigener Wörter.')
lesson('sch-Verbindungen',['schm','schn','schr','schw'],2,'Lerne zunächst das Erkennen. Die Referenz zeigt später den Einsatz im Wort.')
lesson('Seltene Mitlaute',['c','cr','j','qu'],2,'Diese Formen vervollständigen deinen Zeichenvorrat.')
lesson('Das Mitlaut-Finale',['rdr','rs','ss-ß','x','y','z','zr','zw'],2,'Teile diese Einheit nach Bedarf auf mehrere Tage auf.')
lesson('Selbstlaute am Ende I',['v-e','v-o','v-i'],3,'Wichtig: Diese Formen sind buchstäbliche Selbstlaute. Sie gelten, wenn kein Mitlaut folgt.')
lesson('Selbstlaute am Ende II',['v-a','v-ö','v-ü','v-ä','v-u'],3,'Lies § 3: Im Wort vor Mitlauten werden Selbstlaute durch Verbindung und Veränderung dargestellt.')
lesson('Doppellaute und y',['v-ei-ai','v-eu','v-au','v-äu','v-y'],3,'Für das Bilden eigener Wörter brauchst du zusätzlich die sinnbildliche Vokaldarstellung aus der Referenz.')
lesson('Erste ganze Wörter',['k-die','k-der','k-und'],4,'Kürzel sind vereinbarte Kurzformen. Du kannst sie direkt als Wörter lesen und schreiben.')
lesson('Pronomen und Verbformen',['k-ich','k-wir','k-sie','k-sind'],4,'Lies die Formen laut und schreibe sie ohne Vorlage.')
lesson('Kurze Alltagswörter',['k-es','k-ist','k-in','k-für'],4,'Achte darauf, nicht nur den Namen, sondern auch die Form aus dem Gedächtnis zu kennen.')
lesson('Genauer lesen',['k-dem','k-den','k-des','k-durch'],4,'Verwechsle ähnliche Formen nicht. Fällige Wiederholungen helfen dir dabei.')
lesson('Kleine Helfer',['k-auf','k-aus','k-von','k-vom'],4,'Baue eine kurze freie Übungszeile aus diesen Einzelwörtern.')
lesson('Aussagen und Einschränkungen',['k-nicht','k-nur','k-noch','k-schon'],4,'Schreibe zu jeder Form die Langschrift und prüfe anschließend deine Erinnerung.')
lesson('Weitere häufige Kürzel',['k-eine','k-sich','k-kann','k-doch'],4,'kann(st) ist die gemeinsame Vorlage für kann und kannst.')
lesson('Dein Kürzelvorrat wächst',['k-uns','k-unser','k-unter','k-voll'],4,'Wechsle zwischen Lesen und Schreiben; beides trainiert unterschiedliche Fähigkeiten.')
lesson('Kürzel-Abschluss',['k-all','k-als','k-also','k-bis','k-dies','k-wo'],4,'Danach steht die Wiederholung im Mittelpunkt. Das ist ein Grundlagenkurs, kein vollständiger DEK-Abschluss.')
# Whole pages: source is the official publication, no invented glyphs.
refs=[]
for i in range(5,14):
 pix=doc[i].get_pixmap(matrix=fitz.Matrix(1.7,1.7))
 refs.append(dict(page=i-3,image='data:image/png;base64,'+base64.b64encode(pix.tobytes('png')).decode()))
data=dict(cards=cards,lessons=lessons,reference=refs,sourceUrl='https://media.frag-den-staat.de/files/docs/06/28/25/06282512a3b140d99e993ed6979109ea/gmbl-ausgabe-1968-15.pdf')
(root/'web/content.json').write_text(json.dumps(data,ensure_ascii=False))
print(len(cards),'cards,',len(lessons),'lessons,',len(refs),'reference pages')
