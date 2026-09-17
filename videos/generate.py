#!/usr/bin/env python3
"""Generate the six Lieferuhr product launch spots (HyperFrames HTML).

Structure per spot (~23.4s, beat-locked to happy-beats vol-1, 120 BPM):
  hook (dark, word slam) -> reveal (mark punch @3.02) -> flow A/B
  (full-bleed UI, camera push, cursor click, spotlight, swapping captions)
  -> 3 feature chips on the beat grid -> end card with CTA.
"""
import os

W, H = 1280, 720
DUR = 23.4

# Beat map from the bundled cue preset (track starts at t=0).
BEAT_REVEAL = 3.02
FLOW_A, CLICK_A = 5.03, 7.02
FLOW_B, CLICK_B = 10.52, 13.01
CHIPS = [16.02, 16.52, 17.02]
END = 19.02

GLYPHS = {
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
         hook=('Wann kommt die Ware', 'wirklich?'),
         flows=[
             dict(img='einkauf-dash.png', focus='62% 55%', zoom=1.16,
                  spot=(62, 54, 18, 40), cursor=(92, 64),
                  caps=('Jede Bestellung. Ein Status.', 'Verspätung sichtbar, bevor sie wehtut.')),
             dict(img='einkauf-suppliers.png', focus='50% 42%', zoom=1.14,
                  spot=(20, 26, 55, 48), cursor=(50, 55),
                  caps=('Lieferanten melden per Link.', 'Kein Telefon. Kein Excel.')),
         ],
         chips=['Risiko-Ampel je Bestellung', 'Erinnerungen automatisch', 'Lieferanten-Scorecards'],
         cta='Demo testen', tag='Ein Produkt von Lieferuhr'),

    dict(id='frachtradar', name='FrachtRadar', audience='Für Fuhrunternehmen 3–30 LKW',
         accent='oklch(58% 0.175 55)', ink='oklch(99% 0.003 80)',
         hook=('40 Anrufe.', 'Eine Tour.'),
         flows=[
             dict(img='fleet-dispatch.png', focus='42% 50%', zoom=1.18,
                  spot=(18, 18, 32, 58), cursor=(42, 50),
                  caps=('Touren disponieren ohne Telefon.', 'Jeder Status. Ein Board.')),
             dict(img='fleet-driver.png', focus='50% 40%', zoom=1.1, tall=True,
                  spot=None, cursor=(66, 52),
                  caps=('Fahrer melden per Link.', 'POD-Foto inklusive.')),
         ],
         chips=['Dispo-Board in Echtzeit', 'Fahrer ohne App-Installation', 'Rechnung direkt aus der Tour'],
         cta='Dispo-Demo testen', tag='Ein Produkt von Lieferuhr'),

    dict(id='frachtamt', name='FrachtAmt', audience='Für Fuhrunternehmen 3–30 LKW',
         accent='oklch(50% 0.13 180)', ink='oklch(98% 0.005 200)',
         hook=('Das Postfach entscheidet', 'den Tag.'),
         flows=[
             dict(img='suite-dispatch.png', focus='40% 32%', zoom=1.15,
                  spot=(19, 22, 48, 26), cursor=(30, 28),
                  caps=('Angebote aus TIMOCOM und Mail.', 'Bewertet, nicht verloren.')),
             dict(img='suite-dispatch.png', focus='84% 35%', zoom=1.22,
                  spot=(68.5, 39, 27, 8), cursor=(83, 43),
                  caps=('Konter als fertiger Entwurf.', 'Buchung samt Papieren.')),
         ],
         chips=['Konter-Mail in Sekunden', 'Papiere in einem Fluss', 'Übergabe an FrachtRadar'],
         cta='Demo testen', tag='Betriebsamt · die Werkzeuge von Lieferuhr'),

    dict(id='pruefamt', name='PrüfAmt', audience='Für Fuhrunternehmen & Flottenleiter',
         accent='oklch(47% 0.15 295)', ink='oklch(98% 0.005 300)',
         hook=('Juli 2026 ändert', 'alles.'),
         flows=[
             dict(img='suite-comply.png', focus='45% 30%', zoom=1.15,
                  spot=(19, 24, 49, 27), cursor=(40, 38),
                  caps=('Lenkzeiten je Fahrer, live.', 'Pausen laufen mit.')),
             dict(img='suite-comply.png', focus='45% 78%', zoom=1.18,
                  spot=(19, 55, 49, 12), cursor=(84, 55),
                  caps=('Fristen warnen, bevor sie ablaufen.', 'Das Kontroll-Paket per Klick.')),
         ],
         chips=['Auch Transporter ab 2,5 t', 'Audit-Paket per Klick', 'Dokumente mit Ampel'],
         cta='Demo testen', tag='Betriebsamt · die Werkzeuge von Lieferuhr'),

    dict(id='einsatzamt', name='EinsatzAmt', audience='Für Handwerksbetriebe 2–15 Monteure',
         accent='oklch(55% 0.19 30)', ink='oklch(99% 0.003 40)',
         hook=('Der Anruf, den', 'keiner mitbekam.'),
         flows=[
             dict(img='suite-hvac.png', focus='38% 40%', zoom=1.15,
                  spot=(19, 22, 42, 50), cursor=(35, 35),
                  caps=('Anruf, Mail, Formular — ein Eingang.', 'Erkannt: Gerät, Ort, Dringlichkeit.')),
             dict(img='suite-hvac.png', focus='82% 40%', zoom=1.2,
                  spot=(66, 20, 30, 55), cursor=(82, 50),
                  caps=('Techniker und Termin vorgeschlagen.', 'Kundenbestätigung als Entwurf.')),
         ],
         chips=['Aus jeder Anfrage ein Job', 'Vorschlag statt Zettel', 'Die Zentrale entscheidet'],
         cta='Demo testen', tag='Betriebsamt · die Werkzeuge von Lieferuhr'),

    dict(id='postamt', name='PostAmt', audience='Für kleine Großhändler & Lager',
         accent='oklch(50% 0.13 145)', ink='oklch(98% 0.005 145)',
         hook=('Bestellung als Mail.', 'Wieder.'),
         flows=[
             dict(img='suite-depot.png', focus='42% 32%', zoom=1.15,
                  spot=(19.5, 22, 46, 12), cursor=(42, 28),
                  caps=('Mail rein. Positionen raus.', 'Mengen und Artikel erkannt.')),
             dict(img='suite-depot.png', focus='82% 45%', zoom=1.2,
                  spot=(67, 33, 30, 22), cursor=(84, 59),
                  caps=('Bestand bucht automatisch ab.', 'Pickliste bis Versand.')),
         ],
         chips=['Kein ERP-Projekt', 'Bestand in Echtzeit', 'Konfidenz je Position'],
         cta='Demo testen', tag='Betriebsamt · die Werkzeuge von Lieferuhr'),
]

CSS = """
@page { margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; background: #e8ecf3; }
#root { position: relative; width: 100%; height: 100%; overflow: hidden;
        font-family: 'Geist', system-ui, sans-serif; color: #1c2430; }
.clip { position: absolute; inset: 0; overflow: hidden; }
.bg { position: absolute; inset: 0;
  background: radial-gradient(120% 90% at 20% 10%, #f4f6fa 0%, #e8ecf3 55%, #dfe4ee 100%); }
.center { position: absolute; inset: 0; display: flex; flex-direction: column;
          align-items: center; justify-content: center; text-align: center; }

/* hook — dark, kinetic */
.hook-bg { position: absolute; inset: 0; background: #10151d; }
.hook-glow { position: absolute; inset: -20%; opacity: .5; }
.hook-center { position: absolute; inset: 0; display: flex; flex-direction: column;
               align-items: center; justify-content: center; text-align: center; padding: 0 90px; }
.hook-kick { font-family: 'Geist Mono', monospace; font-size: 17px; letter-spacing: .22em;
             text-transform: uppercase; margin: 0 0 30px; }
.hook-line { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 76px;
             letter-spacing: -0.025em; line-height: 1.04; margin: 0; color: #eef1f6; }
.hook-line .accent { display: block; }
.hook-bar { height: 6px; border-radius: 3px; margin-top: 34px; width: 0; }

/* reveal */
.mark { width: 104px; height: 104px; border-radius: 28px; display: flex;
        align-items: center; justify-content: center;
        box-shadow: 10px 10px 26px rgba(94,110,140,.32), -6px -6px 18px rgba(255,255,255,.85); }
.mark svg { width: 56px; height: 56px; }
.ring { position: absolute; width: 104px; height: 104px; border-radius: 32px;
        border: 3px solid; opacity: 0; }
.rv-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 68px;
           letter-spacing: -0.02em; margin: 30px 0 0; color: #161c26; }
.rv-aud { font-size: 23px; font-weight: 600; margin: 12px 0 0; }

/* flow — full-bleed UI with camera */
.cam { position: absolute; inset: 0; }
.cam img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cam-tall { position: absolute; inset: 0; display: flex; align-items: center; justify-content: flex-end; padding-right: 12%; }
.cam-tall img { height: 620px; border-radius: 30px; display: block;
  box-shadow: 24px 30px 60px rgba(16,21,29,.45), 0 0 0 1px rgba(255,255,255,.35); }
.spot { position: absolute; border-radius: 18px; border: 3px solid;
        box-shadow: 0 0 0 4px rgba(255,255,255,.25), 0 0 34px 4px currentColor; opacity: 0; }
.cursor { position: absolute; left: 0; top: 0; width: 0; height: 0; z-index: 5; }
.cursor-dot { position: absolute; left: -9px; top: -9px; width: 18px; height: 18px;
  border-radius: 50%; background: #10151d; border: 2.5px solid #fff;
  box-shadow: 0 2px 10px rgba(16,21,29,.5); }
.cursor-ring { position: absolute; left: -22px; top: -22px; width: 44px; height: 44px;
  border-radius: 50%; border: 3px solid #fff; opacity: 0; }
.capbar { position: absolute; left: 56px; bottom: 52px; display: flex; align-items: center;
  gap: 12px; background: rgba(16,21,29,.88); border-radius: 999px; padding: 15px 26px;
  box-shadow: 0 14px 34px rgba(16,21,29,.4); z-index: 4; }
.capbar .dot { width: 11px; height: 11px; border-radius: 50%; flex: none; }
.cap-texts { height: 1.45em; overflow: hidden; }
.cap-col { display: flex; flex-direction: column; }
.cap-t { height: 1.45em; line-height: 1.45em; font-size: 22px; font-weight: 600;
         color: #f2f4f8; white-space: nowrap; }
.prod-tab { position: absolute; right: 56px; top: 46px; display: flex; align-items: center;
  gap: 10px; background: rgba(238,241,246,.92); border-radius: 999px; padding: 9px 18px;
  font-family: 'Geist Mono', monospace; font-size: 14px; font-weight: 600;
  letter-spacing: .14em; text-transform: uppercase; color: #2a3442;
  box-shadow: 0 6px 18px rgba(16,21,29,.18); z-index: 4; }
.prod-tab .dot { width: 9px; height: 9px; border-radius: 50%; }

/* chips */
.chips-wrap { position: absolute; inset: 0; display: flex; flex-direction: column;
              justify-content: center; padding-left: 110px; gap: 24px; }
.chips-kick { font-family: 'Geist Mono', monospace; font-size: 16px; letter-spacing: .2em;
              text-transform: uppercase; color: #5a6678; margin-bottom: 6px; }
.chip { display: flex; align-items: center; gap: 18px; width: fit-content;
        background: #edf0f6; border-radius: 20px; padding: 20px 34px 20px 22px;
        font-family: 'Space Grotesk', sans-serif; font-size: 30px; font-weight: 600;
        color: #1c2430;
        box-shadow: 12px 14px 30px rgba(94,110,140,.3), -6px -6px 18px rgba(255,255,255,.8); }
.chip .tick { width: 36px; height: 36px; border-radius: 50%; flex: none;
              display: flex; align-items: center; justify-content: center; }
.chip .tick svg { width: 19px; height: 19px; }

/* end card */
.end-cta { display: inline-flex; align-items: center; gap: 12px; border-radius: 999px;
  padding: 18px 38px; font-family: 'Space Grotesk', sans-serif; font-size: 27px;
  font-weight: 700; color: #fff; margin-top: 38px;
  box-shadow: 12px 14px 34px rgba(94,110,140,.4); }
.end-tag { font-family: 'Geist Mono', monospace; font-size: 15px; letter-spacing: .18em;
           text-transform: uppercase; color: #5a6678; margin-top: 30px; }
"""


def mark_svg(p, size=56):
    return (f'<svg viewBox="0 0 24 24" fill="none" stroke="{p["ink"]}" stroke-width="1.9" '
            f'stroke-linecap="round" stroke-linejoin="round">{GLYPHS[p["id"]]}</svg>')


def hook_scene(p):
    kick = 'Lieferuhr' if p['tag'].startswith('Ein Produkt') else 'Betriebsamt · von Lieferuhr'
    return f"""
  <section class="clip" data-start="0" data-duration="2.8">
    <div class="hook-bg"></div>
    <div class="hook-glow" style="background: radial-gradient(50% 45% at 50% 60%, {p['accent']} 0%, transparent 70%);"></div>
    <div class="hook-center">
      <p class="hook-kick" id="{p['id']}-kick" style="color:{p['accent']}">{kick}</p>
      <h1 class="hook-line"><span id="{p['id']}-h1">{p['hook'][0]}</span>
        <span class="accent" id="{p['id']}-h2" style="color:{p['accent']}">{p['hook'][1]}</span></h1>
      <div class="hook-bar" id="{p['id']}-hbar" style="background:{p['accent']}"></div>
    </div>
  </section>"""


def reveal_scene(p):
    return f"""
  <section class="clip" data-start="2.8" data-duration="{FLOW_A - 2.8:.2f}">
    <div class="bg"></div>
    <div class="center">
      <div class="mark" id="{p['id']}-mark" style="background:{p['accent']}">{mark_svg(p)}</div>
      <div class="ring" id="{p['id']}-ring" style="border-color:{p['accent']}"></div>
      <h1 class="rv-name" id="{p['id']}-name">{p['name']}</h1>
      <p class="rv-aud" id="{p['id']}-aud" style="color:{p['accent']}">{p['audience']}</p>
    </div>
  </section>"""


def flow_scene(p, i, flow, start, dur, click_at):
    sid = f"{p['id']}-f{i}"
    if flow.get('tall'):
        shot = f"""<div class="cam-tall" id="{sid}-cam"><img src="assets/{flow['img']}" /></div>"""
    else:
        shot = f"""<div class="cam" id="{sid}-cam"><img src="assets/{flow['img']}" /></div>"""
    spot = ''
    if flow.get('spot'):
        l, t, w, h = flow['spot']
        spot = (f'<div class="spot" id="{sid}-spot" '
                f'style="left:{l}%;top:{t}%;width:{w}%;height:{h}%;border-color:{p["accent"]};color:{p["accent"]}"></div>')
    cx, cy = flow['cursor']
    return f"""
  <section class="clip" data-start="{start}" data-duration="{dur:.2f}">
    <div class="bg" style="background: radial-gradient(110% 90% at 80% 15%, #f0f3f8 0%, #e8ecf3 60%, #dde2ec 100%);"></div>
    {shot}
    {spot}
    <div class="cursor" id="{sid}-cur">
      <div class="cursor-ring" id="{sid}-ring"></div>
      <div class="cursor-dot"></div>
    </div>
    <div class="prod-tab"><span class="dot" style="background:{p['accent']}"></span>{p['name']}</div>
    <div class="capbar" id="{sid}-capbar">
      <span class="dot" style="background:{p['accent']}"></span>
      <div class="cap-texts"><div class="cap-col" id="{sid}-caps">
        <span class="cap-t">{flow['caps'][0]}</span>
        <span class="cap-t">{flow['caps'][1]}</span>
      </div></div>
    </div>
  </section>"""


def chips_scene(p, start, dur):
    rows = ''.join(
        f'<div class="chip" id="{p["id"]}-chip-{i}">'
        f'<span class="tick" style="background:{p["accent"]}">'
        f'<svg viewBox="0 0 24 24" fill="none" stroke="{p["ink"]}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>'
        f'</span>{c}</div>'
        for i, c in enumerate(p['chips']))
    return f"""
  <section class="clip" data-start="{start}" data-duration="{dur:.2f}">
    <div class="bg"></div>
    <div class="chips-wrap">
      <p class="chips-kick" id="{p['id']}-ckick">{p['name']}</p>
      {rows}
    </div>
  </section>"""


def end_scene(p, start, dur):
    return f"""
  <section class="clip" data-start="{start}" data-duration="{dur:.2f}">
    <div class="bg"></div>
    <div class="hook-glow" style="background: radial-gradient(55% 50% at 50% 55%, {p['accent']}22 0%, transparent 70%); opacity:1;"></div>
    <div class="center">
      <div class="mark" id="{p['id']}-emark" style="background:{p['accent']}; width:76px; height:76px; border-radius:22px;">{mark_svg(p)}</div>
      <h1 class="rv-name" id="{p['id']}-ename" style="font-size:60px;">{p['name']}</h1>
      <div class="end-cta" id="{p['id']}-cta" style="background:{p['accent']}">{p['cta']}
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </div>
      <p class="end-tag" id="{p['id']}-etag">{p['tag']}</p>
    </div>
  </section>"""


def audio(pid):
    sfx = [(0.45, 'impact-light', .5), (1.35, 'impact-light', .35), (BEAT_REVEAL, 'impact-light', .45),
           (CLICK_A, 'click', .6), (CLICK_B, 'click', .6),
           (CHIPS[0], 'tick', .5), (CHIPS[1], 'tick', .5), (CHIPS[2], 'tick', .5),
           (END, 'select', .55)]
    els = [f'<audio id="{pid}-music" src="assets/music/happy-beats.mp3" data-start="0" data-duration="{DUR}" data-volume="0.3"></audio>']
    els += [f'<audio id="{pid}-sfx-{k}" src="assets/sfx/{n}.ogg" data-start="{t}" data-volume="{v}"></audio>'
            for k, (t, n, v) in enumerate(sfx)]
    return '\n'.join(els)


def build(p):
    a_end = FLOW_B
    scenes = [hook_scene(p), reveal_scene(p),
              flow_scene(p, 0, p['flows'][0], FLOW_A, a_end - FLOW_A, CLICK_A),
              flow_scene(p, 1, p['flows'][1], FLOW_B, CHIPS[0] - 0.5 - FLOW_B, CLICK_B),
              chips_scene(p, CHIPS[0] - 0.5, END - (CHIPS[0] - 0.5)),
              end_scene(p, END, DUR - END)]

    i = p['id']
    anims = f"""
  const tl = gsap.timeline({{ paused: true }});
  // hook — word slam + underline sweep
  tl.from('#{i}-kick', {{ opacity: 0, duration: 0.4 }}, 0.2)
    .from('#{i}-h1', {{ y: 70, opacity: 0, rotation: -2, duration: 0.55, ease: 'power4.out' }}, 0.4)
    .from('#{i}-h2', {{ y: 90, opacity: 0, duration: 0.6, ease: 'power4.out' }}, 1.3)
    .to('#{i}-hbar', {{ width: 340, duration: 0.55, ease: 'power3.inOut' }}, 1.75);
  // reveal — mark punch on the first beat ({BEAT_REVEAL})
  tl.from('#{i}-mark', {{ scale: 0.4, opacity: 0, duration: 0.55, ease: 'back.out(2)' }}, {BEAT_REVEAL})
    .fromTo('#{i}-ring', {{ scale: 0.8, opacity: 0.9 }}, {{ scale: 1.9, opacity: 0, duration: 0.8, ease: 'power2.out' }}, {BEAT_REVEAL + 0.05})
    .from('#{i}-name', {{ y: 38, opacity: 0, duration: 0.5, ease: 'power3.out' }}, {BEAT_REVEAL + 0.25})
    .from('#{i}-aud', {{ y: 22, opacity: 0, duration: 0.45, ease: 'power3.out' }}, {BEAT_REVEAL + 0.45});"""

    for idx, (flow, start, dur, click_at) in enumerate(zip(
            p['flows'], [FLOW_A, FLOW_B],
            [a_end - FLOW_A, CHIPS[0] - 0.5 - FLOW_B], [CLICK_A, CLICK_B])):
        sid = f"{i}-f{idx}"
        end = start + dur
        swap = start + dur * 0.55
        spot_in, spot_out = start + 1.15, end - 0.35
        if flow.get('tall'):
            anims += f"""
  tl.fromTo('#{sid}-cam', {{ x: 80, opacity: 0, rotation: 2 }}, {{ x: 0, opacity: 1, rotation: 0, duration: 0.7, ease: 'power3.out' }}, {start + 0.05})
    .fromTo('#{sid}-cam img', {{ scale: 1 }}, {{ scale: 1.05, y: -18, duration: {dur:.2f}, ease: 'none' }}, {start});"""
        else:
            anims += f"""
  tl.fromTo('#{sid}-cam', {{ opacity: 0 }}, {{ opacity: 1, duration: 0.35 }}, {start})
    .fromTo('#{sid}-cam', {{ scale: 1.0, transformOrigin: '{flow['focus']}' }},
           {{ scale: {flow['zoom']}, duration: {dur:.2f}, ease: 'none', immediateRender: false }}, {start});"""
        if flow.get('spot'):
            anims += f"""
  tl.fromTo('#{sid}-spot', {{ opacity: 0, scale: 0.85 }}, {{ opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)', immediateRender: false }}, {spot_in})
    .to('#{sid}-spot', {{ opacity: 0, duration: 0.3 }}, {spot_out});"""
        cx, cy = flow['cursor']
        cxp, cyp = cx * W / 100, cy * H / 100
        ex, ey = min(cx + 10, 96) * W / 100, min(cy + 22, 104) * H / 100
        anims += f"""
  tl.fromTo('#{sid}-cur', {{ x: {cxp + 190}, y: {H + 40}, opacity: 0 }},
           {{ x: {cxp}, y: {cyp}, opacity: 1, duration: 1.1, ease: 'power2.inOut' }}, {click_at - 1.15})
    .fromTo('#{sid}-ring', {{ scale: 0.3, opacity: 0.9 }}, {{ scale: 1.9, opacity: 0, duration: 0.6, ease: 'power2.out', immediateRender: false }}, {click_at})
    .fromTo('#{sid}-cur .cursor-dot', {{ scale: 1 }}, {{ scale: 0.75, duration: 0.12, yoyo: true, repeat: 1, immediateRender: false }}, {click_at})
    .to('#{sid}-cur', {{ x: {ex}, y: {ey}, opacity: 0, duration: 0.9, ease: 'power2.in' }}, {end - 1.0})
    .fromTo('#{sid}-caps', {{ y: 0 }}, {{ y: '-1.45em', duration: 0.5, ease: 'power3.inOut', immediateRender: false }}, {swap})
    .from('#{sid}-capbar', {{ y: 24, opacity: 0, duration: 0.5, ease: 'power3.out' }}, {start + 0.4});"""

    chips_in = CHIPS[0] - 0.5
    anims += f"""
  tl.from('#{i}-ckick', {{ opacity: 0, y: 14, duration: 0.4 }}, {chips_in + 0.15});"""
    for j, bt in enumerate(CHIPS):
        anims += f"""
  tl.from('#{i}-chip-{j}', {{ x: -70, opacity: 0, duration: 0.45, ease: 'power3.out' }}, {bt});"""
    anims += f"""
  tl.from('#{i}-emark', {{ scale: 0.5, opacity: 0, duration: 0.5, ease: 'back.out(2)' }}, {END + 0.12})
    .from('#{i}-ename', {{ y: 30, opacity: 0, duration: 0.5, ease: 'power3.out' }}, {END + 0.28})
    .from('#{i}-cta', {{ scale: 0.8, opacity: 0, duration: 0.5, ease: 'back.out(1.8)' }}, {END + 0.55})
    .to('#{i}-cta', {{ scale: 1.05, duration: 0.35, yoyo: true, repeat: 1, ease: 'power2.inOut' }}, {END + 1.5})
    .from('#{i}-etag', {{ opacity: 0, duration: 0.45 }}, {END + 0.85});
  window.__timelines['{i}'] = tl;"""

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
@font-face {{ font-family: 'Geist Mono'; src: url('assets/fonts/geist-mono.woff2') format('woff2'); font-weight: 100 900; }}
{CSS}
</style>
</head>
<body>
<div id="root" data-composition-id="{p['id']}" data-start="0" data-width="{W}" data-height="{H}" data-duration="{DUR}">
{''.join(scenes)}
</div>
{audio(p['id'])}
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
