import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sotobe.eats',
  appName: 'Sotobe Eats',
  webDir: 'public',
  server: {
    androidScheme: 'https',
    url: 'https://omni-eats-f8p8.vercel.app',
    cleartext: false
  }
};

export default config;
