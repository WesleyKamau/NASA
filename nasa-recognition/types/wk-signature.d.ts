/** Minimal typing for the wk-signature curtain API (v3.6.2, linked mode). */
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
  /** Per-site config, set inline before the engine loads. */
  WK_SIGNATURE?: Record<string, unknown>;
  /** Handwriting data, set by the hub's signatures.js (or the vendored fallback). */
  WK_SIGNATURES?: unknown[];
}
