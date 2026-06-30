import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

const PERKS = [
  ['⚡', 'Faster Support', 'Priority assistance through our partnered brokers.'],
  ['🎁', 'Trading Bonuses', 'Exclusive deposit bonuses for AFRIFX students.'],
  ['🎓', 'Educational Support', 'Extra learning resources tied to your account.'],
  ['🏆', 'Trade Challenges', 'Entry into funded and demo trading competitions.'],
  ['🔥', 'Exclusive Promotions', 'Member-only offers and seasonal promos.'],
];

export default function PartnerBroker() {
  return (
    <PageShell title="Broker Partnership" subtitle="Open a trading account with our partnered brokers and unlock student perks.">
      <div className="card" style={{ background: 'linear-gradient(135deg,rgba(26,107,60,0.15),rgba(201,168,76,0.08))', border: '1px solid rgba(201,168,76,0.25)', marginBottom: 24, textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🤝</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.5rem', fontWeight: 800, marginBottom: 10 }}>Trade with AFRIFX's Trusted Brokers</h2>
        <p style={{ color: '#c8c8c8', maxWidth: 540, margin: '0 auto 20px', lineHeight: 1.7 }}>
          Students who open accounts through our partnered brokers enjoy faster support, bonuses, and exclusive educational perks.
        </p>
        <a href="#contact-broker" className="btn btn-gold">Request Broker Details</a>
      </div>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>What You Get</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginBottom: 32 }}>
        {PERKS.map(([icon, title, desc]) => (
          <div key={title} className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{title}</div>
              <div style={{ fontSize: '0.82rem', color: '#9a9a9a', marginTop: 2 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div id="contact-broker" className="card" style={{ textAlign: 'center', padding: 32 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Ready to open an account?</h3>
        <p style={{ color: '#9a9a9a', marginBottom: 20 }}>Contact our team for the latest partnered broker links and onboarding help.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/meetings" className="btn btn-outline">Book a Session</Link>
          <a href="mailto:partners@afrifxacademy.com" className="btn btn-gold">Email Partnerships</a>
        </div>
      </div>
    </PageShell>
  );
}
