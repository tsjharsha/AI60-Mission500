from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit
from pathlib import Path
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
pdfmetrics.registerFont(TTFont("DejaVu", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DejaVu-Bold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
W,H=595.28,841.89
out=Path('public/submission/AI60-Growth-Plan.pdf')
c=canvas.Canvas(str(out),pagesize=(W,H)); c.setTitle('AI60 - Mission 500 Growth Plan'); c.setAuthor('AI60 Mission 500')
ink=HexColor('#182018'); muted=HexColor('#56604f'); green=HexColor('#cde6a0')
def page(number,title,subtitle):
 c.setFillColor(ink);c.rect(0,0,W,H,fill=1,stroke=0);c.setFillColor(green);c.setFont('DejaVu-Bold',10);c.drawString(40,H-45,'AI60 / MISSION 500 / GROWTH PLAN')
 c.setFillColor(HexColor('#f1f2e9'));c.setFont('DejaVu-Bold',27);c.drawString(40,H-92,title)
 c.setFont('DejaVu',10);c.setFillColor(HexColor('#b7bfad'));c.drawString(40,H-114,subtitle)
 c.setFont('DejaVu',8);c.drawString(40,25,'Independent challenge simulation. Assumptions are not measured campaign results.');c.drawRightString(W-40,25,f'{number} / 2')
def block(y,label,text,width=515):
 c.setFillColor(green);c.setFont('DejaVu-Bold',10);c.drawString(40,y,label)
 c.setFillColor(HexColor('#e3e7db'));c.setFont('DejaVu',10)
 lines=simpleSplit(text,'DejaVu',10,width)
 for line in lines: y-=15;c.drawString(40,y,line)
 return y-24
page(1,'A concrete reason to register.','500 registrations / 7 days / INR 2,000 / one working growth asset')
y=H-157
y=block(y,'WHO & WHY','Primary segment: final-year CSE, IT, and AI/ML students with basic programming skills but no finished AI project they can explain. This is a targeting hypothesis, not completed student research.')
y=block(y,'THE OFFER','Build a small AI prototype in a free, guided 60-minute online workshop. See an actual sample output before signing up. Leave with three checked examples, one documented failure, and a README. No placement guarantee.')
y=block(y,'THE WORKING ASSET','A project workbench with three scoped previews, a three-question optional matcher, direct registration, a preparation pass and starter kit, optional squads, project-specific invites, and an editable campaign simulator.')
y=block(y,'PRIORITIZED DISTRIBUTION','1. Campus clubs and class representatives: recruit 20 contacts, give each a ready-to-share project preview, and use tagged links. 2. Placement coordinators and relevant engineering communities: permission-based distribution to new audiences. 3. Optional peer invitations after registration: invite a friend for a specific build.')
y=block(y,'WHY IT COULD WORK','A tangible output makes the workshop relevant; trusted campus distribution supplies reach; direct signup removes the diagnostic gate; optional collaboration gives a practical reason to share. Each claim is a hypothesis to validate in the pilot.')
y=block(y,'HOW REACH BECOMES 500','Campus: 20 contacts x 50 unique visits x 30% registration = 300. Communities: 500 unique visits x 25% = 125. Peer invites: 425 initial registrations x 30% participation x 2 delivered invitations x 29.42% registration = about 75. Total: 500. One referral generation; no compounding.')
y=block(y,'ASSUMPTIONS TO CHALLENGE','Contacts are not confirmed partners. Group membership is not landing traffic. Baseline community overlap is 0%; adjust it in the simulator. Referral delivery is an assumption, not a share-click metric. Unique registrations must be deduplicated.')
assert y>45,y
c.showPage();page(2,'A plan that admits its downside.','Execution, budget, recovery, and the evidence to inspect')
y=H-157
y=block(y,'BUDGET CAP: INR 2,000','INR 800 campus support (20 contacts x INR 40 for agreed distribution deliverables); INR 400 reusable creatives; INR 300 tooling cap; INR 500 uncommitted recovery reserve. No rewards for duplicate signups. Spend only against a measured bottleneck.')
y=block(y,'SEVEN-DAY OPERATING PLAN','Day 1: prepare the offer, recruit contacts, and tag distribution links. Day 2: pilot with two campus placements; inspect unique visits and signup conversion. Days 3-4: expand the two partner channels and remove audience overlap. Day 5: offer peer invites after registration. Day 6: diagnose the shortfall and release reserve selectively. Day 7: use the genuine deadline and reconcile unique eligible registrations.')
y=block(y,'DOWNSIDE & RECOVERY','If campus conversion falls to 20%, initial registrations become 325 and first-generation referrals about 57: total 382, a gap of 118. At 10 initial registrations per contact, 12 additional participating contacts could conservatively cover the gap before referral effects. At INR 40 each, this costs INR 480. Access to new audiences is not guaranteed; first test whether the offer or distribution is failing.')
y=block(y,'MEASURE THE RIGHT THINGS','Count unique landing visitor IDs, unique matcher starts/completions, saved registrations, unique invite opens, attributed peer registrations, and squads. Direct registration bypasses matching. Share actions do not verify delivered invites. Separate illustrative data from database-only measurements.')
y=block(y,'PILOT DECISION','Compare project-output-led copy with generic workshop copy using tagged links. Primary metric: unique eligible registrations / unique landing visitors. Report sample size, dates, and missing tracking. Do not call a small pilot statistically conclusive or infer causality from aggregate ratios.')
y=block(y,'JUDGMENT & LEARNING','Changed the initial six-step gate into optional matching and direct signup. Rejected compulsory referrals, artificial timers, unvalidated readiness scoring, and silent backend success. Corrected inconsistent simulation metrics and narrowed the project scope to guided prototypes.')
y=block(y,'ANOTHER 24 HOURS','Observe five consenting student usability sessions, validate channel access, exercise database concurrency on staging, confirm the real event schedule, and review performance on a constrained mobile connection. No actual outreach is required or claimed for this simulation.')
assert y>45,y
c.save();print(out)
