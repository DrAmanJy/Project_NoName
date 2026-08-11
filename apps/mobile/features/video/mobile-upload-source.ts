import { File } from 'expo-file-system';
import type { UploadSource, UploadChunk } from '@repo/api-client';

export class MobileUploadSource implements UploadSource {
  private file: File;
  public readonly size: number;
  public readonly contentType: string;

  constructor(uri: string, size: number, contentType: string) {
    this.file = new File(uri);
    this.size = size;
    this.contentType = contentType;
  }

  public async readPart(partNumber: number, offset: number, length: number): Promise<UploadChunk> {
    const blob = this.file.slice(offset, offset + length);
    return {
      data: blob
    };
  }
}
