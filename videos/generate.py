#!/usr/bin/env python3
"""Generate the six Lieferuhr product launch compositions (HyperFrames HTML)."""
import os

W, H = 1280, 720

GLYPHS = {
    # lucide-style stroke glyphs, white on product accent tile
    'einkauf': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/><path d="M15.5 15.5l2 2 3.5-3.5" transform="translate(-3,1) scale(0.85)"/>',
    'frachtradar': '<rect x="2" y="7" width="13" height="9" rx="1"/><path d="M15 10h4l3 3v3h-7z"/><circle cx="6.5" cy="18" r="1.8"/><circle cx="17.5" cy="18" r="1.8"/><path d="M19 4a3 3 0 0 1 3 3" opacity="0.6"/>',
    'frachtamt': '<path d="M3 11l18-8-7 18-2.5-7.5z"/><path d="M11.5 13.5L21 3" opacity="0.7"/>',
    'pruefamt': '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 9.5h18"/><circle cx="12" cy="15" r="3.2"/><path d="M12 13.4V15l1.2 0.9"/>',
    'einsatzamt': '<path d="M14.7 6.3a4.6 4.6 0 0 0-6.2 6.2L4 17a2 2 0 1 0 2.8 2.8l4.5-4.5a4.6 4.6 0 0 0 6.2-6.2l-2.9 2.9-2.8-2.8z"/>',
    'postamt': '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12L4 7.5M12 12v9" opacity="0.8"/>',
}

PRODUCTS = [
    dict(id='einkauf', name='Lieferuhr Einkauf', audience='Für Einkaufsteams',
         accent='oklch(46% 0.185 265)', ink='oklch(98% 0.005 250)',
         claim='Wissen, wann Ware ankommt.',
         scenes=[('shot', 'einkauf-dash.png', 'Offene Bestellungen, Risiko-Ampel, Liefertermine'),
                 ('shot', 'einkauf-suppliers.png', 'Lieferanten-Scorecards statt Telefonlisten')],
         tag='Ein Produkt von Lieferuhr'),
    dict(id='frachtradar', name='FrachtRadar', audience='Für Fuhrunternehmen 3–30 LKW',
         accent='oklch(58% 0.175 55)', ink='oklch(99% 0.003 80)',
         claim='Dispo, Fahrer, POD, Rechnung.',
         scenes=[('shot', 'fleet-dispatch.png', 'Das Dispo-Board: Touren, Fahrer, Status'),
                 ('shot-tall', 'fleet-driver.png', 'Fahrer melden Status — ohne App-Installation')],
         tag='Ein Produkt von Lieferuhr'),
    dict(id='frachtamt', name='FrachtAmt', audience='Für Fuhrunternehmen 3–30 LKW',
         accent='oklch(50% 0.13 180)', ink='oklch(98% 0.005 200)',
         claim='Der Posteingang wird disponiert.',
         scenes=[('shot', 'suite-dispatch.png', 'Angebote bewerten, kontern, buchen'),
                 ('beats', None, ['Konter als fertiger E-Mail-Entwurf', 'Papiere und Buchung in einem Fluss', 'Übergabe an FrachtRadar'])],
         tag='Betriebsamt · die Werkzeuge von Lieferuhr'),
    dict(id='pruefamt', name='PrüfAmt', audience='Für Fuhrunternehmen & Flottenleiter',
         accent='oklch(47% 0.15 295)', ink='oklch(98% 0.005 300)',
         claim='Lenkzeiten und Fristen im Griff.',
         scenes=[('shot', 'suite-comply.png', 'Lenkzeit-Uhren und Fristen-Ampel je Fahrer'),
                 ('beats', None, ['Auch Transporter ab 2,5 t — Pflicht ab Juli 2026', 'Audit-Paket für die Kontrolle per Klick', 'Dokumente warnen, bevor sie ablaufen'])],
         tag='Betriebsamt · die Werkzeuge von Lieferuhr'),
    dict(id='einsatzamt', name='EinsatzAmt', audience='Für Handwerksbetriebe 2–15 Monteure',
         accent='oklch(55% 0.19 30)', ink='oklch(99% 0.003 40)',
         claim='Kein Anruf geht verloren.',
         scenes=[('shot', 'suite-hvac.png', 'Anfragen aus Anruf, Mail und Formular'),
                 ('beats', None, ['Techniker- und Terminvorschlag', 'Kundenbestätigung als Entwurf', 'Die Zentrale behält die Kontrolle'])],
         tag='Betriebsamt · die Werkzeuge von Lieferuhr'),
    dict(id='postamt', name='PostAmt', audience='Für kleine Großhändler & Lager',
         accent='oklch(50% 0.13 145)', ink='oklch(98% 0.005 145)',
         claim='Bestell-Mails werden Aufträge.',
         scenes=[('shot', 'suite-depot.png', 'Erkannte Positionen, Mengen, Artikel'),
                 ('beats', None, ['Bestand bucht automatisch ab', 'Pickliste und Versand folgen', 'Ohne ERP-Projekt'])],
         tag='Betriebsamt · die Werkzeuge von Lieferuhr'),
]

CSS = """
@page { margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; background: #e8ecf3; }
#root { position: relative; width: 100%; height: 100%; overflow: hidden;
        font-family: 'Geist', system-ui, sans-serif; color: #1c2430; }
.clip { position: absolute; inset: 0; }
.bg { position: absolute; inset: 0;
  background:
    radial-gradient(120% 90% at 20% 10%, #f4f6fa 0%, #e8ecf3 55%, #dfe4ee 100%);
}
.center { position: absolute; inset: 0; display: flex; flex-direction: column;
          align-items: center; justify-content: center; text-align: center; }
.mark { width: 96px; height: 96px; border-radius: 26px; display: flex;
        align-items: center; justify-content: center;
        box-shadow: 8px 8px 20px rgba(94,110,140,.28), -6px -6px 16px rgba(255,255,255,.85); }
.mark svg { width: 52px; height: 52px; }
h1 { font-family: 'Space Grotesk', 'Geist', sans-serif; font-weight: 700;
     font-size: 72px; letter-spacing: -0.02em; margin: 26px 0 0; }
.aud { margin: 12px 0 0; font-size: 24px; font-weight: 600; }
.claim { margin: 20px 0 0; font-size: 21px; color: #5a6678; }
.shot-wrap { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.shot { border-radius: 22px; overflow: hidden;
        box-shadow: 18px 22px 44px rgba(94,110,140,.38), -10px -10px 26px rgba(255,255,255,.8);
        border: 1px solid rgba(255,255,255,.7); }
.shot img { display: block; }
.cap { position: absolute; left: 72px; bottom: 64px; display: flex; align-items: center;
       gap: 10px; background: #eef1f6; border-radius: 999px; padding: 12px 22px;
       font-size: 19px; font-weight: 600; color: #2a3442;
       box-shadow: 6px 6px 16px rgba(94,110,140,.3), -4px -4px 12px rgba(255,255,255,.8); }
.cap .dot { width: 10px; height: 10px; border-radius: 50%; }
.beats-card { background: #edf0f6; border-radius: 26px; padding: 44px 52px;
  box-shadow: 14px 16px 36px rgba(94,110,140,.3), -8px -8px 20px rgba(255,255,255,.8);
  display: flex; flex-direction: column; gap: 26px; }
.beat { display: flex; align-items: center; gap: 18px; font-size: 30px; font-weight: 600; }
.beat .tick { width: 34px; height: 34px; border-radius: 50%; flex: none;
  display: flex; align-items: center; justify-content: center; }
.beat .tick svg { width: 18px; height: 18px; }
.end-name { font-family: 'Space Grotesk', sans-serif; font-size: 54px; font-weight: 700;
            letter-spacing: -0.02em; margin: 0; }
.end-tag { margin: 14px 0 0; font-size: 19px; color: #5a6678; font-weight: 500; }
.end-bar { width: 0; height: 5px; border-radius: 3px; margin-top: 26px; }
"""


def shot_scene(p, start, dur, img, cap, tall=False):
    w = 'height: 640px;' if tall else 'width: 1000px;'
    return f"""
  <section class="clip" data-start="{start}" data-duration="{dur}">
    <div class="bg"></div>
    <div class="shot-wrap">
      <div class="shot" id="{p['id']}-shot-{start}" style="{w}">
        <img src="assets/{img}" style="width:100%;height:100%;object-fit:cover;object-position:top center;" />
      </div>
    </div>
    <div class="cap" id="{p['id']}-cap-{start}">
      <span class="dot" style="background:{p['accent']}"></span>{cap}
    </div>
  </section>"""


def beats_scene(p, start, dur, beats):
    rows = ''.join(
        f'<div class="beat" id="{p["id"]}-beat-{i}">'
        f'<span class="tick" style="background:{p["accent"]}">'
        f'<svg viewBox="0 0 24 24" fill="none" stroke="{p["ink"]}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>'
        f'</span>{b}</div>'
        for i, b in enumerate(beats))
    return f"""
  <section class="clip" data-start="{start}" data-duration="{dur}">
    <div class="bg"></div>
    <div class="center">
      <div class="beats-card">{rows}</div>
    </div>
  </section>"""


def build(p):
    t_end = 15.4
    dur_total = 19
    scenes = [f"""
  <section class="clip" data-start="0" data-duration="2.6">
    <div class="bg"></div>
    <div class="center">
      <div class="mark" id="{p['id']}-mark" style="background:{p['accent']}">
        <svg viewBox="0 0 24 24" fill="none" stroke="{p['ink']}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">{GLYPHS[p['id']]}</svg>
      </div>
      <h1 id="{p['id']}-name">{p['name']}</h1>
      <p class="aud" id="{p['id']}-aud" style="color:{p['accent']}">{p['audience']}</p>
      <p class="claim" id="{p['id']}-claim">{p['claim']}</p>
    </div>
  </section>"""]
    starts = [(2.6, 6.2), (8.8, 6.6)]
    for (kind, img, meta), (st, d) in zip(p['scenes'], starts):
        if kind == 'shot':
            scenes.append(shot_scene(p, st, d, img, meta))
        elif kind == 'shot-tall':
            scenes.append(shot_scene(p, st, d, img, meta, tall=True))
        else:
            scenes.append(beats_scene(p, st, d, meta))
    scenes.append(f"""
  <section class="clip" data-start="{t_end}" data-duration="{dur_total - t_end}">
    <div class="bg"></div>
    <div class="center">
      <p class="end-name" id="{p['id']}-endname">{p['name']}</p>
      <div class="end-bar" id="{p['id']}-endbar" style="background:{p['accent']}"></div>
      <p class="end-tag" id="{p['id']}-endtag">{p['tag']}</p>
    </div>
  </section>""")

    # animation script — deterministic, seek-safe
    anims = f"""
  const tl = gsap.timeline({{ paused: true }});
  tl.from('#{p['id']}-mark', {{ scale: 0.6, opacity: 0, duration: 0.5, ease: 'back.out(1.8)' }}, 0.15)
    .from('#{p['id']}-name', {{ y: 34, opacity: 0, duration: 0.55, ease: 'power3.out' }}, 0.3)
    .from('#{p['id']}-aud', {{ y: 20, opacity: 0, duration: 0.5, ease: 'power3.out' }}, 0.5)
    .from('#{p['id']}-claim', {{ opacity: 0, duration: 0.5 }}, 0.7);"""
    for (kind, img, meta), (st, d) in zip(p['scenes'], starts):
        if kind.startswith('shot'):
            anims += f"""
  tl.fromTo('#{p['id']}-shot-{st}', {{ scale: 0.94, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.7, ease: 'power2.out' }}, {st + 0.1})
    .fromTo('#{p['id']}-shot-{st} img', {{ scale: 1 }}, {{ scale: 1.07, duration: {d}, ease: 'none' }}, {st})
    .from('#{p['id']}-cap-{st}', {{ y: 18, opacity: 0, duration: 0.45, ease: 'power2.out' }}, {st + 0.6});"""
        else:
            for i in range(len(meta)):
                anims += f"""
  tl.from('#{p['id']}-beat-{i}', {{ x: -30, opacity: 0, duration: 0.45, ease: 'power2.out' }}, {st + 0.3 + i * 0.5});"""
    anims += f"""
  tl.from('#{p['id']}-endname', {{ y: 26, opacity: 0, duration: 0.5, ease: 'power3.out' }}, {t_end + 0.15})
    .to('#{p['id']}-endbar', {{ width: 320, duration: 0.7, ease: 'power2.inOut' }}, {t_end + 0.5})
    .from('#{p['id']}-endtag', {{ opacity: 0, duration: 0.5 }}, {t_end + 0.9});
  window.__timelines['{p['id']}'] = tl;"""

    return f"""<!doctype html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width={W}, height={H}" />
<title>{p['name']} — Lieferuhr</title>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
@font-face {{ font-family: 'Geist'; src: url('assets/fonts/geist.woff2') format('woff2'); font-weight: 100 900; }}
@font-face {{ font-family: 'Space Grotesk'; src: url('assets/fonts/space-grotesk.woff2') format('woff2'); font-weight: 100 900; }}
{CSS}
</style>
</head>
<body>
<div id="root" data-composition-id="{p['id']}" data-start="0" data-width="{W}" data-height="{H}" data-duration="{dur_total}">
{''.join(scenes)}
</div>
<script>{anims}
</script>
</body>
</html>
"""


os.makedirs('compositions', exist_ok=True)
for p in PRODUCTS:
    path = f"compositions/{p['id']}.html"
    with open(path, 'w') as f:
        f.write(build(p))
    print('wrote', path)
