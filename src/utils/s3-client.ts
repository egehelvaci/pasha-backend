import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Tebi.io için S3 istemcisi yapılandırması
const s3Client = new S3Client({
  endpoint: 'https://s3.tebi.io',
  region: 'global',
  credentials: {
    accessKeyId: process.env.TEBI_ACCESS_KEY!,
    secretAccessKey: process.env.TEBI_SECRET_KEY!,
  },
});

const BUCKET_NAME = process.env.TEBI_BUCKET_NAME!;

export { s3Client, BUCKET_NAME }; 