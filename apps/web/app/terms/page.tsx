import React from 'react';

export const metadata = {
  title: 'Terms of Service — Synq',
  description: 'Terms and conditions for using Synq services.',
  openGraph: {
    title: 'Terms of Service — Synq',
    description: 'Terms and conditions for using Synq services.',
    url: 'https://synqdapp.com/terms',
    images: [{ url: '/opengraph-image.png', alt: 'Synq Terms' }],
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 py-16 px-6 sm:px-12 lg:px-28">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">Terms of Service</h1>
        <p className="text-gray-600 mb-6">Last updated: December 2025</p>

        <section className="prose prose-neutral mb-8">
          <p>
            These Terms of Service govern your use of Synq. By accessing or using the platform, you agree to these
            terms. If you do not agree, do not use the services.
          </p>

          <h2>Using the Service</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and for any activity that occurs
            under your account. Do not share private keys or credentials.
          </p>

          <h2>Acceptable Use</h2>
          <p>
            You agree not to use Synq for unlawful activities, to harass others, or to upload malicious content. We may
            suspend or terminate accounts that violate these rules.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            Content you create and post remains yours. By posting content, you grant Synq a license to host and display
            that content as necessary to operate the service.
          </p>

          <h2>Disclaimers & Limitation of Liability</h2>
          <p>
            The service is provided "as is" without warranties. Synq is not responsible for losses from blockchain
            transactions or the actions of other users. To the maximum extent permitted by law, our liability is
            limited.
          </p>

          <h2>Governing Law</h2>
          <p>These terms are governed by applicable laws in the jurisdictions where Synq operates.</p>

          <h2>Contact</h2>
          <p>Questions about these terms? Email <a href="mailto:synqafrica1.0@gmail.com">synqafrica1.0@gmail.com</a>.</p>
        </section>
      </div>
    </main>
  );
}
