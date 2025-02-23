import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      buffer: 'buffer/',   // Buffer paketini doğru yönlendiriyoruz
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis', // Vite ile uyumlu global kullanım
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ]
    }
  }
});
