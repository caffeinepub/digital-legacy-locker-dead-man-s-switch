import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Shield, Lock, Users, FileCheck, ArrowRight, CheckCircle, Globe, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Lock className="h-6 w-6 text-primary" />,
      title: 'Military-Grade Encryption',
      description: 'Your digital assets are encrypted with AES-256 before being stored on the blockchain.',
    },
    {
      icon: <Users className="h-6 w-6 text-accent" />,
      title: 'Nominee Management',
      description: 'Designate trusted individuals who will receive access to your digital legacy.',
    },
    {
      icon: <FileCheck className="h-6 w-6 text-gold" />,
      title: 'Legal Verification',
      description: 'Robust legal verification process ensures only authorized heirs gain access.',
    },
    {
      icon: <Globe className="h-6 w-6 text-primary" />,
      title: 'Blockchain Secured',
      description: 'Built on the Internet Computer Protocol for immutable, decentralized storage.',
    },
  ];

  const steps = [
    { step: '01', title: 'Create Your Vault', description: 'Register and set up your encrypted digital legacy vault.' },
    { step: '02', title: 'Add Your Assets', description: 'Securely store passwords, crypto keys, and digital accounts.' },
    { step: '03', title: 'Designate Nominees', description: 'Choose trusted heirs and upload their verification documents.' },
    { step: '04', title: 'Protected Forever', description: 'Your legacy is secured and will be released only when verified.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-8">
              <Shield className="h-4 w-4" />
              <span>Blockchain-Powered Digital Legacy Protection</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="text-foreground">Dead Man's</span>
              <br />
              <span className="gradient-text">Switch</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4 font-medium">
              Secure Today. Protected Forever.
            </p>
            <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Protect your digital assets and ensure your loved ones receive your digital legacy
              exactly as you intended — securely, privately, and on your terms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate({ to: '/login' })}
                className="gap-2 text-base px-8"
              >
                Secure Your Legacy
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate({ to: '/death-verification-request' })}
                className="gap-2 text-base px-8"
              >
                I'm a Nominated Heir
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 section-gradient">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The Digital Legacy Problem
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Billions of dollars in digital assets are lost every year because there's no secure
              way to pass them on. Dead Man's Switch solves this.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { stat: '$140B+', label: 'Lost in unclaimed crypto annually' },
              { stat: '70%', label: 'Of people have no digital estate plan' },
              { stat: '3.5B+', label: 'Digital accounts with no succession plan' },
            ].map((item) => (
              <Card key={item.label} className="glass-card text-center p-6">
                <CardContent className="pt-0">
                  <div className="text-4xl font-bold gradient-text mb-2">{item.stat}</div>
                  <div className="text-muted-foreground">{item.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Dead Man's Switch?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with cutting-edge technology to give you complete peace of mind.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="glass-card p-6 hover:border-primary/40 transition-colors">
                <CardContent className="pt-0">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 section-gradient">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to protect your digital legacy forever.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.step} className="relative">
                <div className="glass-card p-6 h-full">
                  <div className="text-4xl font-bold text-primary/20 mb-3">{step.step}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Heir CTA Banner */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-accent/30 bg-accent/5 p-8 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent mb-6">
              <Users className="h-4 w-4" />
              <span>Are You a Nominated Heir?</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Submit a Death Verification Request
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              If you've been nominated as an heir and need to claim a digital legacy,
              submit your verification request here.
            </p>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate({ to: '/death-verification-request' })}
              className="gap-2 border-accent/50 text-accent hover:bg-accent/10"
            >
              Start Heir Verification
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Protect Your Digital Legacy Today
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands who trust Dead Man's Switch to secure their digital assets
            for the people they love most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              onClick={() => navigate({ to: '/login' })}
              className="gap-2 text-base px-8"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {['No credit card required', 'End-to-end encrypted', 'Blockchain secured', 'Cancel anytime'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Dead Man's Switch</span>
              <span className="text-muted-foreground text-sm">— Secure Today. Protected Forever.</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Dead Man's Switch. All rights reserved.
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              Built with <Heart className="h-3.5 w-3.5 text-destructive fill-destructive mx-0.5" /> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'dead-mans-switch')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
