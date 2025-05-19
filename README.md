# Paper Tracking System

A document management system for tracking and managing paper documents between departments.

## Features

- Secure document storage with PostgreSQL and AWS S3/local file system
- User authentication and role-based access control
- Real-time document status tracking
- Document history and audit trail
- Export functionality to CSV
- Support for PDF documents

## Prerequisites

- Node.js 14+ and npm
- PostgreSQL 12+
- AWS S3 bucket (optional, for S3 storage)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd paper-tracking-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   - Database credentials
   - Session secret
   - Storage configuration (local or S3)
   - AWS credentials (if using S3)

5. Create the database:
   ```bash
   createdb paper_tracking
   ```

6. Run database migrations:
   ```bash
   npm run migrate
   ```

7. Start the server:
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## Default Users

The system comes with the following default users:

| Username    | Password          | Role       |
|------------|------------------|------------|
| wteistaff1 | wtei_2025!      | staff      |
| wteistaff2 | wtei_2025@      | staff      |
| wteiadmin  | wtei_2025#      | admin      |
| accounting | accounting2025   | department |
| purchasing | purchasing2025   | department |
| engineering| engineering2025  | department |

## Storage Options

### Local Storage
By default, documents are stored in the local filesystem. Set the following in your `.env`:
```
STORAGE_TYPE=local
STORAGE_PATH=./uploads
```

### AWS S3 Storage
To use S3 for document storage, set the following in your `.env`:
```
STORAGE_TYPE=s3
AWS_REGION=your-region
AWS_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

## API Endpoints

### Authentication
- `POST /api/login` - Login with username and password
- `POST /api/logout` - Logout current user

### Documents
- `GET /api/documents` - List documents with filters
- `POST /api/documents` - Create new document
- `PATCH /api/documents/:id/status` - Update document status
- `GET /api/documents/:id/file` - Download document file
- `GET /api/documents/export` - Export documents to CSV

## Development

### Running Tests
```bash
npm test
```

### Code Style
The project uses ESLint for code style. Run:
```bash
npm run lint
```

## Security

- All passwords are hashed using bcrypt
- Session management with express-session
- Role-based access control
- Input validation and sanitization
- File type validation for uploads
- Secure file storage options

## License

This project is licensed under the MIT License - see the LICENSE file for details. 