import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smartspend.app',
  appName: 'SmartSpend',
  webDir: 'out',
  server: {
    url: 'https://expense-tracker-five-mu-77.vercel.app/',
    androidScheme: 'https'
  }
};

export default config;
