// ecosystem.config.js
export default {
  apps: [{
    name: "csi-showcase_backend",
    script: "./src/app.js",  // เส้นทางไปยังไฟล์เริ่มต้นของแอพคุณ
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 3000  // ปรับพอร์ตตามที่คุณต้องการ
    }
  }]
};