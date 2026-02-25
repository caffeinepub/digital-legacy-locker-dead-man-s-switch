import { useRouter } from '@tanstack/react-router';
import { Shield, Lock, FileCheck, Users, Activity, Cpu, Globe, Heart, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/assets/generated/hero-bg.dim_1440x800.png)' }}
        />
        <div className="absolute inset-0 hero-gradient opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.15)_0%,_transparent_70%)]" />

        {/* Floating security icons */}
        <div className="absolute top-20 left-10 opacity-10 animate-pulse">
          <Shield size={80} className="text-white" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-10 animate-pulse" style={{ animationDelay: '1s' }}>
          <Lock size={60} className="text-white" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-8 backdrop-blur-sm">
            <Shield size={14} />
            Blockchain-Secured Digital Estate Planning
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Secure Today.
            <br />
            <span className="text-gradient">Protected Forever.</span>
          </h1>
          <p className="text-xl text-navy-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            The world's first decentralized digital inheritance platform. Store your encrypted credentials and release them only after verified legal death confirmation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.navigate({ to: '/register' })}
              className="bg-white text-navy-900 hover:bg-navy-50 font-semibold px-8 py-6 text-base shadow-glow transition-smooth"
            >
              <Shield size={18} className="mr-2" />
              Create Legacy Plan
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.navigate({ to: '/login' })}
              className="border-white/40 text-white hover:bg-white/10 font-semibold px-8 py-6 text-base backdrop-blur-sm transition-smooth"
            >
              <Lock size={18} className="mr-2" />
              Login
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-white/60 text-sm">
            <span className="flex items-center gap-1.5"><Cpu size={14} /> AES-256 Encrypted</span>
            <span className="flex items-center gap-1.5"><Shield size={14} /> Blockchain Secured</span>
            <span className="flex items-center gap-1.5"><Lock size={14} /> Zero-Knowledge Privacy</span>
          </div>
        </div>
      </section>

      {/* Heir Verification CTA */}
      <section className="py-12 px-4 bg-navy-900">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-navy-800 border border-navy-600">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/15 rounded-xl flex-shrink-0">
                <FileText size={24} className="text-amber-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-lg mb-1">
                  Are You a Nominated Heir?
                </h3>
                <p className="text-navy-300 text-sm leading-relaxed max-w-md">
                  If you are the heir of a deceased user and need to request access to their digital vault, submit a formal verification request with the required legal documents.
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.navigate({ to: '/death-verification-request' })}
              className="bg-amber-500 hover:bg-amber-400 text-navy-900 font-semibold gap-2 whitespace-nowrap flex-shrink-0"
              size="lg"
            >
              <FileText size={18} />
              Submit Heir Verification
            </Button>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">The Problem</span>
            <h2 className="font-display text-4xl font-bold text-navy-900 mt-3 mb-4">
              Digital Assets Die With You
            </h2>
            <p className="text-navy-500 text-lg max-w-2xl mx-auto">
              Billions of dollars in digital assets are lost every year because there's no secure way to pass them on.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <AlertTriangle className="text-amber-500" size={32} />,
                title: '$140B+ Lost Annually',
                desc: 'Digital assets including crypto, cloud accounts, and financial credentials become inaccessible after death.',
              },
              {
                icon: <Lock className="text-red-500" size={32} />,
                title: 'No Secure Transfer Method',
                desc: 'Sharing passwords before death creates security risks. Not sharing them means permanent loss.',
              },
              {
                icon: <Users className="text-navy-500" size={32} />,
                title: 'Families Left Helpless',
                desc: 'Loved ones struggle for years to access accounts, losing memories, money, and digital legacies.',
              },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl border border-navy-100 bg-navy-50/50 hover:shadow-card-hover transition-smooth">
                <div className="mb-4">{item.icon}</div>
                <h3 className="font-display font-bold text-navy-900 text-xl mb-2">{item.title}</h3>
                <p className="text-navy-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Solution */}
      <section className="py-20 px-4 section-gradient">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Our Solution</span>
            <h2 className="font-display text-4xl font-bold text-navy-900 mt-3 mb-4">
              The Digital Legacy Locker
            </h2>
            <p className="text-navy-500 text-lg max-w-2xl mx-auto">
              A secure, decentralized vault that holds your digital assets and releases them only when legally verified.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              {[
                { step: '01', title: 'Store Encrypted Assets', desc: 'Add your digital credentials, encrypted with AES-256 and stored on the blockchain.' },
                { step: '02', title: 'Designate Nominees', desc: 'Choose trusted individuals who will receive access after legal verification.' },
                { step: '03', title: 'Legal Death Verification', desc: 'Our admin team verifies official death certificates before any access is granted.' },
                { step: '04', title: 'Controlled Release', desc: 'Nominees receive secure, audited access to your digital legacy.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-1">{item.title}</h3>
                    <p className="text-navy-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-navy-900 rounded-2xl p-8 text-white shadow-glow">
              <div className="flex items-center gap-3 mb-6">
                <Shield size={28} className="text-navy-300" />
                <span className="font-display font-bold text-xl">Security Architecture</span>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Encryption', value: 'AES-256 + Blockchain', icon: <Cpu size={16} /> },
                  { label: 'Storage', value: 'Decentralized ICP', icon: <Globe size={16} /> },
                  { label: 'Access Control', value: 'Role-Based (RBAC)', icon: <Lock size={16} /> },
                  { label: 'Audit Trail', value: 'Immutable Logs', icon: <Activity size={16} /> },
                  { label: 'Verification', value: 'Legal Document Review', icon: <FileCheck size={16} /> },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-navy-700">
                    <span className="flex items-center gap-2 text-navy-300 text-sm">{item.icon}{item.label}</span>
                    <span className="text-white text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Key Features</span>
            <h2 className="font-display text-4xl font-bold text-navy-900 mt-3 mb-4">
              Enterprise-Grade Security
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Cpu size={28} className="text-primary" />,
                title: 'AES-256 Encryption',
                desc: 'Military-grade encryption protects every credential stored in your vault.',
                badge: 'AES-256',
              },
              {
                icon: <Globe size={28} className="text-primary" />,
                title: 'Secure Cloud Storage',
                desc: 'Decentralized storage on the Internet Computer blockchain — no single point of failure.',
                badge: 'Blockchain',
              },
              {
                icon: <Shield size={28} className="text-primary" />,
                title: 'Role-Based Access',
                desc: 'Granular permissions ensure only verified nominees can access your assets.',
                badge: 'RBAC',
              },
              {
                icon: <Activity size={28} className="text-primary" />,
                title: 'Activity Logging',
                desc: 'Every action is timestamped and recorded in an immutable audit trail.',
                badge: 'Audit Trail',
              },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl border border-navy-100 hover:border-primary/30 hover:shadow-card-hover transition-smooth group">
                <div className="mb-4 p-3 bg-primary/5 rounded-xl w-fit group-hover:bg-primary/10 transition-smooth">
                  {feature.icon}
                </div>
                <h3 className="font-display font-bold text-navy-900 text-lg mb-2">{feature.title}</h3>
                <p className="text-navy-500 text-sm leading-relaxed mb-3">{feature.desc}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                  {feature.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Innovation Highlight */}
      <section className="py-20 px-4 bg-navy-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-navy-300 text-sm font-semibold uppercase tracking-widest">Innovation</span>
            <h2 className="font-display text-4xl font-bold text-white mt-3 mb-4">
              Why We're Different
            </h2>
            <p className="text-navy-300 text-lg max-w-2xl mx-auto">
              The first platform to combine legal verification with digital estate planning on a decentralized blockchain.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                icon: <FileCheck size={24} className="text-navy-300" />,
                title: 'Legal Verification + Digital Estate Planning',
                desc: 'We bridge the gap between traditional legal processes and modern digital asset management. Death certificates are verified by our admin team before any access is granted.',
              },
              {
                icon: <Lock size={24} className="text-navy-300" />,
                title: 'Privacy-First Architecture',
                desc: 'Your credentials are encrypted before storage. Even our platform cannot read your data. Zero-knowledge principles ensure complete privacy throughout.',
              },
              {
                icon: <Shield size={24} className="text-navy-300" />,
                title: 'Controlled Release After Verified Death',
                desc: 'Assets are released only after multi-step verification: legal document review, admin approval, and multi-factor authentication by nominees.',
              },
              {
                icon: <CheckCircle size={24} className="text-navy-300" />,
                title: 'Fraud Prevention & Misuse Protection',
                desc: 'Role-based access control, immutable audit trails, and multi-layer authentication prevent unauthorized access and fraudulent claims.',
              },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-navy-800 border border-navy-700 hover:border-navy-500 transition-smooth">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-navy-700 rounded-lg flex-shrink-0">{item.icon}</div>
                  <div>
                    <h3 className="font-display font-bold text-white text-lg mb-2">{item.title}</h3>
                    <p className="text-navy-300 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Impact */}
      <section className="py-20 px-4 section-gradient">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Social Impact</span>
            <h2 className="font-display text-4xl font-bold text-navy-900 mt-3 mb-4">
              Protecting What Matters Most
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Heart size={28} className="text-red-500" />,
                title: 'Family Financial Rights',
                desc: 'Ensure your family receives their rightful inheritance without legal battles or lost accounts.',
                stat: '73%',
                statLabel: 'of families face digital asset loss',
              },
              {
                icon: <Globe size={28} className="text-blue-500" />,
                title: 'Digital Memories',
                desc: 'Preserve photos, videos, and personal accounts so your digital legacy lives on.',
                stat: '4.9B',
                statLabel: 'social media accounts at risk',
              },
              {
                icon: <Users size={28} className="text-purple-500" />,
                title: 'Inheritance Conflicts',
                desc: 'Clear, legally-verified access prevents disputes between family members and nominees.',
                stat: '60%',
                statLabel: 'reduction in inheritance disputes',
              },
              {
                icon: <Shield size={28} className="text-emerald-500" />,
                title: 'Valuable Digital Assets',
                desc: 'Crypto wallets, investment accounts, and digital businesses are secured and transferred.',
                stat: '$140B+',
                statLabel: 'in digital assets lost annually',
              },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-navy-100 hover:shadow-card-hover transition-smooth text-center">
                <div className="flex justify-center mb-4">{item.icon}</div>
                <div className="text-3xl font-display font-bold text-navy-900 mb-1">{item.stat}</div>
                <p className="text-xs text-navy-400 mb-3">{item.statLabel}</p>
                <h3 className="font-display font-bold text-navy-900 text-base mb-2">{item.title}</h3>
                <p className="text-navy-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-navy-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <Shield size={48} className="text-navy-300 mx-auto mb-6" />
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Start Protecting Your Legacy Today
          </h2>
          <p className="text-navy-300 text-lg mb-8 leading-relaxed">
            Join thousands of users who trust Digital Legacy Locker to secure their digital estate for their loved ones.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.navigate({ to: '/register' })}
              className="bg-white text-navy-900 hover:bg-navy-50 font-semibold px-8 py-6 text-base shadow-glow transition-smooth"
            >
              <Shield size={18} className="mr-2" />
              Create Your Legacy Plan
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.navigate({ to: '/death-verification-request' })}
              className="border-white/40 text-white hover:bg-white/10 font-semibold px-8 py-6 text-base backdrop-blur-sm transition-smooth"
            >
              <FileText size={18} className="mr-2" />
              Submit Heir Verification
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
