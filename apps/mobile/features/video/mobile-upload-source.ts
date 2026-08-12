import type { UploadSource, UploadChunk } from '@repo/api-client';

export class MobileUploadSource implements UploadSource {
  private uri: string;
  private blob: Blob | null = null;
  public readonly size: number;
  public readonly contentType: string;

  constructor(uri: string, size: number, contentType: string) {
    this.uri = uri;
    this.size = size;
    this.contentType = contentType;
  }

  public async readPart(partNumber: number, offset: number, length: number): Promise<UploadChunk> {
    if (!this.blob) {
      const response = await fetch(this.uri);
      this.blob = await response.blob();
    }
    const chunk = this.blob.slice(offset, offset + length);
    return {
      data: chunk
    };
  }
}
