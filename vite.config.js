import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/* import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); */

// https://vitejs.dev/config/
export default defineConfig({
  /* base: path.resolve(__dirname, './dist'), */
  plugins: [vue()],
})
