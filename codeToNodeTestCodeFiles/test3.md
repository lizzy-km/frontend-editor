<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Salt &amp; Ember — Master Chef Championship 2026</title>
<meta name="description" content="Two days, twelve finalists, one master chef. Salt & Ember Championship, 21–22 November 2026.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Figtree:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#E6EBE0; --surface:#F4F6F0; --ink:#2B1B2E; --muted:#5E5361;
  --saffron:#E8A33D; --saffron-ink:#7A4E0C; --herb:#3F6B4A; --line:#C9D1C1;
  --ticket:#FFFDF6; --shadow:0 1px 0 rgba(43,27,46,.08), 0 14px 30px -18px rgba(43,27,46,.45);
  --serif:"Young Serif", Georgia, "Times New Roman", serif;
  --sans:"Figtree", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  box-sizing:border-box;
  padding-top:env(safe-area-inset-top,0px); padding-bottom:env(safe-area-inset-bottom,0px);
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --bg:#1E1521; --surface:#2A1F2D; --ink:#EFE9E2; --muted:#B7ACB5;
    --saffron:#F0B458; --saffron-ink:#F0B458; --herb:#8CC19A; --line:#3E3142;
    --ticket:#332737; --shadow:0 14px 30px -18px rgba(0,0,0,.8);
  }
}
:root[data-theme="dark"]{
  --bg:#1E1521; --surface:#2A1F2D; --ink:#EFE9E2; --muted:#B7ACB5;
  --saffron:#F0B458; --saffron-ink:#F0B458; --herb:#8CC19A; --line:#3E3142;
  --ticket:#332737; --shadow:0 14px 30px -18px rgba(0,0,0,.8);
}
*,*::before,*::after{box-sizing:inherit}
html{scroll-behavior:smooth; scroll-padding-top:calc(env(safe-area-inset-top,0px) + 72px)}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto} *{animation:none!important;transition:none!important}}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:1.0625rem;line-height:1.6;-webkit-font-smoothing:antialiased}
img,svg{max-width:100%}
a{color:inherit}
:focus-visible{outline:3px solid var(--saffron);outline-offset:3px;border-radius:4px}
.wrap{width:min(1120px,100% - 2.5rem);margin-inline:auto}
h1,h2,h3{font-family:var(--serif);font-weight:400;line-height:1.1;margin:0}
h2{font-size:clamp(2rem,4.5vw,3rem);margin-bottom:.75rem}
p{margin:0 0 1rem}
.lede{color:var(--muted);max-width:60ch;font-size:1.125rem}
section{padding:clamp(4rem,9vw,7rem) 0}

/* Nav */
.nav{position:sticky;top:env(safe-area-inset-top,0px);z-index:20;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.nav .wrap{display:flex;align-items:center;justify-content:space-between;height:64px;gap:1rem}
.brand{font-family:var(--serif);font-size:1.3rem;text-decoration:none;display:flex;align-items:center;gap:.5rem}
.brand svg{width:26px;height:26px}
.nav ul{display:flex;gap:1.5rem;list-style:none;margin:0;padding:0}
.nav ul a{text-decoration:none;font-weight:500;font-size:.95rem;color:var(--muted)}
.nav ul a:hover{color:var(--ink)}
.nav-actions{display:flex;align-items:center;gap:.5rem}
.theme-btn{background:none;border:1px solid var(--line);color:var(--ink);width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:1rem}
.menu-btn{display:none}
@media (max-width:820px){
  .nav ul{display:none;position:absolute;top:64px;left:0;right:0;flex-direction:column;gap:0;background:var(--surface);border-bottom:1px solid var(--line);padding:.5rem 1.25rem 1rem}
  .nav ul.open{display:flex}
  .nav ul a{display:block;padding:.75rem 0;font-size:1.05rem}
  .menu-btn{display:inline-grid;place-items:center}
}

.btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;font:600 1rem var(--sans);padding:.85rem 1.4rem;border-radius:999px;border:2px solid var(--ink);background:var(--ink);color:var(--bg);text-decoration:none;cursor:pointer;transition:transform .15s}
.btn:hover{transform:translateY(-1px)}
.btn.ghost{background:transparent;color:var(--ink)}
.btn.small{padding:.55rem 1rem;font-size:.9rem}

/* Hero */
.hero{padding:clamp(3rem,7vw,5.5rem) 0 clamp(3rem,7vw,5rem)}
.hero .wrap{display:grid;grid-template-columns:1.25fr 1fr;gap:clamp(2rem,5vw,4rem);align-items:center}
.hero h1{font-size:clamp(3rem,9vw,6.4rem);letter-spacing:-.02em}
.hero h1 span{display:block;font-size:.42em;letter-spacing:0;color:var(--herb);margin-top:.6rem}
.hero .when{font-weight:600;margin:1.5rem 0 .25rem}
.hero .where{color:var(--muted);margin-bottom:2rem}
.hero-ctas{display:flex;flex-wrap:wrap;gap:.75rem}
@media (max-width:820px){.hero .wrap{grid-template-columns:1fr}}

/* Kitchen timer countdown */
.timer{position:relative;aspect-ratio:1;max-width:420px;width:100%;margin-inline:auto}
.timer svg{width:100%;height:100%;display:block}
.timer .face{position:absolute;inset:0;display:grid;place-content:center;text-align:center}
.timer .days{font-family:var(--serif);font-size:clamp(4rem,12vw,6.5rem);line-height:1}
.timer .unit{color:var(--muted);font-weight:500}
.timer .hms{font-variant-numeric:tabular-nums;font-weight:600;font-size:1.25rem;margin-top:.5rem}
.dial-hand{transform-origin:200px 200px;transition:transform 1s cubic-bezier(.3,1.6,.5,1)}

/* Facts strip */
.facts{border-block:1px solid var(--line);padding:1.75rem 0;background:var(--surface)}
.facts dl{display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem;margin:0}
.facts dt{color:var(--muted);font-size:.9rem}
.facts dd{margin:0;font-family:var(--serif);font-size:1.6rem}
@media (max-width:700px){.facts dl{grid-template-columns:repeat(2,1fr)}}

/* About */
.about .wrap{display:grid;grid-template-columns:1fr 1fr;gap:clamp(2rem,6vw,5rem)}
.about blockquote{margin:0;font-family:var(--serif);font-size:clamp(1.4rem,2.6vw,1.9rem);line-height:1.35;border-left:4px solid var(--saffron);padding-left:1.25rem}
.about cite{display:block;font:500 1rem var(--sans);color:var(--muted);font-style:normal;margin-top:1rem}
@media (max-width:820px){.about .wrap{grid-template-columns:1fr}}

/* Rounds — order tickets on a rail */
.rounds{background:var(--surface)}
.rail{margin-top:2.5rem;position:relative;display:flex;gap:1.25rem;overflow-x:auto;padding:28px 4px 20px;scroll-snap-type:x mandatory}
.rail::before{content:"";position:absolute;left:0;right:0;top:12px;height:10px;border-radius:6px;background:linear-gradient(var(--line),color-mix(in srgb,var(--line) 60%,var(--ink)));min-width:100%}
.ticket{flex:0 0 min(270px,80vw);scroll-snap-align:start;background:var(--ticket);box-shadow:var(--shadow);padding:1.4rem 1.3rem 1.6rem;position:relative;transform:rotate(var(--r,0deg));
  -webkit-mask:radial-gradient(circle 7px at 50% 100%,#0000 98%,#000) 50% 100%/18px 100% repeat-x;mask:radial-gradient(circle 7px at 50% 100%,#0000 98%,#000) 50% 100%/18px 100% repeat-x}
.ticket::before{content:"";position:absolute;top:-16px;left:50%;width:34px;height:22px;margin-left:-17px;background:var(--muted);border-radius:4px;opacity:.55}
.ticket .no{font-family:var(--serif);font-size:2.4rem;color:var(--saffron-ink);line-height:1}
.ticket h3{font-size:1.35rem;margin:.4rem 0 .2rem}
.ticket .time{font-weight:600;font-size:.9rem;color:var(--herb);margin-bottom:.75rem}
.ticket p{font-size:.95rem;color:var(--muted);margin:0}
.ticket .meta{border-top:1px dashed var(--line);margin-top:1rem;padding-top:.75rem;font-size:.85rem}

/* Schedule */
.tabs{display:flex;gap:.5rem;margin:2rem 0 1.5rem}
.tab{font:600 .95rem var(--sans);padding:.6rem 1.2rem;border-radius:999px;border:1px solid var(--line);background:transparent;color:var(--ink);cursor:pointer}
.tab[aria-selected="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.agenda{list-style:none;margin:0;padding:0;border-top:1px solid var(--line)}
.agenda li{display:grid;grid-template-columns:120px 1fr auto;gap:1.5rem;padding:1.25rem 0;border-bottom:1px solid var(--line);align-items:baseline}
.agenda time{font-variant-numeric:tabular-nums;font-weight:600}
.agenda h3{font-family:var(--sans);font-weight:600;font-size:1.1rem;margin-bottom:.2rem}
.agenda p{color:var(--muted);margin:0;font-size:.95rem}
.tag{font-size:.8rem;font-weight:600;padding:.2rem .6rem;border-radius:999px;background:color-mix(in srgb,var(--herb) 16%,transparent);color:var(--herb);white-space:nowrap}
.tag.live{background:color-mix(in srgb,var(--saffron) 25%,transparent);color:var(--saffron-ink)}
@media (max-width:640px){.agenda li{grid-template-columns:1fr;gap:.35rem}}

/* Judges */
.judges-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;margin-top:2.5rem}
.judge .portrait{aspect-ratio:4/5;border-radius:200px 200px 12px 12px;display:grid;place-items:center;font-family:var(--serif);font-size:3rem;color:var(--bg);margin-bottom:1rem}
.judge h3{font-size:1.3rem}
.judge .role{color:var(--herb);font-weight:600;font-size:.9rem;margin:.2rem 0 .5rem}
.judge p{color:var(--muted);font-size:.95rem;margin:0}
@media (max-width:900px){.judges-grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:480px){.judges-grid{grid-template-columns:1fr}}

/* Tickets */
.passes{background:var(--surface)}
.pass-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;margin-top:2.5rem;align-items:stretch}
.pass{border:1px solid var(--line);border-radius:16px;padding:1.75rem;display:flex;flex-direction:column;background:var(--bg)}
.pass.featured{border:2px solid var(--ink);position:relative}
.pass.featured .badge{position:absolute;top:-13px;left:1.5rem;background:var(--saffron);color:#2B1B2E;font-weight:700;font-size:.8rem;padding:.2rem .7rem;border-radius:999px}
.pass h3{font-size:1.5rem}
.price{font-family:var(--serif);font-size:2.6rem;margin:.75rem 0 .1rem}
.price small{font:500 1rem var(--sans);color:var(--muted)}
.pass ul{list-style:none;padding:0;margin:1rem 0 1.5rem;flex:1}
.pass li{padding:.4rem 0 .4rem 1.6rem;position:relative;font-size:.97rem}
.pass li::before{content:"";position:absolute;left:0;top:.8rem;width:.8rem;height:.45rem;border-left:2px solid var(--herb);border-bottom:2px solid var(--herb);transform:rotate(-45deg)}
.qty{display:flex;align-items:center;gap:.75rem;margin-bottom:1rem}
.qty button{width:36px;height:36px;border-radius:50%;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:1.1rem;cursor:pointer}
.qty output{min-width:2ch;text-align:center;font-weight:600;font-variant-numeric:tabular-nums}
.seats{font-size:.85rem;color:var(--muted);margin-top:.75rem}
.meter{height:6px;border-radius:3px;background:var(--line);overflow:hidden;margin-top:.35rem}
.meter i{display:block;height:100%;background:var(--saffron)}
.cart{margin-top:2rem;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1rem;padding:1.25rem 1.5rem;border-radius:16px;background:var(--ink);color:var(--bg)}
.cart strong{font-family:var(--serif);font-size:1.6rem;font-weight:400}
.cart .btn{background:var(--saffron);border-color:var(--saffron);color:#2B1B2E}
@media (max-width:900px){.pass-grid{grid-template-columns:1fr}}

/* Venue */
.venue .wrap{display:grid;grid-template-columns:1fr 1.1fr;gap:clamp(2rem,5vw,4rem);align-items:center}
.map{border-radius:16px;overflow:hidden;border:1px solid var(--line);background:var(--surface)}
.venue dl{display:grid;grid-template-columns:auto 1fr;gap:.6rem 1.5rem;margin:1.5rem 0 0}
.venue dt{font-weight:600}
.venue dd{margin:0;color:var(--muted)}
@media (max-width:820px){.venue .wrap{grid-template-columns:1fr}}

/* FAQ */
.faq-list{margin-top:2rem;border-top:1px solid var(--line);max-width:780px}
.faq-list details{border-bottom:1px solid var(--line)}
.faq-list summary{cursor:pointer;list-style:none;padding:1.25rem 2.5rem 1.25rem 0;font-weight:600;font-size:1.08rem;position:relative}
.faq-list summary::-webkit-details-marker{display:none}
.faq-list summary::after{content:"+";position:absolute;right:.25rem;top:50%;transform:translateY(-50%);font-size:1.5rem;font-weight:400;transition:transform .2s}
.faq-list details[open] summary::after{transform:translateY(-50%) rotate(45deg)}
.faq-list details p{color:var(--muted);padding-bottom:1.25rem;margin:0;max-width:65ch}

/* Register */
.register{background:var(--ink);color:var(--bg)}
.register .wrap{display:grid;grid-template-columns:1fr 1.2fr;gap:clamp(2rem,5vw,4rem)}
.register .lede{color:color-mix(in srgb,var(--bg) 75%,var(--ink))}
form{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.field{display:flex;flex-direction:column;gap:.35rem}
.field.full{grid-column:1/-1}
label{font-weight:600;font-size:.92rem}
input,select,textarea{font:inherit;font-size:1rem;padding:.8rem .9rem;border-radius:10px;border:1px solid color-mix(in srgb,var(--bg) 30%,var(--ink));background:color-mix(in srgb,var(--bg) 8%,var(--ink));color:var(--bg)}
input:user-invalid,select:user-invalid{border-color:#FF8A7A}
.err{color:#FFB3A8;font-size:.85rem;min-height:1.1em}
.check{flex-direction:row;align-items:flex-start;gap:.6rem;font-weight:400}
.check input{width:20px;height:20px;margin-top:.2rem;accent-color:var(--saffron)}
form .btn{background:var(--saffron);border-color:var(--saffron);color:#2B1B2E;justify-self:start}
.success{display:none;grid-column:1/-1;padding:1.25rem;border-radius:12px;background:color-mix(in srgb,var(--herb) 35%,var(--ink))}
.success.show{display:block}
@media (max-width:820px){.register .wrap{grid-template-columns:1fr} form{grid-template-columns:1fr}}

footer{padding:3rem 0;border-top:1px solid var(--line);font-size:.92rem;color:var(--muted)}
footer .wrap{display:flex;flex-wrap:wrap;justify-content:space-between;gap:1.5rem}
footer nav{display:flex;gap:1.25rem;flex-wrap:wrap}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
</style>
</head>
<body>

<header class="nav">
  <div class="wrap">
    <a href="#top" class="brand" aria-label="Salt and Ember home">
      <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3c3 5 8 7 8 14a8 8 0 0 1-16 0c0-4 2-6 4-8 0 3 1 5 3 5-1-4 0-8 1-11z" fill="var(--saffron)"/><path d="M16 17c2 2 3 3 3 5a3 3 0 0 1-6 0c0-2 1-3 3-5z" fill="var(--ink)"/></svg>
      Salt &amp; Ember
    </a>
    <ul id="menu">
      <li><a href="#rounds">Rounds</a></li>
      <li><a href="#schedule">Schedule</a></li>
      <li><a href="#judges">Judges</a></li>
      <li><a href="#passes">Tickets</a></li>
      <li><a href="#venue">Venue</a></li>
      <li><a href="#faq">FAQ</a></li>
    </ul>
    <div class="nav-actions">
      <button class="theme-btn" id="themeBtn" aria-label="Toggle dark mode">◐</button>
      <button class="theme-btn menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="menu">☰</button>
      <a href="#passes" class="btn small">Get tickets</a>
    </div>
  </div>
</header>

<main id="top">
  <section class="hero">
    <div class="wrap">
      <div>
        <h1>The Master Chef Championship<span>Twelve finalists. Four rounds. One jacket.</span></h1>
        <p class="when">21–22 November 2026</p>
        <p class="where">Old Tram Depot, Harbour District</p>
        <div class="hero-ctas">
          <a href="#passes" class="btn">Get tickets</a>
          <a href="#schedule" class="btn ghost">See the schedule</a>
        </div>
      </div>
      <div class="timer" role="timer" aria-live="off" aria-label="Time until the championship begins">
        <svg viewBox="0 0 400 400" aria-hidden="true">
          <circle cx="200" cy="200" r="190" fill="var(--ticket)" stroke="var(--ink)" stroke-width="6"/>
          <g id="ticks"></g>
          <circle cx="200" cy="200" r="140" fill="none" stroke="var(--line)" stroke-width="14"/>
          <circle id="arc" cx="200" cy="200" r="140" fill="none" stroke="var(--saffron)" stroke-width="14" stroke-linecap="round" transform="rotate(-90 200 200)" stroke-dasharray="879.6" stroke-dashoffset="879.6"/>
          <g class="dial-hand" id="hand"><rect x="196" y="18" width="8" height="30" rx="4" fill="var(--herb)"/></g>
          <rect x="182" y="0" width="36" height="14" rx="4" fill="var(--ink)"/>
        </svg>
        <div class="face">
          <div class="days" id="cdDays">--</div>
          <div class="unit" id="cdUnit">days to service</div>
          <div class="hms" id="cdHms">--:--:--</div>
        </div>
      </div>
    </div>
  </section>

  <div class="facts">
    <div class="wrap">
      <dl>
        <div><dt>Finalists</dt><dd>12</dd></div>
        <div><dt>Plates judged</dt><dd>96</dd></div>
        <div><dt>Seats per day</dt><dd>800</dd></div>
        <div><dt>Winner's grant</dt><dd>$50,000</dd></div>
      </dl>
    </div>
  </div>

  <section class="about" id="about">
    <div class="wrap">
      <div>
        <h2>A championship cooked in front of you</h2>
        <p class="lede">Salt &amp; Ember brings twelve chefs, chosen from more than 1,400 applicants across the region, into one open kitchen. Every round is cooked live on the depot floor, and every plate is tasted blind by the judging table.</p>
        <p>Between rounds you can eat your way through the market hall, sit in on masterclasses, and meet the growers who supply the finale's mystery basket. The winner takes home a $50,000 grant to open or grow their own kitchen.</p>
      </div>
      <blockquote>
        "We don't judge the chef. We judge the plate that reaches the pass, and whether we'd cross the city to eat it again."
        <cite>Ines Varga, head judge</cite>
      </blockquote>
    </div>
  </section>

  <section class="rounds" id="rounds">
    <div class="wrap">
      <h2>Four rounds on the rail</h2>
      <p class="lede">Each round cuts the field. Scroll the rail to see how twelve become one.</p>
      <div class="rail" tabindex="0" aria-label="Competition rounds">
        <article class="ticket" style="--r:-1.2deg">
          <div class="no">1</div>
          <h3>The signature</h3>
          <div class="time">Saturday · 10:30</div>
          <p>One dish that tells us who you are. Sixty minutes, your own pantry list.</p>
          <div class="meta">12 cook · 8 advance</div>
        </article>
        <article class="ticket" style="--r:.8deg">
          <div class="no">2</div>
          <h3>Mystery basket</h3>
          <div class="time">Saturday · 15:00</div>
          <p>Seven ingredients from local growers, revealed at the bell. Use at least five.</p>
          <div class="meta">8 cook · 6 advance</div>
        </article>
        <article class="ticket" style="--r:-.6deg">
          <div class="no">3</div>
          <h3>Service for forty</h3>
          <div class="time">Sunday · 11:00</div>
          <p>Paired teams run a real lunch service for forty ticket holders drawn by lottery.</p>
          <div class="meta">6 cook · 3 advance</div>
        </article>
        <article class="ticket" style="--r:1.1deg">
          <div class="no">4</div>
          <h3>The three-course finale</h3>
          <div class="time">Sunday · 17:30</div>
          <p>Starter, main and dessert in three hours. One chef leaves in the jacket.</p>
          <div class="meta">3 cook · 1 wins</div>
        </article>
      </div>
    </div>
  </section>

  <section id="schedule">
    <div class="wrap">
      <h2>Schedule</h2>
      <p class="lede">Doors open at 9:00 both days. Competition rounds are marked live.</p>
      <div class="tabs" role="tablist" aria-label="Event days">
        <button class="tab" role="tab" aria-selected="true" aria-controls="day1" id="t1">Saturday 21 Nov</button>
        <button class="tab" role="tab" aria-selected="false" aria-controls="day2" id="t2" tabindex="-1">Sunday 22 Nov</button>
      </div>
      <ol class="agenda" id="day1" role="tabpanel" aria-labelledby="t1">
        <li><time>09:00</time><div><h3>Doors and market hall open</h3><p>Forty food stalls, coffee roasters and the grower's row.</p></div><span class="tag">Market</span></li>
        <li><time>10:30</time><div><h3>Round 1: The signature</h3><p>All twelve finalists cook at once on the main floor.</p></div><span class="tag live">Live round</span></li>
        <li><time>12:30</time><div><h3>Masterclass: fire, smoke and patience</h3><p>Chef Tomas Adeyemi on open-flame cooking. Limited to 60 seats.</p></div><span class="tag">Masterclass</span></li>
        <li><time>15:00</time><div><h3>Round 2: Mystery basket</h3><p>The basket is revealed on stage. Eight chefs, one bell.</p></div><span class="tag live">Live round</span></li>
        <li><time>17:30</time><div><h3>Judges' table talk</h3><p>The panel explains the day's scores, plate by plate.</p></div><span class="tag">Talk</span></li>
        <li><time>19:00</time><div><h3>Night market</h3><p>Stalls stay open with live music until 22:00.</p></div><span class="tag">Market</span></li>
      </ol>
      <ol class="agenda" id="day2" role="tabpanel" aria-labelledby="t2" hidden>
        <li><time>09:00</time><div><h3>Doors and market hall open</h3><p>Breakfast service from the finalists' mentors.</p></div><span class="tag">Market</span></li>
        <li><time>11:00</time><div><h3>Round 3: Service for forty</h3><p>Lottery winners are seated at 10:45. Check your email on Saturday night.</p></div><span class="tag live">Live round</span></li>
        <li><time>14:00</time><div><h3>Masterclass: the pastry section</h3><p>Chef Mei Lin Hart on laminated doughs and plated desserts.</p></div><span class="tag">Masterclass</span></li>
        <li><time>15:30</time><div><h3>Young cooks showcase</h3><p>Culinary school students present a tasting menu.</p></div><span class="tag">Showcase</span></li>
        <li><time>17:30</time><div><h3>Round 4: The three-course finale</h3><p>Three chefs, three courses, three hours.</p></div><span class="tag live">Live round</span></li>
        <li><time>20:45</time><div><h3>Winner announced</h3><p>Jacket ceremony, grant presentation and closing toast.</p></div><span class="tag">Ceremony</span></li>
      </ol>
    </div>
  </section>

  <section class="judges" id="judges">
    <div class="wrap">
      <h2>The judging table</h2>
      <p class="lede">Four chefs with more than eighty years of kitchens between them. Plates reach them unnamed.</p>
      <div class="judges-grid">
        <article class="judge">
          <div class="portrait" style="background:#2B1B2E" aria-hidden="true">IV</div>
          <h3>Ines Varga</h3>
          <div class="role">Head judge</div>
          <p>Chef-owner of Marrow, where she has cooked a daily-changing menu for nineteen years.</p>
        </article>
        <article class="judge">
          <div class="portrait" style="background:#3F6B4A" aria-hidden="true">TA</div>
          <h3>Tomas Adeyemi</h3>
          <div class="role">Fire and grill</div>
          <p>Built the region's first wood-fired tasting counter. Teaches Saturday's masterclass.</p>
        </article>
        <article class="judge">
          <div class="portrait" style="background:#B07A24" aria-hidden="true">ML</div>
          <h3>Mei Lin Hart</h3>
          <div class="role">Pastry</div>
          <p>Former head of pastry at the Grand Harbour Hotel, now runs a bakery with a six-week waitlist.</p>
        </article>
        <article class="judge">
          <div class="portrait" style="background:#5E5361" aria-hidden="true">RK</div>
          <h3>Rafael Kovač</h3>
          <div class="role">Guest diner</div>
          <p>Food writer and critic. Judges from the diner's seat, scoring only what arrives at the table.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="passes" id="passes">
    <div class="wrap">
      <h2>Tickets</h2>
      <p class="lede">All passes include entry to the market hall. Children under 12 enter free with an adult.</p>
      <div class="pass-grid">
        <article class="pass" data-price="35" data-name="Day pass">
          <h3>Day pass</h3>
          <div class="price">$35 <small>per person</small></div>
          <ul><li>One day of your choice</li><li>Standing access to all live rounds</li><li>Market hall and night market</li></ul>
          <div class="qty"><button type="button" data-d="-1" aria-label="Remove one day pass">−</button><output>0</output><button type="button" data-d="1" aria-label="Add one day pass">+</button></div>
          <div class="seats">512 of 800 left<div class="meter"><i style="width:36%"></i></div></div>
        </article>
        <article class="pass featured" data-price="60" data-name="Weekend pass">
          <span class="badge">Most chosen</span>
          <h3>Weekend pass</h3>
          <div class="price">$60 <small>per person</small></div>
          <ul><li>Both days</li><li>Reserved seating for the finale</li><li>One masterclass seat</li><li>Entry to the Round 3 lunch lottery</li></ul>
          <div class="qty"><button type="button" data-d="-1" aria-label="Remove one weekend pass">−</button><output>0</output><button type="button" data-d="1" aria-label="Add one weekend pass">+</button></div>
          <div class="seats">188 of 400 left<div class="meter"><i style="width:53%"></i></div></div>
        </article>
        <article class="pass" data-price="180" data-name="Chef's table">
          <h3>Chef's table</h3>
          <div class="price">$180 <small>per person</small></div>
          <ul><li>Both days, front-row seats</li><li>Taste the finale menu after judging</li><li>Kitchen tour with a finalist</li><li>Welcome dinner on Friday</li></ul>
          <div class="qty"><button type="button" data-d="-1" aria-label="Remove one chef's table pass">−</button><output>0</output><button type="button" data-d="1" aria-label="Add one chef's table pass">+</button></div>
          <div class="seats">14 of 40 left<div class="meter"><i style="width:65%"></i></div></div>
        </article>
      </div>
      <div class="cart" aria-live="polite">
        <div><div id="cartLine">No tickets selected</div><strong id="cartTotal">$0</strong></div>
        <a href="#register" class="btn" id="checkoutBtn">Continue to details</a>
      </div>
    </div>
  </section>

  <section class="venue" id="venue">
    <div class="wrap">
      <div class="map" aria-hidden="true">
        <svg viewBox="0 0 480 360">
          <rect width="480" height="360" fill="var(--surface)"/>
          <path d="M0 290 C120 260 200 320 300 280 S440 250 480 270 V360 H0Z" fill="color-mix(in srgb,var(--herb) 25%,transparent)"/>
          <g stroke="var(--line)" stroke-width="14" fill="none" stroke-linecap="round"><path d="M40 60 H440"/><path d="M40 180 H440"/><path d="M120 20 V260"/><path d="M340 20 V260"/></g>
          <g stroke="var(--muted)" stroke-width="2" stroke-dasharray="6 6" fill="none"><path d="M20 120 H460"/></g>
          <rect x="175" y="82" width="130" height="76" rx="6" fill="var(--ink)"/>
          <text x="240" y="126" text-anchor="middle" fill="var(--bg)" font-family="Figtree,sans-serif" font-size="15" font-weight="600">Old Tram Depot</text>
          <circle cx="340" cy="120" r="9" fill="var(--saffron)"/><text x="354" y="112" fill="var(--ink)" font-family="Figtree,sans-serif" font-size="13">Depot tram stop</text>
          <rect x="370" y="200" width="60" height="40" rx="4" fill="none" stroke="var(--ink)" stroke-width="2"/><text x="400" y="225" text-anchor="middle" fill="var(--ink)" font-family="Figtree,sans-serif" font-size="14" font-weight="700">P</text>
          <text x="60" y="320" fill="var(--herb)" font-family="Figtree,sans-serif" font-size="13" font-style="italic">Harbour</text>
        </svg>
      </div>
      <div>
        <h2>Old Tram Depot</h2>
        <p class="lede">A restored 1920s tram shed with a glass roof, now the Harbour District's largest covered hall. The open kitchen sits in the centre, with tiered seating on three sides.</p>
        <dl>
          <dt>Address</dt><dd>14 Depot Lane, Harbour District</dd>
          <dt>Tram</dt><dd>Lines 3 and 7 to Depot stop, 2 minutes' walk</dd>
          <dt>Parking</dt><dd>Harbour car park, 300 spaces, $8 per day</dd>
          <dt>Access</dt><dd>Step-free throughout, with accessible seating on every tier</dd>
        </dl>
      </div>
    </div>
  </section>

  <section id="faq">
    <div class="wrap">
      <h2>Questions</h2>
      <div class="faq-list">
        <details><summary>Can I taste the competition dishes?</summary><p>Chef's table holders taste the finale menu after judging. Weekend pass holders can enter the lottery for the Round 3 lunch service, where forty guests are served by the finalists.</p></details>
        <details><summary>Are dietary needs catered for?</summary><p>Every market stall labels its allergens, and at least a third of stalls offer vegetarian and vegan dishes. Tell us your needs when you book a chef's table and the kitchen will plan for you.</p></details>
        <details><summary>Can I bring children?</summary><p>Yes. Children under 12 enter free with a ticketed adult. The live kitchen floor has a safety barrier and ear defenders are available at the information desk.</p></details>
        <details><summary>What if I can't attend?</summary><p>Tickets can be transferred to someone else for free until 14 November. Refunds are available until 31 October.</p></details>
        <details><summary>How do I apply to compete next year?</summary><p>Applications for the 2027 championship open in March. Leave your email when you register and we'll send you the application pack.</p></details>
      </div>
    </div>
  </section>

  <section class="register" id="register">
    <div class="wrap">
      <div>
        <h2>Book your place</h2>
        <p class="lede">Add your details to reserve the tickets you selected. You'll pay on the next screen, and your tickets arrive by email.</p>
        <p id="formSummary" style="font-weight:600"></p>
      </div>
      <form id="regForm" novalidate>
        <div class="field"><label for="fname">First name</label><input id="fname" name="fname" autocomplete="given-name" required><span class="err" id="fname-err"></span></div>
        <div class="field"><label for="lname">Last name</label><input id="lname" name="lname" autocomplete="family-name" required><span class="err" id="lname-err"></span></div>
        <div class="field full"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required><span class="err" id="email-err"></span></div>
        <div class="field"><label for="phone">Phone (optional)</label><input id="phone" name="phone" type="tel" autocomplete="tel"></div>
        <div class="field"><label for="day">Day pass date</label><select id="day" name="day"><option value="">Not buying a day pass</option><option>Saturday 21 Nov</option><option>Sunday 22 Nov</option></select></div>
        <div class="field full"><label for="diet">Dietary needs (optional)</label><textarea id="diet" name="diet" rows="3"></textarea></div>
        <label class="field full check"><input type="checkbox" id="news" name="news"> Send me the 2027 competitor application pack</label>
        <div class="field full"><span class="err" id="cart-err"></span><button type="submit" class="btn">Reserve tickets</button></div>
        <div class="success" id="success" role="status"></div>
      </form>
    </div>
  </section>
</main>

<footer>
  <div class="wrap">
    <div>© 2026 Salt &amp; Ember Culinary Trust. All rights reserved.</div>
    <nav aria-label="Footer"><a href="#faq">FAQ</a><a href="#venue">Getting there</a><a href="mailto:hello@saltandember.example">hello@saltandember.example</a></nav>
  </div>
</footer>

<script>
(() => {
  // Theme
  const root = document.documentElement;
  try { const t = localStorage.getItem('se-theme'); if (t) root.dataset.theme = t; } catch(e){}
  document.getElementById('themeBtn').addEventListener('click', () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('se-theme', root.dataset.theme); } catch(e){}
  });

  // Mobile menu
  const menu = document.getElementById('menu'), menuBtn = document.getElementById('menuBtn');
  menuBtn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  menu.addEventListener('click', e => { if (e.target.tagName === 'A') { menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); } });

  // Timer ticks
  const ticks = document.getElementById('ticks');
  for (let i = 0; i < 60; i++) {
    const long = i % 5 === 0, a = i * 6 * Math.PI / 180;
    const r1 = 178, r2 = long ? 160 : 168;
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', 200 + r1 * Math.sin(a)); l.setAttribute('y1', 200 - r1 * Math.cos(a));
    l.setAttribute('x2', 200 + r2 * Math.sin(a)); l.setAttribute('y2', 200 - r2 * Math.cos(a));
    l.setAttribute('stroke', 'var(--ink)'); l.setAttribute('stroke-width', long ? 3 : 1.5); l.setAttribute('opacity', long ? .8 : .35);
    ticks.appendChild(l);
  }

  // Countdown
  const target = new Date('2026-11-21T09:00:00').getTime();
  const announced = new Date('2026-06-01T00:00:00').getTime();
  const $d = document.getElementById('cdDays'), $u = document.getElementById('cdUnit'), $h = document.getElementById('cdHms');
  const arc = document.getElementById('arc'), hand = document.getElementById('hand'), C = 879.6;
  const pad = n => String(n).padStart(2, '0');
  function tick() {
    const now = Date.now(), diff = target - now;
    if (diff <= 0) { $d.textContent = 'Now'; $u.textContent = 'service has started'; $h.textContent = ''; arc.style.strokeDashoffset = 0; return; }
    const d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24, m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
    $d.textContent = d; $u.textContent = d === 1 ? 'day to service' : 'days to service';
    $h.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
    const progress = Math.min(1, Math.max(0, (now - announced) / (target - announced)));
    arc.style.strokeDashoffset = C * (1 - progress);
    hand.style.transform = `rotate(${s * 6}deg)`;
  }
  tick(); setInterval(tick, 1000);

  // Schedule tabs
  const tabs = [...document.querySelectorAll('.tab')];
  function select(tab) {
    tabs.forEach(t => { const on = t === tab; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; document.getElementById(t.getAttribute('aria-controls')).hidden = !on; });
    tab.focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]); }
    });
  });

  // Ticket selector
  const passes = [...document.querySelectorAll('.pass')];
  const cartLine = document.getElementById('cartLine'), cartTotal = document.getElementById('cartTotal'), summary = document.getElementById('formSummary');
  const counts = new Map(passes.map(p => [p, 0]));
  function render() {
    let total = 0; const parts = [];
    passes.forEach(p => {
      const n = counts.get(p); p.querySelector('output').textContent = n;
      if (n) { total += n * +p.dataset.price; parts.push(`${n} × ${p.dataset.name}`); }
    });
    cartLine.textContent = parts.length ? parts.join(', ') : 'No tickets selected';
    cartTotal.textContent = '$' + total.toLocaleString();
    summary.textContent = parts.length ? `Your selection: ${parts.join(', ')} ($${total.toLocaleString()})` : '';
  }
  passes.forEach(p => p.querySelectorAll('.qty button').forEach(b => b.addEventListener('click', () => {
    counts.set(p, Math.max(0, Math.min(10, counts.get(p) + +b.dataset.d))); render();
  })));

  // Registration form
  const form = document.getElementById('regForm'), success = document.getElementById('success');
  const rules = {
    fname: v => v.trim() ? '' : 'Enter your first name.',
    lname: v => v.trim() ? '' : 'Enter your last name.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter an email address like name@example.com.'
  };
  form.addEventListener('submit', e => {
    e.preventDefault();
    let firstBad = null;
    for (const [id, fn] of Object.entries(rules)) {
      const el = document.getElementById(id), msg = fn(el.value);
      document.getElementById(id + '-err').textContent = msg;
      el.setAttribute('aria-invalid', !!msg);
      if (msg) el.setAttribute('aria-describedby', id + '-err'); else el.removeAttribute('aria-describedby');
      if (msg && !firstBad) firstBad = el;
    }
    const totalTickets = [...counts.values()].reduce((a, b) => a + b, 0);
    const dayPass = counts.get(passes[0]);
    const cartErr = document.getElementById('cart-err');
    cartErr.textContent = !totalTickets ? 'Choose at least one ticket in the Tickets section.'
      : dayPass && !form.day.value ? 'Choose a date for your day pass.' : '';
    if (firstBad) return firstBad.focus();
    if (cartErr.textContent) return;
    success.textContent = `Tickets reserved, ${form.fname.value.trim()}. We've held ${totalTickets} ticket${totalTickets > 1 ? 's' : ''} for 15 minutes and sent the payment link to ${form.email.value.trim()}.`;
    success.classList.add('show');
    form.querySelector('button[type=submit]').disabled = true;
  });
})();
</script>
</body>
</html>
