import React from 'react';

export const metadata = {
  title: 'Privacy Policy — Synq',
  description: 'Learn how Synq collects, uses, and protects your data.',
  openGraph: {
    title: 'Privacy Policy — Synq',
    description: 'Learn how Synq collects, uses, and protects your data.',
    url: 'https://synqdapp.com/privacy',
    images: [{ url: '/opengraph-image.png', alt: 'Synq Privacy' }],
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 py-16 px-6 sm:px-12 lg:px-28">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-6">Last updated: December 2025</p>

        <section className="prose prose-neutral mb-8">
          <p>
            Welcome to Synq. This Privacy Policy explains how we collect, use, disclose, and protect your personal
            information when you use our services. By accessing or using Synq, you agree to the terms described here.
          </p>

          <h2>Information We Collect</h2>
          <ul>
            <li>Account information (username, email).</li>
            <li>Profile and public content you choose to share.</li>
            <li>Usage data and analytics for improving the service.</li>
            <li>Wallet addresses and transaction metadata required for on-chain interactions.</li>
          </ul>

          <h2>How We Use Information</h2>
          <p>
            We use your information to provide and improve services, to communicate with you, to secure the platform, and
            to comply with legal obligations.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            We may integrate with third-party services (analytics, storage providers, block explorers). Each third party
            has its own privacy practices — please review them before using those integrations.
          </p>

          <h2>Data Security</h2>
          <p>
            We implement reasonable organizational and technical safeguards to protect your data. However, no system is
            completely secure — never share your private keys or secrets with anyone.
          </p>

          <h2>Data Retention</h2>
          <p>We retain information as long as necessary to provide the services and to meet legal obligations.</p>

          <h2>Your Choices</h2>
          <p>You can manage account settings and opt out of certain communications in your profile settings.</p>

          <h2>Contact Us</h2>
          <p>If you have questions about this policy, contact us at <a href="mailto:synqafrica1.0@gmail.com">synqafrica1.0@gmail.com</a>.</p>
        </section>
      </div>
    </main>
  );
}
