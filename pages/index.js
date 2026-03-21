export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            <span className="text-yellow-400">Papercall</span>
            <br />
            <span className="text-4xl md:text-5xl">Pay to Reach the People You Admire</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
            Fans pay a one-time fee to get through to influencers, celebrities, or creators.  
            Spam is blocked. Creators earn real money from real conversations.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a
              href="/pay?caller=+19162547699"
              className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-5 px-10 rounded-full text-xl transition duration-300 transform hover:scale-105"
            >
              Try It Now – Pay to Call
            </a>
            <a
              href="#for-creators"
              className="inline-block bg-transparent border-2 border-white hover:bg-white hover:text-black font-bold py-5 px-10 rounded-full text-xl transition duration-300"
            >
              For Creators & Influencers
            </a>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            How Papercall Works
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-6xl mb-6">🛡️</div>
              <h3 className="text-2xl font-bold mb-4">Spam Dies Instantly</h3>
              <p className="text-gray-300">
                Only callers who pay get through. Bots and randos get blocked — your line stays clean.
              </p>
            </div>

            <div className="text-center">
              <div className="text-6xl mb-6">💰</div>
              <h3 className="text-2xl font-bold mb-4">Earn From Every Real Call</h3>
              <p className="text-gray-300">
                Set your price ($49–$499). Keep 70–80% of each payment. Passive income from superfans.
              </p>
            </div>

            <div className="text-center">
              <div className="text-6xl mb-6">🔒</div>
              <h3 className="text-2xl font-bold mb-4">Private & Secure</h3>
              <p className="text-gray-300">
                Dedicated number. Full control. Turn it off anytime. No personal number exposed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Creators Section */}
      <section id="for-creators" className="py-20 bg-gradient-to-r from-purple-900 to-indigo-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-8">
            Creators: Turn Fans Into Revenue
          </h2>

          <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto">
            Whether you're a musician, podcaster, YouTuber, or influencer — let your biggest supporters pay for a real conversation.  
            You set the price, keep most of the money, and we handle spam, payments, and tech.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-black bg-opacity-50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4">How Much You Can Earn</h3>
              <p className="text-gray-300 mb-4">
                1,000 superfans pay $99 once = <strong>$99,000</strong><br />
                You keep 75% = <strong>$74,250</strong> from one campaign
              </p>
            </div>

            <div className="bg-black bg-opacity-50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4">Zero Hassle</h3>
              <p className="text-gray-300">
                We provide the number, filter spam, process payments via Stripe, and send you your earnings.  
                You just answer when you want.
              </p>
            </div>
          </div>

          <a
            href="mailto:your@email.com?subject=Papercall%20Creator%20Interest"
            className="inline-block bg-white text-black font-bold py-6 px-12 rounded-full text-xl hover:bg-gray-200 transition"
          >
            Get Your Private Line – Free Test Setup
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black text-center text-gray-500">
        <p>© {new Date().getFullYear()} Papercall – Pay to Connect. All rights reserved.</p>
        <p className="mt-2 text-sm">
          Built with ❤️ in California
        </p>
      </footer>
    </div>
  )
}
