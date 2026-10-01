# 📘 Facebook Tool - Tự Động Quản Lý & Lên Lịch Đăng Bài Fanpage

> Công cụ quản lý đa Fanpage, soạn thảo bài viết với phông chữ nghệ thuật, chèn biểu tượng cảm xúc và tự động lên lịch xuất bản bài đăng lên Facebook.

---

## ✨ Tính năng chính

* ✍️ **Soạn bài thông minh:**
  * **Đổi phông chữ Facebook:** In đậm, in nghiêng, gạch chân, chữ nghệ thuật (Unicode hiển thị trực tiếp trên Facebook).
  * **Chèn Icon / Emoji:** Bảng biểu tượng cảm xúc phân loại theo chủ đề bán hàng, cảm xúc, liên hệ.
  * **Hashtag & Chữ ký mẫu:** Thêm nhanh hashtag xu hướng và thông tin liên hệ / hotline chỉ với 1 click.
* 👁️ **Xem trước trực tiếp (Live Preview):** Hiển thị giao diện bài viết y như trên Newsfeed Facebook thật ngay khi đang gõ.
* ⏰ **Lên lịch đăng bài tự động:** Chọn ngày giờ xuất bản chính xác, hệ thống tự động đăng bài theo hàng đợi thông minh.
* 📑 **Quản lý đa Fanpage:** Kết nối và đồng bộ nhiều Fanpage trên cùng một giao diện làm việc.
* ☀️ **Giao diện tươi sáng, hiện đại:** Thiết kế chuyên nghiệp, trực quan, dễ sử dụng.

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy nhanh

### Bước 1: Cài đặt thư viện
Mở Terminal trong thư mục dự án và chạy:

```bash
# Cài đặt cho Client
cd client
npm install

# Cài đặt cho Server
cd ../server
npm install
```

### Bước 2: Cấu hình tệp môi trường
Tạo tệp `.env` trong thư mục `server/` (tham khảo `server/.env.example`):

```env
CLIENT_ORIGIN=http://localhost:3000
PORT=5000

# Thông tin Meta App của bạn
FACEBOOK_APP_ID=id_ung_dung_cua_ban
FACEBOOK_APP_SECRET=ma_bi_mat_cua_ban
FACEBOOK_REDIRECT_URI=http://localhost:5000/api/auth/facebook/callback

# Phiên đăng nhập
SESSION_SECRET=khoa_bi_mat_32_ky_tu_ngau_nhien
COOKIE_SECURE=false

# Cấu hình CSDL SQL Server & Redis
DB_USER=sa
DB_PASSWORD=mat_khau_sql
DB_SERVER=localhost
DB_NAME=FacebookWorkspace
DB_PORT=1433

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### Bước 3: Khởi chạy ứng dụng

* **Cách 1 (Nhanh nhất trên Windows):** Bấm đúp chuột vào tệp **`start.bat`** ở thư mục gốc để mở cả hệ thống.
* **Cách 2 (Khởi chạy bằng lệnh):**
  * Chạy Server: `cd server && npm run dev` (cổng `5000`)
  * Chạy Client: `cd client && npm run dev` (truy cập `http://localhost:3000`)

---

## 🛠️ Công nghệ sử dụng

* **Frontend:** Next.js (React), Lucide Icons, CSS hiện đại.
* **Backend:** Node.js, Express.js, BullMQ, Redis.
* **Cơ sở dữ liệu:** Microsoft SQL Server.
* **Kết nối:** Meta Graph API v19.0.

---

## 📄 Bản quyền

Dự án được phát triển phục vụ tự động hóa quản lý nội dung Fanpage Facebook. Giấy phép mã nguồn mở MIT.
