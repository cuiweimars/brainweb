/// <reference types="react-scripts" />

// Adding type definitions for react-i18next
import 'react-i18next';
import { ResourceKey } from 'i18next';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: {
        [key: string]: string;
      };
    };
  }
}

// Add a more explicit type for the t function
declare module 'i18next' {
  interface TFunction {
    (key: string | string[], options?: any): string;
  }
}

declare module '*.json' {
  const value: any;
  export default value;
}
