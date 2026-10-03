"""Build a captioned 3:00 walkthrough from the verified app viewport screenshots."""
from pathlib import Path
import subprocess, tempfile, textwrap
root=Path(__file__).resolve().parent.parent
shots=root/'docs/screenshots'
work=Path(tempfile.mkdtemp(prefix='ai60-demo-'))
segments=[
 ('video-home-desktop',25,'01 / THE CHALLENGE','500 registrations in seven days, with INR 2,000. Target final-year engineering students who can code but need an AI project they can explain. Show a concrete outcome before asking for registration.'),
 ('video-project-reveal',25,'02 / THE VALUE','Three optional answers suggest a scoped project. Prepared inputs and outputs show what the student could build. Guidance respects existing AI experience. No employability score or invented resume diagnosis.'),
 ('video-workshop-pass',25,'03 / REGISTRATION','Students register directly. The workshop pass contains a preparation checklist and starter kit. Simulation is visibly labeled. No date is invented, and a failed live write never creates a false success.'),
 ('video-squad',20,'04 / OPTIONAL TEAMS','Builder connects the system. Solver checks examples and failures. Shipper explains and documents. Teamwork is optional: the registration remains valid even when no friends join.'),
 ('video-invite',20,'05 / A REASON TO SHARE','Invite someone to build a specific project alongside you. The invitation leads directly to registration. Share actions are measured separately from delivered invitations. Preview opens are excluded from tracking.'),
 ('video-command-baseline',25,'06 / THE ECONOMICS','Campus distribution contributes 300 registrations. Relevant communities contribute 125. One referral generation adds about 75. The baseline totals 500. These are editable hypotheses, not executed campaign results.'),
 ('video-command-center',25,'07 / THE DOWNSIDE','At 20 percent campus conversion, the forecast falls to 382: a gap of 118. Audience overlap, sharing, and budget can be challenged. Keep INR 500 in reserve and diagnose the bottleneck before spending.'),
 ('video-submission',15,'08 / THE JUDGMENT','The submission includes a two-page plan and genuine learning notes. Rejected: compulsory referrals, artificial urgency, unvalidated scoring, and silent backend success. Next: student testing and staging verification.')
]
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
for i,(name,duration,title,body) in enumerate(segments):
 note=work/f'note-{i}.txt';note.write_text(title+'\n\n'+'\n'.join(textwrap.wrap(body,width=25))+'\n\nCAPTIONED WALKTHROUGH\nIndependent challenge\nsimulation. No outreach\nor real enrollment claimed.')
 output=work/f'clip-{i}.mp4'
 vf=f"scale=894:621:force_original_aspect_ratio=decrease,pad=1280:720:20:50:color=0x111310,drawbox=x=930:y=50:w=330:h=621:color=0x1b2019:t=fill,drawtext=fontfile={font}:textfile={note}:x=948:y=75:fontsize=20:line_spacing=8:fontcolor=0xe8eddf"
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-loop','1','-i',str(shots/f'{name}.png'),'-t',str(duration),'-vf',vf,'-r','12','-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p','-threads','2',str(output)],check=True)
(work/'concat.txt').write_text('\n'.join(f"file '{work}/clip-{i}.mp4'" for i in range(len(segments))))
output=root/'public/submission/AI60-Three-Minute-Demo.mp4'
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(work/'concat.txt'),'-c','copy','-movflags','+faststart',str(output)],check=True)
print(output)
