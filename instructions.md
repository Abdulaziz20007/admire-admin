# Admire API – Documentation (NestJS)

_Last updated: **2025-07-05**_

---

## Overview

This NestJS backend exposes a modular REST API secured with JWT authentication.

- All routes are **protected by default** with `AccessTokenGuard` and therefore require an `Authorization: Bearer <JWT_ACCESS_TOKEN>` header.
- Routes annotated with `@Public()` are open to anonymous clients.
- Refresh-token flow is managed with an **HTTP-only** cookie named `refresh_token`.
- Validation errors, business errors and uncaught exceptions are formatted by the global `AllExceptionsFilter` in the following canonical shape:

```json
{
  "statusCode": 400,
  "timestamp": "2025-07-05T12:00:00.000Z",
  "path": "/example",
  "message": {
    "message": ["field should not be empty"],
    "error": "Bad Request",
    "statusCode": 400
  }
}
```

File uploads are handled with Multer interceptors – single file via `FileInterceptor` and multiple files via `FileFieldsInterceptor`.

---

# Authentication Module

### `POST /auth/login`

- **Description**: Authenticate an admin and receive an access-token. A long-lived refresh-token is returned as an **HTTP-only cookie**.
- **Authentication**: Public
- **Service Logic**: Verifies `username` & `password`, issues JWTs, persists `refresh_token` in DB.

**Request Body (`application/json` – `AdminLoginDto`)**

```json
{
  "username": "admin",
  "password": "strong-password"
}
```

**Responses**

- **`200 OK`**
  ```json
  {
    "message": "Admin logged in successfully",
    "access_token": "<JWT_ACCESS_TOKEN>"
  }
  ```
- **`401 Unauthorized`** – wrong credentials

---

### `POST /auth/refresh`

- **Description**: Exchange a valid `refresh_token` cookie for a fresh access-token (and rotated refresh-token).
- **Authentication**: Public + `refresh_token` cookie

**Responses**

- **`200 OK`**
  ```json
  { "access_token": "<NEW_ACCESS_TOKEN>" }
  ```
- **`401 Unauthorized`** – invalid / missing cookie

---

### `POST /auth/logout`

- **Description**: Invalidate the current refresh-token and clear the cookie.
- **Authentication**: Public + `refresh_token` cookie

**Responses**

- **`200 OK`**
  ```json
  { "message": "Admin logged out successfully" }
  ```

---

# Admin Module

Base URL: `/admin` (protected)

### `POST /admin`

- **Description**: Create a new admin account with optional avatar.
- **Authentication**: Admin Token Required
- **Uploads**: `multipart/form-data` single file **avatar**
- **Service Logic**: Checks username uniqueness, uploads avatar to Cloudflare R2, hashes password (todo), stores row, returns safe fields (no password/refresh_token).

**Form Fields (`CreateAdminDto`)**
| field | type | required | description |
|-------|------|----------|-------------|
| `name` | string | ✔︎ | First name |
| `surname` | string | ✔︎ | Last name |
| `username` | string | ✔︎ | Must be unique |
| `password` | string | ✔︎ | Raw password |
| `avatar` | file (image) | ✖︎ | Admin profile picture |

**Example (cURL)**

```bash
curl -X POST 'http://localhost:3030/admin' \
  -H 'Authorization: Bearer <token>' \
  -F 'name="John"' \
  -F 'surname="Doe"' \
  -F 'username="johndoe"' \
  -F 'password="Pa$$w0rd"' \
  -F 'avatar=@"/path/avatar.jpg"'
```

**Responses**

- **`201 Created`**
  ```json
  {
    "id": 1,
    "name": "John",
    "surname": "Doe",
    "username": "johndoe",
    "avatar": "https://cdn.example.com/admins/uuid.jpg"
  }
  ```
- **`409 Conflict`** – username already exists

---

### `GET /admin`

- **Description**: List all admins (safe fields only).
- **Authentication**: Admin Token Required
- **Responses** – `200 OK` – array of objects identical to _201_ payload above.

### `GET /admin/:id`

- Fetch single admin by **numeric** id.

### `PATCH /admin/:id`

- Update admin fields (partial) – same form structure as **POST**. If a new avatar is supplied, the old one is deleted from storage.

### `DELETE /admin/:id`

- Permanently remove an admin and their avatar file.

---

# Icon Module

Base URL: `/icon` (protected)

| Method   | Path        | Description                                         |
| -------- | ----------- | --------------------------------------------------- |
| `POST`   | `/icon`     | Create icon. Upload single file `file` (image/svg). |
| `GET`    | `/icon`     | List icons                                          |
| `GET`    | `/icon/:id` | Get icon                                            |
| `PATCH`  | `/icon/:id` | Update metadata / replace file                      |
| `DELETE` | `/icon/:id` | Delete icon                                         |

`CreateIconDto` fields: `name` (string, required), `url` (string – overridden by uploaded file URL).

---

# Media Module

Base URL: `/media` (protected)

`CreateMediaDto` fields: `name` (string), `is_video` (boolean, default `false`), plus file `file` (image / video).

CRUD endpoints identical in shape to _Icon Module_.

---

# Message Module

Base URL: `/message` (protected)

All routes operate on JSON; no file uploads.

- `POST /message` – create message (`name`, `phone`, `message`)
- `GET /message` – list messages
- `GET /message/:id` – single message
- `PATCH /message/:id` – update (`is_checked`, `is_telegram`, etc.)
- `DELETE /message/:id` – remove
- `PATCH /message/:id/check/:is_checked` – update message status (`is_checked`).  
  Codes: `0` = pending, `1` = rejected, `2` = checked.

---

# Phone Module

Base URL: `/phone` (protected)

Simple phone strings CRUD (`phone` field).

---

# Social Module

Base URL: `/social` (protected)

`CreateSocialDto` fields: `name`, `url`, `icon_id` (FK → `icons`).

---

# Student Module

Base URL: `/student` (protected)

`multipart/form-data` with **two optional file fields**: `image`, `certificate_image`.

Primary DTO fields (scores omitted for brevity): `name`, `surname`, `overall`, `cefr`, `review_uz`, `review_en`, etc.

Endpoints mirror standard CRUD.

---

# Teacher Module

Base URL: `/teacher` (protected)

Single file upload `image`. DTO includes `about_*`, quotes, scores, stats…

---

# Web Module

Base URL: `/web` (protected)

Large settings record controlling the landing page. All fields are JSON strings/numbers – no file uploads here.

---

# Junction (Many-to-Many) Modules

| Module        | Base Path      | Purpose                                         |
| ------------- | -------------- | ----------------------------------------------- |
| `web-media`   | `/web-media`   | Order & size of media tiles inside a web record |
| `web-phone`   | `/web-phone`   | Link phones to a web record                     |
| `web-social`  | `/web-social`  | Link socials to a web record                    |
| `web-student` | `/web-student` | Showcase best students                          |
| `web-teacher` | `/web-teacher` | Showcase best teachers                          |

Each exposes the standard CRUD surface (`POST`, `GET`, `GET :id`, `PATCH :id`, `DELETE :id`) and uses a small DTO with FK fields (`web_id`, `media_id`, etc.) plus `order` or `size` where applicable.

---

## Notes on Error Responses

Common HTTP codes across the API:

| Status             | Meaning                      | Typical Cause                            |
| ------------------ | ---------------------------- | ---------------------------------------- |
| `400 Bad Request`  | Validation or malformed data | DTO validation failed, wrong `id` format |
| `401 Unauthorized` | Missing/invalid JWT          | Expired / absent access token            |
| `403 Forbidden`    | Reserved for future RBAC     |                                          |
| `404 Not Found`    | Resource does not exist      | Wrong `id` or already deleted            |
| `409 Conflict`     | Unique constraint violation  | Duplicate username / file name           |

---

## Keeping this document up-to-date

> Always update this file when you add, modify or remove a controller method so that consumers have an accurate contract.
