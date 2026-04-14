import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 1. 外部（トンネル）からのアクセスを待機
    host: true,
    
    // 2. localhost.run のセキュリティブロックを回避
    // true に設定することで、すべてのホスト名からのアクセスを許可します
    allowedHosts: true, 
    
    proxy: {
      // 3. /api で始まるリクエストをバックエンド（3000番）に転送
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        ws: true,
        // Webhookの受け取り側が「/api/webhooks/...」を期待しているなら
        // このままでOKです（rewriteは不要）
      },
    },
    // HMR（ホットリロード）がトンネル越しでも動くようにする設定（念のため）
    hmr: {
      clientPort: 443,
    },
  },
});