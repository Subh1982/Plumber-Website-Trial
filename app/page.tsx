const services = [
  { icon: "↯", title: "Blocked drains", price: "From $189", text: "Fast clearing for sinks, showers and sewer lines." },
  { icon: "◌", title: "Leaking taps", price: "From $145", text: "Repairs and replacements that stop the drip for good." },
  { icon: "!", title: "Burst pipes", price: "From $245", text: "Rapid isolation and dependable emergency pipe repairs." },
  { icon: "♨", title: "Hot-water systems", price: "From $220", text: "Repairs, servicing and new system replacements." },
  { icon: "◇", title: "Toilets", price: "From $165", text: "Unblocking, leak repairs and complete installations." },
  { icon: "✦", title: "Gas fitting", price: "From $195", text: "Licensed gas repairs, appliance connections and testing." },
  { icon: "+", title: "Installations", price: "From $180", text: "Professional fitting for fixtures and appliances." },
  { icon: "✓", title: "Maintenance", price: "From $149", text: "Preventative checks that keep plumbing running smoothly." },
];

const reviews = [
  { quote: "They arrived when promised, explained everything clearly and had our blocked drain sorted in no time.", name: "Sarah M.", suburb: "Hornsby" },
  { quote: "Friendly, tidy and upfront about the price. Our hot water was back on that afternoon.", name: "James T.", suburb: "Waitara" },
  { quote: "A calm voice in a stressful situation. The burst pipe was isolated quickly and repaired properly.", name: "Priya R.", suburb: "Asquith" },
];

export default function Home() {
  return (
    <main>
      <div className="topbar">
        <div className="shell topbar-inner">
          <span><b>24/7 emergency plumbing</b> · Hornsby &amp; surrounds</span>
          <a href="tel:+61291587742">Call 02 9158 7742</a>
        </div>
      </div>

      <header className="nav shell">
        <a className="brand" href="#top" aria-label="Hornsby Star Plumbers home">
          <span className="brand-mark" aria-hidden="true">★</span>
          <span><b>HORNSBY STAR</b><small>PLUMBERS</small></span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#services">Services</a>
          <a href="#pricing">Pricing</a>
          <a href="#reviews">Reviews</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="button button-small" href="tel:+61291587742">Book a plumber <span>→</span></a>
      </header>

      <section className="hero" id="top">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span>★</span> Local. Licensed. Ready to help.</div>
            <h1>Plumbing problems?<br/><em>Consider them solved.</em></h1>
            <p>Reliable plumbing for Hornsby homes and businesses—clear pricing, quality workmanship and friendly service, every time.</p>
            <div className="hero-actions">
              <a className="button" href="tel:+61291587742">Call 02 9158 7742 <span>→</span></a>
              <a className="text-link" href="#services">Explore our services ↓</a>
            </div>
            <div className="trust-row">
              <span><b>✓</b> Licensed &amp; insured</span>
              <span><b>✓</b> Upfront pricing</span>
              <span><b>✓</b> Workmanship guaranteed</span>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="sun"></div>
            <div className="pipe pipe-a"></div>
            <div className="pipe pipe-b"></div>
            <div className="tool-card">
              <span className="tool-star">★</span>
              <div className="wrench">⌕</div>
              <b>ON TIME.<br/>JOB DONE.</b>
            </div>
            <div className="response-card"><span>●</span><b>Same-day service</b><small>Across the Upper North Shore</small></div>
          </div>
        </div>
      </section>

      <section className="service-section section" id="services">
        <div className="shell">
          <div className="section-heading">
            <div><span className="kicker">WHAT WE FIX</span><h2>Everyday plumbing,<br/><em>expertly handled.</em></h2></div>
            <p>From small drips to urgent repairs, our experienced team gets your plumbing back on track—without the fuss.</p>
          </div>
          <div className="service-grid" id="pricing">
            {services.map((service) => (
              <article className="service-card" key={service.title}>
                <div className="service-top"><span className="service-icon">{service.icon}</span><span className="price">{service.price}</span></div>
                <h3>{service.title}</h3><p>{service.text}</p>
                <a href="tel:+61291587742" aria-label={`Book ${service.title}`}>Book this service <span>→</span></a>
              </article>
            ))}
          </div>
          <p className="price-note">Prices shown are indicative, include GST and cover standard weekday jobs. We’ll confirm your fixed price before work begins. Parts and after-hours call-outs may cost extra.</p>
        </div>
      </section>

      <section className="promise-section section">
        <div className="shell promise-grid">
          <div><span className="kicker light">THE STAR STANDARD</span><h2>Good plumbing.<br/><em>No surprises.</em></h2></div>
          <div className="promise-list">
            <div><span>01</span><p><b>We show up.</b><br/>A clear arrival window and updates along the way.</p></div>
            <div><span>02</span><p><b>We price first.</b><br/>You approve the price before we start.</p></div>
            <div><span>03</span><p><b>We leave it tidy.</b><br/>Respectful work and a clean finish.</p></div>
          </div>
        </div>
      </section>

      <section className="reviews-section section" id="reviews">
        <div className="shell">
          <div className="section-heading review-heading">
            <div><span className="kicker">LOCAL FAVOURITES</span><h2>Five-star service,<br/><em>close to home.</em></h2></div>
            <div className="rating"><b>5.0</b><span>★★★★★</span><small>Sample customer reviews</small></div>
          </div>
          <div className="review-grid">
            {reviews.map((review) => (
              <figure key={review.name}><div className="stars">★★★★★</div><blockquote>“{review.quote}”</blockquote><figcaption><span>{review.name.charAt(0)}</span><div><b>{review.name}</b><small>{review.suburb}</small></div></figcaption></figure>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="shell contact-grid">
          <div><span className="kicker light">NEED A PLUMBER?</span><h2>Let’s get it sorted.</h2><p>Call now for fast help or email us to arrange a convenient time.</p></div>
          <div className="contact-actions">
            <a className="contact-phone" href="tel:+61291587742"><small>CALL TO BOOK</small><b>02 9158 7742</b><span>→</span></a>
            <a href="mailto:bookings@hornsbystarplumbers.com.au">bookings@hornsbystarplumbers.com.au</a>
            <p>Based in Hornsby NSW 2077<br/>Mon–Fri 7am–6pm · Emergency help 24/7</p>
          </div>
        </div>
      </section>

      <footer>
        <div className="shell footer-grid">
          <a className="brand brand-footer" href="#top"><span className="brand-mark">★</span><span><b>HORNSBY STAR</b><small>PLUMBERS</small></span></a>
          <p>Serving Hornsby, Waitara, Asquith, Wahroonga,<br/>Normanhurst, Thornleigh and nearby suburbs.</p>
          <p className="footer-end">© 2026 Hornsby Star Plumbers<br/>Licence details available on request</p>
        </div>
      </footer>

      <a className="mobile-call" href="tel:+61291587742">Call now · 02 9158 7742</a>
    </main>
  );
}
