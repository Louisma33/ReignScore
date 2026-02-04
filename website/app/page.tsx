import Image from "next/image";

export default function Home() {
  const features = [
    {
      title: "Your Financial Kingdom at a Glance",
      description: "Monitor your credit utilization, scores, and daily spending in one unified dashboard. Real-time updates keep you in control of your financial destiny.",
      image: "/images/1_dashboard.png",
      reverse: false,
    },
    {
      title: "Predict Future Scores",
      description: "Don't guess—know. Use our AI-powered Simulator to see exactly how your actions today will impact your score tomorrow. Plan your moves like a strategist.",
      image: "/images/2_simulator.png",
      reverse: true,
    },
    {
      title: "Personalized Action Plans",
      description: "The Noble Plan gives you step-by-step missions to improve your credit. It's not just advice; it's a battle plan for financial victory.",
      image: "/images/3_noble_plan.png",
      reverse: false,
    },
    {
      title: "Identity & Credit Protection",
      description: "Reign Guard actively monitors for threats. Get instant alerts on suspicious activity and lock down your profile with a tap.",
      image: "/images/4_reign_guard.png",
      reverse: true,
    },
    {
      title: "Maximize Every Swipe",
      description: "Our Card Optimizer tells you exactly which card to use for every purchase to maximize rewards and minimize interest. Efficiency is power.",
      image: "/images/5_card_optimizer.png",
      reverse: false,
    },
    {
      title: "Earn While You Build",
      description: "Unlock exclusive rewards as you improve your score. From cashback boosts to premium features, your responsible habits pay off.",
      image: "/images/6_rewards.png",
      reverse: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-yellow-500/30">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
              ReignScore
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Stories</a>
          </div>
          <button className="px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-colors">
            Get the App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-yellow-500/20 blur-[120px] rounded-full pointer-events-none opacity-20" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-sm font-semibold tracking-wide uppercase">
            Now Available on iOS & Android
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
            Master Your <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500">
              Financial Kingdom
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-10 leading-relaxed">
            The first credit building app that feels like a game. Track utilization, simulating scores, and earn real-world rewards while you build your future.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button className="w-full sm:w-auto px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg rounded-full transition-all transform hover:scale-105 flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.23-3.14-2.47-1.7-2.45-3-6.24-1.26-9.28 1.4-2.43 3.4-2.8 4.7-2.82 1.3-.06 2.53.88 3.32.88.78 0 2.25-1.09 3.79-.93 1.29.13 2.27.52 2.96 1.13-2.58 1.55-2.16 5.86.37 6.99zm-4.37-14.37c.71-1.23 2.1-1.9 2.1-1.9-.36 2.4-1.89 4.31-4.01 3.52-.1-.97.58-1.52.92-2.14z" /></svg>
              Download for iOS
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg rounded-full border border-slate-700 transition-all flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3,20.5V3.5C3,2.91,3.34,2.39,3.84,2.15L13.69,12L3.84,21.85C3.34,21.6,3,21.09,3,20.5M16.81,15.12L6.05,21.34L14.54,12.85M16.81,8.88L14.54,11.15L6.05,2.66M18.59,11.87L19.61,11.28C20.29,10.93,20.29,10.07,19.61,9.72L17.67,8.6L15.39,10.88L17.67,13.15z" /></svg>
              Get the App
            </button>
          </div>

          <div className="relative mx-auto w-full max-w-[1200px] aspect-[16/9] lg:aspect-[21/9]">
            {/* Abstract representation or hero image collage could go here */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
            <div className="grid grid-cols-3 gap-8 opacity-90 transform perspective-1000 rotate-x-12 scale-90">
              <div className="translate-y-12">
                <Image src="/images/1_dashboard.png" alt="Dashboard" width={400} height={800} className="rounded-[32px] border-8 border-slate-800 shadow-2xl" />
              </div>
              <div className="-translate-y-4 z-10">
                <Image src="/images/3_noble_plan.png" alt="Noble Plan" width={400} height={800} className="rounded-[32px] border-8 border-slate-800 shadow-2xl shadow-yellow-900/20" />
              </div>
              <div className="translate-y-12">
                <Image src="/images/2_simulator.png" alt="Simulator" width={400} height={800} className="rounded-[32px] border-8 border-slate-800 shadow-2xl" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-20" />
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-white mb-1">150+</div>
            <div className="text-sm text-slate-500 uppercase tracking-wider">Points Avg. Increase</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-1">24/7</div>
            <div className="text-sm text-slate-500 uppercase tracking-wider">Credit Monitoring</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-1">$0</div>
            <div className="text-sm text-slate-500 uppercase tracking-wider">Hidden Fees</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-1">5.0</div>
            <div className="text-sm text-slate-500 uppercase tracking-wider">App Store Rating</div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section id="features" className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto space-y-32">
          {features.map((feature, idx) => (
            <div key={idx} className={`flex flex-col md:flex-row items-center gap-12 lg:gap-24 ${feature.reverse ? 'md:flex-row-reverse' : ''}`}>
              <div className="flex-1 space-y-6">
                <div className="inline-block p-3 rounded-2xl bg-slate-800 border border-slate-700">
                  <span className="text-2xl">
                    {idx === 0 && '📊'}
                    {idx === 1 && '🔮'}
                    {idx === 2 && '🗺️'}
                    {idx === 3 && '🛡️'}
                    {idx === 4 && '💳'}
                    {idx === 5 && '🎁'}
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold leading-tight">{feature.title}</h2>
                <p className="text-lg text-slate-400 leading-relaxed">{feature.description}</p>
                <button className="text-yellow-500 font-bold hover:text-yellow-400 flex items-center gap-2 group">
                  Learn more
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-yellow-500/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-700" />
                <div className="relative transform transition-transform duration-500 hover:-translate-y-2">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={400}
                    height={800}
                    className="mx-auto rounded-[40px] border-[10px] border-slate-800 shadow-2xl"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4">
        <div className="max-w-5xl mx-auto relative rounded-[3rem] overflow-hidden bg-slate-900 border border-slate-800 text-center px-8 py-20 md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent" />

          <h2 className="text-4xl md:text-6xl font-bold mb-8 relative z-10">Start Your Reign Today</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 relative z-10">
            Join thousands of others who are actively building their credit score and financial future with CardReign.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <button className="px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-200 transition-colors">
              Download on App Store
            </button>
            <button className="px-8 py-4 bg-slate-800 text-white font-bold text-lg rounded-full border border-slate-700 hover:bg-slate-700 transition-colors">
              Get on Google Play
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div>
            <span className="text-2xl font-bold text-white">ReignScore</span>
            <p className="text-slate-500 mt-2 text-sm">© 2026 ReignScore Inc. All rights reserved.</p>
          </div>
          <div className="flex gap-8 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
          <div className="flex gap-4">
            {/* Social icons placeholders */}
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">𝕏</div>
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">📸</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
