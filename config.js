require('dotenv').config();

// Database Configuration
const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'paper_tracking',
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : false
};

// File Storage Configuration
const storageConfig = {
    type: process.env.STORAGE_TYPE || 'local', // 'local' or 's3'
    basePath: process.env.STORAGE_PATH || './uploads',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf'],
    s3: {
        region: process.env.AWS_REGION || 'us-east-1',
        bucket: process.env.AWS_BUCKET,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
};

// Pagination Configuration
const paginationConfig = {
    defaultLimit: 50,
    maxLimit: 100
};

module.exports = {
    dbConfig,
    storageConfig,
    paginationConfig
}; 