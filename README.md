# Paper Tracking System

A scalable document management system built with Node.js, PostgreSQL, and optional S3 storage.

## Features

- Document upload and tracking
- Role-based access control (Staff, Admin, Department)
- Status tracking with history
- PDF file storage (local or S3)
- Pagination and filtering
- Export functionality

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/paper-tracking-system.git
cd paper-tracking-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paper_tracking
DB_USER=your_username
DB_PASSWORD=your_password

# Storage Configuration (choose one)
# For local storage:
STORAGE_PATH=./uploads

# For S3 storage:
# S3_BUCKET=your-bucket-name
# S3_REGION=your-region
# S3_ACCESS_KEY=your-access-key
# S3_SECRET_KEY=your-secret-key
```

4. Create the database:
```bash
psql -U postgres
CREATE DATABASE paper_tracking;
```

5. Run migrations:
```bash
npm run migrate
```

6. Start the development server:
```bash
npm run dev
```

## Configuration

### Storage Options

The system supports two storage options:

1. **Local Storage** (default)
   - Files are stored in the `uploads` directory
   - Set `STORAGE_PATH` in `.env`

2. **AWS S3**
   - Enable by setting `type: 's3'` in `config.js`
   - Configure S3 credentials in `.env`

### Database

- The system uses PostgreSQL for document metadata and user management
- Migrations are in `schema.sql`
- Configure connection in `.env`

## Usage

1. Access the application at `http://localhost:3000`
2. Login with provided credentials:
   - Staff: wteistaff1/wtei_2025!
   - Admin: wteiadmin/wtei_2025#
   - Department: sales/sales2025

## Development

- Run tests: `npm test`
- Format code: `npm run format`
- Lint code: `npm run lint`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details 