
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-900 text-white font-sans">
      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center pt-24 pb-16 px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
          ReignScore
        </h1>
        <p className="max-w-xl text-xl text-slate-300 leading-relaxed mb-8">
          The first credit building app that feels like a game. Track utilization, earn rewards, and secure your financial kingdom.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition-all transform hover:scale-105">
            Download for iOS
          </button>
          <button className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-full border border-slate-700 transition-all">
            Get on Android
          </button>
        </div>
      </header>

      {/* Feature Showcase Grid */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-slate-800 border border-slate-700 hover:border-yellow-500/50 transition-colors">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">Reign Advisor</h3>
            <p className="text-slate-400">Get instant AI-driven advice to optimize your score based on your real spending.</p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-800 border border-slate-700 hover:border-yellow-500/50 transition-colors">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-xl font-bold mb-2">Smart Alerts</h3>
            <p className="text-slate-400">Never miss a beat. We warn you before your utilization spikes past 30%.</p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-800 border border-slate-700 hover:border-yellow-500/50 transition-colors">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-2">Invite & Earn</h3>
            <p className="text-slate-400">Refer friends to the kingdom and unlock exclusive premium features.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-slate-500 text-sm">
        <p>© 2026 ReignScore Inc. Master Your Credit.</p>
        <div className="mt-4 space-x-4">
          <a href="#" className="hover:text-yellow-500">Privacy</a>
          <a href="#" className="hover:text-yellow-500">Terms</a>
          <a href="#" className="hover:text-yellow-500">Support</a>
        </div>
      </footer>
    </div>
  );
}
