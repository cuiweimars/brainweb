import React from 'react';
import { useTranslation } from 'react-i18next';

const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {t('Privacy Policy')}
      </h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          Last updated: January 15, 2024
        </p>
        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          BrainWeb Inc. ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by BrainWeb.
        </p>
        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          This Privacy Policy applies to our website, and its associated subdomains (collectively, our "Service") alongside our application, BrainWeb. By accessing or using our Service, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy and our Terms of Service.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('1. Information We Collect')}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">1.1 Information you provide to us</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We collect information you provide directly to us when you:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Create or modify your account</li>
            <li>Complete a form on our Service</li>
            <li>Communicate with us via third-party social media sites</li>
            <li>Request customer support</li>
            <li>Otherwise communicate with us</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            The types of information we may collect include your name, email address, username, password, profile picture, game preferences, game scores, and any other information you choose to provide.
          </p>

          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3 mt-6">1.2 Information we collect automatically</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            When you access or use our Service, we automatically collect certain information, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li><strong>Log Information:</strong> We collect log information about your use of the Service, including the type of browser you use, access times, pages viewed, your IP address, and the page you visited before navigating to our Service.</li>
            <li><strong>Device Information:</strong> We collect information about the computer or mobile device you use to access our Service, including the hardware model, operating system and version, unique device identifiers, and mobile network information.</li>
            <li><strong>Usage Information:</strong> We collect information about your usage of the Service, such as the games you play, how often you play them, your scores, achievements, and other statistics.</li>
            <li><strong>Location Information:</strong> We may collect information about the approximate location of your device based on your IP address.</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            We use various technologies to collect information automatically, including cookies, web beacons, and similar technologies.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('2. How We Use Your Information')}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6 space-y-2">
            <li>Provide, maintain, and improve our Service</li>
            <li>Process and complete transactions, and send you related information, including purchase confirmations and invoices</li>
            <li>Send you technical notices, updates, security alerts, and support and administrative messages</li>
            <li>Respond to your comments, questions, and requests, and provide customer service</li>
            <li>Communicate with you about products, services, offers, promotions, and events, and provide other news or information about BrainWeb and our partners</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our Service</li>
            <li>Personalize and improve the Service and provide content, features, or advertisements that match user profiles or interests</li>
            <li>Facilitate contests, sweepstakes, and promotions and process and deliver entries and rewards</li>
            <li>Link or combine with information we get from others to help understand your needs and provide you with better service</li>
            <li>Carry out any other purpose for which the information was collected</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            BrainWeb is based in the United States, and the information we collect is governed by U.S. law. By accessing or using the Service or otherwise providing information to us, you consent to the processing and transfer of information in and to the U.S. and other countries.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('3. Sharing of Information')}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We may share personal information about you as follows:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>With vendors, consultants, and other service providers who need access to such information to carry out work on our behalf</li>
            <li>In response to a request for information if we believe disclosure is in accordance with any applicable law, regulation, or legal process, or as otherwise required by any applicable law, rule, or regulation</li>
            <li>If we believe your actions are inconsistent with the spirit or language of our user agreements or policies, or to protect the rights, property, and safety of BrainWeb or others</li>
            <li>In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company</li>
            <li>With your consent or at your direction, including if we notify you through our Service that the information you provide will be shared in a particular manner and you provide such information</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We may also share aggregated or de-identified information, which cannot reasonably be used to identify you.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('4. Cookies and Similar Technologies')}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            Most web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove or reject browser cookies. Please note that if you choose to remove or reject cookies, this could affect the availability and functionality of our Service.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            We use cookies and similar technologies to track and analyze usage and to enhance user experience on our platform. These technologies help us understand which features are most popular, count visitor numbers, and improve the website's overall functionality.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('5. Data Retention')}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We store the information we collect about you for as long as is necessary for the purpose(s) for which we originally collected it. We may retain certain information for legitimate business purposes or as required by law.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('6. Your Choices')}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">6.1 Account Information</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            You may update, correct, or delete information about you at any time by logging into your online account and modifying your information or by emailing us at privacy@brainweb.com. If you wish to delete or deactivate your account, please email us at privacy@brainweb.com, but note that we may retain certain information as required by law or for legitimate business purposes. We may also retain cached or archived copies of information about you for a certain period of time.
          </p>

          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">6.2 Promotional Communications</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            You may opt out of receiving promotional emails from BrainWeb by following the instructions in those emails or by adjusting the appropriate settings in your profile preferences. If you opt out, we may still send you non-promotional communications, such as those about your account or our ongoing business relations.
          </p>

          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">6.3 Your Data Protection Rights Under GDPR</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            If you are a resident of the European Economic Area (EEA), you have certain data protection rights. BrainWeb aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            If you wish to be informed what Personal Data we hold about you and if you want it to be removed from our systems, please contact us at privacy@brainweb.com.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('7. Changes to this Privacy Policy')}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('8. Contact Us')}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at privacy@brainweb.com.
          </p>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage; 