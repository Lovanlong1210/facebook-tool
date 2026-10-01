# 🚀 Facebook Tool - Automation Suite Pro

> **Nền tảng tự động hóa quản lý, lên lịch và xuất bản bài viết đa Fanpage Facebook chuyên nghiệp với Meta Graph API v19.0 & AI Studio.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-Database-red?style=for-the-badge&logo=microsoftsqlserver)](https://www.microsoft.com/sql-server)
[![Redis](https://img.shields.io/badge/Redis-Queue%20BullMQ-critical?style=for-the-badge&logo=redis)](https://redis.io/)
[![Facebook API](https://img.shields.io/badge/Meta%20Graph%20API-v19.0-blue?style=for-the-badge&logo=facebook)](https://developers.facebook.com/)

---

## 🌟 Giới thiệu tổng quan

**Facebook Tool Automation Suite** là giải pháp toàn diện dành cho các nhà tiếp thị, quản trị viên Fanpage và doanh nghiệp kinh doanh trực tuyến. Hệ thống giúp đồng bộ quản trị nhiều kênh Fanpage, tự động hóa quy trình lên lịch xuất bản bài đăng, định dạng phông chữ nghệ thuật Facebook, chèn emoji & hashtag thông minh và theo dõi hiệu suất theo thời gian thực.

---

## 🚀 Tính năng nổi bật

### 1. ✍️ Bộ Soạn Thảo Bài Viết Đa Năng (Rich Post Editor)
* **Chuyển đổi phông chữ Facebook nghệ thuật (Unicode):**
  * Hỗ trợ **In đậm Sans**, **In đậm Serif**, *In nghiêng*, ***Đậm nghiêng***, `Máy đánh chữ`, Ⓑⓞⓝⓖ ⓑó, 🅑🅞🅧🅔🅓, 𝔊𝔬𝔱𝔥𝔦𝔠, Gạch ngang (S̶t̶r̶i̶k̶e̶), Gạch chân (U̲n̲d̲e̲r̲l̲i̲n̲e̲)...
  * Cho phép bôi đen đoạn văn bản bất kỳ để đổi font riêng hoặc đổi toàn bộ nội dung.
* **Kho biểu tượng cảm xúc (Emoji):** Hơn 100+ icon phân loại theo chủ đề: Bán hàng, Hotline/Liên hệ, Mũi tên dẫn hướng, Cảm xúc thịnh hành.
* **Gợi ý Hashtag & Mẫu chữ ký (CTA):** Chèn nhanh hashtag viral và thông tin hotline, địa chỉ, ưu đãi chỉ với một cú click.
* **Trợ lý AI Studio:** Hỗ trợ viết bài tự động theo chủ đề hoặc từ khóa được cung cấp.
* **Bộ đếm ký tự & từ thời gian thực:** Quản lý độ dài bài viết chính xác.

### 2. 📱 Xem Trước Facebook Trực Tiếp (Live Facebook Feed Preview)
* Mô phỏng chân thực bài đăng trên bảng tin Facebook ngay lúc soạn thảo: Logo trang, Tích xanh, Header, Khung hiển thị Hình ảnh / Video, cùng các nút Thích, Bình luận, Chia sẻ.

### 3. 📅 Lên Lịch & Quản Trị Hàng Đợi (Queue BullMQ + Redis)
* Lên lịch xuất bản chính xác theo ngày giờ mong muốn.
* Hàng đợi BullMQ công suất cao, tự động thử lại khi gặp sự cố mạng hoặc giới hạn tạm thời từ Meta.
* Chế độ xuất bản ngay lập tức (1-Click Publish) hoặc xuất bản hàng loạt qua tệp Excel.

### 4. 🔗 Quản Lý Kênh & Kết Nối Đa Dạng
* **Đăng nhập nhanh 1-Click:** Truy cập ngay workspace quản trị mà không bị gián đoạn.
* **Kết nối Meta OAuth v19.0:** Đăng nhập trực tiếp bằng tài khoản Facebook bảo mật cao.
* **Kết nối qua Facebook User Access Token / Page Access Token.**

### 5. 🎨 Giao Diện Tươi Sáng & Chuyên Nghiệp (Light SaaS Aesthetic)
* Thiết kế hiện đại theo chuẩn quốc tế (Stripe, Linear UI).
* Tông màu trắng sáng thanh lịch, độ tương phản cao, trải nghiệm mượt mà trên cả máy tính lẫn thiết bị di động.

---

## 🛠️ Công nghệ sử dụng

| Tầng công nghệ | Công cụ / Thư viện |
| :--- | :--- |
| **Frontend** | [Next.js](https://nextjs.org/) (React 18), [Lucide React](https://lucide.dev/), Axios, Vanilla CSS / CSS-in-JS |
| **Backend** | [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/), Cookie-Session |
| **Hàng đợi & Worker** | [BullMQ](https://docs.bullmq.io/) & [Redis](https://redis.io/) |
| **Cơ sở dữ liệu** | [Microsoft SQL Server](https://www.microsoft.com/sql-server) (qua thư viện `mssql`) |
| **Tích hợp bên ngoài** | [Facebook Graph API v19.0](https://developers.facebook.com/docs/graph-api) |

---

## 📁 Cấu trúc thư mục

```text
facebook_Tool/
├── client/                     # Mã nguồn Frontend (Next.js)
│   ├── src/
│   │   ├── components/
│   │   │   ├── brand/          # Logo & nhận diện thương hiệu
│   │   │   ├── layout/         # Layout chính (Sidebar, Topbar)
│   │   │   └── planner/        # RichPostEditor & FacebookFeedPreview
│   │   ├── pages/
│   │   │   ├── channels/       # Quản lý danh sách Fanpage
│   │   │   ├── post-planner/   # Soạn bài, lịch đăng, danh sách bài
│   │   │   ├── index.jsx       # Trang giới thiệu (Landing Page)
│   │   │   └── login.jsx       # Màn hình đăng nhập đa kênh
│   │   ├── services/           # Axios API client
│   │   ├── styles/             # Global CSS
│   │   └── utils/              # Font converter & Emoji database
│   └── package.json
│
├── server/                     # Mã nguồn Backend API (Express.js)
│   ├── queues/                 # Hàng đợi đăng bài BullMQ (post.queue & post.worker)
│   ├── src/
│   │   ├── middlewares/        # Xác thực phiên, bảo mật
│   │   ├── utils/              # Token Exchange & Facebook Page Connections
│   │   └── app.js              # Khởi tạo API Server Express
│   ├── .env.example            # Mẫu biến môi trường Backend
│   └── package.json
│
├── docker-compose.yml          # Triển khai Redis / SQL Server qua Docker
├── launcher.ps1                # Script khởi chạy PowerShell 1-Click
├── start.bat                   # File khởi động nhanh trên Windows
├── stop.bat                    # File dừng toàn bộ hệ thống
└── README.md
```

---

## ⚡ Hướng dẫn cài đặt & Chạy ứng dụng

### 1. Yêu cầu hệ thống
* **Node.js** phiên bản 18.x trở lên
* **Redis** (dành cho hàng đợi BullMQ, cổng mặc định `6379`)
* **SQL Server** (cổng mặc định `1433`)

### 2. Cài đặt các gói phụ thuộc

```bash
# Cài đặt phụ thuộc cho Client
cd client
npm install

# Cài đặt phụ thuộc cho Server
cd ../server
npm install
```

### 3. Cấu hình biến môi trường
Tạo tệp `server/.env` dựa trên `server/.env.example`:

```env
CLIENT_ORIGIN=http://localhost:3000
PORT=5000

# Meta Developer App
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_REDIRECT_URI=http://localhost:5000/api/auth/facebook/callback
FACEBOOK_LOGIN_SCOPES=public_profile,pages_show_list,pages_manage_posts,pages_read_engagement

# Session & Bảo mật
SESSION_SECRET=your_super_secret_session_key_32_chars
COOKIE_SECURE=false

# Cấu hình SQL Server
DB_USER=sa
DB_PASSWORD=your_password
DB_SERVER=localhost
DB_NAME=FacebookWorkspace
DB_PORT=1433

# Cấu hình Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### 4. Khởi động ứng dụng

#### Cách 1: Khởi động 1-Click trên Windows
Nhấp đúp chuột vào tệp **`start.bat`** ở thư mục gốc để tự động khởi chạy cả Backend (Port 5000) và Frontend (Port 3000).

#### Cách 2: Khởi động thủ công bằng Terminal

* **Khởi động Backend:**
```bash
cd server
npm run dev
# Máy chủ Backend sẽ lắng nghe tại: http://localhost:5000
```

* **Khởi động Frontend:**
```bash
cd client
npm run dev
# Ứng dụng giao diện sẽ sẵn sàng tại: http://localhost:3000
```

---

## 🔑 Hướng dẫn tạo Facebook Developer App

1. Truy cập [Facebook Developers](https://developers.facebook.com/) và đăng nhập tài khoản của bạn.
2. Chọn **Tạo ứng dụng** > Chọn loại **Doanh nghiệp (Business)** hoặc **Khác (Other)**.
3. Trong mục **Cài đặt sản phẩm**, chọn **Đăng nhập bằng Facebook (Facebook Login)**:
   * Thêm URL chuyển hướng hợp lệ: `http://localhost:5000/api/auth/facebook/callback`
4. Vào **Cài đặt ứng dụng** > **Thông thường (Basic)**:
   * Sao chép **ID ứng dụng (App ID)** và **Khóa bí mật (App Secret)** vào tệp `.env`.
5. Trong mục **Quyền và tính năng (Permissions)**, thêm các quyền sau cho Fanpage:
   * `pages_show_list`: Liệt kê các Fanpage bạn quản lý.
   * `pages_manage_posts`: Đăng và lên lịch bài viết lên Fanpage.
   * `pages_read_engagement`: Đọc thông tin tương tác Fanpage.

---

## 🤝 Đóng góp & Giấy phép

* Mọi đóng góp, báo cáo lỗi (Issues) hoặc yêu cầu tính năng (Pull Requests) đều được hoan nghênh.
* Bản quyền thuộc về tác giả. Dự án được phân phối dưới giấy phép **MIT License**.
