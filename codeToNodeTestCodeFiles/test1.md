<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#07110f">
<meta name="description" content="Master Chief: The Reclaimer — a cinematic sci-fi fan event landing page.">
<title>MASTER CHIEF — THE RECLAIMER</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

:root{
  --bg:#050908;
  --bg2:#09120f;
  --panel:rgba(12,22,19,.82);
  --panel2:rgba(18,31,26,.74);
  --line:rgba(155,255,198,.16);
  --green:#9dffc4;
  --green2:#43e58c;
  --lime:#d6ff7b;
  --muted:#8d9d96;
  --text:#edf8f1;
  --warning:#f0c66b;
  --max:1240px;
  --shadow:0 30px 90px rgba(0,0,0,.42);
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{
  background:
    radial-gradient(circle at 78% 12%,rgba(55,145,94,.16),transparent 28%),
    radial-gradient(circle at 10% 70%,rgba(26,97,72,.12),transparent 30%),
    var(--bg);
  color:var(--text);
  font-family:Inter,system-ui,sans-serif;
  overflow-x:hidden;
}
body:before{
  content:"";position:fixed;inset:0;pointer-events:none;opacity:.035;z-index:20;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.7'/%3E%3C/svg%3E");
}
a{color:inherit;text-decoration:none}
button{font:inherit}
.container{width:min(var(--max),calc(100% - 40px));margin:auto}
.condensed{font-family:"Barlow Condensed",sans-serif;letter-spacing:.04em}
.nav{
  position:fixed;top:0;left:0;right:0;z-index:30;
  border-bottom:1px solid transparent;
  transition:.35s ease;
}
.nav.scrolled{background:rgba(3,8,6,.88);backdrop-filter:blur(18px);border-color:var(--line)}
.nav-inner{height:76px;display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:11px;font-family:"Barlow Condensed";font-weight:800;letter-spacing:.1em}
.brand-mark{
  width:34px;height:34px;border:1px solid var(--green);position:relative;transform:rotate(45deg);
  box-shadow:0 0 20px rgba(67,229,140,.15)
}
.brand-mark:after{content:"";position:absolute;inset:7px;border:1px solid var(--green2)}
.brand span{transform:translateY(1px)}
.nav-links{display:flex;gap:28px;color:#b9c7c0;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.12em}
.nav-links a{position:relative;padding:10px 0}
.nav-links a:after{content:"";position:absolute;bottom:3px;left:0;width:0;height:1px;background:var(--green);transition:.25s}
.nav-links a:hover:after{width:100%}
.nav-cta{padding:11px 17px;border:1px solid var(--green);font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.12em}
.nav-cta:hover{background:var(--green);color:#04100a}
.menu{display:none;background:none;border:0;color:white;font-size:25px}

.hero{
  min-height:820px;position:relative;display:grid;align-items:center;overflow:hidden;
  background:
    linear-gradient(90deg,rgba(3,8,6,.98) 0%,rgba(3,8,6,.8) 39%,rgba(3,8,6,.2) 73%,rgba(3,8,6,.72) 100%),
    linear-gradient(0deg,var(--bg) 0%,transparent 24%,rgba(0,0,0,.15) 100%);
}
.hero-art{position:absolute;inset:0;overflow:hidden}
.hero-art .orb{
  position:absolute;width:620px;height:620px;border-radius:50%;right:3%;top:90px;
  background:
    radial-gradient(circle at 37% 31%,#d7f9cf 0 1%,#6e967a 2%,#233c31 15%,#102019 42%,#050b08 67%);
  box-shadow:0 0 90px rgba(88,255,159,.13);
  opacity:.9;
}
.hero-art .halo{
  position:absolute;width:920px;height:280px;border:18px solid rgba(149,255,189,.15);
  border-radius:50%;right:-5%;top:220px;transform:rotate(-18deg);
  box-shadow:0 0 80px rgba(71,238,143,.08),inset 0 0 50px rgba(71,238,143,.06)
}
.chief{
  position:absolute;right:15%;bottom:-5px;width:390px;height:650px;
  filter:drop-shadow(0 30px 45px rgba(0,0,0,.7));
}
.chief .head{position:absolute;top:28px;left:125px;width:145px;height:180px;border-radius:46% 46% 35% 35%;background:linear-gradient(135deg,#91ad94,#344f40 45%,#111c17 75%);border:2px solid #6b8d76;transform:skew(-4deg)}
.chief .visor{position:absolute;top:83px;left:106px;width:184px;height:70px;border-radius:48%;background:linear-gradient(110deg,#d5ff73,#7ca53d 32%,#273819 72%);border:3px solid #18251b;box-shadow:0 0 35px rgba(214,255,123,.2)}
.chief .neck{position:absolute;top:185px;left:146px;width:105px;height:75px;background:#202d27}
.chief .torso{position:absolute;top:228px;left:54px;width:300px;height:365px;border-radius:46px 46px 25px 25px;background:linear-gradient(135deg,#607968,#263a2f 35%,#17251f 72%);border:2px solid #526c5c}
.chief .plate{position:absolute;top:260px;left:86px;width:235px;height:145px;border-radius:35px 35px 45px 45px;background:linear-gradient(160deg,#78947e,#344b3d 40%,#18251f);border:1px solid #88a68e}
.chief .plate:after{content:"UNSC";position:absolute;right:25px;top:30px;color:#bbd3c1;font:700 14px "Barlow Condensed";letter-spacing:.2em}
.chief .shoulder{position:absolute;top:248px;width:92px;height:180px;border-radius:35px;background:#415849;border:2px solid #607b69}
.chief .left{left:12px;transform:rotate(7deg)} .chief .right{right:12px;transform:rotate(-7deg)}
.chief .arm{position:absolute;top:386px;width:78px;height:245px;border-radius:28px;background:linear-gradient(135deg,#526b5a,#1c2c24);border:2px solid #455e50}
.chief .arm.a1{left:35px;transform:rotate(7deg)} .chief .arm.a2{right:35px;transform:rotate(-7deg)}
.chief .leg{position:absolute;top:545px;width:105px;height:230px;border-radius:30px;background:linear-gradient(135deg,#4e6657,#17251e);border:2px solid #405648}
.chief .leg.l1{left:87px;transform:rotate(2deg)} .chief .leg.l2{right:87px;transform:rotate(-2deg)}
.chief .glow{position:absolute;left:0;right:0;bottom:0;height:180px;background:radial-gradient(ellipse,rgba(91,255,153,.13),transparent 65%)}
.scanlines{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent 0 5px,rgba(177,255,205,.018) 6px);pointer-events:none}
.hero-content{position:relative;z-index:2;padding-top:120px;padding-bottom:90px}
.eyebrow{display:flex;align-items:center;gap:10px;color:var(--green);font-size:11px;font-weight:800;letter-spacing:.22em;text-transform:uppercase}
.eyebrow:before{content:"";width:34px;height:1px;background:var(--green)}
h1{font-family:"Barlow Condensed";font-size:clamp(76px,11vw,150px);line-height:.82;text-transform:uppercase;max-width:720px;margin:23px 0}
h1 em{font-style:normal;color:var(--green);display:block}
.hero-copy{max-width:560px;color:#b9c7c0;line-height:1.8;font-size:15px}
.hero-actions{display:flex;gap:12px;margin-top:30px;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:15px 22px;border:1px solid var(--green);text-transform:uppercase;letter-spacing:.12em;font-size:12px;font-weight:800;cursor:pointer;transition:.25s}
.btn.primary{background:var(--green);color:#04100a}
.btn.primary:hover{background:#d1ffe0;transform:translateY(-2px)}
.btn.ghost{border-color:#456052;color:#d6e3dc;background:rgba(5,12,9,.3)}
.btn.ghost:hover{border-color:var(--green);color:var(--green)}
.hero-meta{display:flex;gap:36px;margin-top:46px;padding-top:24px;border-top:1px solid var(--line);max-width:650px}
.meta b{display:block;font:800 27px "Barlow Condensed";color:#f0fff5}
.meta span{display:block;margin-top:2px;color:#788981;font-size:10px;text-transform:uppercase;letter-spacing:.16em}

.section{padding:105px 0;position:relative}
.section-head{display:flex;justify-content:space-between;gap:40px;align-items:end;margin-bottom:42px}
.section-kicker{color:var(--green);font:700 13px "Barlow Condensed";letter-spacing:.18em;text-transform:uppercase}
.section-title{font:800 clamp(44px,6vw,76px) "Barlow Condensed";line-height:.88;text-transform:uppercase;margin-top:10px}
.section-intro{max-width:440px;color:#82928a;line-height:1.7;font-size:14px}
.stats{border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:rgba(7,17,13,.55)}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr)}
.stat{padding:27px 22px;border-right:1px solid var(--line)}
.stat:last-child{border-right:0}
.stat strong{font:800 48px "Barlow Condensed";color:var(--green);display:block}
.stat span{color:#84948c;text-transform:uppercase;font-size:10px;letter-spacing:.14em}

.about-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:65px;align-items:center}
.story{color:#a6b5ae;line-height:1.9;font-size:15px}
.story p+p{margin-top:17px}
.quote{margin-top:28px;padding:22px;border-left:2px solid var(--green);background:rgba(139,255,185,.035);color:#e5f3eb;font:600 22px/1.25 "Barlow Condensed";text-transform:uppercase}
.terminal{
  min-height:360px;border:1px solid var(--line);background:
  linear-gradient(145deg,rgba(54,105,77,.16),rgba(4,11,8,.82)),
  repeating-linear-gradient(90deg,transparent 0 49px,rgba(157,255,196,.025) 50px),
  repeating-linear-gradient(0deg,transparent 0 49px,rgba(157,255,196,.025) 50px);
  padding:26px;position:relative;overflow:hidden;box-shadow:var(--shadow)
}
.terminal:before{content:"TACTICAL // ARCHIVE 117";font:600 10px "Barlow Condensed";letter-spacing:.2em;color:#5f7769}
.helmet{width:220px;height:170px;margin:45px auto 25px;border-radius:45% 45% 40% 40%;background:linear-gradient(135deg,#76927c,#2a3d32 46%,#111b16);border:3px solid #708b79;position:relative;box-shadow:0 25px 45px rgba(0,0,0,.45)}
.helmet:before{content:"";position:absolute;left:-18px;right:-18px;bottom:25px;height:55px;background:linear-gradient(180deg,#9fc34c,#4e702c 40%,#172214);border:3px solid #182219;clip-path:polygon(8% 35%,92% 35%,78% 80%,22% 80%);box-shadow:0 0 30px rgba(214,255,123,.12)}
.terminal-line{font:600 10px "Barlow Condensed";color:#6e8a7b;letter-spacing:.13em;text-align:center}

.timeline{position:relative}
.timeline:before{content:"";position:absolute;left:126px;top:0;bottom:0;width:1px;background:var(--line)}
.event-row{display:grid;grid-template-columns:100px 1fr;gap:52px;padding:24px 0;position:relative}
.event-row:after{content:"";position:absolute;left:121px;top:34px;width:11px;height:11px;border:2px solid var(--green);background:var(--bg);border-radius:50%;box-shadow:0 0 0 5px rgba(157,255,196,.05)}
.time{font:700 18px "Barlow Condensed";color:var(--green);text-align:right}
.event-card{border:1px solid var(--line);padding:24px 27px;background:linear-gradient(110deg,rgba(15,29,23,.82),rgba(7,14,11,.5));transition:.25s}
.event-card:hover{border-color:rgba(157,255,196,.4);transform:translateX(5px)}
.event-card h3{font:700 29px "Barlow Condensed";text-transform:uppercase}
.event-card p{color:#7f9188;font-size:13px;line-height:1.7;margin-top:6px}
.tag{display:inline-block;margin-top:13px;padding:5px 8px;border:1px solid var(--line);font-size:9px;letter-spacing:.14em;color:#8ca197;text-transform:uppercase}

.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.card{border:1px solid var(--line);background:var(--panel);overflow:hidden;transition:.3s}
.card:hover{transform:translateY(-6px);border-color:rgba(157,255,196,.35)}
.card-art{height:210px;position:relative;overflow:hidden;background:linear-gradient(135deg,#192a22,#07100c)}
.card-art.one{background:radial-gradient(circle at 70% 40%,#6f956e 0 2%,#243b2d 15%,transparent 16%),linear-gradient(135deg,#18271f,#050b08)}
.card-art.two{background:radial-gradient(circle at 30% 35%,#b4d95e 0 3%,#415e32 14%,transparent 15%),linear-gradient(135deg,#17261f,#050b08)}
.card-art.three{background:radial-gradient(circle at 60% 40%,#80c49d 0 2%,#244d3c 18%,transparent 19%),linear-gradient(135deg,#16261f,#050b08)}
.card-art:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.7),transparent 60%)}
.card-art b{position:absolute;left:20px;bottom:17px;z-index:1;font:800 50px "Barlow Condensed";color:rgba(222,255,233,.17)}
.card-body{padding:23px}
.card-body small{color:var(--green);font-size:9px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}
.card-body h3{font:700 30px "Barlow Condensed";text-transform:uppercase;margin:7px 0}
.card-body p{font-size:12px;line-height:1.7;color:#819189}

.tickets{background:linear-gradient(180deg,transparent,rgba(23,55,40,.13),transparent)}
.ticket-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.ticket{padding:30px;border:1px solid var(--line);background:rgba(8,17,13,.8);position:relative}
.ticket.featured{border-color:rgba(157,255,196,.55);box-shadow:0 20px 70px rgba(55,200,120,.08)}
.ticket-label{font-size:9px;color:var(--green);letter-spacing:.18em;font-weight:800;text-transform:uppercase}
.ticket h3{font:700 35px "Barlow Condensed";text-transform:uppercase;margin:7px 0}
.price{font:800 50px "Barlow Condensed";color:#effff5}
.price span{font:500 12px Inter;color:#718078}
.features{list-style:none;margin:22px 0 28px;border-top:1px solid var(--line)}
.features li{padding:11px 0;border-bottom:1px solid rgba(155,255,198,.08);font-size:12px;color:#9baaa3}
.features li:before{content:"✓";color:var(--green);margin-right:9px}

.countdown-wrap{border:1px solid var(--line);padding:32px;background:linear-gradient(120deg,rgba(62,122,86,.14),rgba(5,12,9,.8));display:grid;grid-template-columns:1fr auto;align-items:center;gap:30px}
.countdown-wrap h3{font:700 36px "Barlow Condensed";text-transform:uppercase}
.countdown-wrap p{color:#7d8e86;font-size:12px;margin-top:4px}
.countdown{display:flex;gap:9px}
.unit{min-width:72px;text-align:center;padding:12px 8px;border:1px solid var(--line);background:#07100c}
.unit strong{font:800 36px "Barlow Condensed";display:block;color:var(--green)}
.unit span{font-size:8px;color:#72847b;text-transform:uppercase;letter-spacing:.15em}

.faq{max-width:850px}
.faq-item{border-top:1px solid var(--line)}
.faq-q{width:100%;background:none;border:0;color:#e6f3eb;text-align:left;padding:21px 0;display:flex;justify-content:space-between;cursor:pointer;font:600 20px "Barlow Condensed";text-transform:uppercase}
.faq-q span{color:var(--green);transition:.25s}
.faq-a{max-height:0;overflow:hidden;color:#7e9087;font-size:13px;line-height:1.8;transition:max-height .3s ease}
.faq-item.open .faq-a{max-height:160px;padding-bottom:20px}
.faq-item.open .faq-q span{transform:rotate(45deg)}

.footer{border-top:1px solid var(--line);padding:35px 0;color:#66766e;font-size:10px;text-transform:uppercase;letter-spacing:.12em}
.footer-inner{display:flex;justify-content:space-between;gap:20px}

.modal{position:fixed;inset:0;background:rgba(0,0,0,.76);backdrop-filter:blur(10px);z-index:60;display:none;align-items:center;justify-content:center;padding:20px}
.modal.show{display:flex}
.modal-box{width:min(520px,100%);background:#08110d;border:1px solid rgba(157,255,196,.3);box-shadow:var(--shadow);padding:32px;position:relative}
.close{position:absolute;right:15px;top:12px;background:none;border:0;color:#809188;font-size:25px;cursor:pointer}
.modal-box h2{font:800 44px "Barlow Condensed";text-transform:uppercase}
.modal-box p{color:#819089;font-size:12px;line-height:1.6;margin:4px 0 22px}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.field{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}
.field.full{grid-column:1/-1}
.field label{font-size:9px;text-transform:uppercase;letter-spacing:.14em;color:#72837b}
.field input,.field select{background:#050b08;border:1px solid var(--line);padding:13px;color:#dceae2;outline:0}
.field input:focus,.field select:focus{border-color:var(--green)}
.form-message{font-size:11px;color:var(--green);margin-top:12px;min-height:15px}

@media(max-width:900px){
  .nav-links,.nav-cta{display:none}.menu{display:block}
  .nav.open .nav-links{display:flex;position:absolute;top:76px;left:0;right:0;padding:20px;background:#050b08;flex-direction:column;border-bottom:1px solid var(--line);gap:4px}
  .hero{min-height:760px}.hero-art .orb{right:-260px;top:180px}.chief{right:-60px;transform:scale(.8);transform-origin:bottom right;opacity:.55}
  .about-grid{grid-template-columns:1fr}.cards,.ticket-grid{grid-template-columns:1fr}
  .stats-grid{grid-template-columns:repeat(2,1fr)}.stat:nth-child(2){border-right:0}.stat:nth-child(-n+2){border-bottom:1px solid var(--line)}
  .countdown-wrap{grid-template-columns:1fr}.countdown{justify-content:flex-start}
}
@media(max-width:560px){
  .container{width:min(var(--max),calc(100% - 28px))}
  .hero-content{padding-top:120px}.hero{min-height:720px}
  h1{font-size:78px}.hero-meta{gap:18px}.meta b{font-size:22px}
  .section{padding:75px 0}.section-head{display:block}.section-intro{margin-top:18px}
  .timeline:before{left:12px}.event-row{grid-template-columns:1fr;gap:12px;padding-left:35px}.event-row:after{left:7px;top:64px}.time{text-align:left}
  .stats-grid{grid-template-columns:1fr 1fr}.stat{padding:20px 12px}.stat strong{font-size:38px}
  .countdown{gap:5px}.unit{min-width:58px}.unit strong{font-size:29px}
  .form-grid{grid-template-columns:1fr}.field.full{grid-column:auto}
  .footer-inner{flex-direction:column}
}
</style>
</head>
<body>

<header class="nav" id="nav">
  <div class="container nav-inner">
    <a class="brand" href="#top"><i class="brand-mark"></i><span>UNSC // 117</span></a>
    <nav class="nav-links">
      <a href="#mission">Mission</a><a href="#schedule">Schedule</a><a href="#experience">Experience</a><a href="#tickets">Tickets</a><a href="#faq">FAQ</a>
    </nav>
    <button class="nav-cta" data-open-modal>Register</button>
    <button class="menu" id="menuBtn" aria-label="Open navigation">☰</button>
  </div>
</header>

<main id="top">
<section class="hero">
  <div class="hero-art">
    <div class="orb"></div><div class="halo"></div>
    <div class="chief" aria-hidden="true">
      <div class="head"></div><div class="visor"></div><div class="neck"></div>
      <div class="shoulder left"></div><div class="shoulder right"></div>
      <div class="torso"></div><div class="plate"></div>
      <div class="arm a1"></div><div class="arm a2"></div>
      <div class="leg l1"></div><div class="leg l2"></div><div class="glow"></div>
    </div>
    <div class="scanlines"></div>
  </div>
  <div class="container hero-content">
    <div class="eyebrow">UNSC ARCHIVE // SPECIAL EVENT</div>
    <h1>Master<br><em>Chief</em><br>Reclaimer</h1>
    <p class="hero-copy">A cinematic celebration of humanity's legendary Spartan-II. Step inside the armor, revisit the missions, and experience the legacy of the soldier who became a symbol of hope.</p>
    <div class="hero-actions">
      <button class="btn primary" data-open-modal>Secure Your Access <span>→</span></button>
      <a class="btn ghost" href="#schedule">View Mission Schedule</a>
    </div>
    <div class="hero-meta">
      <div class="meta"><b>17.10.26</b><span>Event Date</span></div>
      <div class="meta"><b>07:00 PM</b><span>Doors Open</span></div>
      <div class="meta"><b>HALO // UNSC</b><span>Theme</span></div>
    </div>
  </div>
</section>

<section class="stats">
  <div class="container stats-grid">
    <div class="stat"><strong>117</strong><span>Spartan Designation</span></div>
    <div class="stat"><strong>26+</strong><span>Years of Legend</span></div>
    <div class="stat"><strong>03</strong><span>Immersive Zones</span></div>
    <div class="stat"><strong>01</strong><span>Unfinished Mission</span></div>
  </div>
</section>

<section class="section" id="mission">
  <div class="container about-grid">
    <div>
      <div class="section-kicker">01 // The Mission</div>
      <h2 class="section-title">More than<br>a soldier.</h2>
      <div class="story">
        <p>MASTER CHIEF: THE RECLAIMER is an original fan-event concept built around the enduring legacy of John-117. From the Spartan program to humanity's largest battles, the experience follows the moments that made the Chief an icon.</p>
        <p>Designed like a classified UNSC briefing brought to life, the event combines story installations, tactical challenges, armor displays, audio-visual sequences and a final cinematic reveal.</p>
        <div class="quote">“Wake me when you need me.”<br><small style="font:500 10px Inter;color:#718078">— ARCHIVE // 117</small></div>
      </div>
    </div>
    <div class="terminal">
      <div class="helmet"></div>
      <div class="terminal-line">BIOMETRIC ID // JOHN-117 // STATUS: ACTIVE</div>
      <div class="terminal-line">ARMOR // MJOLNIR GEN-3 // READY</div>
    </div>
  </div>
</section>

<section class="section" id="schedule">
  <div class="container">
    <div class="section-head">
      <div><div class="section-kicker">02 // Mission Schedule</div><h2 class="section-title">Your night<br>in the field.</h2></div>
      <p class="section-intro">Every stage of the evening is designed to move from briefing to battle, from memory to myth.</p>
    </div>
    <div class="timeline">
      <div class="event-row"><div class="time">19:00</div><div class="event-card"><h3>UNSC Check-In</h3><p>Credential verification, event briefing and access to the Spartan armor gallery.</p><span class="tag">Arrival</span></div></div>
      <div class="event-row"><div class="time">19:45</div><div class="event-card"><h3>Inside the Armor</h3><p>A guided look at MJOLNIR technology, the Spartan program and the evolution of the Chief's equipment.</p><span class="tag">Exhibition</span></div></div>
      <div class="event-row"><div class="time">20:30</div><div class="event-card"><h3>Battlefield // Installation</h3><p>Enter an atmospheric reconstruction of a UNSC combat zone with sound, light and interactive objectives.</p><span class="tag">Immersive</span></div></div>
      <div class="event-row"><div class="time">21:30</div><div class="event-card"><h3>The Reclaimer</h3><p>The final cinematic presentation: a tribute to the missions, allies and sacrifices behind the legend.</p><span class="tag">Main Event</span></div></div>
      <div class="event-row"><div class="time">22:15</div><div class="event-card"><h3>After Action</h3><p>Photo stations, limited event merchandise and an open fan community session.</p><span class="tag">Community</span></div></div>
    </div>
  </div>
</section>

<section class="section" id="experience">
  <div class="container">
    <div class="section-head">
      <div><div class="section-kicker">03 // Experience</div><h2 class="section-title">Enter the<br>legend.</h2></div>
      <p class="section-intro">Three zones. One night. A carefully staged journey through the world surrounding humanity's most famous Spartan.</p>
    </div>
    <div class="cards">
      <article class="card"><div class="card-art one"><b>01</b></div><div class="card-body"><small>Zone // Alpha</small><h3>Spartan Archive</h3><p>Armor silhouettes, mission records and a visual timeline covering the Chief's evolution.</p></div></article>
      <article class="card"><div class="card-art two"><b>02</b></div><div class="card-body"><small>Zone // Bravo</small><h3>Combat Deck</h3><p>Interactive tactical challenges inspired by UNSC field operations and squad coordination.</p></div></article>
      <article class="card"><div class="card-art three"><b>03</b></div><div class="card-body"><small>Zone // Charlie</small><h3>Reclaimer Theater</h3><p>A cinematic auditorium where the final story unfolds across a giant atmospheric display.</p></div></article>
    </div>
  </div>
</section>

<section class="section tickets" id="tickets">
  <div class="container">
    <div class="section-head">
      <div><div class="section-kicker">04 // Access Levels</div><h2 class="section-title">Choose your<br>deployment.</h2></div>
      <p class="section-intro">Fictional event pricing for this concept page. Connect these cards to your real ticketing provider when launching.</p>
    </div>
    <div class="ticket-grid">
      <article class="ticket"><div class="ticket-label">Standard</div><h3>UNSC Recruit</h3><div class="price">$49 <span>/ person</span></div><ul class="features"><li>General event access</li><li>All three experience zones</li><li>Digital event credential</li><li>Community after-action</li></ul><button class="btn ghost" data-open-modal>Reserve Access</button></article>
      <article class="ticket featured"><div class="ticket-label">Most Access</div><h3>Spartan Class</h3><div class="price">$89 <span>/ person</span></div><ul class="features"><li>Everything in Recruit</li><li>Priority entry</li><li>Exclusive armor-gallery access</li><li>Limited event patch</li></ul><button class="btn primary" data-open-modal>Reserve Access</button></article>
      <article class="ticket"><div class="ticket-label">Premium</div><h3>Blue Team</h3><div class="price">$149 <span>/ person</span></div><ul class="features"><li>Everything in Spartan</li><li>Premium seating</li><li>Collector event credential</li><li>Priority photo station</li></ul><button class="btn ghost" data-open-modal>Reserve Access</button></article>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="countdown-wrap">
      <div><h3>Next deployment begins in</h3><p>Countdown to the fictional event date: October 17, 2026 at 19:00 local time.</p></div>
      <div class="countdown" id="countdown">
        <div class="unit"><strong id="days">00</strong><span>Days</span></div>
        <div class="unit"><strong id="hours">00</strong><span>Hours</span></div>
        <div class="unit"><strong id="minutes">00</strong><span>Minutes</span></div>
        <div class="unit"><strong id="seconds">00</strong><span>Seconds</span></div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="faq">
  <div class="container">
    <div class="section-head"><div><div class="section-kicker">05 // Intel</div><h2 class="section-title">Mission<br>briefing.</h2></div></div>
    <div class="faq">
      <div class="faq-item open"><button class="faq-q">Is this an official Halo event? <span>+</span></button><div class="faq-a">No. This page is a fictional fan-event website concept inspired by the Halo universe. It is not affiliated with Microsoft, Xbox, 343 Industries, or the Halo franchise owners.</div></div>
      <div class="faq-item"><button class="faq-q">Can I customize the event details? <span>+</span></button><div class="faq-a">Yes. All event copy, dates, prices, schedule items, colors and registration behavior are contained in this single HTML file and can be replaced with your real event information.</div></div>
      <div class="faq-item"><button class="faq-q">Does registration actually process payments? <span>+</span></button><div class="faq-a">No. The registration form is a front-end demo. Connect the submit handler to your backend or ticketing service to process real registrations securely.</div></div>
      <div class="faq-item"><button class="faq-q">Is the page responsive? <span>+</span></button><div class="faq-a">Yes. The layout includes mobile breakpoints for navigation, hero artwork, schedules, cards, ticket tiers, forms and the countdown.</div></div>
    </div>
  </div>
</section>
</main>

<footer class="footer">
  <div class="container footer-inner">
    <span>UNSC // 117 — THE RECLAIMER</span>
    <span>Fan concept • Not affiliated with Halo / Microsoft / Xbox</span>
  </div>
</footer>

<div class="modal" id="modal" aria-hidden="true">
  <div class="modal-box">
    <button class="close" id="closeModal" aria-label="Close">×</button>
    <div class="section-kicker">UNSC // Registration</div>
    <h2>Secure your access.</h2>
    <p>Enter your details to reserve a place in this front-end event demo. No payment is collected.</p>
    <form id="registerForm">
      <div class="form-grid">
        <div class="field"><label>First Name</label><input required placeholder="John"></div>
        <div class="field"><label>Last Name</label><input required placeholder="117"></div>
        <div class="field full"><label>Email</label><input type="email" required placeholder="you@example.com"></div>
        <div class="field"><label>Access Level</label><select><option>UNSC Recruit — $49</option><option>Spartan Class — $89</option><option>Blue Team — $149</option></select></div>
        <div class="field"><label>Guests</label><select><option>1</option><option>2</option><option>3</option><option>4</option></select></div>
      </div>
      <button class="btn primary" style="width:100%" type="submit">Transmit Registration →</button>
      <div class="form-message" id="formMessage"></div>
    </form>
  </div>
</div>

<script>
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>30));

const menuBtn=document.getElementById('menuBtn');
menuBtn.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

const modal=document.getElementById('modal');
const openModal=()=>{modal.classList.add('show');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'};
const closeModal=()=>{modal.classList.remove('show');modal.setAttribute('aria-hidden','true');document.body.style.overflow=''};
document.querySelectorAll('[data-open-modal]').forEach(btn=>btn.addEventListener('click',openModal));
document.getElementById('closeModal').addEventListener('click',closeModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

document.querySelectorAll('.faq-q').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const item=btn.parentElement;
    document.querySelectorAll('.faq-item').forEach(i=>{if(i!==item)i.classList.remove('open')});
    item.classList.toggle('open');
  });
});

const target=new Date('2026-10-17T19:00:00');
function updateCountdown(){
  let diff=Math.max(0,target-new Date());
  const d=Math.floor(diff/86400000); diff%=86400000;
  const h=Math.floor(diff/3600000); diff%=3600000;
  const m=Math.floor(diff/60000); diff%=60000;
  const s=Math.floor(diff/1000);
  document.getElementById('days').textContent=String(d).padStart(2,'0');
  document.getElementById('hours').textContent=String(h).padStart(2,'0');
  document.getElementById('minutes').textContent=String(m).padStart(2,'0');
  document.getElementById('seconds').textContent=String(s).padStart(2,'0');
}
updateCountdown();setInterval(updateCountdown,1000);

document.getElementById('registerForm').addEventListener('submit',e=>{
  e.preventDefault();
  document.getElementById('formMessage').textContent='✓ Registration packet received. Welcome to the mission.';
  e.target.reset();
});
</script>
</body>
</html>