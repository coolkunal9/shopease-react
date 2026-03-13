import { useState, useEffect, useRef } from "react";

// ============ DATA ============
const PRODUCTS = [
  { id: 1, name: "Aurora Wireless Headphones", price: 89.99, category: "tech", emoji: "🎧", description: "Noise-isolating, 24h battery, USB-C fast charging.", badge: "Best Seller" },
  { id: 2, name: "Midnight Smartwatch", price: 129.00, category: "tech", emoji: "⌚", description: "Fitness tracking, heart-rate monitor, water resistant.", badge: "New" },
  { id: 3, name: "CityFlex Backpack", price: 59.50, category: "fashion", emoji: "🎒", description: "Minimalist design with padded laptop compartment.", badge: null },
  { id: 4, name: "Neon Runner Sneakers", price: 74.99, category: "fashion", emoji: "👟", description: "Breathable mesh upper and soft foam cushioning.", badge: "Hot" },
  { id: 5, name: "Echo Bluetooth Speaker", price: 49.99, category: "tech", emoji: "🔊", description: "Room-filling sound in a compact, portable design.", badge: null },
  { id: 6, name: "Monochrome Hoodie", price: 39.99, category: "fashion", emoji: "👕", description: "Soft fleece interior with a relaxed, cozy fit.", badge: null },
  { id: 7, name: "Slim Tech Glasses", price: 24.99, category: "fashion", emoji: "🕶️", description: "Anti-blue light lenses for long work sessions.", badge: "Popular" },
  { id: 8, name: "MagCharge Power Bank", price: 39.50, category: "tech", emoji: "🔋", description: "10,000 mAh, fast-charging, ultra-slim profile.", badge: null },
  { id: 9, name: "Orbit Wireless Mouse", price: 29.00, category: "tech", emoji: "🖱️", description: "Ergonomic shape with whisper-quiet silent clicks.", badge: null },
  { id: 10, name: "CloudSoft Beanie", price: 19.99, category: "fashion", emoji: "🧢", description: "Cozy premium knit design for colder days.", badge: null },
  { id: 11, name: "Pixel Pro Keyboard", price: 99.00, category: "tech", emoji: "⌨️", description: "Mechanical keys with customizable RGB backlight.", badge: "New" },
  { id: 12, name: "Everyday Tote Bag", price: 34.99, category: "fashion", emoji: "👜", description: "Spacious canvas tote for your daily essentials.", badge: null },
];

// ============ TOAST COMPONENT ============
function Toast({ toasts }) {
  return (
    <div style={{ position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)", zIndex: 9999, display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: "#0d1117", border: "1px solid #30d158", color: "#30d158",
          padding: "0.65rem 1.4rem", borderRadius: "999px", fontSize: "0.85rem",
          fontWeight: 500, fontFamily: "inherit", letterSpacing: "0.02em",
          animation: "slideUp 0.25s ease", whiteSpace: "nowrap",
          boxShadow: "0 0 20px rgba(48,209,88,0.25)"
        }}>
          ✓ {t.message}
        </div>
      ))}
    </div>
  );
}

// ============ PRODUCT CARD ============
function ProductCard({ product, onAdd }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="product-card">
      {product.badge && <span className="badge">{product.badge}</span>}
      <div className="product-emoji">{product.emoji}</div>
      <div className="product-body">
        <p className="product-category">{product.category}</p>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <button className={`add-btn ${added ? "added" : ""}`} onClick={handleAdd}>
            {added ? "✓ Added" : "+ Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ CART ITEM ============
function CartItem({ item, onRemove, onQty }) {
  return (
    <div className="cart-item">
      <span className="cart-item-emoji">{item.emoji}</span>
      <div className="cart-item-info">
        <p className="cart-item-name">{item.name}</p>
        <p className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</p>
      </div>
      <div className="cart-item-controls">
        <button className="qty-btn" onClick={() => onQty(item.id, -1)}>−</button>
        <span className="qty-num">{item.quantity}</span>
        <button className="qty-btn" onClick={() => onQty(item.id, 1)}>+</button>
        <button className="remove-btn" onClick={() => onRemove(item.id)}>✕</button>
      </div>
    </div>
  );
}

// ============ MAIN APP ============
export default function App() {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("shopease-cart")) || []; }
    catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [toasts, setToasts] = useState([]);
  const [modalProduct, setModalProduct] = useState(null);
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [formErrors, setFormErrors] = useState({});
  const [formSent, setFormSent] = useState(false);
  const toastId = useRef(0);

  // Persist cart
  useEffect(() => {
    localStorage.setItem("shopease-cart", JSON.stringify(cart));
  }, [cart]);

  // Add to cart
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, message: `${product.name} added to cart!` }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  // Filter products
  const filtered = PRODUCTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || p.category === category;
    return matchSearch && matchCat;
  });

  // Contact form
  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formState.name.trim()) errors.name = "Name is required";
    if (!formState.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formState.email)) errors.email = "Invalid email";
    if (!formState.message.trim()) errors.message = "Message is required";
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      setFormSent(true);
      setFormState({ name: "", email: "", message: "" });
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        :root {
          --bg: #0d1117;
          --surface: #161b22;
          --surface2: #21262d;
          --border: rgba(255,255,255,0.08);
          --accent: #30d158;
          --accent2: #0a84ff;
          --text: #e6edf3;
          --muted: #7d8590;
          --danger: #ff453a;
          --font-display: 'Syne', sans-serif;
          --font-body: 'DM Sans', sans-serif;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-body);
          line-height: 1.6;
          overflow-x: hidden;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }

        /* ---- NAVBAR ---- */
        .navbar {
          position: sticky; top: 0; z-index: 100;
          background: rgba(13,17,23,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          padding: 0 1.5rem;
        }
        .navbar-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          height: 64px;
        }
        .logo {
          font-family: var(--font-display);
          font-size: 1.4rem; font-weight: 800;
          color: var(--text); text-decoration: none;
          letter-spacing: -0.02em;
        }
        .logo span { color: var(--accent); }
        .nav-links {
          display: flex; gap: 2rem; list-style: none;
        }
        .nav-links a {
          color: var(--muted); text-decoration: none;
          font-size: 0.9rem; font-weight: 500;
          transition: color 0.15s;
        }
        .nav-links a:hover { color: var(--text); }
        .cart-trigger {
          position: relative;
          background: var(--surface2); border: 1px solid var(--border);
          color: var(--text); border-radius: 12px;
          padding: 0.5rem 1rem; cursor: pointer;
          font-family: var(--font-body); font-size: 0.9rem;
          display: flex; align-items: center; gap: 0.5rem;
          transition: border-color 0.15s, background 0.15s;
        }
        .cart-trigger:hover { border-color: var(--accent); background: rgba(48,209,88,0.08); }
        .cart-badge {
          background: var(--accent); color: #000;
          border-radius: 999px; padding: 0.1rem 0.5rem;
          font-size: 0.72rem; font-weight: 700;
          animation: ${cartCount > 0 ? 'pulse 0.3s ease' : 'none'};
        }

        /* ---- HERO ---- */
        .hero {
          min-height: 88vh;
          display: grid; place-items: center;
          padding: 5rem 1.5rem;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(48,209,88,0.08) 0%, transparent 70%),
                      radial-gradient(ellipse 50% 40% at 80% 80%, rgba(10,132,255,0.06) 0%, transparent 60%);
          position: relative; overflow: hidden;
          text-align: center;
        }
        .hero::before {
          content: '';
          position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.03)'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .hero-tag {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(48,209,88,0.1); border: 1px solid rgba(48,209,88,0.25);
          color: var(--accent); border-radius: 999px;
          padding: 0.35rem 1rem; font-size: 0.8rem; font-weight: 500;
          margin-bottom: 1.5rem; letter-spacing: 0.05em;
          animation: slideUp 0.5s ease both;
        }
        .hero h1 {
          font-family: var(--font-display);
          font-size: clamp(2.8rem, 6vw, 5rem);
          font-weight: 800; line-height: 1.05;
          letter-spacing: -0.03em;
          margin-bottom: 1.2rem;
          animation: slideUp 0.5s 0.1s ease both;
        }
        .hero h1 .highlight {
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero p {
          color: var(--muted); max-width: 480px; margin: 0 auto 2rem;
          font-size: 1.05rem; font-weight: 300;
          animation: slideUp 0.5s 0.2s ease both;
        }
        .hero-btns {
          display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;
          animation: slideUp 0.5s 0.3s ease both;
        }
        .btn-primary {
          background: var(--accent); color: #000;
          border: none; border-radius: 12px;
          padding: 0.75rem 1.8rem; font-weight: 600;
          font-family: var(--font-body); font-size: 0.95rem;
          cursor: pointer; text-decoration: none; display: inline-block;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          box-shadow: 0 0 30px rgba(48,209,88,0.25);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 40px rgba(48,209,88,0.4); opacity: 0.92; }
        .btn-outline {
          background: transparent; color: var(--text);
          border: 1px solid var(--border); border-radius: 12px;
          padding: 0.75rem 1.8rem; font-weight: 500;
          font-family: var(--font-body); font-size: 0.95rem;
          cursor: pointer; text-decoration: none; display: inline-block;
          transition: border-color 0.15s, background 0.15s;
        }
        .btn-outline:hover { border-color: var(--muted); background: var(--surface); }
        .hero-stats {
          display: flex; gap: 3rem; justify-content: center;
          margin-top: 4rem; flex-wrap: wrap;
          animation: slideUp 0.5s 0.4s ease both;
        }
        .stat { text-align: center; }
        .stat-num {
          font-family: var(--font-display);
          font-size: 2rem; font-weight: 800; color: var(--text);
        }
        .stat-label { font-size: 0.8rem; color: var(--muted); }

        /* ---- PRODUCTS ---- */
        .products-section {
          padding: 5rem 1.5rem;
          max-width: 1200px; margin: 0 auto;
        }
        .section-top {
          display: flex; align-items: flex-end;
          justify-content: space-between; flex-wrap: wrap;
          gap: 1.5rem; margin-bottom: 2.5rem;
        }
        .section-label {
          font-size: 0.75rem; font-weight: 600;
          color: var(--accent); letter-spacing: 0.12em;
          text-transform: uppercase; margin-bottom: 0.4rem;
        }
        .section-title {
          font-family: var(--font-display);
          font-size: 2rem; font-weight: 700;
          letter-spacing: -0.02em;
        }
        .filters {
          display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;
        }
        .filter-btn {
          background: var(--surface); border: 1px solid var(--border);
          color: var(--muted); border-radius: 999px;
          padding: 0.4rem 1rem; font-size: 0.82rem; font-weight: 500;
          cursor: pointer; font-family: var(--font-body);
          transition: all 0.15s;
        }
        .filter-btn:hover { border-color: var(--muted); color: var(--text); }
        .filter-btn.active {
          background: var(--accent); border-color: var(--accent);
          color: #000; font-weight: 600;
        }
        .search-wrap {
          position: relative;
        }
        .search-wrap input {
          background: var(--surface); border: 1px solid var(--border);
          color: var(--text); border-radius: 12px;
          padding: 0.55rem 1rem 0.55rem 2.4rem;
          font-size: 0.88rem; font-family: var(--font-body);
          width: 220px; transition: border-color 0.15s;
        }
        .search-wrap input:focus { outline: none; border-color: var(--accent); }
        .search-wrap input::placeholder { color: var(--muted); }
        .search-icon {
          position: absolute; left: 0.8rem; top: 50%;
          transform: translateY(-50%); color: var(--muted);
          font-size: 0.9rem; pointer-events: none;
        }
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.2rem;
        }
        .product-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px; overflow: hidden;
          position: relative;
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
          animation: scaleIn 0.3s ease both;
          display: flex; flex-direction: column;
        }
        .product-card:hover {
          transform: translateY(-4px);
          border-color: rgba(48,209,88,0.3);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        }
        .badge {
          position: absolute; top: 0.8rem; right: 0.8rem;
          background: var(--accent); color: #000;
          border-radius: 999px; padding: 0.15rem 0.6rem;
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em;
        }
        .product-emoji {
          font-size: 3.5rem; padding: 2rem 1.5rem 1rem;
          background: linear-gradient(135deg, var(--surface2), var(--surface));
          text-align: center;
        }
        .product-body { padding: 1.1rem 1.2rem 1.2rem; flex: 1; display: flex; flex-direction: column; }
        .product-category {
          font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--muted); margin-bottom: 0.3rem;
        }
        .product-name {
          font-family: var(--font-display);
          font-size: 0.95rem; font-weight: 600; margin-bottom: 0.4rem;
        }
        .product-desc { font-size: 0.82rem; color: var(--muted); flex: 1; }
        .product-footer {
          display: flex; align-items: center;
          justify-content: space-between; margin-top: 1rem;
        }
        .product-price {
          font-family: var(--font-display);
          font-size: 1.1rem; font-weight: 700; color: var(--text);
        }
        .add-btn {
          background: var(--surface2); border: 1px solid var(--border);
          color: var(--text); border-radius: 10px;
          padding: 0.4rem 0.9rem; font-size: 0.8rem; font-weight: 500;
          cursor: pointer; font-family: var(--font-body);
          transition: all 0.15s;
        }
        .add-btn:hover { background: var(--accent); border-color: var(--accent); color: #000; }
        .add-btn.added { background: var(--accent); border-color: var(--accent); color: #000; }
        .no-results {
          text-align: center; padding: 4rem 0;
          color: var(--muted); font-size: 0.95rem;
        }

        /* ---- CART PANEL ---- */
        .cart-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.6);
          opacity: 0; visibility: hidden;
          transition: all 0.2s;
        }
        .cart-overlay.open { opacity: 1; visibility: visible; }
        .cart-panel {
          position: fixed; top: 0; right: 0;
          width: min(400px, 100vw); height: 100%;
          background: var(--surface);
          border-left: 1px solid var(--border);
          z-index: 201; display: flex; flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .cart-panel.open { transform: translateX(0); }
        .cart-head {
          padding: 1.2rem 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .cart-head h2 {
          font-family: var(--font-display); font-size: 1.1rem; font-weight: 700;
        }
        .close-btn {
          background: var(--surface2); border: 1px solid var(--border);
          color: var(--muted); border-radius: 8px;
          width: 32px; height: 32px; cursor: pointer;
          display: grid; place-items: center; font-size: 1rem;
          transition: color 0.15s;
        }
        .close-btn:hover { color: var(--text); }
        .cart-body { flex: 1; overflow-y: auto; padding: 1rem 1.5rem; }
        .cart-empty {
          text-align: center; padding: 3rem 0;
          color: var(--muted); font-size: 0.9rem;
        }
        .cart-empty div { font-size: 2.5rem; margin-bottom: 0.8rem; }
        .cart-item {
          display: flex; align-items: center; gap: 0.8rem;
          padding: 0.8rem 0; border-bottom: 1px solid var(--border);
        }
        .cart-item-emoji { font-size: 1.8rem; flex-shrink: 0; }
        .cart-item-info { flex: 1; min-width: 0; }
        .cart-item-name { font-size: 0.85rem; font-weight: 500; truncate: true; }
        .cart-item-price { font-size: 0.8rem; color: var(--accent); font-weight: 600; }
        .cart-item-controls {
          display: flex; align-items: center; gap: 0.3rem; flex-shrink: 0;
        }
        .qty-btn {
          background: var(--surface2); border: 1px solid var(--border);
          color: var(--text); border-radius: 6px;
          width: 26px; height: 26px; cursor: pointer;
          font-size: 0.9rem; display: grid; place-items: center;
          transition: border-color 0.15s;
        }
        .qty-btn:hover { border-color: var(--accent); }
        .qty-num { font-size: 0.85rem; font-weight: 600; min-width: 18px; text-align: center; }
        .remove-btn {
          background: transparent; border: none;
          color: var(--muted); cursor: pointer; font-size: 0.8rem;
          padding: 0 0.2rem; margin-left: 0.2rem;
          transition: color 0.15s;
        }
        .remove-btn:hover { color: var(--danger); }
        .cart-foot {
          padding: 1.2rem 1.5rem;
          border-top: 1px solid var(--border);
        }
        .cart-total {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1rem;
        }
        .cart-total span { font-size: 0.9rem; color: var(--muted); }
        .cart-total strong {
          font-family: var(--font-display); font-size: 1.3rem; color: var(--text);
        }
        .checkout-btn {
          width: 100%; background: var(--accent); color: #000;
          border: none; border-radius: 12px; padding: 0.85rem;
          font-weight: 700; font-size: 0.95rem; font-family: var(--font-body);
          cursor: pointer; transition: opacity 0.15s, transform 0.15s;
        }
        .checkout-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .checkout-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        /* ---- ABOUT ---- */
        .about-section {
          padding: 5rem 1.5rem;
          background: var(--surface);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .about-inner {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 4rem; align-items: center;
        }
        .about-inner h2 {
          font-family: var(--font-display);
          font-size: 2.2rem; font-weight: 800;
          letter-spacing: -0.02em; margin-bottom: 1rem;
        }
        .about-inner p { color: var(--muted); margin-bottom: 0.8rem; font-size: 0.95rem; }
        .about-features {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
        }
        .feature-card {
          background: var(--bg); border: 1px solid var(--border);
          border-radius: 16px; padding: 1.2rem;
          transition: border-color 0.2s;
        }
        .feature-card:hover { border-color: rgba(48,209,88,0.3); }
        .feature-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .feature-title { font-weight: 600; font-size: 0.88rem; margin-bottom: 0.25rem; }
        .feature-desc { color: var(--muted); font-size: 0.8rem; }

        /* ---- CONTACT ---- */
        .contact-section {
          padding: 5rem 1.5rem;
          max-width: 600px; margin: 0 auto;
        }
        .contact-section .section-title { margin-bottom: 0.5rem; }
        .contact-section > p { color: var(--muted); margin-bottom: 2rem; font-size: 0.95rem; }
        .form { display: flex; flex-direction: column; gap: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-group label { font-size: 0.82rem; font-weight: 500; color: var(--muted); }
        .form-group input, .form-group textarea {
          background: var(--surface); border: 1px solid var(--border);
          color: var(--text); border-radius: 12px;
          padding: 0.7rem 1rem; font-size: 0.9rem; font-family: var(--font-body);
          resize: vertical; transition: border-color 0.15s;
        }
        .form-group input:focus, .form-group textarea:focus {
          outline: none; border-color: var(--accent);
        }
        .form-error { color: var(--danger); font-size: 0.75rem; }
        .form-success {
          background: rgba(48,209,88,0.1); border: 1px solid rgba(48,209,88,0.3);
          color: var(--accent); border-radius: 12px; padding: 1rem;
          text-align: center; font-size: 0.9rem;
        }

        /* ---- FOOTER ---- */
        .footer {
          background: var(--surface); border-top: 1px solid var(--border);
          padding: 2rem 1.5rem; text-align: center;
          color: var(--muted); font-size: 0.82rem;
        }
        .footer a { color: var(--accent); text-decoration: none; }

        /* ---- RESPONSIVE ---- */
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .about-inner { grid-template-columns: 1fr; gap: 2rem; }
          .about-features { grid-template-columns: 1fr 1fr; }
          .hero h1 { font-size: 2.4rem; }
          .hero-stats { gap: 2rem; }
        }
      `}</style>

      {/* NAVBAR */}
      <header className="navbar">
        <div className="navbar-inner">
          <a href="#hero" className="logo">Shop<span>Ease</span></a>
          <nav><ul className="nav-links">
            <li><a href="#products">Products</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul></nav>
          <button className="cart-trigger" onClick={() => setCartOpen(true)}>
            🛒 Cart <span className="cart-badge">{cartCount}</span>
          </button>
        </div>
      </header>

      {/* HERO */}
      <section id="hero" className="hero">
        <div>
          <div className="hero-tag">⚡ Free shipping on orders over $50</div>
          <h1>Tech & Style,<br /><span className="highlight">Delivered Fast</span></h1>
          <p>Curated gadgets and fashion pieces that match your vibe. Quality you can trust, prices you'll love.</p>
          <div className="hero-btns">
            <a href="#products" className="btn-primary">Shop Now →</a>
            <a href="#about" className="btn-outline">Learn More</a>
          </div>
          <div className="hero-stats">
            <div className="stat"><div className="stat-num">12+</div><div className="stat-label">Products</div></div>
            <div className="stat"><div className="stat-num">4.9★</div><div className="stat-label">Rating</div></div>
            <div className="stat"><div className="stat-num">2k+</div><div className="stat-label">Customers</div></div>
            <div className="stat"><div className="stat-num">24h</div><div className="stat-label">Delivery</div></div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="products-section">
        <div className="section-top">
          <div>
            <p className="section-label">Our Collection</p>
            <h2 className="section-title">Featured Products</h2>
          </div>
          <div className="filters">
            {["all", "tech", "fashion"].map(c => (
              <button key={c} className={`filter-btn ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>
                {c === "all" ? "All" : c === "tech" ? "⚡ Tech" : "👗 Fashion"}
              </button>
            ))}
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="no-results">No products found for "{search}" 😕</div>
        ) : (
          <div className="product-grid">
            {filtered.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
          </div>
        )}
      </section>

      {/* ABOUT */}
      <section id="about" className="about-section">
        <div className="about-inner">
          <div>
            <p className="section-label">Our Story</p>
            <h2>Built for people who care about quality</h2>
            <p>At ShopEase, we blend modern fashion with cutting-edge tech. Our mission is to bring you premium products that are stylish, functional, and sustainable.</p>
            <p>We partner with trusted brands and independent designers around the world to curate pieces that elevate your everyday lifestyle.</p>
          </div>
          <div className="about-features">
            {[
              { icon: "🚀", title: "Fast Delivery", desc: "Orders shipped within 24 hours" },
              { icon: "🔒", title: "Secure Checkout", desc: "256-bit SSL encryption" },
              { icon: "↩️", title: "Easy Returns", desc: "30-day hassle-free returns" },
              { icon: "💬", title: "24/7 Support", desc: "Always here to help you" },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="contact-section">
        <p className="section-label">Get In Touch</p>
        <h2 className="section-title">Contact Us</h2>
        <p>Have a question about an order or want to collaborate? Drop us a message.</p>
        {formSent ? (
          <div className="form-success">✓ Message sent! We'll get back to you soon.</div>
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            {[
              { id: "name", label: "Your Name", type: "text", placeholder: "Kunal Prasad" },
              { id: "email", label: "Email Address", type: "email", placeholder: "kunal@example.com" },
            ].map(f => (
              <div key={f.id} className="form-group">
                <label htmlFor={f.id}>{f.label}</label>
                <input id={f.id} type={f.type} placeholder={f.placeholder}
                  value={formState[f.id]} onChange={e => setFormState(s => ({ ...s, [f.id]: e.target.value }))} />
                {formErrors[f.id] && <span className="form-error">{formErrors[f.id]}</span>}
              </div>
            ))}
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" rows={4} placeholder="Your message..."
                value={formState.message} onChange={e => setFormState(s => ({ ...s, message: e.target.value }))} />
              {formErrors.message && <span className="form-error">{formErrors.message}</span>}
            </div>
            <button type="submit" className="btn-primary">Send Message →</button>
          </form>
        )}
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} ShopEase — Built with React by <a href="https://github.com/coolkunal9" target="_blank" rel="noreferrer">coolkunal9</a></p>
      </footer>

      {/* CART */}
      <div className={`cart-overlay ${cartOpen ? "open" : ""}`} onClick={() => setCartOpen(false)} />
      <aside className={`cart-panel ${cartOpen ? "open" : ""}`}>
        <div className="cart-head">
          <h2>Your Cart {cartCount > 0 && `(${cartCount})`}</h2>
          <button className="close-btn" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="cart-empty"><div>🛒</div>Your cart is empty</div>
          ) : (
            cart.map(item => <CartItem key={item.id} item={item} onRemove={removeFromCart} onQty={updateQty} />)
          )}
        </div>
        <div className="cart-foot">
          <div className="cart-total">
            <span>Total</span>
            <strong>${cartTotal.toFixed(2)}</strong>
          </div>
          <button className="checkout-btn" disabled={cart.length === 0}
            onClick={() => alert("Checkout demo — this is a frontend only project 🎉")}>
            Checkout →
          </button>
        </div>
      </aside>

      {/* TOASTS */}
      <Toast toasts={toasts} />
    </>
  );
}
