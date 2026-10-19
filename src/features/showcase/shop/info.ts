const STORY = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'

/** The About page: the story of the shop and what it stands for. */
export const ABOUT_HTML = `
<section class="shop-wrap" data-fe-animate="fade-up" data-fe-trigger="load"><div class="shop-split">
  <div><p class="shop-eyebrow">About Alder &amp; Co.</p><h1 class="shop-title">A small shop with a short shelf</h1>
    <p class="shop-lead">We started in a spare room in 2019 with twelve products and a label printer. Today we still choose every item ourselves, and we would rather sell fewer things that last than many that do not.</p>
    <p class="shop-lead" style="margin-top: 14px">Prices are shown plainly, shipping is the same for everyone, and if something arrives wrong we fix it first and talk about it afterwards.</p></div>
  <img src="${STORY}" alt="Shelves in a small shop with neatly arranged goods" style="width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 24px">
</div></section>
<section class="shop-wrap shop-wrap--tight" data-fe-animate="fade-up" data-fe-trigger="scroll">
  <div class="shop-benefits" style="grid-template-columns: repeat(3, minmax(0, 1fr))">
    <div class="shop-benefit"><h3>Fewer, better things</h3><p>If we would not use it at home, it does not go on the shelf.</p></div>
    <div class="shop-benefit"><h3>Fair and simple</h3><p>One delivery price, one return rule, no hidden extras at the checkout.</p></div>
    <div class="shop-benefit"><h3>Packed with care</h3><p>Paper tape, recycled boxes and a handwritten note when we have time.</p></div>
  </div>
  <p style="margin-top: 32px"><a class="shop-btn" href="/shop">Start browsing</a></p>
</section>`

const field = (label: string, control: string) => `<label class="shop-field">${label}${control}</label>`

/** The Contact page: a simple form (name, email, topic, message) and the shop's opening hours. */
export const CONTACT_HTML = `
<section class="shop-wrap"><div class="shop-split" style="align-items: start">
  <div data-fe-animate="fade-up" data-fe-trigger="load"><p class="shop-eyebrow">Contact</p><h1 class="shop-title">We read every message</h1>
    <p class="shop-lead">Ask about an order, a product or a gift idea. We answer within one working day.</p>
    <p style="margin-top: 24px; color: var(--shop-soft)">Customer care: Monday to Friday, 9:00 to 17:00<br>Email: hello@alder.example<br>Workshop: 14 Orchard Lane, Bristol</p></div>
  <form class="shop-panel" data-fe-submit="send" data-fe-success="Thank you! Your message is on its way and we will reply within one working day." data-fe-animate="fade-up" data-fe-trigger="load">
    ${field('Your name', '<input class="shop-input" name="name" required minlength="2" autocomplete="name" placeholder="Jane Doe">')}
    ${field('Email', '<input class="shop-input" type="email" name="email" required autocomplete="email" placeholder="jane@example.com">')}
    ${field('What is it about?', '<select class="shop-input" name="topic" required><option value="">Choose one</option><option>An order</option><option>A product</option><option>A gift idea</option><option>Something else</option></select>')}
    ${field('Message', '<textarea class="shop-input" name="message" required minlength="10" maxlength="1000" rows="5" placeholder="How can we help?"></textarea>')}
    <button type="submit" class="shop-btn">Send message</button>
  </form>
</div></section>`

/** The basket page at /cart: an example order and a calm demo checkout form (nothing is charged or sent). */
export const CART_HTML = `
<style>.shop-line { display: flex; justify-content: space-between; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--shop-line) }
.shop-line span:last-child { font-weight: 600 }</style>
<section class="shop-wrap"><p class="shop-eyebrow">Basket</p><h1 class="shop-title">Checkout</h1>
  <p class="shop-note" style="max-width: 720px">This is a demo checkout: nothing is charged and no order is placed. Do not type real card details.</p>
  <div class="shop-split" style="align-items: start; margin-top: 32px" data-fe-animate="fade-up" data-fe-trigger="scroll">
    <form class="shop-panel" data-fe-submit="send" data-fe-success="Thank you! This was a demo, so no order was placed and nothing was charged.">
      <h2 style="font-size: 24px">Your details</h2>
      ${field('Full name', '<input class="shop-input" name="name" required minlength="2" autocomplete="name">')}
      ${field('Email for the receipt', '<input class="shop-input" type="email" name="email" required autocomplete="email">')}
      ${field('Delivery address', '<input class="shop-input" name="address" required minlength="6" autocomplete="street-address">')}
      ${field('Town or city', '<input class="shop-input" name="city" required autocomplete="address-level2">')}
      <label style="display: flex; gap: 10px; align-items: center; font-size: 14px"><input type="checkbox" name="demo" required> I understand this is only a demo</label>
      <button type="submit" class="shop-btn">Place demo order</button>
    </form>
    <div class="shop-panel"><h2 style="font-size: 24px">Order summary</h2>
      <div><div class="shop-line"><span>Classic Black Hooded Sweatshirt</span><span>$79</span></div><div class="shop-line"><span>Sleek Comfort-Fit Over-Ear Headphones</span><span>$28</span></div>
      <div class="shop-line"><span>Delivery</span><span>Free</span></div><div class="shop-line" style="border: 0; font-size: 18px"><span>Total</span><span>$107</span></div></div>
      <a class="shop-btn shop-btn--ghost" href="/shop">Keep shopping</a></div>
  </div>
</section>`

/** The footer shared by every page. */
export const FOOTER_HTML = '<footer class="shop-footer"><div class="shop-footer__in">'
  + '<div><h3>Alder &amp; Co.</h3><p style="margin: 0; max-width: 360px">A small online shop for everyday goods. Product data comes live from the Platzi Fake Store API, so items and prices are for demonstration.</p></div>'
  + '<div><h3>Shop</h3><a href="/shop">All products</a><a href="/cart">Basket</a></div>'
  + '<div><h3>Company</h3><a href="/about">About us</a><a href="/contact">Contact</a></div></div></footer>'
