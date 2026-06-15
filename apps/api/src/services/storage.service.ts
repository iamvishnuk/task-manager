import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { Config } from '../config/env';

export interface IStorageService {
  uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

export class LocalStorageService implements IStorageService {
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'uploads');

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(fileName);
    const uniqueFileName = `${uniqueSuffix}${fileExt}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    await fs.promises.writeFile(filePath, fileBuffer);

    return `/uploads/${uniqueFileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // Local url is of format /uploads/filename.ext
    // Extract filename
    const parts = fileUrl.split('/uploads/');
    if (parts.length < 2) return;

    const fileName = parts[1];
    if (!fileName) return;
    const filePath = path.join(process.cwd(), 'uploads', fileName);

    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error(`Failed to delete local file: ${filePath}`, error);
    }
  }
}

export class R2StorageService implements IStorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    const config = Config.getInstance();
    const accountId = config.r2AccountId;
    const accessKeyId = config.r2AccessKeyId;
    const secretAccessKey = config.r2SecretAccessKey;
    this.bucketName = config.r2BucketName;
    this.publicUrl = config.r2PublicUrl;

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
      }
    });
  }

  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<string> {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(fileName);
    const uniqueFileName = `${uniqueSuffix}${fileExt}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: mimeType
    });

    await this.s3Client.send(command);

    // If a public URL prefix is configured, prepend it. Otherwise, default to the R2 endpoint format.
    if (this.publicUrl) {
      const baseUrl = this.publicUrl.endsWith('/')
        ? this.publicUrl.slice(0, -1)
        : this.publicUrl;
      return `${baseUrl}/${uniqueFileName}`;
    }

    // Fallback URL (note: default endpoint requires public access configured)
    const accountId = Config.getInstance().r2AccountId;
    return `https://${this.bucketName}.${accountId}.r2.cloudflarestorage.com/${uniqueFileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // Extract R2 Key from URL
    // R2 URL is either publicUrl/key or bucket.account.r2.cloudflarestorage.com/key
    let key = '';
    if (this.publicUrl && fileUrl.includes(this.publicUrl)) {
      key = fileUrl.replace(`${this.publicUrl}/`, '');
    } else {
      // Split by slash and take the last part
      const parts = fileUrl.split('/');
      key = parts[parts.length - 1] || '';
    }

    if (!key) return;

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });
      await this.s3Client.send(command);
    } catch (error) {
      console.error(`Failed to delete file from R2: ${fileUrl}`, error);
    }
  }
}

export const getStorageService = (): IStorageService => {
  const provider = Config.getInstance().storageProvider;
  if (provider === 'r2') {
    return new R2StorageService();
  }
  return new LocalStorageService();
};
