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
## 2025-09-16 — Fix search API error: "Incorrect arguments to mysqld_stmt_execute"

Context:
- Error observed in logs when calling GET /csie/backend2/api/search/projects: "Incorrect arguments to mysqld_stmt_execute".
- Root cause: MySQL server prepared statements do not accept placeholders for LIMIT/OFFSET reliably in some environments, leading to a mismatch between SQL placeholders and bound parameters.

Changes applied:
1) Updated [searchProjects()](csi-showcase_backend/src/services/searchService.js:7)
   - Introduced sanitized pagination:
     - safeLimit min=1, max=100
     - safeOffset computed from page/safeLimit
   - Inlined LIMIT/OFFSET directly into SQL (removed LIMIT ? and OFFSET ? placeholders):
     - Before: LIMIT ? OFFSET ?
     - After: LIMIT ${safeLimit} OFFSET ${safeOffset}
   - Adjusted parameter binding:
     - Removed trailing limit/offset params array entries to keep parameter count aligned with placeholders
   - Ensured pagination calculation uses [getPaginationInfo()](csi-showcase_backend/src/constants/pagination.js:19) with safeLimit

   Touch points:
   - Declared sanitizers near pagination parsing (top of function)
   - Modified selectQuery builder to inline LIMIT/OFFSET
   - selectParams now equals [...queryParams] only
   - Pagination info call updated to safeLimit

2) Searched repo for other prepared LIMIT/OFFSET placeholders
   - Used regex search for "LIMIT ?" or "OFFSET ?" across backend
   - No other occurrences found (other modules inline integers already)

Rationale:
- Prevents prepared statement param-count mismatch and improves cross-environment compatibility (not all MySQL setups accept placeholders for LIMIT/OFFSET).
- Keeps SQL injection safety: LIMIT/OFFSET are sanitized integers; all dynamic text continues to use placeholders.

Verification (recommended):
- Local: Ensure backend connects to a reachable DB (current .env uses a remote DB which may be firewalled for local dev). If necessary, point DB_HOST to a dev DB you control.
- Endpoint checks after deploy/restart:
  - GET {BASE_PREFIX}/api/search/projects?keyword=asd&amp;page=1&amp;limit=5
  - GET {BASE_PREFIX}/api/search/projects?page=1&amp;limit=10 (no keyword)
  - GET {BASE_PREFIX}/api/search/projects?type=coursework&amp;year=2024&amp;studyYear=3&amp;page=2&amp;limit=12
- Expect 200 OK with data and no "mysqld_stmt_execute" errors.
- Sanity: Compare total/pagination bounds vs items length.

Notes:
- Controller remains unchanged: [searchProjects()](csi-showcase_backend/src/controllers/user/searchController.js:10) still passes { page, limit }.
- DB connection health may block local verification; production/staging verification is advised immediately after deployment/restart.

Files touched:
- [csi-showcase_backend/src/services/searchService.js](csi-showcase_backend/src/services/searchService.js)