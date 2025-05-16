// Database Configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'paper_tracking',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD
};

// File Storage Configuration
const storageConfig = {
    type: 'local', // or 's3' for AWS S3
    basePath: process.env.STORAGE_PATH || './uploads',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf'],
    s3: {
        bucket: process.env.S3_BUCKET,
        region: process.env.S3_REGION,
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY
    }
};

// Pagination Configuration
const paginationConfig = {
    defaultLimit: 20,
    maxLimit: 100
};

module.exports = {
    dbConfig,
    storageConfig,
    paginationConfig
}; 