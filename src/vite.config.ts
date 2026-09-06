import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { mkdirSync, writeFileSync } from 'fs';

function wpAssetPlugin() {
  return {
    name: 'wp-asset-php',
    writeBundle() {
      const dir = resolve(__dirname, '../assets/js');
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        resolve(dir, 'lipishilpo-pro-editor.asset.php'),
        `<?php\nreturn array(\n\t'dependencies' => array(),\n\t'version' => '${Date.now()}',\n);\n`
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), wpAssetPlugin()],
  build: {
    outDir: '../assets',
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, 'main.tsx'),
      output: {
        entryFileNames: 'js/lipishilpo-pro-editor.js',
        chunkFileNames: 'js/lipishilpo-pro-[name].js',
        assetFileNames: 'js/[name][extname]',
      },
    },
    target: 'es2020',
    sourcemap: false,
  },
  publicDir: false,
});
