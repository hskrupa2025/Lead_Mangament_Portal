# Lead Management Portal

A full-stack lead management system for creating, assigning, tracking, and following up on business leads. The project includes an Express API, MongoDB persistence, JWT authentication, role-based access control, and a responsive Bootstrap frontend.

## Features

- JWT-based authentication with HTTP cookie support
- Admin and regular user roles
- Lead creation, viewing, editing, and deletion
- Lead assignment and status management
- Follow-up history for each lead
- Search, filtering, sorting, and pagination
- Admin dashboard with lead metrics and Chart.js visualizations
- Regular users see their assigned leads and can manage permitted follow-ups
- Server-side validation and rate limiting
- Helmet security headers and CORS configuration
- Responsive layouts for desktop and mobile devices

## Technology Stack

- Node.js 18 or later
- Express 4
- MongoDB with Mongoose
- JWT, bcryptjs, cookie-parser
- express-validator
- Bootstrap 5 and Bootstrap Icons
- Chart.js
- Vanilla JavaScript frontend

## Project Structure

```text
.
├── app.js                     # Express application and middleware
├── server.js                  # Environment loading, database connection, server startup
├── package.json
├── backend/
│   ├── config/                # Constants and MongoDB connection
│   ├── controllers/           # Request handlers
│   ├── middleware/            # Authentication, roles, validation, errors
│   ├── models/                # Mongoose models
│   ├── routes/                # API routes
│   ├── seed/                  # Development seed data
│   └── validators/            # Request validation rules
└── frontend/
    ├── pages/                 # HTML pages
    ├── js/                    # API, authentication, and page scripts
    ├── css/                   # Shared and responsive styles
    └── assets/                # Static assets
```

## Requirements

- Node.js 18+
- npm
- A running MongoDB instance or MongoDB Atlas connection

## Installation

```bash
npm install
```

Create a `.env` file in the project root:

```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=replace-with-a-long-random-secret
COOKIE_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://127.0.0.1:5500
```

`MONGODB_URI` is required. Use strong, private values for both secrets and do not commit `.env` to source control.

## Running the Application

Start the production-style server:

```bash
npm start
```

Start with automatic restart during development:

```bash
npm run dev
```

Open the application at:

```text
http://localhost:5001/
```

The Express server serves the frontend from `frontend/` and redirects the root page to the login screen.

## Seed Development Data

The seed script clears existing users, leads, and follow-ups before inserting sample data:

```bash
npm run seed
```

Development seed credentials:

```text
Admin: admin@example.com / Admin@123
User:  Multiple User email and password 
   
```

Do not use these credentials in production.

## Roles and Permissions

### Admin

- View all leads
- Create leads
- Edit and delete leads
- Assign leads to users
- Manage users
- View dashboard metrics and charts

### Regular User

- View assigned leads only
- Edit assigned leads
- Delete assigned leads
- Add and view follow-up history for assigned leads
- Cannot create leads or manage users

## API Overview

All API routes use the `/api` prefix and require authentication unless stated otherwise.

| Method | Route                     | Purpose                                            |
| ------ | ------------------------- | -------------------------------------------------- |
| GET    | `/api/health`             | Check API availability                             |
| POST   | `/api/auth/login`         | Authenticate a user                                |
| POST   | `/api/auth/register`      | Register a user, according to current auth rules   |
| GET    | `/api/users`              | List users                                         |
| POST   | `/api/leads`              | Create a lead; admin only                          |
| GET    | `/api/leads`              | List leads with filtering, sorting, and pagination |
| GET    | `/api/leads/:id`          | Get one lead                                       |
| PUT    | `/api/leads/:id`          | Update a lead                                      |
| DELETE | `/api/leads/:id`          | Delete a lead and its follow-ups                   |
| PATCH  | `/api/leads/:id/assign`   | Assign a lead; admin only                          |
| PATCH  | `/api/leads/:id/status`   | Update lead status                                 |
| GET    | `/api/followups/lead/:id` | List follow-ups for a lead                         |
| POST   | `/api/followups/lead/:id` | Add a follow-up                                    |
| PUT    | `/api/followups/:id`      | Update a follow-up                                 |
| DELETE | `/api/followups/:id`      | Delete a follow-up; admin only                     |
| GET    | `/api/dashboard/admin`    | Admin metrics and chart data                       |
| GET    | `/api/dashboard/user`     | Assigned-user metrics                              |

Lead list pagination accepts `page` and `limit` query parameters. The frontend uses a limit of 10 records per page.

## Validation Rules

- Lead mobile numbers must contain exactly 10 digits.
- Lead email addresses must be valid.
- Service, source, and status values must match the configured options.
- Estimated values cannot be negative.
- Follow-up dates must use valid ISO date values.

## Security Notes

- Keep `.env` out of source control.
- Replace all development secrets and seed passwords before deployment.
- Configure `CLIENT_URL` for the real frontend origin.
- Use HTTPS in production.
- Use a restricted MongoDB user with only the permissions the application needs.

## License

This project currently uses the ISC license declared in `package.json`.
