
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 브라우저 환경에서 process.env 참조 에러 방지
    'process.env': {}
  }
});
