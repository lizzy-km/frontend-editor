<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Master Chief: Spartan Legacy — Live Event</title>

  <meta
    name="description"
    content="Master Chief: Spartan Legacy — an immersive futuristic fan event featuring live experiences, exhibitions, panels, competitions and more."
  />

  <style>
    /* =========================================================
       MASTER CHIEF EVENT PAGE
       ========================================================= */

    :root {
      --bg: #050907;
      --bg-2: #09100b;
      --bg-3: #0c1510;

      --panel: rgba(12, 24, 16, 0.82);
      --panel-light: rgba(22, 39, 27, 0.72);

      --green: #8dae50;
      --green-light: #b3cf6b;
      --green-dark: #536c2e;

      --gold: #d9b55f;
      --gold-light: #f2d58a;

      --white: #ffffff;
      --text: #e9eee9;
      --muted: #a8b3aa;

      --border: rgba(165, 196, 116, 0.2);

      --shadow:
        0 25px 60px rgba(0, 0, 0, 0.45);

      --container: 1220px;

      --radius: 18px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      font-family:
        Inter,
        Arial,
        Helvetica,
        sans-serif;

      background:
        radial-gradient(
          circle at 80% 10%,
          rgba(104, 132, 66, 0.12),
          transparent 35%
        ),
        #050907;

      color: var(--text);
      line-height: 1.65;

      overflow-x: hidden;
    }

    body.menu-open {
      overflow: hidden;
    }

    img {
      width: 100%;
      display: block;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    button,
    input {
      font: inherit;
    }

    section {
      position: relative;
    }

    .container {
      width: min(
        calc(100% - 40px),
        var(--container)
      );

      margin: 0 auto;
    }

    /* =========================================================
       UTILITIES
       ========================================================= */

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 10px;

      color: var(--green-light);

      font-size: 12px;
      font-weight: 800;

      letter-spacing: 0.18em;

      text-transform: uppercase;

      margin-bottom: 18px;
    }

    .eyebrow::before {
      content: "";

      width: 32px;
      height: 2px;

      background: var(--green);
    }

    .section-heading {
      max-width: 760px;

      margin-bottom: 48px;
    }

    .section-heading.center {
      margin-inline: auto;
      text-align: center;
    }

    .section-heading.center .eyebrow {
      justify-content: center;
    }

    .section-heading.center .eyebrow::before {
      display: none;
    }

    .section-heading h2 {
      font-size: clamp(
        34px,
        5vw,
        62px
      );

      line-height: 1.03;

      margin-bottom: 18px;

      letter-spacing: -0.04em;
    }

    .section-heading p {
      color: var(--muted);

      font-size: 17px;
    }

    .highlight {
      color: var(--green-light);
    }

    .gold {
      color: var(--gold);
    }

    /* =========================================================
       BUTTONS
       ========================================================= */

    .btn {
      min-height: 52px;

      padding: 0 25px;

      border: 1px solid transparent;

      display: inline-flex;
      align-items: center;
      justify-content: center;

      gap: 10px;

      font-size: 13px;
      font-weight: 800;

      letter-spacing: 0.09em;

      text-transform: uppercase;

      cursor: pointer;

      transition:
        0.3s ease;

      position: relative;
      overflow: hidden;
    }

    .btn-primary {
      background:
        linear-gradient(
          135deg,
          #789846,
          #a7c562
        );

      color: #071006;

      box-shadow:
        0 14px 35px rgba(139, 171, 76, 0.2);
    }

    .btn-primary:hover {
      transform: translateY(-3px);

      box-shadow:
        0 18px 42px rgba(139, 171, 76, 0.35);
    }

    .btn-outline {
      border-color:
        rgba(201, 222, 174, 0.35);

      color: white;

      background:
        rgba(255, 255, 255, 0.03);

      backdrop-filter: blur(10px);
    }

    .btn-outline:hover {
      border-color: var(--green-light);

      background:
        rgba(144, 177, 83, 0.1);
    }

    /* =========================================================
       NAVIGATION
       ========================================================= */

    .navbar {
      position: fixed;

      top: 0;
      left: 0;
      right: 0;

      z-index: 1000;

      transition:
        background 0.3s ease,
        border 0.3s ease;
    }

    .navbar.scrolled {
      background:
        rgba(4, 8, 5, 0.88);

      backdrop-filter: blur(18px);

      border-bottom:
        1px solid rgba(156, 187, 110, 0.12);
    }

    .nav-inner {
      height: 86px;

      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 30px;
    }

    .brand {
      display: flex;
      align-items: center;

      gap: 13px;

      font-weight: 900;

      letter-spacing: 0.05em;
    }

    .brand-mark {
      width: 42px;
      height: 42px;

      display: grid;
      place-items: center;

      border:
        1px solid var(--green);

      color: var(--green-light);

      font-size: 12px;

      font-weight: 900;

      transform: rotate(45deg);
    }

    .brand-mark span {
      transform: rotate(-45deg);
    }

    .brand-title {
      line-height: 1;
    }

    .brand-title strong {
      display: block;

      font-size: 15px;
    }

    .brand-title small {
      display: block;

      margin-top: 6px;

      color: var(--muted);

      font-size: 9px;

      letter-spacing: 0.2em;

      text-transform: uppercase;
    }

    .nav-links {
      display: flex;
      align-items: center;

      gap: 32px;
    }

    .nav-links a {
      font-size: 12px;

      letter-spacing: 0.1em;

      text-transform: uppercase;

      color: #cbd4cc;

      font-weight: 700;

      transition: 0.2s;
    }

    .nav-links a:hover {
      color: var(--green-light);
    }

    .menu-btn {
      display: none;

      background: transparent;

      border: 0;

      color: white;

      cursor: pointer;

      width: 44px;
      height: 44px;
    }

    .menu-btn span {
      display: block;

      width: 24px;
      height: 2px;

      background: white;

      margin: 5px auto;

      transition: 0.25s;
    }

    /* =========================================================
       HERO
       ========================================================= */

    .hero {
      min-height: 100vh;

      display: flex;
      align-items: center;

      position: relative;

      overflow: hidden;

      background:
        linear-gradient(
          90deg,
          rgba(2, 5, 3, 0.97) 0%,
          rgba(4, 9, 6, 0.88) 36%,
          rgba(5, 9, 6, 0.48) 64%,
          rgba(3, 6, 4, 0.72) 100%
        ),
        url(
          "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=2000&q=90"
        )
        center / cover no-repeat;
    }

    .hero::before {
      content: "";

      position: absolute;
      inset: 0;

      background:
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 89px,
          rgba(164, 200, 107, 0.025) 90px
        );

      pointer-events: none;
    }

    .hero::after {
      content: "";

      position: absolute;

      left: 0;
      right: 0;
      bottom: 0;

      height: 220px;

      background:
        linear-gradient(
          transparent,
          var(--bg)
        );
    }

    .hero-glow {
      width: 650px;
      height: 650px;

      border-radius: 50%;

      position: absolute;

      right: -100px;
      top: 50%;

      transform: translateY(-50%);

      background:
        radial-gradient(
          circle,
          rgba(161, 194, 93, 0.15),
          transparent 65%
        );

      filter: blur(20px);
    }

    .hero-content {
      position: relative;

      z-index: 3;

      padding:
        145px 0
        120px;

      max-width: 860px;
    }

    .hero-status {
      display: inline-flex;
      align-items: center;

      gap: 9px;

      border:
        1px solid rgba(157, 190, 100, 0.3);

      background:
        rgba(94, 121, 56, 0.08);

      padding:
        9px 14px;

      margin-bottom: 26px;

      font-size: 10px;

      font-weight: 800;

      letter-spacing: 0.18em;

      text-transform: uppercase;

      color: var(--green-light);
    }

    .status-dot {
      width: 7px;
      height: 7px;

      background: #9fcc58;

      border-radius: 50%;

      box-shadow:
        0 0 12px #9fcc58;
    }

    .hero h1 {
      font-size:
        clamp(
          60px,
          9vw,
          120px
        );

      line-height: 0.82;

      letter-spacing: -0.065em;

      text-transform: uppercase;

      margin-bottom: 32px;
    }

    .hero h1 span {
      display: block;

      color: transparent;

      -webkit-text-stroke:
        1px rgba(
          203,
          223,
          173,
          0.58
        );
    }

    .hero-description {
      max-width: 660px;

      font-size: 18px;

      color: #c2cbc3;

      margin-bottom: 36px;
    }

    .hero-info {
      display: flex;
      flex-wrap: wrap;

      gap:
        20px 38px;

      margin-bottom: 40px;
    }

    .hero-info-item {
      display: flex;
      align-items: center;

      gap: 12px;

      color: #e6ece7;

      font-size: 14px;
    }

    .hero-info-icon {
      color: var(--green-light);

      font-size: 18px;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;

      gap: 14px;
    }

    .hero-number {
      position: absolute;

      right: 3%;
      bottom: 100px;

      z-index: 2;

      font-size:
        clamp(
          130px,
          22vw,
          320px
        );

      font-weight: 900;

      line-height: 0.7;

      color:
        rgba(190, 216, 147, 0.025);

      letter-spacing: -0.08em;
    }

    /* =========================================================
       COUNTDOWN
       ========================================================= */

    .countdown-section {
      margin-top: -65px;

      z-index: 10;
    }

    .countdown-box {
      background:
        linear-gradient(
          135deg,
          rgba(16, 28, 19, 0.96),
          rgba(7, 14, 9, 0.96)
        );

      border:
        1px solid var(--border);

      box-shadow: var(--shadow);

      display: grid;

      grid-template-columns:
        1.2fr repeat(
          4,
          1fr
        );
    }

    .countdown-title {
      padding: 30px;

      border-right:
        1px solid var(--border);

      display: flex;
      flex-direction: column;

      justify-content: center;
    }

    .countdown-title small {
      text-transform: uppercase;

      letter-spacing: 0.18em;

      font-size: 10px;

      color: var(--green-light);

      margin-bottom: 6px;

      font-weight: 700;
    }

    .countdown-title strong {
      font-size: 18px;
    }

    .count-item {
      padding: 30px 20px;

      text-align: center;

      border-right:
        1px solid var(--border);
    }

    .count-item:last-child {
      border-right: 0;
    }

    .count-item span {
      display: block;

      color: var(--green-light);

      font-size: 38px;

      font-weight: 900;

      line-height: 1;
    }

    .count-item small {
      color: var(--muted);

      text-transform: uppercase;

      letter-spacing: 0.13em;

      font-size: 9px;
    }

    /* =========================================================
       ABOUT
       ========================================================= */

    .about {
      padding:
        150px 0
        120px;
    }

    .about-grid {
      display: grid;

      grid-template-columns:
        1fr 1fr;

      gap: 90px;

      align-items: center;
    }

    .about-image {
      position: relative;

      min-height: 620px;

      background:
        linear-gradient(
          180deg,
          transparent 40%,
          rgba(5, 9, 6, 0.9)
        ),
        url(
          "https://images.unsplash.com/photo-1518365050014-70fe7232897f?auto=format&fit=crop&w=1200&q=90"
        )
        center / cover;

      border:
        1px solid var(--border);
    }

    .about-image::before {
      content: "SPARTAN // 117";

      position: absolute;

      top: 28px;
      left: 28px;

      padding:
        8px 13px;

      border:
        1px solid rgba(166, 198, 109, 0.35);

      background:
        rgba(5, 10, 7, 0.65);

      color: var(--green-light);

      font-size: 9px;

      letter-spacing: 0.2em;
    }

    .about-image-card {
      position: absolute;

      right: -35px;
      bottom: 35px;

      width: 240px;

      background: #111d14;

      border:
        1px solid var(--border);

      padding: 25px;

      box-shadow: var(--shadow);
    }

    .about-image-card strong {
      font-size: 34px;

      color: var(--green-light);

      display: block;
    }

    .about-image-card span {
      color: var(--muted);

      font-size: 11px;

      text-transform: uppercase;

      letter-spacing: 0.12em;
    }

    .about-copy h2 {
      font-size:
        clamp(
          42px,
          5vw,
          68px
        );

      line-height: 1;

      letter-spacing: -0.05em;

      margin-bottom: 25px;
    }

    .about-copy p {
      color: var(--muted);

      margin-bottom: 19px;
    }

    .about-features {
      margin-top: 32px;

      display: grid;

      grid-template-columns:
        1fr 1fr;

      gap: 16px;
    }

    .about-feature {
      padding: 17px;

      border-left:
        2px solid var(--green);

      background:
        rgba(255, 255, 255, 0.025);
    }

    .about-feature strong {
      display: block;

      margin-bottom: 5px;

      font-size: 14px;
    }

    .about-feature span {
      color: var(--muted);

      font-size: 12px;
    }

    /* =========================================================
       EVENT HIGHLIGHTS
       ========================================================= */

    .highlights {
      padding:
        120px 0;

      background: var(--bg-2);
    }

    .highlight-grid {
      display: grid;

      grid-template-columns:
        repeat(
          3,
          1fr
        );

      border-top:
        1px solid var(--border);

      border-left:
        1px solid var(--border);
    }

    .highlight-card {
      padding:
        44px 34px;

      min-height: 300px;

      border-right:
        1px solid var(--border);

      border-bottom:
        1px solid var(--border);

      transition:
        0.3s ease;

      position: relative;
    }

    .highlight-card:hover {
      background:
        rgba(130, 163, 74, 0.07);

      transform:
        translateY(-6px);
    }

    .highlight-number {
      position: absolute;

      top: 24px;
      right: 25px;

      color:
        rgba(179, 207, 107, 0.12);

      font-size: 42px;

      font-weight: 900;
    }

    .highlight-icon {
      font-size: 28px;

      margin-bottom: 45px;
    }

    .highlight-card h3 {
      margin-bottom: 12px;

      font-size: 19px;
    }

    .highlight-card p {
      color: var(--muted);

      font-size: 14px;
    }

    /* =========================================================
       FEATURE BANNER
       ========================================================= */

    .feature-banner {
      min-height: 610px;

      display: flex;
      align-items: center;

      background:
        linear-gradient(
          90deg,
          rgba(4, 8, 5, 0.96),
          rgba(5, 9, 6, 0.75),
          rgba(5, 9, 6, 0.25)
        ),
        url(
          "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2000&q=90"
        )
        center / cover;

      background-attachment: fixed;
    }

    .feature-content {
      max-width: 660px;

      padding:
        100px 0;
    }

    .feature-content h2 {
      font-size:
        clamp(
          48px,
          7vw,
          82px
        );

      line-height: 0.95;

      letter-spacing: -0.055em;

      margin-bottom: 27px;
    }

    .feature-content p {
      font-size: 17px;

      color: #c5cec6;

      max-width: 590px;

      margin-bottom: 32px;
    }

    /* =========================================================
       SCHEDULE
       ========================================================= */

    .schedule {
      padding:
        120px 0;
    }

    .schedule-tabs {
      display: flex;

      border-bottom:
        1px solid var(--border);

      margin-bottom: 30px;
    }

    .schedule-tab {
      padding:
        16px 26px;

      background: none;

      border: 0;

      color: var(--muted);

      font-weight: 700;

      cursor: pointer;

      text-transform: uppercase;

      letter-spacing: 0.09em;

      font-size: 11px;

      border-bottom:
        2px solid transparent;
    }

    .schedule-tab.active {
      color: var(--green-light);

      border-color: var(--green-light);
    }

    .schedule-panel {
      display: none;
    }

    .schedule-panel.active {
      display: block;
    }

    .schedule-row {
      display: grid;

      grid-template-columns:
        170px 1fr 180px;

      gap: 30px;

      align-items: center;

      padding:
        27px 20px;

      border-bottom:
        1px solid var(--border);

      transition: 0.25s;
    }

    .schedule-row:hover {
      background:
        rgba(145, 175, 91, 0.045);
    }

    .schedule-time {
      color: var(--green-light);

      font-size: 13px;

      font-weight: 800;
    }

    .schedule-details h3 {
      font-size: 18px;

      margin-bottom: 4px;
    }

    .schedule-details p {
      color: var(--muted);

      font-size: 13px;
    }

    .schedule-location {
      text-align: right;

      font-size: 11px;

      color: var(--gold);

      text-transform: uppercase;

      letter-spacing: 0.1em;
    }

    /* =========================================================
       GUESTS
       ========================================================= */

    .guests {
      background: var(--bg-2);

      padding:
        120px 0;
    }

    .guest-grid {
      display: grid;

      grid-template-columns:
        repeat(
          4,
          1fr
        );

      gap: 18px;
    }

    .guest-card {
      position: relative;

      overflow: hidden;

      min-height: 410px;

      border:
        1px solid var(--border);

      background: #101912;
    }

    .guest-image {
      position: absolute;
      inset: 0;

      background-size: cover;
      background-position: center;

      filter:
        grayscale(0.4)
        contrast(1.05);

      transition:
        0.5s;
    }

    .guest-card:hover .guest-image {
      transform: scale(1.05);

      filter:
        grayscale(0);
    }

    .guest-overlay {
      position: absolute;
      inset: 0;

      background:
        linear-gradient(
          transparent 35%,
          rgba(5, 8, 6, 0.96)
        );
    }

    .guest-info {
      position: absolute;

      bottom: 0;
      left: 0;
      right: 0;

      padding: 25px;
    }

    .guest-info small {
      color: var(--green-light);

      font-size: 9px;

      text-transform: uppercase;

      letter-spacing: 0.16em;
    }

    .guest-info h3 {
      margin-top: 6px;

      font-size: 20px;
    }

    /* =========================================================
       STATISTICS
       ========================================================= */

    .stats {
      padding:
        90px 0;

      border-bottom:
        1px solid var(--border);

      border-top:
        1px solid var(--border);
    }

    .stats-grid {
      display: grid;

      grid-template-columns:
        repeat(
          4,
          1fr
        );
    }

    .stat {
      text-align: center;

      padding:
        20px;

      border-right:
        1px solid var(--border);
    }

    .stat:last-child {
      border: 0;
    }

    .stat strong {
      font-size:
        clamp(
          38px,
          5vw,
          64px
        );

      display: block;

      color: var(--green-light);

      line-height: 1;
    }

    .stat span {
      color: var(--muted);

      font-size: 10px;

      text-transform: uppercase;

      letter-spacing: 0.14em;
    }

    /* =========================================================
       TICKETS
       ========================================================= */

    .tickets {
      padding:
        120px 0;
    }

    .ticket-grid {
      display: grid;

      grid-template-columns:
        repeat(
          3,
          1fr
        );

      gap: 20px;

      align-items: stretch;
    }

    .ticket-card {
      border:
        1px solid var(--border);

      padding: 38px;

      background:
        linear-gradient(
          145deg,
          rgba(21, 33, 24, 0.82),
          rgba(8, 14, 10, 0.82)
        );

      position: relative;

      transition:
        transform 0.3s,
        border 0.3s;
    }

    .ticket-card:hover {
      transform:
        translateY(-8px);

      border-color:
        rgba(178, 209, 108, 0.48);
    }

    .ticket-card.featured {
      border-color:
        var(--green);

      transform: scale(1.025);
    }

    .ticket-badge {
      position: absolute;

      top: 0;
      right: 0;

      padding:
        8px 14px;

      background: var(--green);

      color: #071006;

      font-size: 9px;

      font-weight: 900;

      text-transform: uppercase;

      letter-spacing: 0.1em;
    }

    .ticket-level {
      text-transform: uppercase;

      letter-spacing: 0.16em;

      color: var(--green-light);

      font-size: 10px;

      font-weight: 800;

      margin-bottom: 18px;
    }

    .ticket-price {
      font-size: 52px;

      font-weight: 900;

      line-height: 1;

      margin-bottom: 7px;
    }

    .ticket-price sup {
      font-size: 20px;
    }

    .ticket-sub {
      color: var(--muted);

      font-size: 12px;

      margin-bottom: 28px;
    }

    .ticket-features {
      list-style: none;

      margin:
        26px 0
        34px;

      border-top:
        1px solid var(--border);
    }

    .ticket-features li {
      padding:
        12px 0;

      color: #c3cdc5;

      border-bottom:
        1px solid var(--border);

      font-size: 13px;
    }

    .ticket-features li::before {
      content: "✓";

      color: var(--green-light);

      margin-right: 10px;

      font-weight: 900;
    }

    .ticket-card .btn {
      width: 100%;
    }

    /* =========================================================
       GALLERY
       ========================================================= */

    .gallery {
      padding:
        120px 0;

      background: var(--bg-2);
    }

    .gallery-grid {
      display: grid;

      grid-template-columns:
        repeat(
          4,
          1fr
        );

      grid-auto-rows: 240px;

      gap: 10px;
    }

    .gallery-item {
      position: relative;

      overflow: hidden;
    }

    .gallery-item.big {
      grid-column: span 2;
      grid-row: span 2;
    }

    .gallery-item.wide {
      grid-column: span 2;
    }

    .gallery-item img {
      width: 100%;
      height: 100%;

      object-fit: cover;

      transition: 0.5s;
    }

    .gallery-item:hover img {
      transform: scale(1.07);
    }

    .gallery-item::after {
      content: "";

      position: absolute;
      inset: 0;

      background:
        linear-gradient(
          transparent,
          rgba(5, 9, 6, 0.4)
        );
    }

    /* =========================================================
       FAQ
       ========================================================= */

    .faq {
      padding:
        120px 0;
    }

    .faq-wrapper {
      max-width: 900px;

      margin: 0 auto;
    }

    .faq-item {
      border-bottom:
        1px solid var(--border);
    }

    .faq-question {
      width: 100%;

      padding:
        25px 0;

      background: none;

      color: white;

      border: 0;

      cursor: pointer;

      display: flex;
      justify-content: space-between;

      gap: 20px;

      text-align: left;

      font-weight: 700;

      font-size: 16px;
    }

    .faq-icon {
      color: var(--green-light);

      font-size: 20px;

      transition:
        transform 0.3s;
    }

    .faq-item.active .faq-icon {
      transform: rotate(45deg);
    }

    .faq-answer {
      max-height: 0;

      overflow: hidden;

      color: var(--muted);

      transition:
        max-height 0.35s ease;
    }

    .faq-answer-inner {
      padding:
        0 40px
        25px 0;
    }

    /* =========================================================
       FINAL CTA
       ========================================================= */

    .cta {
      padding:
        140px 0;

      text-align: center;

      overflow: hidden;

      background:
        linear-gradient(
          rgba(7, 14, 9, 0.88),
          rgba(7, 14, 9, 0.93)
        ),
        url(
          "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=2000&q=90"
        )
        center / cover;
    }

    .cta::before {
      content: "117";

      position: absolute;

      top: 50%;
      left: 50%;

      transform:
        translate(
          -50%,
          -50%
        );

      font-size:
        clamp(
          280px,
          40vw,
          600px
        );

      font-weight: 900;

      color:
        rgba(177, 204, 119, 0.025);

      line-height: 1;
    }

    .cta-content {
      position: relative;

      z-index: 2;

      max-width: 760px;

      margin: auto;
    }

    .cta h2 {
      font-size:
        clamp(
          46px,
          7vw,
          82px
        );

      line-height: 0.95;

      margin-bottom: 25px;

      letter-spacing: -0.05em;
    }

    .cta p {
      color: #c1cbc2;

      font-size: 17px;

      margin:
        0 auto
        34px;

      max-width: 570px;
    }

    /* =========================================================
       FOOTER
       ========================================================= */

    footer {
      background: #030604;

      padding:
        60px 0
        28px;
    }

    .footer-grid {
      display: grid;

      grid-template-columns:
        1.6fr
        1fr
        1fr
        1fr;

      gap: 45px;

      padding-bottom: 45px;
    }

    .footer-brand p {
      color: var(--muted);

      font-size: 13px;

      max-width: 330px;

      margin-top: 20px;
    }

    .footer-column h4 {
      font-size: 11px;

      text-transform: uppercase;

      letter-spacing: 0.15em;

      color: var(--green-light);

      margin-bottom: 20px;
    }

    .footer-column a {
      display: block;

      color: var(--muted);

      margin-bottom: 10px;

      font-size: 13px;
    }

    .footer-column a:hover {
      color: white;
    }

    .footer-bottom {
      border-top:
        1px solid var(--border);

      padding-top: 26px;

      display: flex;
      justify-content: space-between;

      gap: 20px;

      color: #69736b;

      font-size: 10px;

      text-transform: uppercase;

      letter-spacing: 0.1em;
    }

    /* =========================================================
       REVEAL ANIMATION
       ========================================================= */

    .reveal {
      opacity: 0;

      transform:
        translateY(30px);

      transition:
        opacity 0.7s ease,
        transform 0.7s ease;
    }

    .reveal.visible {
      opacity: 1;

      transform:
        translateY(0);
    }

    /* =========================================================
       RESPONSIVE
       ========================================================= */

    @media (
      max-width: 1000px
    ) {

      .nav-links {
        position: fixed;

        top: 0;
        right: -100%;

        width: min(
          360px,
          90vw
        );

        height: 100vh;

        background:
          rgba(5, 10, 7, 0.98);

        backdrop-filter:
          blur(20px);

        flex-direction: column;

        justify-content: center;

        transition:
          right 0.35s;

        border-left:
          1px solid var(--border);
      }

      .nav-links.open {
        right: 0;
      }

      .nav-cta {
        display: none;
      }

      .menu-btn {
        display: block;

        position: relative;

        z-index: 1001;
      }

      .countdown-box {
        grid-template-columns:
          repeat(
            4,
            1fr
          );
      }

      .countdown-title {
        grid-column:
          1 / -1;

        border-right: 0;

        border-bottom:
          1px solid var(--border);

        text-align: center;
      }

      .about-grid {
        grid-template-columns:
          1fr;

        gap: 60px;
      }

      .about-image {
        max-width: 800px;
      }

      .about-image-card {
        right: 25px;
      }

      .highlight-grid {
        grid-template-columns:
          repeat(
            2,
            1fr
          );
      }

      .guest-grid {
        grid-template-columns:
          repeat(
            2,
            1fr
          );
      }

      .ticket-grid {
        grid-template-columns:
          1fr;

        max-width: 620px;

        margin: auto;
      }

      .ticket-card.featured {
        transform: none;
      }

      .gallery-grid {
        grid-template-columns:
          repeat(
            2,
            1fr
          );
      }

      .footer-grid {
        grid-template-columns:
          2fr 1fr 1fr;
      }

      .footer-grid
      .footer-column:last-child {
        grid-column:
          2;
      }
    }

    @media (
      max-width: 720px
    ) {

      .container {
        width: min(
          calc(100% - 28px),
          var(--container)
        );
      }

      .hero {
        min-height: 850px;
      }

      .hero-content {
        padding-top:
          130px;
      }

      .hero h1 {
        font-size:
          clamp(
            56px,
            19vw,
            90px
          );
      }

      .countdown-section {
        margin-top: -35px;
      }

      .countdown-box {
        grid-template-columns:
          1fr 1fr;
      }

      .count-item {
        border-bottom:
          1px solid var(--border);
      }

      .count-item:nth-of-type(
        2
      ) {
        border-right: 0;
      }

      .about {
        padding:
          110px 0
          90px;
      }

      .about-image {
        min-height: 450px;
      }

      .about-features {
        grid-template-columns:
          1fr;
      }

      .highlight-grid {
        grid-template-columns:
          1fr;
      }

      .schedule-row {
        grid-template-columns:
          1fr;

        gap: 8px;

        padding:
          23px 5px;
      }

      .schedule-location {
        text-align: left;
      }

      .guest-grid {
        grid-template-columns:
          1fr;
      }

      .stats-grid {
        grid-template-columns:
          1fr 1fr;

        gap: 25px 0;
      }

      .stat:nth-child(
        2
      ) {
        border-right: 0;
      }

      .gallery-grid {
        grid-template-columns:
          1fr;

        grid-auto-rows:
          260px;
      }

      .gallery-item.big,
      .gallery-item.wide {
        grid-column:
          span 1;

        grid-row:
          span 1;
      }

      .footer-grid {
        grid-template-columns:
          1fr 1fr;
      }

      .footer-brand {
        grid-column:
          1 / -1;
      }

      .footer-grid
      .footer-column:last-child {
        grid-column:
          auto;
      }

      .footer-bottom {
        flex-direction:
          column;
      }
    }

  </style>
</head>

<body>

  <!-- =========================================
       NAVIGATION
       ========================================= -->

  <header
    class="navbar"
    id="navbar"
  >

    <div
      class="container nav-inner"
    >

      <a
        href="#home"
        class="brand"
      >

        <div
          class="brand-mark"
        >
          <span>117</span>
        </div>

        <div
          class="brand-title"
        >
          <strong>
            SPARTAN LEGACY
          </strong>

          <small>
            Master Chief Event
          </small>
        </div>

      </a>

      <nav
        class="nav-links"
        id="navLinks"
      >
        <a href="#about">
          About
        </a>

        <a href="#experience">
          Experience
        </a>

        <a href="#schedule">
          Schedule
        </a>

        <a href="#guests">
          Guests
        </a>

        <a href="#tickets">
          Tickets
        </a>

        <a href="#faq">
          FAQ
        </a>
      </nav>

      <a
        href="#tickets"
        class="btn btn-primary nav-cta"
      >
        Secure Access
      </a>

      <button
        class="menu-btn"
        id="menuBtn"
        aria-label="Open Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

    </div>

  </header>


  <!-- =========================================
       HERO
       ========================================= -->

  <section
    class="hero"
    id="home"
  >

    <div
      class="hero-glow"
    ></div>

    <div
      class="hero-number"
    >
      117
    </div>

    <div
      class="container"
    >

      <div
        class="hero-content"
      >

        <div
          class="hero-status"
        >
          <span
            class="status-dot"
          ></span>

          Transmission Received
        </div>

        <h1>
          MASTER
          <span>
            CHIEF
          </span>
        </h1>

        <p
          class="hero-description"
        >
          Enter the world of the Spartan program
          for an immersive celebration of courage,
          technology, combat, storytelling and the
          legendary legacy of Spartan-117.
        </p>

        <div
          class="hero-info"
        >

          <div
            class="hero-info-item"
          >
            <span
              class="hero-info-icon"
            >
              ◈
            </span>

            17–18 October 2026
          </div>

          <div
            class="hero-info-item"
          >
            <span
              class="hero-info-icon"
            >
              ⌖
            </span>

            UNSC Exhibition Center
          </div>

          <div
            class="hero-info-item"
          >
            <span
              class="hero-info-icon"
            >
              ◉
            </span>

            09:00 – 22:00
          </div>

        </div>

        <div
          class="hero-actions"
        >

          <a
            href="#tickets"
            class="btn btn-primary"
          >
            Get Tickets
          </a>

          <a
            href="#experience"
            class="btn btn-outline"
          >
            Explore Event
          </a>

        </div>

      </div>

    </div>

  </section>


  <!-- =========================================
       COUNTDOWN
       ========================================= -->

  <section
    class="countdown-section"
  >

    <div
      class="container"
    >

      <div
        class="countdown-box"
      >

        <div
          class="countdown-title"
        >
          <small>
            Deployment begins in
          </small>

          <strong>
            Operation Spartan Legacy
          </strong>
        </div>

        <div
          class="count-item"
        >
          <span id="days">
            00
          </span>

          <small>
            Days
          </small>
        </div>

        <div
          class="count-item"
        >
          <span id="hours">
            00
          </span>

          <small>
            Hours
          </small>
        </div>

        <div
          class="count-item"
        >
          <span id="minutes">
            00
          </span>

          <small>
            Minutes
          </small>
        </div>

        <div
          class="count-item"
        >
          <span id="seconds">
            00
          </span>

          <small>
            Seconds
          </small>
        </div>

      </div>

    </div>

  </section>


  <!-- =========================================
       ABOUT
       ========================================= -->

  <section
    class="about"
    id="about"
  >

    <div
      class="container"
    >

      <div
        class="about-grid"
      >

        <div
          class="about-image reveal"
        >

          <div
            class="about-image-card"
          >
            <strong>
              117
            </strong>

            <span>
              Spartan Designation
            </span>
          </div>

        </div>


        <div
          class="about-copy reveal"
        >

          <div
            class="eyebrow"
          >
            The Legend
          </div>

          <h2>
            Become part of
            the
            <span
              class="highlight"
            >
              legacy.
            </span>
          </h2>

          <p>
            Spartan Legacy is a large-scale
            celebration inspired by the universe
            surrounding one of science fiction's
            most iconic supersoldiers.
          </p>

          <p>
            The experience brings together fans,
            creators, collectors, competitive
            players and technology enthusiasts for
            two unforgettable days of exhibitions,
            demonstrations, tournaments, panels
            and immersive experiences.
          </p>

          <div
            class="about-features"
          >

            <div
              class="about-feature"
            >
              <strong>
                Immersive World
              </strong>

              <span>
                Step inside military-inspired
                futuristic installations.
              </span>
            </div>

            <div
              class="about-feature"
            >
              <strong>
                Fan Community
              </strong>

              <span>
                Meet thousands of fans from
                around the world.
              </span>
            </div>

            <div
              class="about-feature"
            >
              <strong>
                Live Experiences
              </strong>

              <span>
                Interactive demonstrations,
                challenges and competitions.
              </span>
            </div>

            <div
              class="about-feature"
            >
              <strong>
                Exclusive Access
              </strong>

              <span>
                Collectibles, panels, exhibits
                and limited experiences.
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>

  </section>


  <!-- =========================================
       EVENT EXPERIENCES
       ========================================= -->

  <section
    class="highlights"
    id="experience"
  >

    <div
      class="container"
    >

      <div
        class="section-heading reveal"
      >

        <div
          class="eyebrow"
        >
          Event Experiences
        </div>

        <h2>
          Your mission
          <span
            class="highlight"
          >
            awaits.
          </span>
        </h2>

        <p>
          Explore a complete program of
          exhibitions, competitions,
          interactive installations and
          live entertainment.
        </p>

      </div>


      <div
        class="highlight-grid"
      >

        <article
          class="highlight-card reveal"
        >
          <span
            class="highlight-number"
          >
            01
          </span>

          <div
            class="highlight-icon"
          >
            ◈
          </div>

          <h3>
            Spartan Training
          </h3>

          <p>
            Test your reaction speed, tactical
            awareness and teamwork across
            interactive challenges.
          </p>
        </article>


        <article
          class="highlight-card reveal"
        >
          <span
            class="highlight-number"
          >
            02
          </span>

          <div
            class="highlight-icon"
          >
            ◎
          </div>

          <h3>
            Armour Exhibition
          </h3>

          <p>
            Explore detailed futuristic armour,
            helmets, props and collector
            displays.
          </p>
        </article>


        <article
          class="highlight-card reveal"
        >
          <span
            class="highlight-number"
          >
            03
          </span>

          <div
            class="highlight-icon"
          >
            ◉
          </div>

          <h3>
            Gaming Arena
          </h3>

          <p>
            Enter competitive multiplayer
            matches and community tournaments
            throughout the weekend.
          </p>
        </article>


        <article
          class="highlight-card reveal"
        >
          <span
            class="highlight-number"
          >
            04
          </span>

          <div
            class="highlight-icon"
          >
            △
          </div>

          <h3>
            Creator Panels
          </h3>

          <p>
            Hear from artists, designers,
            performers and creators discussing
            science-fiction storytelling.
          </p>
        </article>


        <article
          class="highlight-card reveal"
        >
          <span
            class="highlight-number"
          >
            05
          </span>

          <div
            class="highlight-icon"
          >
            ⌖
          </div>

          <h3>
            Combat Simulation
          </h3>

          <p>
            Join tactical team missions built
            around communication, strategy and
            immersive environments.
          </p>
        </article>


        <article
          class="highlight-card reveal"
        >
          <span
            class="highlight-number"
          >
            06
          </span>

          <div
            class="highlight-icon"
          >
            ✦
          </div>

          <h3>
            Night Celebration
          </h3>

          <p>
            Finish the mission with music,
            entertainment, cosplay showcases
            and a community celebration.
          </p>
        </article>

      </div>

    </div>

  </section>


  <!-- =========================================
       FEATURE
       ========================================= -->

  <section
    class="feature-banner"
  >

    <div
      class="container"
    >

      <div
        class="feature-content reveal"
      >

        <div
          class="eyebrow"
        >
          Main Experience
        </div>

        <h2>
          Finish the
          <span
            class="highlight"
          >
            fight.
          </span>
        </h2>

        <p>
          Enter a cinematic tactical experience
          where squads work together through a
          sequence of interactive objectives,
          environmental challenges and mission
          simulations.
        </p>

        <a
          href="#tickets"
          class="btn btn-primary"
        >
          Join the Mission
        </a>

      </div>

    </div>

  </section>


  <!-- =========================================
       SCHEDULE
       ========================================= -->

  <section
    class="schedule"
    id="schedule"
  >

    <div
      class="container"
    >

      <div
        class="section-heading reveal"
      >

        <div
          class="eyebrow"
        >
          Operation Timeline
        </div>

        <h2>
          Event
          <span
            class="highlight"
          >
            schedule.
          </span>
        </h2>

      </div>


      <div
        class="schedule-tabs"
      >

        <button
          class="schedule-tab active"
          data-day="day1"
        >
          Day 01 · Saturday
        </button>

        <button
          class="schedule-tab"
          data-day="day2"
        >
          Day 02 · Sunday
        </button>

      </div>


      <!-- Day 1 -->

      <div
        class="schedule-panel active"
        id="day1"
      >

        <div
          class="schedule-row"
        >
          <div
            class="schedule-time"
          >
            09:00
          </div>

          <div
            class="schedule-details"
          >
            <h3>
              Gates Open
            </h3>

            <p>
              Registration, exhibition access
              and attendee briefing.
            </p>
          </div>

          <div
            class="schedule-location"
          >
            Main Deck
          </div>
        </div>


        <div
          class="schedule-row"
        >
          <div
            class="schedule-time"
          >
            10:00
          </div>

          <div
            class="schedule-details"
          >
            <h3>
              Opening Transmission
            </h3>

            <p>
              Welcome presentation and
              introduction to Spartan Legacy.
            </p>
          </div>

          <div
            class="schedule-location"
          >
            Command Stage
          </div>
        </div>


        <div
          class="schedule-row"
        >
          <div
            class="schedule-time"
          >
            11:30
          </div>

          <div
            class="schedule-details"
          >
            <h3>
              Spartan Training Session
            </h3>

            <p>
              Interactive tactical challenge
              for registered participants.
            </p>
          </div>

          <div
            class="schedule-location"
          >
            Training Zone
          </div>
        </div>


        <div
          class="schedule-row"
        >
          <div
            class="schedule-time"
          >
            14:00
          </div>

          <div
            class="schedule-details"
          >
            <h3>
              Science Fiction Design Panel
            </h3>

            <p>
              Artists and designers discuss
              futuristic worlds and visual
              storytelling.
            </p>
          </div>

          <div
            class="schedule-location"
          >
            Theatre 01
          </div>
        </div>


        <div
          class="schedule-row"
        >
          <div
            class="schedule-time"
          >
            17:00
          </div>

          <div
            class="schedule-details"
          >
            <h3>
              Multiplayer Championship
            </h3>

            <p>
              Qualifying tournament featuring
              community teams.
            </p>
          </div>

          <div
            class="schedule-location"
          >
            Gaming Arena
          </div>
        </div>


        <div
          class="schedule-row"
        >
          <div
            class="schedule-time"
          >
            20:00
          </div>

          <div
            class="schedule-details"
          >
            <h3>
              Spartan Night
            </h3>

            <p>
              Music, cosplay showcase and
              evening entertainment.
            </p>
          </div>

          <div
            class="schedule-location"
          >
            Main Stage
          </div>
        </div>

      </div>


      <!-- Day 2 -->

      <div
        class="schedule-panel"
        id="day2"
      >

        <div
          class="schedule-row"
        >
          <div
            class="schedule-time"
          >
            09:30
          </div>

          <div
            class="schedule-details"
          >
            <h3>
              Day Two Deployment
            </h3>

            <p>
              Doors open and morning
              activities begin.
            </p>
          </div>

          <div
            class="schedule-location"
          >
            Main Deck
          </div>
        </div>


        <div
          class="schedule-row"
        >
          <div
            class="schedule-time"
          >
            11:00
          </div>

          <div
            class="schedule-details"
          >
            <h3>
              Armour & Prop Showcase
            </h3>

            <p>
              Builders reveal custom armour
              and prop creations.
            </p>
          </div>

          <div
            class="schedule-location"
          >
            Exhibition Hall
          </div>
        </div>


        <div
          class="schedule-row"
        >
          <div
            class="schedule-time"
          >
            13:30
          </div>

          <div
            class="schedule-details"
          >
            <h3>
              Storytelling Panel
            </h3>

            <p>
              Exploring the evolution of
              military science-fiction
              storytelling.
            </p>
          </div>

          <div
            class="schedule-location"
          >
            Theatre 01
          </div>
        </div>


        <div
          class="schedule-row"
        >
          <div
            class="schedule-time"
          >
            16:00
          </div>

          <div
            class="schedule-details"
          >
            <h3>
              Tournament Finals
            </h3>

            <p>
              The final teams compete for
              championship honours.
            </p>
          </div>

          <div
            class="schedule-location"
          >
            Gaming Arena
          </div>
        </div>


        <div
          class="schedule-row"
        >
          <div
            class="schedule-time"
          >
            19:30
          </div>

          <div
            class="schedule-details"
          >
            <h3>
              Closing Ceremony
            </h3>

            <p>
              Awards, highlights and final
              transmission.
            </p>
          </div>

          <div
            class="schedule-location"
          >
            Command Stage
          </div>
        </div>

      </div>

    </div>

  </section>


  <!-- =========================================
       GUESTS
       ========================================= -->

  <section
    class="guests"
    id="guests"
  >

    <div
      class="container"
    >

      <div
        class="section-heading reveal"
      >

        <div
          class="eyebrow"
        >
          Special Guests
        </div>

        <h2>
          Meet the
          <span
            class="highlight"
          >
            creators.
          </span>
        </h2>

        <p>
          Sample guest profiles are included
          below. Replace these with your actual
          event speakers, creators or performers.
        </p>

      </div>


      <div
        class="guest-grid"
      >

        <article
          class="guest-card reveal"
        >
          <div
            class="guest-image"
            style="
              background-image:
              url(
                'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=85'
              );
            "
          ></div>

          <div
            class="guest-overlay"
          ></div>

          <div
            class="guest-info"
          >
            <small>
              Creative Director
            </small>

            <h3>
              Marcus Hale
            </h3>
          </div>
        </article>


        <article
          class="guest-card reveal"
        >
          <div
            class="guest-image"
            style="
              background-image:
              url(
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=85'
              );
            "
          ></div>

          <div
            class="guest-overlay"
          ></div>

          <div
            class="guest-info"
          >
            <small>
              Concept Artist
            </small>

            <h3>
              Elena Voss
            </h3>
          </div>
        </article>


        <article
          class="guest-card reveal"
        >
          <div
            class="guest-image"
            style="
              background-image:
              url(
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=85'
              );
            "
          ></div>

          <div
            class="guest-overlay"
          ></div>

          <div
            class="guest-info"
          >
            <small>
              Game Designer
            </small>

            <h3>
              Daniel Cole
            </h3>
          </div>
        </article>


        <article
          class="guest-card reveal"
        >
          <div
            class="guest-image"
            style="
              background-image:
              url(
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85'
              );
            "
          ></div>

          <div
            class="guest-overlay"
          ></div>

          <div
            class="guest-info"
          >
            <small>
              Prop Designer
            </small>

            <h3>
              Sarah Keene
            </h3>
          </div>
        </article>

      </div>

    </div>

  </section>


  <!-- =========================================
       STATS
       ========================================= -->

  <section
    class="stats"
  >

    <div
      class="container"
    >

      <div
        class="stats-grid"
      >

        <div
          class="stat reveal"
        >
          <strong>
            5K+
          </strong>

          <span>
            Attendees
          </span>
        </div>

        <div
          class="stat reveal"
        >
          <strong>
            25+
          </strong>

          <span>
            Experiences
          </span>
        </div>

        <div
          class="stat reveal"
        >
          <strong>
            20+
          </strong>

          <span>
            Special Guests
          </span>
        </div>

        <div
          class="stat reveal"
        >
          <strong>
            2
          </strong>

          <span>
            Epic Days
          </span>
        </div>

      </div>

    </div>

  </section>


  <!-- =========================================
       TICKETS
       ========================================= -->

  <section
    class="tickets"
    id="tickets"
  >

    <div
      class="container"
    >

      <div
        class="section-heading center reveal"
      >

        <div
          class="eyebrow"
        >
          Choose Your Access
        </div>

        <h2>
          Secure your
          <span
            class="highlight"
          >
            deployment.
          </span>
        </h2>

        <p>
          Select the access level that matches
          your mission.
        </p>

      </div>


      <div
        class="ticket-grid"
      >

        <!-- Recruit -->

        <article
          class="ticket-card reveal"
        >

          <div
            class="ticket-level"
          >
            Recruit Access
          </div>

          <div
            class="ticket-price"
          >
            <sup>$</sup>49
          </div>

          <div
            class="ticket-sub"
          >
            Single-day admission
          </div>

          <ul
            class="ticket-features"
          >
            <li>
              General event admission
            </li>

            <li>
              Exhibition hall access
            </li>

            <li>
              Public panel access
            </li>

            <li>
              Gaming arena access
            </li>

            <li>
              Merchandise marketplace
            </li>
          </ul>

          <a
            href="#"
            class="btn btn-outline"
          >
            Select Ticket
          </a>

        </article>


        <!-- Spartan -->

        <article
          class="ticket-card featured reveal"
        >

          <div
            class="ticket-badge"
          >
            Most Popular
          </div>

          <div
            class="ticket-level"
          >
            Spartan Access
          </div>

          <div
            class="ticket-price"
          >
            <sup>$</sup>99
          </div>

          <div
            class="ticket-sub"
          >
            Full weekend admission
          </div>

          <ul
            class="ticket-features"
          >
            <li>
              Two-day event admission
            </li>

            <li>
              All Recruit benefits
            </li>

            <li>
              Spartan Training access
            </li>

            <li>
              Priority panel seating
            </li>

            <li>
              Exclusive event collectible
            </li>

            <li>
              Evening event access
            </li>
          </ul>

          <a
            href="#"
            class="btn btn-primary"
          >
            Select Ticket
          </a>

        </article>


        <!-- Legendary -->

        <article
          class="ticket-card reveal"
        >

          <div
            class="ticket-level gold"
          >
            Legendary Access
          </div>

          <div
            class="ticket-price"
          >
            <sup>$</sup>199
          </div>

          <div
            class="ticket-sub"
          >
            Premium experience
          </div>

          <ul
            class="ticket-features"
          >
            <li>
              Full weekend access
            </li>

            <li>
              All Spartan benefits
            </li>

            <li>
              Early event entry
            </li>

            <li>
              VIP lounge access
            </li>

            <li>
              Premium collectible pack
            </li>

            <li>
              Guest meet-and-greet
            </li>
          </ul>

          <a
            href="#"
            class="btn btn-outline"
          >
            Select Ticket
          </a>

        </article>

      </div>

    </div>

  </section>


  <!-- =========================================
       GALLERY
       ========================================= -->

  <section
    class="gallery"
  >

    <div
      class="container"
    >

      <div
        class="section-heading reveal"
      >

        <div
          class="eyebrow"
        >
          Field Intelligence
        </div>

        <h2>
          Inside the
          <span
            class="highlight"
          >
            experience.
          </span>
        </h2>

      </div>


      <div
        class="gallery-grid"
      >

        <div
          class="gallery-item big reveal"
        >
          <img
            src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=85"
            alt="Space"
          />
        </div>

        <div
          class="gallery-item reveal"
        >
          <img
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=85"
            alt="Planet"
          />
        </div>

        <div
          class="gallery-item reveal"
        >
          <img
            src="https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=800&q=85"
            alt="Stars"
          />
        </div>

        <div
          class="gallery-item wide reveal"
        >
          <img
            src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=85"
            alt="Galaxy"
          />
        </div>

      </div>

    </div>

  </section>


  <!-- =========================================
       FAQ
       ========================================= -->

  <section
    class="faq"
    id="faq"
  >

    <div
      class="container"
    >

      <div
        class="section-heading center reveal"
      >

        <div
          class="eyebrow"
        >
          Intelligence Database
        </div>

        <h2>
          Frequently asked
          <span
            class="highlight"
          >
            questions.
          </span>
        </h2>

      </div>


      <div
        class="faq-wrapper"
      >

        <div
          class="faq-item"
        >

          <button
            class="faq-question"
          >
            What is Spartan Legacy?

            <span
              class="faq-icon"
            >
              +
            </span>
          </button>

          <div
            class="faq-answer"
          >
            <div
              class="faq-answer-inner"
            >
              Spartan Legacy is an immersive
              science-fiction fan event
              celebrating futuristic gaming,
              art, design, storytelling,
              cosplay and community experiences.
            </div>
          </div>

        </div>


        <div
          class="faq-item"
        >

          <button
            class="faq-question"
          >
            Can children attend the event?

            <span
              class="faq-icon"
            >
              +
            </span>
          </button>

          <div
            class="faq-answer"
          >
            <div
              class="faq-answer-inner"
            >
              Yes. The main exhibition areas
              are family-friendly. Certain
              activities may have age or height
              restrictions for safety.
            </div>
          </div>

        </div>


        <div
          class="faq-item"
        >

          <button
            class="faq-question"
          >
            Can attendees wear cosplay?

            <span
              class="faq-icon"
            >
              +
            </span>
          </button>

          <div
            class="faq-answer"
          >
            <div
              class="faq-answer-inner"
            >
              Absolutely. Cosplay is encouraged.
              Props and armour must comply with
              the venue's safety and security
              requirements.
            </div>
          </div>

        </div>


        <div
          class="faq-item"
        >

          <button
            class="faq-question"
          >
            Are tickets transferable?

            <span
              class="faq-icon"
            >
              +
            </span>
          </button>

          <div
            class="faq-answer"
          >
            <div
              class="faq-answer-inner"
            >
              Ticket transfer policies depend
              on the ticket type. Check your
              registration confirmation for
              the applicable conditions.
            </div>
          </div>

        </div>


        <div
          class="faq-item"
        >

          <button
            class="faq-question"
          >
            Is photography allowed?

            <span
              class="faq-icon"
            >
              +
            </span>
          </button>

          <div
            class="faq-answer"
          >
            <div
              class="faq-answer-inner"
            >
              Personal photography is generally
              permitted. Some presentations,
              displays or guest sessions may
              restrict photography or recording.
            </div>
          </div>

        </div>


        <div
          class="faq-item"
        >

          <button
            class="faq-question"
          >
            What should I bring?

            <span
              class="faq-icon"
            >
              +
            </span>
          </button>

          <div
            class="faq-answer"
          >
            <div
              class="faq-answer-inner"
            >
              Bring your digital ticket,
              identification where required,
              comfortable footwear and plenty
              of enthusiasm for the mission.
            </div>
          </div>

        </div>

      </div>

    </div>

  </section>


  <!-- =========================================
       FINAL CTA
       ========================================= -->

  <section
    class="cta"
  >

    <div
      class="container"
    >

      <div
        class="cta-content reveal"
      >

        <div
          class="eyebrow"
        >
          Incoming Transmission
        </div>

        <h2>
          Spartans never
          <span
            class="highlight"
          >
            stand alone.
          </span>
        </h2>

        <p>
          Join thousands of fans for two days
          dedicated to legendary characters,
          futuristic worlds and an unforgettable
          community experience.
        </p>

        <a
          href="#tickets"
          class="btn btn-primary"
        >
          Secure Your Ticket
        </a>

      </div>

    </div>

  </section>


  <!-- =========================================
       FOOTER
       ========================================= -->

  <footer>

    <div
      class="container"
    >

      <div
        class="footer-grid"
      >

        <div
          class="footer-brand"
        >

          <a
            href="#home"
            class="brand"
          >

            <div
              class="brand-mark"
            >
              <span>117</span>
            </div>

            <div
              class="brand-title"
            >
              <strong>
                SPARTAN LEGACY
              </strong>

              <small>
                Master Chief Event
              </small>
            </div>

          </a>

          <p>
            A fan-focused celebration of
            futuristic gaming, storytelling,
            creativity and science-fiction
            culture.
          </p>

        </div>


        <div
          class="footer-column"
        >
          <h4>
            Event
          </h4>

          <a href="#about">
            About
          </a>

          <a href="#experience">
            Experiences
          </a>

          <a href="#schedule">
            Schedule
          </a>

          <a href="#guests">
            Guests
          </a>
        </div>


        <div
          class="footer-column"
        >
          <h4>
            Information
          </h4>

          <a href="#tickets">
            Tickets
          </a>

          <a href="#faq">
            FAQ
          </a>

          <a href="#">
            Venue
          </a>

          <a href="#">
            Contact
          </a>
        </div>


        <div
          class="footer-column"
        >
          <h4>
            Follow
          </h4>

          <a href="#">
            Instagram
          </a>

          <a href="#">
            YouTube
          </a>

          <a href="#">
            Discord
          </a>

          <a href="#">
            X / Twitter
          </a>
        </div>

      </div>


      <div
        class="footer-bottom"
      >
        <span>
          © 2026 Spartan Legacy Event
        </span>

        <span>
          Unofficial fan event concept
        </span>
      </div>

    </div>

  </footer>


  <!-- =========================================
       JAVASCRIPT
       ========================================= -->

  <script>

    /* =========================================
       NAVBAR
       ========================================= */

    const navbar =
      document.getElementById(
        "navbar"
      );

    window.addEventListener(
      "scroll",
      () => {

        if (
          window.scrollY > 30
        ) {
          navbar.classList.add(
            "scrolled"
          );
        } else {
          navbar.classList.remove(
            "scrolled"
          );
        }

      }
    );


    /* =========================================
       MOBILE MENU
       ========================================= */

    const menuBtn =
      document.getElementById(
        "menuBtn"
      );

    const navLinks =
      document.getElementById(
        "navLinks"
      );

    menuBtn.addEventListener(
      "click",
      () => {

        navLinks.classList.toggle(
          "open"
        );

        document.body.classList.toggle(
          "menu-open"
        );

      }
    );

    document
      .querySelectorAll(
        ".nav-links a"
      )
      .forEach(
        link => {

          link.addEventListener(
            "click",
            () => {

              navLinks.classList.remove(
                "open"
              );

              document.body.classList.remove(
                "menu-open"
              );

            }
          );

        }
      );


    /* =========================================
       COUNTDOWN
       ========================================= */

    /*
      Change this date to your actual event date.
    */

    const eventDate =
      new Date(
        "2026-10-17T09:00:00"
      ).getTime();

    function updateCountdown() {

      const now =
        new Date().getTime();

      const difference =
        eventDate - now;

      if (
        difference <= 0
      ) {

        document.getElementById(
          "days"
        ).textContent = "00";

        document.getElementById(
          "hours"
        ).textContent = "00";

        document.getElementById(
          "minutes"
        ).textContent = "00";

        document.getElementById(
          "seconds"
        ).textContent = "00";

        return;
      }

      const days =
        Math.floor(
          difference /
          (
            1000 *
            60 *
            60 *
            24
          )
        );

      const hours =
        Math.floor(
          (
            difference %
            (
              1000 *
              60 *
              60 *
              24
            )
          ) /
          (
            1000 *
            60 *
            60
          )
        );

      const minutes =
        Math.floor(
          (
            difference %
            (
              1000 *
              60 *
              60
            )
          ) /
          (
            1000 *
            60
          )
        );

      const seconds =
        Math.floor(
          (
            difference %
            (
              1000 *
              60
            )
          ) /
          1000
        );

      document.getElementById(
        "days"
      ).textContent =
        String(days).padStart(
          2,
          "0"
        );

      document.getElementById(
        "hours"
      ).textContent =
        String(hours).padStart(
          2,
          "0"
        );

      document.getElementById(
        "minutes"
      ).textContent =
        String(minutes).padStart(
          2,
          "0"
        );

      document.getElementById(
        "seconds"
      ).textContent =
        String(seconds).padStart(
          2,
          "0"
        );

    }

    updateCountdown();

    setInterval(
      updateCountdown,
      1000
    );


    /* =========================================
       SCHEDULE TABS
       ========================================= */

    const scheduleTabs =
      document.querySelectorAll(
        ".schedule-tab"
      );

    const schedulePanels =
      document.querySelectorAll(
        ".schedule-panel"
      );

    scheduleTabs.forEach(
      tab => {

        tab.addEventListener(
          "click",
          () => {

            scheduleTabs.forEach(
              item =>
                item.classList.remove(
                  "active"
                )
            );

            schedulePanels.forEach(
              panel =>
                panel.classList.remove(
                  "active"
                )
            );

            tab.classList.add(
              "active"
            );

            const target =
              tab.dataset.day;

            document
              .getElementById(
                target
              )
              .classList.add(
                "active"
              );

          }
        );

      }
    );


    /* =========================================
       FAQ
       ========================================= */

    const faqItems =
      document.querySelectorAll(
        ".faq-item"
      );

    faqItems.forEach(
      item => {

        const button =
          item.querySelector(
            ".faq-question"
          );

        const answer =
          item.querySelector(
            ".faq-answer"
          );

        button.addEventListener(
          "click",
          () => {

            const isActive =
              item.classList.contains(
                "active"
              );

            faqItems.forEach(
              faq => {

                faq.classList.remove(
                  "active"
                );

                faq.querySelector(
                  ".faq-answer"
                ).style.maxHeight =
                  null;

              }
            );

            if (
              !isActive
            ) {

              item.classList.add(
                "active"
              );

              answer.style.maxHeight =
                answer.scrollHeight +
                "px";

            }

          }
        );

      }
    );


    /* =========================================
       SCROLL REVEAL
       ========================================= */

    const observer =
      new IntersectionObserver(
        entries => {

          entries.forEach(
            entry => {

              if (
                entry.isIntersecting
              ) {

                entry.target.classList.add(
                  "visible"
                );

                observer.unobserve(
                  entry.target
                );

              }

            }
          );

        },
        {
          threshold: 0.12
        }
      );

    document
      .querySelectorAll(
        ".reveal"
      )
      .forEach(
        element => {

          observer.observe(
            element
          );

        }
      );


    /* =========================================
       HERO PARALLAX
       ========================================= */

    const hero =
      document.querySelector(
        ".hero"
      );

    window.addEventListener(
      "scroll",
      () => {

        const scroll =
          window.scrollY;

        if (
          scroll <
          window.innerHeight
        ) {

          hero.style.backgroundPosition =
            `center ${
              50 +
              scroll *
              0.025
            }%`;

        }

      }
    );

  </script>

</body>
</html>