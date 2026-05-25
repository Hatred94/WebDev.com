# Backend WebDev (SQLite)

Сервер хранит данные в SQLite: пользователи, роли, уроки, тесты, прогресс.

**База данных** — один файл `diplom.db` в **корне проекта** (рядом с папкой `server`). Его использует и seed, и сервер.

## Установка и запуск

```bash
cd server
npm install
npm run seed       # заполнить diplom.db уроками и тестами (16 уроков, 15 тестов); создать админа admin/admin
npm start          # запуск на http://localhost:3000
```

Сайт открывать по адресу **http://localhost:3000** (не file://), иначе не работают API, авторизация и прогресс.

Если уже запускали сервер раньше — после `npm run seed` **перезапустите сервер**, чтобы подхватить обновлённую БД.

## Роли

- **user** — обычный пользователь: личный кабинет, прогресс по урокам и тестам.
- **admin** — может создавать и редактировать уроки и тесты через API (`POST/PUT /api/admin/lessons`, `POST/PUT /api/admin/tests`).

После первого `npm run seed` создаётся пользователь **admin** с паролем **admin** — смените пароль после входа.

## API (кратко)

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/me`
- `GET /api/lessons`, `GET /api/lessons/:id`
- `GET /api/tests`, `GET /api/tests/:id`
- `GET /api/progress/stats`, `POST /api/progress/lesson`, `POST /api/progress/test`, `GET /api/progress/lessons`, `GET /api/progress/tests` (требуется авторизация)
- Админ: `POST/PUT /api/admin/lessons`, `POST/PUT /api/admin/tests`

Сессии — cookie `webdev_sid`, httpOnly.
