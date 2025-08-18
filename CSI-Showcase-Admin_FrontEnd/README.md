# CSI ProjectManage

ระบบจัดการผลงานนักศึกษา สำหรับคณะวิทยาการคอมพิวเตอร์และสารสนเทศ

## คุณสมบัติหลัก

- **สำหรับนักศึกษา:**
  - อัปโหลดและจัดการผลงานส่วนตัว
  - ติดตามสถานะการอนุมัติ
  - ดูสถิติและการเข้าชมผลงาน
  - แดชบอร์ดส่วนตัว

- **สำหรับผู้ดูแลระบบ:**
  - อนุมัติและตรวจสอบผลงาน
  - จัดการผู้ใช้งาน
  - ดูรายงานและสถิติระบบ
  - จัดการข้อมูลผลงานทั้งหมด

## เทคโนโลยีที่ใช้

- **Frontend:** React 19 + Vite
- **UI Framework:** Ant Design
- **Styling:** Tailwind CSS
- **State Management:** React Context
- **Authentication:** JWT
- **Charts:** Recharts

## การติดตั้งและใช้งาน

### ข้อกำหนดเบื้องต้น
- Node.js 18+ 
- npm หรือ yarn

### การติดตั้ง

```bash
# Clone repository
git clone [repository-url]
cd CSI-Showcase-Admin_FrontEnd

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ environment
cp .env.example .env

# แก้ไขค่าใน .env ตามความเหมาะสม
```

### การรันโปรเจค

```bash
# Development mode
npm run dev

# Build สำหรับ production
npm run build

# Preview build
npm run preview
```

## โครงสร้างโปรเจค

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── common/         # Shared components
│   ├── dashboard/      # Dashboard components
│   ├── projects/       # Project management components
│   └── users/          # User management components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── layouts/            # Layout components
├── pages/              # Page components
├── services/           # API services
├── utils/              # Utility functions
└── constants/          # Constants and configurations
```

## การพัฒนา

### Code Style
- ใช้ ESLint สำหรับ code linting
- ใช้ Prettier สำหรับ code formatting
- ตั้งชื่อไฟล์และ component ด้วย PascalCase
- ใช้ camelCase สำหรับ variables และ functions

### Git Workflow
- สร้าง branch ใหม่สำหรับ feature แต่ละตัว
- ใช้ commit message ที่ชัดเจน
- สร้าง Pull Request สำหรับการ merge

## การ Deploy

โปรเจคนี้สามารถ deploy ได้บน:
- Vercel
- Netlify  
- GitHub Pages
- หรือ web server ทั่วไป

## License

MIT License
