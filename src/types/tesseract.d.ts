declare module 'tesseract.js' {
  export interface RecognizeResult {
    data: {
      text: string;
      confidence: number;
      [key: string]: any;
    };
  }

  export interface Worker {
    recognize(image: string | Buffer): Promise<RecognizeResult>;
    terminate(): Promise<void>;
  }

  export function createWorker(language?: string): Promise<Worker>;
}
