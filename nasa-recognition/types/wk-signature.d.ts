/** Minimal typing for the wk-signature curtain API (public/wk-signature.js). */
interface WkSignatureApi {
  version: string;
  revealed(): boolean;
  whenRevealed(cb: () => void): void;
  /** Defers the reveal until the returned release() is called. */
  hold(): () => void;
  replay(mode?: string, look?: unknown): void;
  close(url?: string, look?: unknown): void;
}

interface Window {
  __wkSignature?: WkSignatureApi;
  WK_SIGNATURE?: Record<string, unknown>;
}
