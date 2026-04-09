'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const features = [
  {
    icon: '☕',
    iconClass: 'purple',
    title: 'Specialty Coffee',
    desc: 'Sourced from single-origin farms and roasted weekly — every cup is a crafted experience, not just a beverage.',
  },
  {
    icon: '📱',
    iconClass: 'orange',
    title: 'Order via App',
    desc: 'Skip the queue. Browse our full menu, customize your order, and pick it up when it\'s ready — all from your phone.',
  },
  {
    icon: '🥐',
    iconClass: 'green',
    title: 'Fresh Daily Pastries',
    desc: 'Our pastry team bakes fresh every morning. From buttery croissants to seasonal cakes — there\'s always something new.',
  },
  {
    icon: '💳',
    iconClass: 'purple',
    title: 'Loyalty Points',
    desc: 'Earn a point for every cup and redeem them for free drinks and exclusive menu items. Regulars always win.',
  },
  {
    icon: '📊',
    iconClass: 'orange',
    title: 'Real-time Tracking',
    desc: 'Watch your order move from barista hands to the counter in real time. No more wondering when it\'s ready.',
  },
  {
    icon: '🌱',
    iconClass: 'green',
    title: 'Sustainably Sourced',
    desc: 'We partner with farms that pay fair wages and use eco-friendly practices — so your coffee does good in the world.',
  },
];

const menuItems = [
  { emoji: '☕', label: 'Signature', name: 'Velvet Latte', price: 'Rp 42K' },
  { emoji: '🧋', label: 'Cold Brew', name: 'Midnight Brew', price: 'Rp 38K' },
  { emoji: '🥐', label: 'Pastry', name: 'Butter Croissant', price: 'Rp 28K' },
  { emoji: '🍪', label: 'Special', name: 'Choco Hazelnut', price: 'Rp 32K' },
];

const testimonials = [
  {
    stars: '★★★★★',
    text: '"The Velvet Latte is unlike any coffee I\'ve had. The app makes ordering ridiculously easy — I use it every single morning."',
    avatar: '👩',
    avatarBg: '#7C61D4',
    name: 'Ayu Ramadhani',
    role: 'Regular Customer',
  },
  {
    stars: '★★★★★',
    text: '"The freshness of the pastries combined with specialty coffee — Cafe-X has become my go-to workspace cafe. Literally perfect."',
    avatar: '👨',
    avatarBg: '#EAAE87',
    name: 'Bima Satria',
    role: 'Freelance Designer',
  },
  {
    stars: '★★★★★',
    text: '"Love how I can order ahead and the coffee is always ready when I arrive. The loyalty points are a genius touch!"',
    avatar: '🧑',
    avatarBg: '#16A34A',
    name: 'Clara Dewi',
    role: 'Marketing Executive',
  },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* ── NAVBAR ─────────────────────────────── */}
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <a href="/" className="navbar-logo" aria-label="Cafe-X home" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Image src="/logo.png" alt="Cafe-X Logo" width={32} height={32} style={{ borderRadius: '8px' }} />
          <span>Cafe-X</span>
        </a>

        <ul className="navbar-links" role="list">
          <li><a href="#features">Features</a></li>
          <li><a href="#menu">Menu</a></li>
          <li><a href="#reviews">Reviews</a></li>
          <li><a href="#about">About</a></li>
        </ul>

        <div className="navbar-cta">
          <a href="#menu" className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '14px' }}>
            View Menu
          </a>
          <a href="#order" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
            Order Now →
          </a>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────── */}
      <section className="hero" aria-label="Hero section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" aria-hidden="true"></span>
            Now Open · Sudirman, Jakarta
          </div>

          <h1 className="hero-heading">
            Coffee<br />
            <span className="accent-secondary">Made with</span><br />
            <span className="accent-primary">Passion.</span>
          </h1>

          <p className="hero-sub">
            Specialty coffee, fresh pastries, and a seamless digital experience — Cafe-X is where your day begins right.
          </p>

          <div className="hero-actions">
            <a id="order-btn" href="#order" className="btn btn-primary btn-lg">
              Order Now →
            </a>
            <a href="#menu" className="btn btn-secondary btn-lg">
              Explore Menu
            </a>
          </div>

          <div className="hero-stats" role="list" aria-label="Cafe statistics">
            <div role="listitem">
              <div className="hero-stat-val">4.9★</div>
              <div className="hero-stat-label">Average Rating</div>
            </div>
            <div role="listitem">
              <div className="hero-stat-val">12K+</div>
              <div className="hero-stat-label">Happy Customers</div>
            </div>
            <div role="listitem">
              <div className="hero-stat-val">50+</div>
              <div className="hero-stat-label">Menu Items</div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-img-wrapper">
            <Image
              src="/hero.png"
              alt="Specialty coffee and pastries at Cafe-X"
              width={520}
              height={520}
              priority
              style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
            />

            <div className="hero-float-card card-1" aria-hidden="true">
              <div className="hero-float-title">Today&apos;s Special</div>
              <div className="hero-float-value">Velvet Latte</div>
              <div className="hero-float-sub">↑ #1 bestseller</div>
            </div>

            <div className="hero-float-card card-2" aria-hidden="true">
              <div className="hero-float-title">Orders Today</div>
              <div className="hero-float-value">386</div>
              <div className="hero-float-sub">↑ 24% vs yesterday</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────── */}
      <section id="features" className="section" aria-labelledby="features-heading">
        <div className="section-label">Why Cafe-X</div>
        <h2 id="features-heading" className="section-title">
          More than just coffee.<br />It&apos;s an experience.
        </h2>
        <p className="section-sub">
          We blend specialty craftsmanship, thoughtful technology, and a passion for community into every cup we serve.
        </p>

        <div className="features-grid">
          {features.map((f) => (
            <article key={f.title} className="feature-card">
              <div className={`feature-icon ${f.iconClass}`} aria-hidden="true">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── MENU SHOWCASE ───────────────────────── */}
      <div className="section" style={{ paddingTop: 0, paddingLeft: 0, paddingRight: 0 }}>
        <div className="menu-section" id="menu" aria-labelledby="menu-heading">
          <div className="section-label">Our Menu</div>
          <h2 id="menu-heading" className="section-title">
            Crafted for every craving.
          </h2>
          <p className="section-sub">
            From our signature Velvet Latte to seasonal specials, every item on our menu is made with obsessive attention to quality.
          </p>

          <div className="menu-grid">
            {menuItems.map((item) => (
              <article key={item.name} className="menu-card">
                <div className="menu-card-img" style={{ background: 'linear-gradient(135deg, #EDE9FA, #FDF3EA)' }} aria-hidden="true">
                  {item.emoji}
                </div>
                <div className="menu-card-body">
                  <div className="menu-card-label">{item.label}</div>
                  <h3 className="menu-card-name">{item.name}</h3>
                  <div className="menu-card-price">{item.price}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ────────────────────────── */}
      <section id="reviews" className="section" aria-labelledby="reviews-heading">
        <div className="section-label">Reviews</div>
        <h2 id="reviews-heading" className="section-title">
          Loved by coffee lovers.
        </h2>
        <p className="section-sub">
          Don&apos;t just take our word for it — here&apos;s what our regulars say about Cafe-X.
        </p>

        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <article key={t.name} className="testimonial-card">
              <div className="testimonial-stars" aria-label="5 stars">{t.stars}</div>
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-author">
                <div
                  className="testimonial-avatar"
                  style={{ background: t.avatarBg }}
                  aria-hidden="true">
                  {t.avatar}
                </div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────── */}
      <div className="section" style={{ paddingTop: 0, paddingLeft: 0, paddingRight: 0 }}>
        <div className="cta-section" id="order">
          <h2 className="section-title font-display">
            Ready for your perfect cup?
          </h2>
          <p className="section-sub">
            Join thousands of Cafe-X regulars. Download the app or walk in — we&apos;re ready when you are.
          </p>
          <div className="cta-actions">
            <a id="download-app-btn" href="#" className="btn btn-white btn-lg">
              📱 Download App
            </a>
            <a id="find-us-btn" href="#" className="btn btn-ghost-white btn-lg">
              📍 Find Us
            </a>
          </div>
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────── */}
      <footer className="footer" role="contentinfo">
        <div className="footer-copy">
          © {new Date().getFullYear()} Cafe-X. Crafted with ☕ and passion.
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Instagram</a>
          <a href="#">Contact</a>
        </nav>
      </footer>
    </>
  );
}
