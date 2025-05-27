# Paper Tracking System

A real-time document tracking system built with Firebase.

## Features

- Real-time document tracking
- Department management
- User authentication
- File upload and storage
- Real-time notifications

## Deployment

1. Fork this repository
2. Enable GitHub Pages in your repository settings
3. Configure Firebase:
   - Create a new Firebase project
   - Enable Authentication, Firestore, and Storage
   - Add your GitHub Pages domain to authorized domains
4. Update Firebase configuration in `firebase-config.js`
5. Push to GitHub to trigger automatic deployment

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Firebase Configuration

Make sure to update the Firebase configuration in `firebase-config.js` with your project's credentials:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Security

- All Firebase services are protected by security rules
- User authentication is required for all operations
- File uploads are restricted to authorized users
- Real-time updates are filtered based on user permissions

## Default Users

The system comes with the following default users:

| Username | Password     | Role       |
|----------|-------------|------------|
| wteiadmin| wtei_2025#  | admin      |
| sales    | sales2025   | department |
| hr       | hr2025      | department |
| cashier  | cashier2025 | department |

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

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
