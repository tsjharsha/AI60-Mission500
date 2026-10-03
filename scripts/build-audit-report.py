from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
pdfmetrics.registerFont(TTFont('DV','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DV-Bold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
root=Path(__file__).resolve().parent.parent
output=root/'public/submission/AI60-Audit-Completion-Report.pdf'
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='Title2',fontName='DV-Bold',fontSize=25,leading=31,textColor=HexColor('#172016'),spaceAfter=16))
styles.add(ParagraphStyle(name='H2x',fontName='DV-Bold',fontSize=13,leading=18,textColor=HexColor('#273d20'),spaceBefore=14,spaceAfter=8))
styles.add(ParagraphStyle(name='Bodyx',fontName='DV',fontSize=9,leading=14,textColor=HexColor('#394135'),spaceAfter=8))
styles.add(ParagraphStyle(name='Cellx',fontName='DV',fontSize=8,leading=11,textColor=HexColor('#394135')))
def p(text,style='Bodyx'):return Paragraph(escape(text),styles[style])
lines=(root/'docs/Audit-Completion-Report.md').read_text().splitlines()
rows=[]
for line in lines:
 if line.startswith('|') and 'Audit item' not in line and any(c.isalnum() for c in line):
  rows.append([x.strip() for x in line.strip('|').split('|')])
def table(items):
 data=[[p('Audit recommendation','Cellx'),p('Implemented result / evidence','Cellx')]]
 for label,result,evidence in items:data.append([p(label,'Cellx'),p(result+' • '+evidence,'Cellx')])
 t=Table(data,colWidths=[155,355],hAlign='LEFT');t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),HexColor('#dceac6')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8),('LINEBELOW',(0,0),(-1,-1),.3,HexColor('#d7ddd1'))]));return t
story=[p('AI60 / Mission 500','H2x'),p('Audit completion report','Title2'),p('4 October 2026 • Full implementation and regression review'),p('Implemented and verified as a challenge simulation. Every audit recommendation is mapped below. Live deployment and research gates are stated explicitly; selection is not promised.'),p('Student experience','H2x'),table(rows[:13]),PageBreak(),p('Growth, product and submission','Title2'),table(rows[13:]),p('Additional integrity corrections','H2x'),p('Fail-closed writes; transactional registration; unique email/user/builder assignment; signed HttpOnly sessions; locked squad joins and unique roles; real demo invite lookup; paginated and deduplicated metrics; validated attribution; analytics PII allowlist; bounded requests; server consent validation; reset of both cookie and local state; builds independent of external Google Fonts downloads.'),PageBreak(),p('What was verified','Title2')]
checks=[
'Production webpack build, full-repository ESLint and TypeScript passed.',
'Seven domain tests passed: forecast, downside/overlap, malformed bounds, unique stage counting, consistent metrics, experienced guidance and calendar.',
'Production-server integration passed: nine pages, input/consent validation, session restore, idempotent retry, authorization, invalid invites, concurrent demo capacity, unique roles, duplicate joins, tampered cookie, CSRF, JSON/body-size limits, calendar guard and reset.',
'Configured-live outage injection passed: registration, metrics and squad creation return 503, not invented success or seeded counters.',
'Desktop browser flow passed: output preview, matcher, experienced guidance, registration, pass reload, optional squad, invite preview and changed forecast. No page exceptions.',
'Mobile home, registration and dashboard passed 390px horizontal-overflow checks; screenshots inspected.',
'Starter parses; Python statistics correctly compute 75% change and a 20-unit increase. Growth plan rendered and inspected. Captioned video generated from tested app screenshots and checked at exactly 180 seconds.'
]
for item in checks:story.append(p('PASS — '+item))
story.append(p('Deployment gates still open','H2x'))
for item in [
'No staging database credentials were supplied. Apply duplicate preflight and migration once, then verify live transaction concurrency. Demo concurrency is not proof of database deployment.',
'Configure a stable signing secret and server-only service key. A distributed public deployment needs a shared edge rate limiter. Demo memory is deliberately ephemeral.',
'Confirm the real event date, meeting link, organizer contact and retention/deletion process before collecting participants. Calendar is implemented but guarded until a date is supplied.',
'No student interviews, partners, outreach, conversion lift or 500 registrations are claimed. The plan remains a hypothesis to pilot.',
'A captioned three-minute walkthrough and personal narration script are supplied. No challenge form has been submitted.'
]:story.append(p(item))
story.append(p('Arithmetic correction','H2x'));story.append(p('The verbal audit previously claimed 400 at 20% campus conversion. Correct calculation: 200 campus + 125 community + about 57 referrals = 382. Code, tests and materials use 382.'))
story += [PageBreak(),p('Evidence from the tested app','Title2'),p('Desktop workbench and workshop pass. Screenshots use fictional demo details.'),Image(str(root/'docs/screenshots/video-home-desktop.png'),width=432,height=300),Spacer(1,12),Image(str(root/'docs/screenshots/video-workshop-pass.png'),width=432,height=300)]
def footer(c,doc):
 c.setFillColor(HexColor('#68725f'));c.setFont('DV',7);c.drawString(42,24,'AI60 Mission 500 • Implementation report • Live deployment gates remain explicit');c.drawRightString(553,24,str(doc.page))
SimpleDocTemplate(str(output),pagesize=(595.28,841.89),leftMargin=42,rightMargin=42,topMargin=38,bottomMargin=42,title='AI60 Audit Completion Report',author='AI60 Mission 500').build(story,onFirstPage=footer,onLaterPages=footer)
print(output)
