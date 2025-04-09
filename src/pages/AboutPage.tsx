import React from 'react';
import { useTranslation } from 'react-i18next';

const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          {t('About BrainWeb')}
        </h1>
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 rounded-2xl p-8 shadow-md">
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed text-center">
            {t('BrainWeb is a platform dedicated to enhancing cognitive abilities through engaging, science-backed brain training games. Our mission is to make brain development fun, accessible, and effective for everyone, everywhere.')}
          </p>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
          {t('Our Mission')}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            {t("At BrainWeb, we believe that cognitive development should be part of everyone's daily routine. Our platform offers a wide range of games designed to challenge your mind, improve various cognitive skills, and make learning enjoyable.")}
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {t("We're committed to creating a global community where users of all ages can develop their mental abilities while having fun. Whether you're looking to improve memory, enhance focus, boost logical thinking, strengthen mathematical skills, or develop language capabilities, BrainWeb has something for you.")}
          </p>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
          {t('Our Story')}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            {t('BrainWeb was founded in 2020 by a team of cognitive neuroscientists, educational psychologists, and game developers who shared a vision: to transform how people approach brain training and cognitive development.')}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            {t('We noticed that many existing brain training platforms were either too clinical, lacking engagement, or not based on solid scientific principles. We set out to create something different – a platform that combines rigorous cognitive science with entertaining gameplay.')}
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {t('Starting with just a handful of games, BrainWeb has grown into a comprehensive platform offering hundreds of activities across multiple cognitive domains. Today, we serve millions of users worldwide and continue to expand our offerings based on the latest research in neuroscience and cognitive psychology.')}
          </p>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
          {t('The Science Behind BrainWeb')}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            {t("All games on BrainWeb are developed with input from experts in cognitive neuroscience, ensuring they target specific cognitive functions effectively. We utilize principles of neuroplasticity – the brain's ability to reorganize itself by forming new neural connections throughout life.")}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            {t("Our games implement proven cognitive training techniques like spaced repetition, adaptive difficulty, and varied practice. Each game on our platform is designed to challenge your brain in specific ways, creating the right amount of cognitive load to promote development without causing frustration.")}
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {t('We continually update our games based on user feedback and new research findings, ensuring that BrainWeb remains at the cutting edge of cognitive science and educational technology.')}
          </p>
        </div>
      </section>

    </div>
  );
};

export default AboutPage; 