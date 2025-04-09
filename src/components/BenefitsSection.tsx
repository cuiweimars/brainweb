import React from 'react';
import { useTranslation } from 'react-i18next';

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: '🧠',
    title: 'benefit_1_title',
    description: 'benefit_1_description',
  },
  {
    icon: '⚡',
    title: 'benefit_2_title',
    description: 'benefit_2_description',
  },
  {
    icon: '🎯',
    title: 'benefit_3_title',
    description: 'benefit_3_description',
  },
];

const BenefitsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="mb-12 rounded-xl bg-white p-8 shadow-md dark:bg-gray-800">
      <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white capitalize">
        {t('Benefits Of Brain Training')}
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-lg bg-gray-50 p-6 transition-all duration-300 hover:shadow-lg dark:bg-gray-700"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-primary-600/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-4 text-4xl">{benefit.icon}</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {t(benefit.title)}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t(benefit.description)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BenefitsSection; 