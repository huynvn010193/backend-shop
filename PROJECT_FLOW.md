# Luồng hoạt động dự án Backend Shop

## 1. Tổng quan

Đây là REST API Node.js/Express kết nối MongoDB qua Mongoose. Mã nguồn được tách theo các lớp:

```text
Client
  -> Express app (app.js)
  -> Middleware chung
  -> Router
  -> Middleware xác thực / phân quyền (nếu endpoint yêu cầu)
  -> Validate request (nếu có)
  -> Model (xử lý truy vấn)
  -> Mongoose schema
  -> MongoDB Atlas
  -> JSON response
```

Các nhóm chức năng chính là `auth`, `users`, `product` và `category`.

## 2. Khởi động ứng dụng

File vào chính là `app.js`. Khi chạy `npm start`, Nodemon chạy ứng dụng ở cổng `4000` (hoặc giá trị biến môi trường `PORT`).

```text
npm start
  -> nodemon app.js
  -> kết nối MongoDB Atlas
  -> lắng nghe HTTP tại http://localhost:4000
```

Prefix chung cho toàn bộ API là:

```text
/api/v1
```

Ví dụ endpoint danh sách sản phẩm:

```text
GET http://localhost:4000/api/v1/product
```

## 3. Middleware chung

Trước khi request đi vào router, `app.js` chạy các middleware theo thứ tự:

1. `express.json()` — đọc JSON body.
2. `morgan("tiny")` — ghi log HTTP request.
3. `cors()` — cho phép request cross-origin.
4. `cookieParser()` — đọc cookie, dùng cho token đăng nhập.
5. `helmet()` — bổ sung các HTTP security headers.
6. `express-rate-limit` — giới hạn tối đa 100 request/IP trong 15 phút.
7. `sanitizeObject()` — làm sạch chuỗi trong `body`, `params`, `query` bằng `sanitize-html`.
8. Router `/api/v1/`.
9. Middleware 404 — request không khớp route sẽ trả `Not Found`.
10. `errorHandler` — chuẩn hóa lỗi thành JSON.

## 4. Điều hướng router

`app/routes/index.js` gắn các router con như sau:

| URL prefix | Router | Ghi chú |
| --- | --- | --- |
| `/api/v1/auth` | `app/routes/auth.js` | Đăng ký, đăng nhập và thông tin tài khoản |
| `/api/v1/product` | `app/routes/product.js` | Sản phẩm |
| `/api/v1/category` | `app/routes/category.js` | Danh mục và sản phẩm theo danh mục |
| `/api/v1/users` | `app/routes/users.js` | Toàn bộ router yêu cầu role `admin` |

Luồng chọn route:

```text
PUT /api/v1/product/even/like/:id
  -> app.js: /api/v1/
  -> routes/index.js: /product
  -> routes/product.js: PUT /even/:type/:id
```

Nếu sai HTTP method, sai prefix hoặc sai tên path (ví dụ gọi `/event/...` trong khi code khai báo `/even/...`), request sẽ không vào handler và nhận `404 Not Found`.

## 5. Xác thực và phân quyền

Các endpoint cần đăng nhập dùng middleware `protect` trong `app/middleware/auth.js`.

```text
Request
  -> lấy JWT từ Authorization: Bearer <token>
     hoặc cookie token
  -> jwt.verify(token, JWT_SECRET)
  -> lấy user từ database, gán vào req.user
  -> next()
```

Middleware `authorize("publisher", "admin")` kiểm tra `req.user.role`:

```text
role hợp lệ       -> cho phép vào handler
không hợp lệ      -> 403
thiếu/sai token   -> 401
```

## 6. Luồng Product

| Method | Endpoint | Quyền | Chức năng |
| --- | --- | --- | --- |
| `GET` | `/api/v1/product` | Không | Danh sách sản phẩm; hỗ trợ lọc, `select`, `sort`, `page`, `limit` |
| `GET` | `/api/v1/product/:id` | Không | Lấy một sản phẩm |
| `POST` | `/api/v1/product/add` | `publisher`, `admin` | Tạo sản phẩm |
| `PUT` | `/api/v1/product/edit/:id` | `publisher`, `admin` | Cập nhật sản phẩm |
| `DELETE` | `/api/v1/product/delete/:id` | `publisher`, `admin` | Xóa sản phẩm |
| `PUT` | `/api/v1/product/even/:type/:id` | `publisher`, `admin` | Cập nhật lượt like |

### Luồng cập nhật like

```text
PUT /api/v1/product/even/like/:id
  -> protect
  -> authorize("publisher", "admin")
  -> MainModel.even({ id, type: "like" })
  -> Product.findByIdAndUpdate(id, { $inc: { like: 1 } }, { new: true })
  -> trả product sau khi cập nhật
```

Trong code hiện tại, `type=dislike` không cập nhật field `dislike` vì schema Product không có field này. Nó được chuyển thành giảm field `like` đi 1:

```text
PUT /api/v1/product/even/dislike/:id
  -> $inc: { like: -1 }
```

Tên `even` có thể là lỗi chính tả của `event`. Nếu muốn URL là `/event/...`, cần đổi trực tiếp path router từ `"/even/:type/:id"` sang `"/event/:type/:id"`.

## 7. Luồng Auth

| Method | Endpoint | Chức năng |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Validate và tạo người dùng; trả JWT qua body và cookie |
| `POST` | `/api/v1/auth/login` | Kiểm tra thông tin đăng nhập; trả JWT qua body và cookie |
| `GET` | `/api/v1/auth/me` | Lấy user hiện tại; cần token |
| `POST` | `/api/v1/auth/forgotpassword` | Tạo/gửi luồng quên mật khẩu |
| `POST` | `/api/v1/auth/resetPassword/:resetToken` | Đặt lại mật khẩu |
| `GET` | `/api/v1/auth/logout` | Ghi đè cookie token để đăng xuất; cần token |

Sau khi login/register, client có thể xác thực bằng một trong hai cách:

```http
Authorization: Bearer <token>
```

hoặc gửi cookie `token` do server đặt.

## 8. Xử lý lỗi

`asyncHandler` bọc các route async và chuyển lỗi Promise tới middleware lỗi.

| Tình huống | Response dự kiến |
| --- | --- |
| Sai URL hoặc sai method | `404`, `message: "Not Found"` |
| Thiếu hoặc JWT không hợp lệ | `401` |
| Role không được phép | `403` |
| Validate thất bại | `400` |
| MongoDB ID sai định dạng | `404` |
| Lỗi không được xử lý riêng | `500` |

Response lỗi có cấu trúc:

```json
{
  "success": false,
  "message": "..."
}
```

## 9. Dữ liệu và database

Schema nằm tại `app/schemas/`, model truy vấn database nằm tại `app/models/`.

```text
routes/product.js -> models/product.js -> schemas/product.js -> MongoDB collection product
routes/category.js -> models/category.js -> schemas/category.js -> MongoDB collection category
routes/auth.js / users.js -> models/auth.js / users.js -> schemas/users.js -> MongoDB collection users
```

Script seed dữ liệu:

```bash
node seeder -i # thêm dữ liệu mẫu
node seeder -d # xóa dữ liệu mẫu
```
