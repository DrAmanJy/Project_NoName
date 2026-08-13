import { spawn } from 'child_process';
export interface FfprobeResult {
  duration: number;
  width: number;
  height: number;
  codec: string;
  hasAudio: boolean;
  hasVideo: boolean;
}

export class FFmpegWrapper {
  static async probe(filePath: string, signal?: AbortSignal): Promise<FfprobeResult> {
    return new Promise((resolve, reject) => {
      const args = [
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        '-show_streams',
        filePath
      ];

      let stdout = '';
      let stderr = '';

      const process = spawn('ffprobe', args, { signal, timeout: 60000 });

      process.stdout.on('data', (data) => { stdout += data; });
      process.stderr.on('data', (data) => { stderr += data; });

      process.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`ffprobe exited with code ${code}. stderr: ${stderr}`));
          return;
        }

        try {
          const parsed = JSON.parse(stdout);
          const videoStream = parsed.streams?.find((s: unknown) => (s as { codec_type: string }).codec_type === 'video');
          const audioStream = parsed.streams?.find((s: unknown) => (s as { codec_type: string }).codec_type === 'audio');

          const durationStr = parsed.format?.duration || videoStream?.duration;
          const duration = durationStr ? parseFloat(durationStr) : 0;

          resolve({
            duration,
            width: videoStream?.width || 0,
            height: videoStream?.height || 0,
            codec: videoStream?.codec_name || '',
            hasAudio: !!audioStream,
            hasVideo: !!videoStream,
          });
        } catch (err) {
          reject(new Error(`Failed to parse ffprobe output: ${err}`));
        }
      });

      process.on('error', (err) => {
        reject(err);
      });
    });
  }

  static async extractAudio(inputPath: string, outputPath: string, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        '-i', inputPath,
        '-vn', // no video
        '-acodec', 'libmp3lame',
        '-ar', '16000', // 16kHz for whisper
        '-ac', '1',     // mono
        '-q:a', '9',    // lowest quality/smallest file
        '-y',           // overwrite
        '-threads', '1',
        outputPath
      ];

      const process = spawn('ffmpeg', args, { signal, timeout: 120000 });
      let stderr = '';
      process.stderr.on('data', (data) => { stderr += data; });

      process.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`ffmpeg audio extraction failed (code ${code}): ${stderr}`));
          return;
        }
        resolve();
      });

      process.on('error', reject);
    });
  }

  static async extractFrames(inputPath: string, outputPattern: string, duration: number, numFrames: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      // Calculate rate based on duration to get roughly numFrames
      // e.g. if duration is 10s and numFrames is 5, rate is 0.5 fps
      const fps = numFrames / duration;
      
      const args = [
        '-i', inputPath,
        '-vf', `fps=${fps},scale=512:-1`, // small frames for AI
        '-frame_pts', '1',
        '-y',
        '-threads', '1',
        outputPattern
      ];

      const process = spawn('ffmpeg', args, { signal, timeout: 180000 });
      let stderr = '';
      process.stderr.on('data', (data) => { stderr += data; });

      process.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`ffmpeg frame extraction failed (code ${code}): ${stderr}`));
          return;
        }
        resolve();
      });

      process.on('error', reject);
    });
  }


}
