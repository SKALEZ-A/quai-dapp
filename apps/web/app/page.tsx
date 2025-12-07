"use client";

import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCurrentUser } from '@/hooks/useCurrentUser';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet } from '@fortawesome/free-solid-svg-icons';

const LandingPage = () => {
  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const currentUser = useCurrentUser();

  const testimonials = [
    {
      name: 'Kunms',
      handle: 'BD Manager - Victus',
      avatar: '/assets/kunms.jpg',
      quote: 'SYNQ has a simplified the entire onboarding process into a super app which i think is amazing. Highly recommended for new users in the Quai ecosystem!',
    },
    {
      name: 'Rocster',
      handle: 'Founder - SYNQ',
      avatar: '/assets/rocster.jpg',
      quote: "SYNQ is very user friendly and easy to use. I believe what we've built would be the ost used DApp on Quai very sopon. We're a community focused super DApp that brings value to the ecosystem.",
    },
    {
      name: 'Skalez',
      handle: 'CTO - SYNQ',
      avatar: '/assets/skalez.jpg',
      quote: "The protocol is incredibly fast and secure. We have established a seamless identity layer on Quai. The integration with our social features is absolutely brilliant",
    },
  ];

  return (
    <div className="landing-page overflow-x-hidden">
      <Header />
      <main>
        {/* HERO SECTION */}
        <section className="text-center pt-32 md:pt-[160px] px-4 md:px-[24px] pb-10 md:pb-[80px] relative flex flex-col items-center justify-center mt-10 md:mt-20">
          <div className="max-w-6xl mx-auto -mb-10 md:-mb-20 z-10 relative">
            {/* Heading */}
            <h1 className="font-space-grotesk text-4xl md:text-6xl lg:text-[4.5rem] font-bold leading-tight md:leading-[1.1] tracking-[-0.02em] text-white mb-6">
              A Unified Web3 <span className="text-gradient">Experience.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-500 text-base md:text-lg max-w-3xl mx-auto mb-8 px-2">
              Connect, transact, and socialize seamlessly on Quai Network. Get your QNS identity, bridge assets cross-chain, and join the vibrant Web3 community all in one platform.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto px-4 sm:px-0">
              <button 
                onClick={() => { if (isConnected && currentUser.address) { router.push('/dashboard/social'); } else { open(); } }} 
                className="w-full sm:w-auto px-6 py-3 rounded-md font-manrope btn-gradient text-white font-medium hover:opacity-90 transition"
              >
                Launch Social Dapp →
              </button>
              <button 
                onClick={() => { if (isConnected && currentUser.address) { router.push('/qns/profile'); } else { open(); } }} 
                className="w-full sm:w-auto px-6 py-3 rounded-md font-manrope border-gradient-2 text-white font-medium transition"
              >
                Get your QNS Domain
              </button>
            </div>
          </div>

          {/* Background visuals */}
          <div className="relative w-full lg:w-[2000px] h-[300px] sm:h-[500px] lg:h-[1300px] lg:transform lg:-translate-y-1/4 mt-12 lg:mt-0 flex justify-center items-start lg:block">
            
            {/* Pattern */}
            <img 
              src="/assets/pattern.png" 
              alt="Pattern" 
              className="block absolute top-1/2 left-1/2 lg:w-[220vw] md:w-[310vw] w-[330vw] lg:h-[180vh] md:h-[160vh] h-[120vh] -translate-x-1/2 -translate-y-1/3 pointer-events-none select-none z-1" 
            />
            
            {/* Dashboard Mockup */}
            <img 
              src="/assets/dashboard-mockup.png" 
              alt="Synq Dashboard" 
              className="relative mt-8 md:mt-16 lg:mt-0 lg:absolute lg:top-1/2 lg:left-1/2 w-[90%] md:w-[700px] lg:w-[1100px] h-auto lg:h-[650px] lg:-translate-x-1/2 lg:-translate-y-1/4 z-10 object-contain" 
            />
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="bg-[#111928] py-12 md:py-20 px-4 text-center text-white relative z-20 mt-[-40px] md:mt-10 lg:mt-[-405px]">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
            <div>
              <p className="text-2xl md:text-3xl font-bold text-white">50<span className="text-gradient">+</span></p>
              <p className="mt-2 text-xs md:text-sm text-gray-400">QNS Domain</p>
            </div>
            <div>
              <p className="text-xl md:text-xl font-bold text-white">coming<span className="text-gradient"> soon</span></p>
              <p className="mt-2 text-xs md:text-sm text-gray-400">Bridge Transactions</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-white">100<span className="text-gradient">+</span></p>
              <p className="mt-2 text-xs md:text-sm text-gray-400">Active Users</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-white">99.9<span className="text-gradient">%</span></p>
              <p className="mt-2 text-xs md:text-sm text-gray-400">Uptime</p>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="text-center text-white mt-0 px-4 py-16">
          <h2 className="font-space-grotesk text-3xl md:text-4xl mb-4 font-bold">
            You are in <span className="text-gradient">Good</span> Company
          </h2>
          <p className="font-manrope text-sm sm:text-base text-gray-400 font-normal max-w-xl mx-auto mb-12 md:mb-20">
            Join thousands of users who have simplified their Web3 experience with our integrated platform.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mt-4">
            {/* QNS Identity Card */}
            <div className="bg-[#450A0A66] bg-opacity-40 border border-[#fca5a5] rounded-md p-6 md:p-8 w-full md:max-w-sm flex flex-col items-start text-left">
              <div className="mb-4">
                <img src="/assets/icon-1.png" alt="QNS Identity Icon" className="h-12 w-12 mb-4" />
              </div>
              <h3 className="font-manrope text-2xl md:text-3xl font-bold mb-3">QNS Identity</h3>
              <p className="font-manrope text-sm md:text-md text-gray-400 mb-6 flex-grow leading-loose">
                Get your human-readable identity on Quai Network. Fair auctions, reserved names, and cross-chain compatibility.
              </p>
              <ul className="text-sm text-gray-200 space-y-3 mb-8">
                <li className="flex items-center text-gray-400">
                  <span className="mr-2 text-[#16f847] text-lg">✓</span> Reverse Dutch Option
                </li>
                <li className="flex items-center text-gray-400">
                  <span className="mr-2 text-[#16f847] text-lg">✓</span> Cross-chain Resolution
                </li>
                <li className="flex items-center text-gray-400">
                  <span className="mr-2 text-[#16f847] text-lg">✓</span> Anti-sniping Protection
                </li>
              </ul>
              <button onClick={() => { if (isConnected && currentUser.address) { router.push('/qns/namesearch'); } else { open(); } }} className="bg-[#8B1E3F] text-white font-bold py-3 rounded-md hover:bg-opacity-90 transition-colors self-start w-full font-manrope">
                Mint Identity
              </button>
            </div>

            {/* Cross-chain Bridge Card */}
            <div className="bg-[#36165566] bg-opacity-40 border border-[#D5C0F2] rounded-md p-6 md:p-8 w-full md:max-w-sm flex flex-col items-start text-left">
              <div className="mb-4">
                <img src="/assets/icon-2.png" alt="Cross-chain Bridge Icon" className="h-12 w-12 mb-4" />
              </div>
              <h3 className="font-manrope text-2xl md:text-3xl font-bold mb-3">Cross-chain Bridge</h3>
              <p className="font-manrope text-sm md:text-md text-gray-400 mb-6 flex-grow leading-loose">
                Seamlessly transfer assets between Quai Network and major L1s/L2s with our secure, fast bridge.
              </p>
              <ul className="text-sm text-gray-200 space-y-3 mb-8">
                <li className="flex items-center text-gray-400">
                  <span className="mr-2 text-[#16f847] text-lg">✓</span> Multi-chain Support
                </li>
                <li className="flex items-center text-gray-400">
                  <span className="mr-2 text-[#16f847] text-lg">✓</span> Low Fees & Fast Speeds
                </li>
                <li className="flex items-center text-gray-400">
                  <span className="mr-2 text-[#16f847] text-lg">✓</span> Security First
                </li>
              </ul>
              <button onClick={() => { if (isConnected && currentUser.address) { router.push('/dashboard/bridge'); } else { open(); } }} className="bg-[#6C3B9E] text-white font-bold py-3 rounded-md hover:bg-opacity-90 transition-colors self-start w-full font-manrope">
                Start Bridging
              </button>
            </div>

            {/* Social Hub Card */}
            <div className="bg-[#172A5466] bg-opacity-40 border border-[#93B4FD] rounded-md p-6 md:p-8 w-full md:max-w-sm flex flex-col items-start text-left">
              <div className="mb-4">
                <img src="/assets/icon-3.png" alt="Social Hub Icon" className="h-12 w-12 mb-4" />
              </div>
              <h3 className="font-manrope text-2xl md:text-3xl font-bold mb-3">Social Hub</h3>
              <p className="font-manrope text-sm md:text-md text-gray-400 mb-6 flex-grow leading-loose">
                Connect, chat, and transact with the Quai community. Built-in tipping, NFT sharing, and more.
              </p>
              <ul className="text-sm text-gray-200 space-y-3 mb-8">
                <li className="flex items-center text-gray-400">
                  <span className="mr-2 text-[#16f847] text-lg">✓</span> On-chain Messaging
                </li>
                <li className="flex items-center text-gray-400">
                  <span className="mr-2 text-[#16f847] text-lg">✓</span> Community Groups
                </li>
                <li className="flex items-center text-gray-400">
                  <span className="mr-2 text-[#16f847] text-lg">✓</span> Social Payments
                </li>
              </ul>
              <button onClick={() => { if (isConnected && currentUser.address) { router.push('/dashboard/social'); } else { open(); } }} className="bg-[#2563EB] text-white font-bold py-3 rounded-md hover:bg-opacity-90 transition-colors self-start w-full font-manrope">
                Open Synq Social
              </button>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="bg-[#2A0913] py-16 md:py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto grid grid-cols-1 items-center gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`rounded-lg border border-neutral-500 h-50 flex flex-col justify-between ${
                  index === 0
                    ? 'p-6 md:p-8'
                    : index === 1
                    ? 'p-6 py-4 md:px-8 md:py-16'
                    : 'p-6 py-8 md:px-8 md:py-14'
                }`}
              >
                <div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                  </div>
                  <p className="mt-6 text-neutral-300 text-sm md:text-base">"{testimonial.quote}"</p>
                </div>

                <div className="mt-8 flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <p className="font-bold text-white text-sm md:text-base">{testimonial.name}</p>
                    <p className="text-xs md:text-sm text-neutral-400">{testimonial.handle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA SECTION */}
        <section
          className="relative flex flex-col items-center justify-center py-16 px-4 sm:px-8 md:px-16 lg:px-24 text-center text-white overflow-hidden mt-6"
          style={{
            background: 'linear-gradient(120deg, #6C3B9E, #000000, #8B1E3F)',
          }}
        >
          <div className="absolute inset-0 bg-black opacity-30 z-0"></div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Ready to Simplify Your Web3 <span className="block sm:inline">Experience?</span>
            </h2>
            <p className="text-sm md:text-base text-gray-400 mb-8 mx-auto px-2 max-w-lg md:max-w-none">
              Join thousands of users who've simplified their Web3 experience with our integrated platform.
            </p>
            <button
              className={`inline-flex items-center px-6 md:px-8 py-3 rounded-md text-sm md:text-md font-medium transition duration-300 ease-in-out text-white ${
                isConnected && currentUser.address ? 'btn-primary' : 'btn-gradient'
              }`}
              onClick={() => { if (isConnected && currentUser.address) { router.push('/dashboard'); } else { open(); } }}
              title={isConnected && currentUser.address ? 'Go to Dashboard' : 'Connect Wallet'}
            >
              {isConnected && currentUser.address ? (
                'Go to Dashboard'
              ) : (
                <>
                  <FontAwesomeIcon icon={faWallet} className="text-white mr-2 text-lg" />
                  Connect Wallet to start
                </>
              )}
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;