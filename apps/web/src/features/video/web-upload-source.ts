import type { UploadSource, UploadChunk } from '@repo/api-client';

export class WebUploadSource implements UploadSource {
  private file: File;

  constructor(file: File) {
    this.file = file;
  }

  get size(): number {
    return this.file.size;
  }

  get contentType(): string {
    return this.file.type;
  }

  public async readPart(partNumber: number, offset: number, length: number): Promise<UploadChunk> {
    const slice = this.file.slice(offset, offset + length);
    return {
      data: slice
    };
  }
}
