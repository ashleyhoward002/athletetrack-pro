"use client";
// app/page.tsx - Landing Page
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AthleticHero } from '@/components/ui/AthleticHero';
import Header from '@/components/Header';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <AthleticHero>
        <div className="max-w-6xl mx-auto pt-16 pb-8">
          {/* Tagline pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-slate-200 rounded-full px-5 py-2 shadow-sm">
              <span className="text-cyan-600 font-semibold text-sm">From Peewee to Prospect</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600 text-sm">One app for the entire journey</span>
            </div>
          </motion.div>

          {/* Main headline - emotional transformation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
              <span className="text-slate-800">Stop being the </span>
              <span className="text-red-500 line-through decoration-red-400/50">admin</span>
              <span className="text-slate-800">.</span>
              <br />
              <span className="text-slate-800">Go back to being the </span>
              <span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">fan</span>
              <span className="text-slate-800">.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              No more messy spreadsheets. No more scattered videos. No more data anxiety.
              <br className="hidden md:block" />
              <span className="font-medium text-slate-700">AthleteTrack Pro</span> organizes everything so you can focus on what matters—watching them play.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link
              href="/signup"
              className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-cyan-500/25 transform transition-all hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30 text-center"
            >
              Start 14-Day Free Trial
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
            <Link
              href="#demo"
              className="px-8 py-4 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-lg rounded-xl transition hover:bg-slate-50 text-center"
            >
              See How It Works
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 mb-16"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Setup in 5 minutes
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Works for all sports
            </span>
          </motion.div>

          {/* Visual comparison - Before/After */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="grid md:grid-cols-2">
                {/* Before */}
                <div className="p-8 border-b md:border-b-0 md:border-r border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <span className="text-sm font-medium text-red-600">Before</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-600">
                      <span className="text-red-400">✕</span>
                      <span>Spreadsheets everywhere</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <span className="text-red-400">✕</span>
                      <span>4,000 videos, no organization</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <span className="text-red-400">✕</span>
                      <span>"Storage full" on your phone</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <span className="text-red-400">✕</span>
                      <span>Embarrassing PDFs to scouts</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <span className="text-red-400">✕</span>
                      <span>Constant data anxiety</span>
                    </div>
                  </div>
                </div>

                {/* After */}
                <div className="p-8 bg-gradient-to-br from-emerald-50/50 to-cyan-50/50">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    <span className="text-sm font-medium text-emerald-600">After</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-700">
                      <span className="text-emerald-500">✓</span>
                      <span>One clean dashboard</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700">
                      <span className="text-emerald-500">✓</span>
                      <span>Videos organized & searchable</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700">
                      <span className="text-emerald-500">✓</span>
                      <span>Unlimited cloud storage</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700">
                      <span className="text-emerald-500">✓</span>
                      <span>Professional recruiting profiles</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700">
                      <span className="text-emerald-500">✓</span>
                      <span>Peace of mind</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </AthleticHero>

      {/* Social Proof Bar */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-sm text-slate-500 mb-6">Trusted by sports parents tracking athletes in</p>
          <div className="flex justify-center flex-wrap gap-8 md:gap-16 opacity-50">
            {['Soccer', 'Basketball', 'Baseball', 'Football', 'Volleyball', 'Swimming'].map((sport) => (
              <span key={sport} className="text-slate-700 font-semibold text-lg">{sport}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Point Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Sound familiar?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              You're not alone. Every sports parent knows these struggles.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">The Spreadsheet Nightmare</h3>
              <p className="text-slate-600">
                Hours spent on manual data entry. Complex formulas that break. The constant fear of losing years of progress to one accidental delete.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">The Video Graveyard</h3>
              <p className="text-slate-600">
                4,000+ clips buried in your camera roll. "Storage Full" notifications. That amazing goal from last season? Good luck finding it.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">😰</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">The Recruitment Anxiety</h3>
              <p className="text-slate-600">
                When that scout asks for a profile, what do you send? A messy PDF? Random video links? You only get one chance to make an impression.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="demo" className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-cyan-100 text-cyan-700 px-4 py-1 rounded-full text-sm font-medium mb-4">
              The Solution
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Your athlete's command center
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything in one place. Always organized. Ready when opportunity knocks.
            </p>
          </div>

          <div className="space-y-20">
            {/* Feature 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  Stats Tracking
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-4">
                  Every stat. Every season. Zero spreadsheets.
                </h3>
                <p className="text-slate-600 mb-6 text-lg">
                  Log games in seconds. Watch career stats build automatically. See the progression from Peewee to Prospect—all in one beautiful dashboard.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-slate-700">
                    <span className="text-emerald-500">✓</span> Quick post-game entry
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <span className="text-emerald-500">✓</span> Multi-sport support
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <span className="text-emerald-500">✓</span> Season comparisons
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl p-8 aspect-video flex items-center justify-center border border-emerald-100">
                <div className="text-center">
                  <div className="text-6xl mb-4">📈</div>
                  <p className="text-slate-600 font-medium">Stats Dashboard Preview</p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 aspect-video flex items-center justify-center border border-amber-100">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-slate-600 font-medium">AI Highlight Reel</p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  AI Highlights
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-4">
                  AI finds the highlights. You share the glory.
                </h3>
                <p className="text-slate-600 mb-6 text-lg">
                  Upload full game footage. Our AI identifies the best moments—goals, saves, big plays. Get a shareable highlight reel in minutes, not hours.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-slate-700">
                    <span className="text-amber-500">✓</span> Automatic moment detection
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <span className="text-amber-500">✓</span> One-click highlight reels
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <span className="text-amber-500">✓</span> Recruitment-ready exports
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  Recruiting Profile
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-4">
                  When scouts ask, you're ready.
                </h3>
                <p className="text-slate-600 mb-6 text-lg">
                  Generate a professional athlete profile in seconds. Stats, highlights, achievements—all in a polished format that impresses coaches and opens doors.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-slate-700">
                    <span className="text-cyan-500">✓</span> Professional PDF exports
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <span className="text-cyan-500">✓</span> Shareable profile links
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <span className="text-cyan-500">✓</span> Embedded highlight videos
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 aspect-video flex items-center justify-center border border-cyan-100">
                <div className="text-center">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-slate-600 font-medium">Recruiter Snapshot</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4" style={{ backgroundColor: '#0F1B2D' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: '#00B4D8' }}>
              Simple, Transparent Pricing
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Less than a private lesson
            </h2>
            <p className="text-xl text-slate-400">
              Invest in their future. Start free, upgrade when ready.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Starter */}
            <div className="rounded-2xl p-6 border border-white/10 hover:scale-[1.02] transition-all" style={{ backgroundColor: '#1E293B' }}>
              <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
              <p className="text-sm text-slate-400 mb-6">Perfect for tracking a single athlete</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$9.99</span>
                <span className="text-slate-400">/mo</span>
                <p className="text-sm text-slate-400 mt-1">or $89/year</p>
                <p className="text-sm mt-1" style={{ color: '#10B981' }}>14-day free trial</p>
              </div>
              <ul className="space-y-3 mb-8">
                {['1 athlete', 'All sports stat tracking', 'AI Coach tips', 'Recruiter Snapshot PDF', 'Phone video upload'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                    <span style={{ color: '#10B981' }}>✓</span> {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup?plan=starter" className="block w-full py-3 text-center font-semibold rounded-xl transition hover:opacity-90" style={{ backgroundColor: '#00B4D8', color: 'white' }}>
                Start Free Trial
              </Link>
            </div>

            {/* Pro - Featured */}
            <div className="relative rounded-2xl p-6 lg:scale-105 lg:-my-4 shadow-2xl" style={{ backgroundColor: '#FF6B35' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide" style={{ backgroundColor: '#0F1B2D', color: '#FF6B35' }}>
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
              <p className="text-sm text-white/80 mb-6">For serious multi-sport families</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$14.99</span>
                <span className="text-white/80">/mo</span>
                <p className="text-sm text-white/80 mt-1">or $139/year</p>
                <p className="text-sm text-white/90 mt-1">14-day free trial</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Up to 4 athletes included',
                  '+$2.99/mo per additional athlete',
                  'Everything in Starter PLUS:',
                  'Veo/video import',
                  'AI shot form analysis',
                  'AI highlight detection',
                  'Recruiting profile builder',
                  'Priority support'
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-white">
                    <span>✓</span> {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup?plan=pro" className="block w-full py-3 bg-white hover:bg-slate-100 text-center font-bold rounded-xl transition" style={{ color: '#FF6B35' }}>
                Start Free Trial
              </Link>
            </div>

            {/* Team */}
            <div className="rounded-2xl p-6 border border-white/10 hover:scale-[1.02] transition-all" style={{ backgroundColor: '#1E293B' }}>
              <h3 className="text-xl font-bold text-white mb-2">Team</h3>
              <p className="text-sm text-slate-400 mb-6">Perfect for coaches and teams</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$29.99</span>
                <span className="text-slate-400">/mo</span>
                <p className="text-sm text-slate-400 mt-1">or $249/year</p>
              </div>
              <ul className="space-y-3 mb-8">
                {['Up to 50 players', 'Full roster management', 'Bulk stat entry', 'Game-day scoring', 'Parent sharing portal', 'Performance reports'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                    <span style={{ color: '#10B981' }}>✓</span> {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup?plan=team" className="block w-full py-3 text-center font-semibold rounded-xl transition hover:opacity-90" style={{ backgroundColor: '#00B4D8', color: 'white' }}>
                Get Started
              </Link>
            </div>

            {/* School/Org */}
            <div className="rounded-2xl p-6 border border-white/10 hover:scale-[1.02] transition-all" style={{ backgroundColor: '#1E293B' }}>
              <h3 className="text-xl font-bold text-white mb-2">School/Org</h3>
              <p className="text-sm text-slate-400 mb-6">For schools and organizations</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-white">Custom</span>
                <p className="text-sm text-slate-400 mt-1">Contact for pricing</p>
              </div>
              <ul className="space-y-3 mb-8">
                {['Unlimited teams', 'Admin dashboard', 'Custom branding', 'Priority onboarding', 'Dedicated support'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                    <span style={{ color: '#10B981' }}>✓</span> {feature}
                  </li>
                ))}
              </ul>
              <a href="mailto:sales@athletetrackpro.com?subject=School/Org Pricing Inquiry" className="block w-full py-3 text-center font-semibold rounded-xl transition bg-white/10 hover:bg-white/20 text-white">
                Contact Sales
              </a>
            </div>
          </div>

          {/* Parent View Free Tier */}
          <div className="max-w-2xl mx-auto rounded-2xl p-6 text-center mb-12" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: '#10B981', color: '#0F1B2D' }}>FREE</span>
              <h4 className="text-lg font-bold text-white">Parent View</h4>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Read-only access when your child's team uses AthleteTrack Pro. View stats, game summaries, and shared highlights at no cost.
            </p>
            <Link href="/signup?plan=parent" className="inline-block px-6 py-2 rounded-lg font-medium text-sm transition bg-white/10 hover:bg-white/20 text-white">
              Join as Parent
            </Link>
          </div>

          {/* Growth Loop Tagline */}
          <div className="text-center">
            <p className="inline-block px-6 py-3 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(0, 180, 216, 0.15)', color: '#00B4D8' }}>
              Coach subscribes → Parents get free access → Parents upgrade for AI & recruiting tools
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500 mt-10">
            <span className="flex items-center gap-2">
              <span style={{ color: '#10B981' }}>✓</span> No credit card for trial
            </span>
            <span className="flex items-center gap-2">
              <span style={{ color: '#10B981' }}>✓</span> Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <span style={{ color: '#10B981' }}>✓</span> Setup in 5 minutes
            </span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Stop managing data.
            <br />
            <span className="text-cyan-400">Start cheering again.</span>
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join thousands of sports parents who've traded spreadsheet stress for sideline joy. Your 14-day free trial starts now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-bold text-lg rounded-xl shadow-lg transform transition hover:scale-105"
            >
              Start Your Free Trial
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 mt-8">
            <span>No credit card required</span>
            <span>•</span>
            <span>Cancel anytime</span>
            <span>•</span>
            <span>Setup in 5 minutes</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-950 text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-bold text-white">AthleteTrack Pro</div>
          <div className="flex gap-6 text-sm">
            <Link href="/tos" className="hover:text-white transition">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <a href="mailto:support@athletetrackpro.com" className="hover:text-white transition">Support</a>
          </div>
          <div className="text-sm">© 2026 AthleteTrack Pro</div>
        </div>
      </footer>
    </main>
  );
}
