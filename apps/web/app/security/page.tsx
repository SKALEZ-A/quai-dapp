import React from 'react';

export const metadata = {
  title: 'Security — Synq',
  description: 'Security practices and responsible disclosure for Synq.',
  openGraph: {
    title: 'Security — Synq',
    description: 'Security practices and responsible disclosure for Synq.',
    url: 'https://synqdapp.com/security',
    images: [{ url: '/opengraph-image.png', alt: 'Synq Security' }],
  },
};

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 py-16 px-6 sm:px-12 lg:px-28">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">Security</h1>
        <p className="text-gray-600 mb-6">Keeping Synq and its users safe</p>

        <section className="prose prose-neutral mb-8">
          <h2>Our Approach</h2>
          <p>
            We prioritize security through careful engineering, periodic reviews, and best practices. This page
            summarizes how we protect the platform and how you can protect yourself.
          </p>

          <h2>Application Security</h2>
          <ul>
            <li>Regular dependency updates and vulnerability scanning.</li>
            <li>Least-privilege access controls for services and databases.</li>
            <li>Secure storage of secrets; secrets are never stored in the client or source control.</li>
          </ul>

          <h2>Blockchain & Wallet Safety</h2>
          <p>
            We never request your private keys. All on-chain actions require a transaction signed by your wallet. Verify
            transactions in your wallet and only interact with trusted contracts and dApps.
          </p>

          <h2>Reporting Vulnerabilities</h2>
          <p>
            If you discover a security issue, please email <a href="mailto:synqafrica1.0@gmail.com">synqafrica1.0@gmail.com</a>
            with details. We appreciate responsible disclosure and will respond promptly.
          </p>

          <h2>Account Protection</h2>
          <p>
            Use strong, unique passwords for services that require them, enable hardware wallets where possible, and be
            cautious with browser extensions and third-party integrations.
          </p>
        </section>
      </div>
    </main>
  );
}
