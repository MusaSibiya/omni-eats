import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sotobe.eats',
  appName: 'Sotobe Eats',
  webDir: 'public',
  server: {
    androidScheme: 'https',
    url: 'http://192.168.1.11:3000',
    cleartext: true
  }
};

export default config;
