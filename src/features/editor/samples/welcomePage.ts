/**
 * A small page that looks like typical AI output. Shown in "Try it" so
 * people can play before pasting their own code.
 */
export const WELCOME_HTML = `<!doctype html>
<html lang="en">
<head>
<title>Sunny Bakery</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Georgia, serif; color: #3b2f2a; background: #fffaf3; }
  .nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 48px; }
  .logo { font-size: 22px; font-weight: bold; }
  .nav a { margin-left: 24px; color: inherit; text-decoration: none; }
  .hero { display: flex; gap: 48px; align-items: center; padding: 48px; }
  .hero h1 { font-size: 52px; line-height: 1.1; margin: 0 0 16px; }
  .hero p { font-size: 19px; line-height: 1.6; max-width: 460px; }
  .btn { display: inline-block; background: #d9772b; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-family: sans-serif; font-weight: 600; }
  .hero img { width: 420px; max-width: 100%; border-radius: 16px; }
  .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; padding: 24px 48px 64px; }
  .card { background: white; border-radius: 14px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,.06); }
  .card h3 { margin-top: 0; }
  footer { text-align: center; padding: 32px; color: #8a7a70; }
  @media (max-width: 700px) { .hero { flex-direction: column; padding: 24px; } .cards { grid-template-columns: 1fr; padding: 24px; } .nav { padding: 16px 24px; } }
</style>
</head>
<body>
  <nav class="nav">
    <div class="logo">☀️ Sunny Bakery</div>
    <div><a href="#menu">Menu</a><a href="#visit">Visit us</a></div>
  </nav>
  <section class="hero">
    <div>
      <h1>Fresh bread, every single morning.</h1>
      <p>We bake small batches from scratch before sunrise, so everything you buy is still warm.</p>
      <a class="btn" href="#menu">See today's menu</a>
    </div>
    <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=840" alt="Fresh bread on a table">
  </section>
  <section class="cards" id="menu">
    <div class="card"><h3>Sourdough</h3><p>Slow-rised for 24 hours with a crackly crust.</p></div>
    <div class="card"><h3>Croissants</h3><p>Buttery, flaky and baked every hour until noon.</p></div>
    <div class="card"><h3>Cinnamon rolls</h3><p>Soft, sticky and topped with vanilla icing.</p></div>
  </section>
  <footer id="visit">12 Baker Street · Open 7am – 3pm</footer>
</body>
</html>`
