// app/page.tsx - Landing Page
import Link from 'next/link';
import Image from 'next/image';
import { AuroraHero } from '@/components/ui/AuroraHero';
import Header from '@/components/Header';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Header />
      {/* Hero Section */}
      <AuroraHero>
        {/* Trust Badge */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span className="text-white text-sm font-medium">Trusted by Strategic Sports Parents & Top College Scouts</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-8 pt-20">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight">
            Eliminate Data Anxiety.
            <br />
            Transform Your Child's
            <br />
            Talent into a Professional
            <br />
            Recruiting Profile.
          </h1>

          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Stop wrestling with messy spreadsheets and fragmented data.
            StatTrack Pro centralizes every metric, rank, and video into a single,
            professional platform, giving you the Control and Confidence needed
            to Optimize their future.
          </p>

          {/* Interactive Demo Preview */}
          <div className="relative mx-auto max-w-4xl mt-12 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-blue-200 mb-2">Interactive Demo Preview</p>
                  <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded p-3">
                    <p className="text-white text-xs">❌ Messy Spreadsheet</p>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-green-300 mb-2">Recruiter Snapshot Generator</p>
                  <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded p-3">
                    <p className="text-white text-xs">✓ Professional Profile</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <p className="text-sm text-blue-200 mb-4">As seen in:</p>
          <div className="flex justify-center gap-8 mb-8 opacity-70">
            {['ESPN', 'MaxPreps', 'NCSA', 'Perfect Game', 'Hudl'].map((brand) => (
              <div key={brand} className="text-white font-semibold text-lg">{brand}</div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-[#00BFFF] hover:bg-[#00a6e6] text-white font-bold text-lg rounded-lg shadow-xl transform transition hover:scale-105"
            >
              Start Your 30-Day Free Trial
            </Link>
            <Link
              href="/signup"
              className="px-8 py-4 bg-transparent border-2 border-white/50 hover:border-white text-white font-bold text-lg rounded-lg transition"
            >
              See Professional Sample Profile
            </Link>
          </div>

          {/* Micro-copy */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-200 mt-4">
            <span className="flex items-center gap-1">
              <span className="text-green-400">✓</span> No credit card required
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-400">✓</span> Cancel anytime
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-400">✓</span> Setup in 5 minutes
            </span>
          </div>
        </div>
      </AuroraHero>

      {/* Problem/Pain Point Section */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-[#0A192F] mb-16">
            Is Your Child's Future Trapped in a Spreadsheet You Can't Trust?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">📊❌</div>
              <h3 className="text-xl font-bold text-[#0A192F] mb-3">The Spreadsheet Liability</h3>
              <p className="text-gray-600">
                Hours wasted on manual data entry, complex formulas that break,
                and the constant fear of losing years of progress due to one simple error.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">🗑️📄</div>
              <h3 className="text-xl font-bold text-[#0A192F] mb-3">The Unprofessional Presentation</h3>
              <p className="text-gray-600">
                Sending college scouts fragmented links, amateur PDFs, or worse—a messy,
                confusing document that gets immediately dismissed.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">😰💔</div>
              <h3 className="text-xl font-bold text-[#0A192F] mb-3">The Anxiety of the Unknown</h3>
              <p className="text-gray-600">
                The constant self-doubt and stress of managing a high-stakes recruiting
                process without a reliable system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0A192F] mb-8">
            StatTrack Pro: The Strategic Command Center for Their Athletic Career
          </h2>

          <div className="space-y-6 text-lg text-gray-700 mb-12">
            <p>
              You shouldn't have to be a data scientist to manage your child's athletic future.
              Like you, we understand the strategic mindset needed to succeed.
            </p>
            <p className="font-semibold text-[#004D99]">
              "Data Doesn't Lie. We Just Make Sure It's Heard."
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-red-50 rounded-xl p-8">
              <h3 className="font-bold text-red-700 mb-4">Before StatTrack Pro</h3>
              <ul className="space-y-2 text-left text-gray-700">
                <li>• Cluttered spreadsheets</li>
                <li>• Lost in notebooks</li>
                <li>• #VALUE! errors</li>
                <li>• Unprofessional presentation</li>
                <li>• Data anxiety</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-xl p-8">
              <h3 className="font-bold text-green-700 mb-4">After StatTrack Pro</h3>
              <ul className="space-y-2 text-left text-gray-700">
                <li>• Clean dashboard</li>
                <li>• Centralized data</li>
                <li>• Automatic calculations</li>
                <li>• Professional profiles</li>
                <li>• Strategic control</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-[#0A192F] mb-16">
            Everything You Need to Manage Their Athletic Future
          </h2>

          <div className="space-y-20">
            {/* Feature 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-[#0A192F] mb-4">
                  Professional Profile Generator
                </h3>
                <p className="text-gray-600 mb-6">
                  Instantly generate a clean, shareable "Recruiter Snapshot" PDF or link.
                  Eliminate the shame of unprofessional documents and ensure your child's
                  data is presented with Authority.
                </p>
                <div className="bg-[#3CB371] text-white px-4 py-2 rounded-lg inline-block">
                  Generate a 5-page profile in 30 seconds
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-xl p-8 h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📄✨</div>
                  <p className="text-gray-700 font-semibold">Professional PDF Export</p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl p-8 h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📈📊</div>
                  <p className="text-gray-700 font-semibold">5-Year Trend Analysis</p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-3xl font-bold text-[#0A192F] mb-4">
                  Longitudinal Performance Tracking
                </h3>
                <p className="text-gray-600 mb-6">
                  Compare current performance against historical data and recruiting benchmarks.
                  Our interactive charts provide the objective truth you need for strategic control.
                </p>
                <div className="bg-[#3CB371] text-white px-4 py-2 rounded-lg inline-block">
                  Track 5-year trend lines and 15+ custom KPIs
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-[#0A192F] mb-4">
                  Data Integrity & Error Check
                </h3>
                <p className="text-gray-600 mb-6">
                  Stop worrying about #VALUE! errors. Our system actively validates inputs
                  and flags anomalies, preventing the administrative failures that keep you awake at night.
                </p>
                <div className="bg-[#3CB371] text-white px-4 py-2 rounded-lg inline-block">
                  99.9% Data Accuracy Guarantee
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-8 h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">✅🛡️</div>
                  <p className="text-gray-700 font-semibold">Automated Error Checking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-[#0A192F] mb-4">
            The Strategic Investment in Their Future
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Less than the cost of a single private lesson
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-[#0A192F] mb-2">Starter</h3>
              <div className="text-4xl font-bold text-[#004D99] mb-4">
                $10<span className="text-lg text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Single Player Profile
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Core Stat Tracking
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Recruiter Snapshot (PDF)
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full py-3 bg-gray-100 hover:bg-gray-200 text-center text-gray-700 font-semibold rounded-lg transition"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Professional - Most Popular */}
            <div className="bg-gradient-to-b from-[#004D99] to-[#00BFFF] rounded-xl p-8 text-white transform scale-105 shadow-2xl">
              <div className="bg-[#3CB371] text-white text-sm px-3 py-1 rounded-full inline-block mb-2">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Professional</h3>
              <div className="text-4xl font-bold mb-4">
                $15<span className="text-lg opacity-75">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-[#3CB371] mt-1">✓</span>
                  Everything in Starter
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3CB371] mt-1">✓</span>
                  Longitudinal Tracking
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3CB371] mt-1">✓</span>
                  Video Integration
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3CB371] mt-1">✓</span>
                  Custom Ranking Algorithm
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3CB371] mt-1">✓</span>
                  Priority Support
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full py-3 bg-white hover:bg-gray-100 text-[#004D99] text-center font-bold rounded-lg transition"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-[#0A192F] mb-2">Club/Scout</h3>
              <div className="text-4xl font-bold text-[#004D99] mb-4">
                Custom
              </div>
              <ul className="space-y-3 mb-8 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Multi-Player Management
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Dedicated Account Manager
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  API Access
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Custom Data Feeds
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Team Analytics
                </li>
              </ul>
              <Link
                href="mailto:support@stattrackpro.com"
                className="block w-full py-3 bg-gray-100 hover:bg-gray-200 text-center text-gray-700 font-semibold rounded-lg transition"
              >
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-gradient-to-r from-[#0A192F] to-[#008000]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Stop Managing Spreadsheets. Start Managing Opportunity.
          </h2>
          <p className="text-xl text-blue-100 mb-12">
            Join thousands of strategic parents who have eliminated data anxiety
            and gained the Control needed to maximize their child's athletic future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-[#3CB371] hover:bg-[#2da05e] text-white font-bold text-lg rounded-lg shadow-xl transform transition hover:scale-105"
            >
              Start Your Free 30-Day Trial
            </Link>
            <Link
              href="/signup"
              className="px-8 py-4 bg-transparent border-2 border-white/50 hover:border-white text-white font-bold text-lg rounded-lg transition"
            >
              Schedule a Personalized Demo
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-200 mt-8">
            <span>✓ 30-day trial</span>
            <span>✓ No credit card</span>
            <span>✓ Cancel anytime</span>
            <span>✓ Professional-Grade Data</span>
          </div>
        </div>
      </section>
    </main>
  );
}
