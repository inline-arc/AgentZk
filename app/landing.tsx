import Image from "next/image"

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden">
      {/* Background image - positioned with slight vertical lift and even distribution */}
      <div className="fixed inset-0 -z-10 h-full w-full mb-50">
        <Image
          src="/gradient-background.jpeg"
          alt="Background gradient"
          fill
          className="object-cover object-center"
          style={{
            objectPosition: "center 90%",
          }}
          priority
          quality={100}
        />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-8">
        <div className="flex items-center gap-3">
          <Image src="/agentzk-logo.png" alt="AgentZk Logo" width={36} height={36} className="w-10 h-10" />
          <span className="text-white text-xl font-geist font-normal">AgentZk</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-300 font-inter">
          {/* X.com Logo */}
          <div className="flex items-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium">69 USERS JOINED</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 text-center max-w-4xl mx-auto">
        {/* Badge */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
            <span className="text-gray-300 text-sm font-inter">Bring your business to the best scale</span>
          </div>
        </div>

        {/* Hero heading with gradient text effect */}
        <h1 className="text-xl sm:text-xl md:text-4xl lg:text-4xl font-geist font-normal mb-6 md:mb-8 leading-tight px-2 bg-gradient-to-b from-white via-white to-gray-300 bg-clip-text text-transparent">
          The future of AI and automation holds immense potential in the industries
        </h1>

        {/* Description */}
        <p className="text-gray-300 text-base md:text-lg font-inter max-w-2xl mb-8 md:mb-12 leading-relaxed px-4">
          AgentZk revolutionizes industries by enhancing efficiency, driving innovation, and transforming the way.
        </p>

        {/* CTA Button */}
        <button className="group relative px-8 py-3 bg-black-200 hover:bg-gray-700 text-white rounded-full font-inter font-medium transition-all duration-200 hover:scale-105 active:scale-95">
          <span className="relative z-10">Join Waitlist</span>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        </button>
      </main>

      {/* Footer */}
      <footer className="p-4 md:p-10 text-center">
        <p className="text-gray-400 text-sm font-inter mb-8">Powering the world's best product teams</p>
        <div className="flex items-center justify-center gap-6 md:gap-12 opacity-60 flex-wrap">
          {/* P Logo */}
          <div className="flex items-center justify-center h-8">
            <Image
              src="/p-logo.webp"
              alt="P Logo"
              width={32}
              height={32}
              className="h-8 w-8 filter grayscale brightness-0 invert"
            />
          </div>

          {/* Vercel Logo */}
          <div className="flex items-center justify-center h-8">
            <Image
              src="/vercel-logo.png"
              alt="Vercel"
              width={80}
              height={32}
              className="h-8 w-auto filter grayscale brightness-0 invert"
            />
          </div>

          {/* SendAI Logo */}
          <div className="flex items-center justify-center h-8">
            <Image src="/sendai-logo.png" alt="SendAI" width={80} height={32} className="h-8 w-auto filter grayscale" />
          </div>

          {/* OpenAI Logo */}
          <div className="flex items-center justify-center h-8">
            <Image
              src="/openai-logo.png"
              alt="OpenAI"
              width={100}
              height={60}
              className="h-8 w-auto filter grayscale"
            />
          </div>

          {/* Solana Logo */}
          <div className="flex items-center justify-center h-8">
            <Image
              src="/solana-logo.svg"
              alt="Solana"
              width={80}
              height={32}
              className="h-8 w-auto filter grayscale brightness-0 invert"
            />
          </div>
        </div>
      </footer>
    </div>
  )
}
