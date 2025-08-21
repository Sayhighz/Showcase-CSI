# Emergency Fix for 503 Error on Production

## 1. ตรวจสอบ Database Connection บน Production

SSH เข้า server แล้วทดสอบ:

```bash
# ทดสอบ connection จาก command line
mysql -h localhost -u zulpszwh_csie -p'Liuxm6,' -D zulpszwh_db_e -e "SELECT 1"

# ถ้าใช้ localhost ไม่ได้ ลองใช้ 127.0.0.1
mysql -h 127.0.0.1 -u zulpszwh_csie -p'Liuxm6,' -D zulpszwh_db_e -e "SELECT 1"
```

## 2. แก้ไข .env บน Production

```env
# เปลี่ยน NODE_ENV เป็น production
NODE_ENV=production

# ลองเปลี่ยน DB_HOST
DB_HOST=127.0.0.1  # แทนที่จะใช้ localhost

# หรือถ้าใช้ socket connection
DB_HOST=/var/lib/mysql/mysql.sock

# ลด connection limit
DB_CONNECTION_LIMIT=3
DB_TIMEOUT=5000
```

## 3. Restart Node.js Application

ใน cPanel:
1. ไปที่ "Setup Node.js App"
2. หา application ของคุณ
3. คลิก "Restart"

หรือผ่าน SSH:
```bash
# หา process
ps aux | grep node

# Kill process เก่า
kill -9 [PID]

# Start ใหม่
cd /home/[username]/[app-directory]
npm start
```

## 4. ตรวจสอบ Error Log

```bash
# ดู error log
tail -f /home/[username]/logs/nodejs.log

# หรือดูใน cPanel > Errors
```

## 5. Quick Fix - ใช้ Connection String แทน

แก้ไข `src/config/database.js`:

```javascript
const mysql = require('mysql2');

// ใช้ connection string โดยตรง
const connectionString = 'mysql://zulpszwh_csie:Liuxm6,@localhost:3306/zulpszwh_db_e';

const pool = mysql.createPool(connectionString + '?waitForConnections=true&connectionLimit=3&queueLimit=0');
```

## 6. Alternative - ใช้ Unix Socket

```javascript
const dbConfig = {
  socketPath: '/var/lib/mysql/mysql.sock',  // หรือ /tmp/mysql.sock
  user: 'zulpszwh_csie',
  password: 'Liuxm6,',
  database: 'zulpszwh_db_e',
  connectionLimit: 3,
  waitForConnections: true,
  queueLimit: 0
};
```

## 7. Deploy Code ใหม่

1. Upload ไฟล์ที่แก้ไข:
   - `server.js`
   - `src/config/database.js`
   - `src/controllers/user/projectController.js`
   - `.htaccess`

2. ผ่าน Git:
```bash
git add .
git commit -m "Fix 503 error - database connection"
git push origin main
```

3. ใน cPanel pull code:
```bash
cd /home/[username]/[app-directory]
git pull
npm install --production
```

## 8. Test Endpoints

```bash
# Test health
curl https://sitspu.com/csie/backend2/health

# Test database (หลัง deploy code ใหม่)
curl https://sitspu.com/csie/backend2/api/test-db

# Test actual endpoint
curl https://sitspu.com/csie/backend2/api/projects/top9
```

## 9. ถ้ายังไม่ได้ - ใช้ PM2

```bash
# Install PM2
npm install -g pm2

# Start app with PM2
pm2 start server.js --name csi-backend

# Save PM2 config
pm2 save
pm2 startup

# Monitor
pm2 monit
```

## 10. Contact Hosting Support

ถ้ายังแก้ไม่ได้ ติดต่อ hosting support พร้อมข้อมูล:
- Database connection ทำงานผ่าน phpMyAdmin ได้หรือไม่
- มี firewall rule block port 3306 หรือไม่
- มี connection limit ของ database หรือไม่
- Node.js version ที่ใช้