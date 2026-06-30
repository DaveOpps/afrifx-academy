import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const VALUES = [
  { icon: '⚖️', title: 'Integrity',       desc: 'We operate with honesty and transparency in everything we do.' },
  { icon: '🎯', title: 'Discipline',       desc: 'We teach disciplined trading — the foundation of consistent profits.' },
  { icon: '🏆', title: 'Excellence',       desc: 'We are committed to delivering world-class education at every level.' },
  { icon: '🔄', title: 'Consistency',      desc: 'We show up every day to deliver signals, lessons, and support.' },
  { icon: '💡', title: 'Innovation',       desc: 'We continuously improve our platform, tools, and teaching methods.' },
  { icon: '🔍', title: 'Transparency',     desc: 'We publish our signal performance openly — wins and losses.' },
  { icon: '🤝', title: 'Community',        desc: 'We grow together. Our students support and inspire each other.' },
  { icon: '💰', title: 'Financial Freedom', desc: 'Our ultimate goal: equipping every student to achieve financial independence.' },
];

const STATS = [
  ['5,000+', 'Students Enrolled'],
  ['15+',    'Countries Represented'],
  ['3',      'Structured Courses'],
  ['72%',    'Average Signal Win Rate'],
];

export default function About() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,rgba(26,107,60,0.15),rgba(201,168,76,0.08))', borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c', padding: '4px 16px', borderRadius: 20, fontSize: '0.75rem', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>About Us</span>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 20 }}>
            Africa's Premier<br /><span style={{ color: '#c9a84c' }}>Forex Trading Academy</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#c8c8c8', lineHeight: 1.7, maxWidth: 620, margin: '0 auto' }}>
            AfriFX Academy was founded with one goal: to empower traders across Africa and the world with the knowledge, tools, and community needed to trade profitably and build lasting financial freedom.
          </p>
        </div>
      </div>

      <div className="section container">

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 16, marginBottom: 60 }}>
          {STATS.map(([val, label]) => (
            <div key={label} className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-val" style={{ fontSize: '2rem', color: '#c9a84c' }}>{val}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24, marginBottom: 60 }}>
          <div className="card" style={{ background: 'linear-gradient(135deg,rgba(26,107,60,0.1),rgba(26,107,60,0.04))', border: '1px solid rgba(26,107,60,0.3)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎯</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '1.3rem', marginBottom: 14, color: '#4caf50' }}>Our Mission</h2>
            <p style={{ color: '#c8c8c8', lineHeight: 1.7 }}>
              To empower traders across Africa and beyond with world-class financial market education, practical mentorship, and professional trading opportunities.
            </p>
          </div>
          <div className="card" style={{ background: 'linear-gradient(135deg,rgba(201,168,76,0.08),rgba(201,168,76,0.02))', border: '1px solid rgba(201,168,76,0.2)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🌍</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '1.3rem', marginBottom: 14, color: '#c9a84c' }}>Our Vision</h2>
            <p style={{ color: '#c8c8c8', lineHeight: 1.7 }}>
              To become Africa's leading financial markets academy, producing disciplined, profitable, and globally competitive traders who represent the continent on the world stage.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div style={{ marginBottom: 60 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>
            Our Core <span style={{ color: '#c9a84c' }}>Values</span>
          </h2>
          <p style={{ color: '#9a9a9a', textAlign: 'center', marginBottom: 36 }}>The principles that guide everything we do at AfriFX Academy.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
            {VALUES.map(v => (
              <div key={v.title} className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>{v.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4, fontSize: '0.95rem' }}>{v.title}</div>
                  <div style={{ fontSize: '0.82rem', color: '#9a9a9a', lineHeight: 1.6 }}>{v.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What we offer */}
        <div className="card" style={{ background: 'linear-gradient(135deg,rgba(13,13,13,0.9),rgba(26,107,60,0.06))', border: '1px solid rgba(201,168,76,0.15)', marginBottom: 60 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.5rem', fontWeight: 800, marginBottom: 28, textAlign: 'center' }}>
            What <span style={{ color: '#c9a84c' }}>AfriFX Academy</span> Offers
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
            {[
              ['📚', 'Structured Courses', 'Beginner to Advanced trading programs with videos, quizzes, and certificates.'],
              ['📡', 'Daily Signals', 'Forex, Gold, Crypto, and Indices signals with entry, SL, and TP levels.'],
              ['📹', 'Live Sessions', 'Daily live trading rooms with real-time analysis and Q&A.'],
              ['🎓', 'Certificates', 'Verifiable digital certificates for every course completed.'],
              ['🏅', 'Student ID', 'Official AfriFX Academy student ID card for all enrolled students.'],
              ['🤝', 'Community', 'Access to a private community of traders across Africa and beyond.'],
            ].map(([icon, title, desc]) => (
              <div key={String(title)} style={{ textAlign: 'center', padding: '16px 12px' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: '0.78rem', color: '#9a9a9a', lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>
            Ready to Start Your <span style={{ color: '#c9a84c' }}>Trading Journey?</span>
          </h2>
          <p style={{ color: '#9a9a9a', marginBottom: 28 }}>Join thousands of traders already learning with AfriFX Academy.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-gold">Enroll Free Today</Link>
            <Link to="/courses" className="btn btn-outline">View Courses</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
