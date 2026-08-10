import { 
  S3Client, 
  CreateMultipartUploadCommand, 
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  GetObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../../config/env.js';

export class S3Service {
  private client: S3Client;

  constructor() {
    const endpoint = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    this.client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  public async createMultipartUpload(key: string, contentType: string) {
    const command = new CreateMultipartUploadCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const response = await this.client.send(command);
    if (!response.UploadId) {
      throw new Error('Failed to create multipart upload: Missing UploadId');
    }

    return response.UploadId;
  }

  public async signPart(key: string, uploadId: string, partNumber: number): Promise<string> {
    const command = new UploadPartCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    // Sign the URL for a short duration (e.g., 15 minutes)
    return getSignedUrl(this.client, command, { expiresIn: 900 });
  }

  public async completeMultipartUpload(key: string, uploadId: string, parts: { partNumber: number; eTag: string }[]) {
    const command = new CompleteMultipartUploadCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map(p => ({
          PartNumber: p.partNumber,
          ETag: p.eTag,
        })),
      },
    });

    await this.client.send(command);
  }

  public async abortMultipartUpload(key: string, uploadId: string) {
    const command = new AbortMultipartUploadCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
    });

    await this.client.send(command);
  }

  public async deleteObject(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    });

    await this.client.send(command);
  }

  public async getObjectStream(key: string) {
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    });

    const response = await this.client.send(command);
    if (!response.Body) {
      throw new Error('Object body is empty');
    }

    // response.Body is a Readable stream in Node.js
    return response.Body as NodeJS.ReadableStream;
  }
}

export const s3Service = new S3Service();
