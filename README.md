# RNI Multi-Survey System

Hệ thống khảo sát đa survey — thêm survey mới chỉ bằng 1 file config, không cần đụng vào code.

## Cấu trúc
```
rni-multi-survey/
├── surveys/
│   ├── index.js                ← Registry: đăng ký survey ở đây
│   ├── tieng-noi-tu-tam.js     ← Config survey #1
│   ├── ap-luc-cong-viec.js     ← Config survey #2 (mẫu)
│   └── [survey-moi].js         ← Thêm survey mới vào đây
├── app/
│   ├── page.js                 ← Trang chủ danh sách surveys
│   ├── surveys/[slug]/page.js  ← Dynamic route tự động
│   └── api/submit/route.js     ← API nhận form → Google Sheets
├── components/
│   └── SurveyClient.js         ← Engine render mọi loại câu hỏi
└── lib/
    └── sheets.js               ← Google Sheets helper
```

## URLs
- `/` → Danh sách tất cả surveys
- `/surveys/tieng-noi-tu-tam` → Survey #1
- `/surveys/ap-luc-cong-viec` → Survey #2
- `/surveys/[slug-moi]` → Survey mới (tự động)

---

## Tạo survey mới (3 bước)

### Bước 1 — Tạo file config
Copy file `surveys/tieng-noi-tu-tam.js`, đặt tên theo slug URL:
```
surveys/ten-survey-moi.js
```

Sửa nội dung: `slug`, `title`, `description`, `color`, `sheetEnvKey`, `questions`.

**4 loại câu hỏi:**
- `chips` — chọn nhiều (tag)
- `radio` — chọn một
- `scale` — thang điểm 1–5
- `textarea` — nhập tự do

### Bước 2 — Đăng ký vào registry
Mở `surveys/index.js`, thêm 2 dòng:
```js
import tenSurveyMoi from './ten-survey-moi'

const registry = [
  tiengNoiTuTam,
  apLucCongViec,
  tenSurveyMoi,   // ← thêm ở đây
]
```

### Bước 3 — Thêm biến môi trường
Tạo Google Sheet mới, share cho service account, lấy Sheet ID.

Thêm vào Vercel Dashboard → Environment Variables:
```
GOOGLE_SHEET_ID_TEN_SURVEY_MOI=your_sheet_id
```

**Xong!** Survey mới tự động có tại `/surveys/ten-survey-moi`.

---

## Setup lần đầu

### 1. Google Service Account
1. Vào [console.cloud.google.com](https://console.cloud.google.com)
2. Bật **Google Sheets API**
3. Tạo Service Account → tải file JSON credentials
4. Lấy `client_email` và `private_key` từ file JSON

### 2. Cấu hình môi trường
```bash
cp .env.local.example .env.local
# Điền đầy đủ các giá trị
```

### 3. Chạy local
```bash
npm install
npm run dev
```

### 4. Deploy Vercel
```bash
git init && git add . && git commit -m "init"
# Push lên GitHub → Import vào Vercel
# Thêm tất cả biến môi trường vào Vercel Dashboard
```
