import { Link } from 'react-router-dom';

function Candles({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 480 140" preserveAspectRatio="none" style={style}>
      {Array.from({ length: 28 }).map((_, i) => {
        const x = 10 + i * 17;
        const up = Math.sin(i * 1.1) > -0.15;
        const cy = 90 - i * 1.7;
        const bh = 12 + (i % 4) * 8;
        const col = up ? '#4caf50' : '#ef5350';
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={cy - bh - 9} y2={cy + bh + 9} stroke={col} strokeWidth={1.3} />
            <rect x={x - 4} y={cy - bh / 2} width={8} height={bh} fill={col} rx={1} />
          </g>
        );
      })}
    </svg>
  );
}

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff' }}>
      {/* ===== Nav ===== */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(10,10,11,0.8)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: "'Playfair Display',serif", fontSize: '1.2rem' }}>A</div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1.3rem' }}><span style={{ color: '#fff' }}>Afri</span><span style={{ color: '#c9a84c' }}>FX</span></span>
          </Link>
          <div className="lp-navlinks" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Link to="/courses" style={{ color: '#c8c8c8', fontSize: '0.9rem' }}>Courses</Link>
            <Link to="/markets" style={{ color: '#c8c8c8', fontSize: '0.9rem' }}>Markets</Link>
            <Link to="/performance" style={{ color: '#c8c8c8', fontSize: '0.9rem' }}>Performance</Link>
            <Link to="/pricing" style={{ color: '#c8c8c8', fontSize: '0.9rem' }}>Pricing</Link>
            <Link to="/partners/ib" style={{ color: '#c8c8c8', fontSize: '0.9rem' }}>Partners</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
            <Link to="/register" className="btn btn-gold btn-sm">Join Free</Link>
          </div>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <header style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, left: -80, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,107,60,0.4), transparent 70%)' }} />
        <div style={{ position: 'absolute', top: -60, right: -100, width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.22), transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
        <Candles style={{ position: 'absolute', right: 0, bottom: 0, width: '55%', height: 220, opacity: 0.18 }} />

        <div style={{ position: 'relative', maxWidth: 1140, margin: '0 auto', padding: '90px 24px 100px', textAlign: 'center' }} className="afx-fade">
          <span style={{ display: 'inline-block', fontSize: '0.74rem', letterSpacing: 2, textTransform: 'uppercase', color: '#c9a84c', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', padding: '6px 16px', borderRadius: 30, marginBottom: 26 }}>🌍 Empowering African Traders</span>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2.4rem,6vw,4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 22, letterSpacing: '-1px' }}>
            Master the Markets at<br /><span style={{ color: '#c9a84c' }}>Africa's Premier Forex Academy</span>
          </h1>
          <p style={{ color: '#c8c8c8', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: 640, margin: '0 auto 34px' }}>
            Structured courses, daily trading signals, live mentorship, and verifiable certificates — everything you need to go from beginner to consistently profitable trader.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
            <Link to="/register" className="btn btn-gold btn-lg">Start Learning Free →</Link>
            <Link to="/performance" className="btn btn-outline btn-lg">View Performance</Link>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(24px,6vw,72px)', flexWrap: 'wrap' }}>
            {[['5,000+', 'Students'], ['15+', 'Countries'], ['72%', 'Win Rate'], ['24/7', 'Community']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, color: '#c9a84c' }}>{v}</div>
                <div style={{ fontSize: '0.82rem', color: '#9a9a9a' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ===== Features ===== */}
      <section style={{ maxWidth: 1140, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
          {[
            ['📈', 'Structured Courses', 'Beginner to Advanced programs with videos, notes, quizzes & assignments.'],
            ['📡', 'Daily Signals', 'Forex, Gold, Indices & Crypto signals with entry, SL and multiple TPs.'],
            ['📹', 'Live Trading Rooms', 'Daily live sessions, market analysis, trade planning and Q&A.'],
            ['🎓', 'Verified Certificates', 'Earn certificates with QR verification employers can trust.'],
          ].map(([icon, title, desc]) => (
            <div key={title} className="card card-hover">
              <div style={{ width: 50, height: 50, borderRadius: 13, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: 16 }}>{icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 8 }}>{title}</h3>
              <p style={{ color: '#9a9a9a', fontSize: '0.88rem', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Courses ===== */}
      <section style={{ maxWidth: 1140, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 800 }}>A Path for Every Trader</h2>
          <p style={{ color: '#9a9a9a', marginTop: 8 }}>Three structured programs that take you from the basics to institutional strategies.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
          {[
            ['Beginner', '#4caf50', ['Introduction to Forex', 'MT4/MT5 Setup', 'Candlestick Patterns', 'Risk Management']],
            ['Intermediate', '#4aa3d4', ['Market Structure', 'Supply & Demand', 'Liquidity Concepts', 'Session Trading']],
            ['Advanced', '#c9a84c', ['Institutional Trading', 'Smart Money Concepts', 'Portfolio Management', 'Trading Plans']],
          ].map(([level, color, topics]) => (
            <div key={level as string} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ alignSelf: 'flex-start', fontSize: '0.72rem', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: color as string, background: `${color}1a`, border: `1px solid ${color}55`, padding: '4px 12px', borderRadius: 20, marginBottom: 14 }}>{level}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18, flex: 1 }}>
                {(topics as string[]).map(t => <div key={t} style={{ display: 'flex', gap: 8, fontSize: '0.86rem', color: '#d0d0d0' }}><span style={{ color: color as string }}>✓</span>{t}</div>)}
              </div>
              <Link to="/courses" className="btn btn-outline btn-sm">Explore {level} →</Link>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Membership tiers ===== */}
      <section style={{ maxWidth: 1140, margin: '0 auto', padding: '40px 24px' }}>
        <div className="card card-premium" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', background: 'linear-gradient(120deg, rgba(26,107,60,0.18), rgba(20,20,24,0.5) 55%, rgba(201,168,76,0.14))' }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Join the VVIP Community</h2>
            <p style={{ color: '#c8c8c8', maxWidth: 520 }}>Lifetime signals, lifetime courses, VIP mentorship, trade challenges and a private community — one payment, forever.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.6rem', fontWeight: 800, color: '#c9a84c' }}>$50</div>
            <div style={{ fontSize: '0.78rem', color: '#9a9a9a', marginBottom: 12 }}>one-time · lifetime</div>
            <Link to="/pricing" className="btn btn-gold">See All Plans</Link>
          </div>
        </div>
      </section>

      {/* ===== Testimonials ===== */}
      <section style={{ maxWidth: 1140, margin: '0 auto', padding: '40px 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
          {[
            ['Kwame A.', 'Accra, Ghana', '“AfriFX took me from zero to consistently profitable. The signals and mentorship are next level.”'],
            ['Amara O.', 'Lagos, Nigeria', '“The structured courses finally made everything click. I passed every quiz and earned my certificate.”'],
            ['David M.', 'Nairobi, Kenya', '“Daily live sessions keep me accountable. Best trading community in Africa, hands down.”'],
          ].map(([name, loc, quote]) => (
            <div key={name} className="card">
              <div style={{ color: '#c9a84c', marginBottom: 10 }}>★★★★★</div>
              <p style={{ fontStyle: 'italic', color: '#e0e0e0', lineHeight: 1.7, marginBottom: 14, fontSize: '0.9rem' }}>{quote}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem' }}>{name[0]}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9a9a9a' }}>{loc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA band ===== */}
      <section style={{ position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(600px 200px at 50% 0%, rgba(201,168,76,0.12), transparent 70%)' }} />
        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 800, marginBottom: 14 }}>Start Your Trading Journey Today</h2>
          <p style={{ color: '#c8c8c8', marginBottom: 28 }}>Free to join. No card required. Begin learning in minutes.</p>
          <Link to="/register" className="btn btn-gold btn-lg">Create Your Free Account →</Link>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer style={{ maxWidth: 1140, margin: '0 auto', padding: '40px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', color: '#9a9a9a', fontSize: '0.82rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1.1rem' }}><span style={{ color: '#fff' }}>Afri</span><span style={{ color: '#c9a84c' }}>FX</span></span>
          <span>· Empowering African Traders</span>
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          <Link to="/courses" style={{ color: '#9a9a9a' }}>Courses</Link>
          <Link to="/pricing" style={{ color: '#9a9a9a' }}>Pricing</Link>
          <Link to="/performance" style={{ color: '#9a9a9a' }}>Performance</Link>
          <Link to="/partners/seminar" style={{ color: '#9a9a9a' }}>Collaborate</Link>
          <Link to="/login" style={{ color: '#9a9a9a' }}>Login</Link>
        </div>
        <div>© {new Date().getFullYear()} AfriFX Academy</div>
      </footer>

      <style>{`@media (max-width: 720px){ .lp-navlinks { display: none !important; } }`}</style>
    </div>
  );
}
