import React, { useEffect, useRef } from 'react';

const svgContent = `
<svg id="S" viewBox="0 0 780 440" style="width:100%;height:100%;display:block;">
<defs>
  <linearGradient id="gG" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0%" stop-color="#166534"/>
    <stop offset="100%" stop-color="#4ade80"/>
  </linearGradient>
  <linearGradient id="eG" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0%" stop-color="#78350f"/>
    <stop offset="100%" stop-color="#fbbf24"/>
  </linearGradient>
  <linearGradient id="jG" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0%" stop-color="#7f1d1d"/>
    <stop offset="100%" stop-color="#f87171"/>
  </linearGradient>
</defs>

<!-- Background -->
<rect width="780" height="440" fill="#040c06"/>

<!-- Subtle vertical separator -->
<line x1="400" y1="30" x2="400" y2="415" stroke="#0c1a0e" stroke-width="1"/>

<!-- Grid lines behind bars -->
<g stroke="#0c1a0e" stroke-width="1">
  <line x1="450" y1="90"  x2="690" y2="90"/>
  <line x1="450" y1="161" x2="690" y2="161"/>
  <line x1="450" y1="232" x2="690" y2="232"/>
  <line x1="450" y1="303" x2="690" y2="303"/>
  <line x1="450" y1="375" x2="690" y2="375"/>
</g>

<!-- Bar fills (drawn first, under containers) -->
<rect id="gF" x="462" y="375" width="52" height="0" fill="url(#gG)" rx="4"/>
<rect id="eF" x="548" y="375" width="52" height="0" fill="url(#eG)" rx="4"/>
<rect id="jF" x="634" y="375" width="52" height="0" fill="url(#jG)" rx="4"/>

<!-- Bar containers (drawn on top of fills) -->
<rect x="462" y="90" width="52" height="285" fill="none" stroke="#163d22" stroke-width="1.5" rx="4"/>
<rect x="548" y="90" width="52" height="285" fill="none" stroke="#3d2008" stroke-width="1.5" rx="4"/>
<rect x="634" y="90" width="52" height="285" fill="none" stroke="#3d0808" stroke-width="1.5" rx="4"/>

<!-- Bar value labels -->
<text id="gV" x="488"  y="83" text-anchor="middle" fill="#4ade80" font-size="11" font-family="'Courier New',monospace">0%</text>
<text id="eV" x="574"  y="83" text-anchor="middle" fill="#fbbf24" font-size="11" font-family="'Courier New',monospace">0%</text>
<text id="jV" x="660"  y="83" text-anchor="middle" fill="#f87171" font-size="11" font-family="'Courier New',monospace">0%</text>

<!-- Bar labels -->
<text x="488"  y="400" text-anchor="middle" fill="#4ade8088" font-size="9.5" font-family="'Courier New',monospace" letter-spacing="0.5">GAINS</text>
<text x="574"  y="400" text-anchor="middle" fill="#fbbf2488" font-size="9.5" font-family="'Courier New',monospace" letter-spacing="0.5">EXERTION</text>
<text x="660"  y="400" text-anchor="middle" fill="#f8717188" font-size="9"   font-family="'Courier New',monospace" letter-spacing="0.5">JOINT STRESS</text>

<!-- Phase label -->
<text id="pL" x="195" y="46" text-anchor="middle" fill="#fbbf24" font-size="22" font-weight="bold" font-family="'Courier New',monospace" letter-spacing="5">LOAD</text>

<!-- Week label -->
<text id="wL" x="195" y="72" text-anchor="middle" fill="#6a9e78" font-size="13" font-family="'Courier New',monospace" letter-spacing="3">WEEK 1</text>

<!-- Week dots -->
<circle id="d1" cx="166" cy="94" r="5" fill="#fbbf24"/>
<circle id="d2" cx="195" cy="94" r="5" fill="none" stroke="#1e3528" stroke-width="1.5"/>
<circle id="d3" cx="224" cy="94" r="5" fill="none" stroke="#1e3528" stroke-width="1.5"/>

<!-- Bench -->
<rect x="108" y="307" width="184" height="14" fill="#0d1c12" stroke="#182d1e" stroke-width="2" rx="2"/>
<line x1="130" y1="321" x2="118" y2="360" stroke="#182d1e" stroke-width="3" stroke-linecap="round"/>
<line x1="274" y1="321" x2="286" y2="360" stroke="#182d1e" stroke-width="3" stroke-linecap="round"/>

<!-- Static body: torso, legs, feet -->
<g stroke="#86efac" stroke-width="3" stroke-linecap="round" fill="none">
  <line x1="200" y1="182" x2="200" y2="292"/>
  <line x1="200" y1="285" x2="158" y2="307"/>
  <line x1="200" y1="285" x2="242" y2="307"/>
  <line x1="158" y1="307" x2="140" y2="355"/>
  <line x1="242" y1="307" x2="260" y2="355"/>
  <line x1="140" y1="355" x2="120" y2="355"/>
  <line x1="260" y1="355" x2="280" y2="355"/>
</g>

<!-- Dynamic arms -->
<line id="lU" x1="185" y1="205" x2="145" y2="228" stroke="#86efac" stroke-width="3" stroke-linecap="round"/>
<line id="lF" x1="145" y1="228" x2="152" y2="200" stroke="#86efac" stroke-width="3" stroke-linecap="round"/>
<line id="rU" x1="215" y1="205" x2="255" y2="228" stroke="#86efac" stroke-width="3" stroke-linecap="round"/>
<line id="rF" x1="255" y1="228" x2="248" y2="200" stroke="#86efac" stroke-width="3" stroke-linecap="round"/>

<!-- Left dumbbell: handle + plates -->
<line id="lL"  x1="140" y1="200" x2="164" y2="200" stroke="#86efac" stroke-width="2.5" stroke-linecap="round"/>
<rect id="lPa" x="131" y="194" width="9" height="12" fill="#4ade80" rx="1.5"/>
<rect id="lPb" x="164" y="194" width="9" height="12" fill="#4ade80" rx="1.5"/>

<!-- Right dumbbell -->
<line id="rL"  x1="236" y1="200" x2="260" y2="200" stroke="#86efac" stroke-width="2.5" stroke-linecap="round"/>
<rect id="rPa" x="227" y="194" width="9" height="12" fill="#4ade80" rx="1.5"/>
<rect id="rPb" x="260" y="194" width="9" height="12" fill="#4ade80" rx="1.5"/>

<!-- Head -->
<circle cx="200" cy="157" r="23" fill="none" stroke="#86efac" stroke-width="3"/>

<!-- Eyebrows (dynamic) -->
<line id="eb1" x1="188" y1="146" x2="196" y2="146" stroke="#86efac" stroke-width="2" stroke-linecap="round"/>
<line id="eb2" x1="204" y1="146" x2="212" y2="146" stroke="#86efac" stroke-width="2" stroke-linecap="round"/>

<!-- Eyes -->
<circle cx="192" cy="154" r="2.5" fill="#86efac"/>
<circle cx="208" cy="154" r="2.5" fill="#86efac"/>

<!-- Mouth (dynamic) -->
<path id="mth" d="M 192 166 Q 200 164 208 166" fill="none" stroke="#86efac" stroke-width="2.5" stroke-linecap="round"/>

<!-- Sweat drops -->
<ellipse id="sw1" cx="225" cy="143" rx="2.5" ry="4"   fill="#7dd3fc" opacity="0" transform="rotate(-15,225,143)"/>
<ellipse id="sw2" cx="218" cy="135" rx="2"   ry="3.5" fill="#7dd3fc" opacity="0" transform="rotate(-5,218,135)"/>

<!-- Subtle branding -->
<text x="590" y="428" text-anchor="middle" fill="#0f2012" font-size="9.5" font-family="'Courier New',monospace" letter-spacing="3">LOADBUDDY</text>
</svg>
`;

export default function HeroAnimation() {
  const containerRef = useRef(null);

  useEffect(() => {
    let cancel = false;
    let rafId;

    const C = 14000;
    const BT = 90, BB = 375, BH = 285;

    const root = containerRef.current;
    if (!root) return;

    const $ = id => root.querySelector('#' + id);
    const sa = (id, k, v) => {
      const e = $(id);
      if (e) e.setAttribute(k, String(v));
    };
    const sl = (id, x1, y1, x2, y2) => {
      const e = $(id);
      if (e) {
        e.setAttribute('x1', x1.toFixed(1));
        e.setAttribute('y1', y1.toFixed(1));
        e.setAttribute('x2', x2.toFixed(1));
        e.setAttribute('y2', y2.toFixed(1));
      }
    };
    const ez = t => t < 0.5 ? 2*t*t : -1 + (4-2*t)*t;
    const lp = (a, b, t) => a + (b - a) * t;

    const KF = [
      [0.00,  0.04, 0.04, 0.04],
      [0.143, 0.28, 0.35, 0.30],
      [0.286, 0.52, 0.62, 0.56],
      [0.429, 0.70, 0.84, 0.78],
      [0.440, 0.70, 0.84, 0.78],
      [0.571, 0.71, 0.28, 0.24],
      [0.714, 0.82, 0.52, 0.47],
      [0.857, 0.91, 0.72, 0.67],
      [1.00,  1.00, 0.92, 0.86],
    ];

    function getBarLevels(nt) {
      let i = 0;
      while (i < KF.length - 1 && KF[i+1][0] <= nt) i++;
      if (i >= KF.length - 1) return { g: KF[KF.length-1][1], e: KF[KF.length-1][2], j: KF[KF.length-1][3] };
      const [t0, g0, e0, j0] = KF[i];
      const [t1, g1, e1, j1] = KF[i+1];
      const p = ez((nt - t0) / (t1 - t0));
      return { g: lp(g0, g1, p), e: lp(e0, e1, p), j: lp(j0, j1, p) };
    }

    function getPhase(nt) {
      if (nt < 0.143) return { p: 'load',   w: 1 };
      if (nt < 0.286) return { p: 'load',   w: 2 };
      if (nt < 0.429) return { p: 'load',   w: 3 };
      if (nt < 0.571) return { p: 'deload', w: 1 };
      if (nt < 0.714) return { p: 'load',   w: 1 };
      if (nt < 0.857) return { p: 'load',   w: 2 };
      return                 { p: 'load',   w: 3 };
    }

    const ARM = {
      dn: {
        lu: [185, 205, 145, 228], lf: [145, 228, 152, 200], lh: [152, 200],
        ru: [215, 205, 255, 228], rf: [255, 228, 248, 200], rh: [248, 200],
      },
      up: {
        lu: [185, 205, 162, 175], lf: [162, 175, 153, 148], lh: [153, 148],
        ru: [215, 205, 238, 175], rf: [238, 175, 247, 148], rh: [247, 148],
      }
    };

    function armLerp(key, t) {
      return ARM.dn[key].map((v, i) => lp(v, ARM.up[key][i], t));
    }

    let lastPW = '', wct = 0;
    let lastP  = '', pct = 0;

    function frame(now) {
      if (cancel) return;
      const nt = (now % C) / C;
      const bl = getBarLevels(nt);
      const pi = getPhase(nt);
      const isDL   = pi.p === 'deload';
      const isLoad = pi.p === 'load';

      const fd = 0.04;
      const fade = nt < fd ? ez(nt / fd) : (nt > 1 - fd ? ez((1 - nt) / fd) : 1);

      function setBar(id, lv) {
        const h = BH * Math.min(1, lv) * fade;
        sa(id, 'y', (BB - h).toFixed(1));
        sa(id, 'height', h.toFixed(1));
      }
      setBar('gF', bl.g); setBar('eF', bl.e); setBar('jF', bl.j);

      if ($('gV')) $('gV').textContent = Math.round(bl.g * 100) + '%';
      if ($('eV')) $('eV').textContent = Math.round(bl.e * 100) + '%';
      if ($('jV')) $('jV').textContent = Math.round(bl.j * 100) + '%';
      ['gV','eV','jV'].forEach(id => sa(id, 'opacity', fade.toFixed(3)));

      const pw = pi.p + pi.w;
      if (pw !== lastPW) { lastPW = pw; wct = now; }
      if (pi.p !== lastP) { lastP = pi.p; pct = now; }

      const dlColor  = '#4ade80';
      const ldColor  = '#fbbf24';
      const dotColor = isDL ? dlColor : ldColor;

      if ($('pL')) {
        $('pL').textContent = isDL ? 'DELOAD' : 'LOAD';
        sa('pL', 'fill', isDL ? dlColor : ldColor);
        sa('pL', 'opacity', fade.toFixed(3));
        const pet = now - pct;
        const ps = pet < 500 ? 1 + 0.22 * Math.sin(pet / 500 * Math.PI) : 1;
        sa('pL', 'transform', `translate(195,46) scale(${ps.toFixed(3)}) translate(-195,-46)`);
      }

      if ($('wL')) {
        const wet = now - wct;
        const ws = wet < 450 ? 1 + 0.38 * Math.sin(wet / 450 * Math.PI) : 1;
        $('wL').textContent = 'WEEK ' + pi.w;
        sa('wL', 'fill', isDL ? dlColor : '#6a9e78');
        sa('wL', 'transform', `translate(195,72) scale(${ws.toFixed(3)}) translate(-195,-72)`);
        sa('wL', 'opacity', fade.toFixed(3));
      }

      const maxD = isDL ? 1 : 3;
      [1, 2, 3].forEach(w => {
        const active = w <= pi.w && w <= maxD;
        sa('d' + w, 'fill',         active ? dotColor : 'none');
        sa('d' + w, 'stroke',       active ? 'none' : (w <= maxD ? '#1e3528' : '#111c13'));
        sa('d' + w, 'stroke-width', '1.5');
        sa('d' + w, 'opacity',      fade.toFixed(3));
      });

      let armT;
      if (isLoad) {
        armT = 0.5 + 0.5 * Math.sin(now / 430 * Math.PI);
      } else {
        armT = 0.18 + 0.07 * Math.sin(now / 2400 * Math.PI);
      }

      const lu = armLerp('lu', armT), lf = armLerp('lf', armT);
      const ru = armLerp('ru', armT), rf = armLerp('rf', armT);
      const lh = armLerp('lh', armT), rh = armLerp('rh', armT);

      sl('lU', lu[0], lu[1], lu[2], lu[3]);
      sl('lF', lf[0], lf[1], lf[2], lf[3]);
      sl('rU', ru[0], ru[1], ru[2], ru[3]);
      sl('rF', rf[0], rf[1], rf[2], rf[3]);

      const lx = lh[0], ly = lh[1];
      sl('lL', lx - 12, ly, lx + 10, ly);
      sa('lPa', 'x', (lx - 21).toFixed(1)); sa('lPa', 'y', (ly - 6).toFixed(1));
      sa('lPb', 'x', (lx + 10).toFixed(1)); sa('lPb', 'y', (ly - 6).toFixed(1));

      const rx = rh[0], ry = rh[1];
      sl('rL', rx - 10, ry, rx + 12, ry);
      sa('rPa', 'x', (rx - 19).toFixed(1)); sa('rPa', 'y', (ry - 6).toFixed(1));
      sa('rPb', 'x', (rx + 12).toFixed(1)); sa('rPb', 'y', (ry - 6).toFixed(1));

      if (isDL) {
        sa('mth', 'd', 'M 192 162 Q 200 172 208 162');
        sl('eb1', 188, 147, 196, 144);
        sl('eb2', 204, 144, 212, 147);
        sa('sw1', 'opacity', '0'); sa('sw2', 'opacity', '0');
      } else {
        const conc = pi.w === 3 ? 0.8 : pi.w === 2 ? 0.35 : 0.0;
        if (conc > 0.3) {
          sa('mth', 'd', 'M 192 168 Q 200 165 208 168');
          sl('eb1', 188, 145, 196, 148);
          sl('eb2', 204, 148, 212, 145);
        } else {
          sa('mth', 'd', 'M 192 166 Q 200 164 208 166');
          sl('eb1', 188, 146, 196, 146);
          sl('eb2', 204, 146, 212, 146);
        }
        if (pi.w >= 2) {
          const swI = pi.w === 3 ? 0.75 : 0.35;
          const swP = swI * (0.5 + 0.5 * Math.sin(now / 650 * Math.PI));
          sa('sw1', 'opacity', swP.toFixed(2));
          sa('sw2', 'opacity', (swP * 0.65).toFixed(2));
        } else {
          sa('sw1', 'opacity', '0'); sa('sw2', 'opacity', '0');
        }
      }

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);

    return () => {
      cancel = true;
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
