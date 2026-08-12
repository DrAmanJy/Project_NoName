import type { UploadSource, UploadChunk } from '@repo/api-client';

export class MobileUploadSource implements UploadSource {
  private uri: string;
  private blob: Blob | null = null;
  private loadPromise: Promise<Blob> | null = null;
  public readonly size: number;
  public readonly contentType: string;

  constructor(uri: string, size: number, contentType: string) {
    this.uri = uri;
    this.size = size;
    this.contentType = contentType;
  }

  public async readPart(partNumber: number, offset: number, length: number): Promise<UploadChunk> {
    if (!this.blob) {
      if (!this.loadPromise) {
        this.loadPromise = fetch(this.uri).then(res => res.blob()).then(blob => {
          this.blob = blob;
          return blob;
        });
      }
      await this.loadPromise;
    }
    const chunk = this.blob!.slice(offset, offset + length);
    return {
      data: chunk
    };
  }
}
