import { ChatBubble, IMessageScreen } from "imessage-ui";

/**
 * The OG identity — 1200×630, adapted from wesleykamau.com's link-preview
 * system: a link preview renders inside a chat bubble, so the preview *is*
 * a message. Built from the real `imessage-ui` kit (pixel-accurate at its
 * native 17px type scale) rather than a hand-rolled lookalike, rendered at
 * native size inside a `zoom`ed frame rather than hand-scaling font-size —
 * that's what keeps the bubble tail attached to the bubble body.
 *
 * Text-only only: this site is a single page, and no existing photo asset
 * (the 242×242 face crops in public/photos/crops/) is high-enough
 * resolution for a 630px-tall full-bleed portrait, so the photo layout from
 * the source kit isn't ported here.
 *
 * SF Pro Display is Apple-licensed and isn't vendored here. The bubble text
 * is the package's own font stack (`-apple-system, BlinkMacSystemFont,
 * system-ui, sans-serif`), which falls through to the generation host's
 * system sans-serif — a system-stack substitute, not a CDN hotlink. The
 * wordmark, which is fully ours to style, uses this site's own self-hosted
 * Geist (`--font-geist-sans`, already loaded in the root layout).
 */
const ZOOM = 3.2;

export interface IdentityOGProps {
  /** The message — the one thing that changes per page. */
  message: string;
}

export default function IdentityOG({ message }: IdentityOGProps) {
  return (
    <div
      className="dark og-identity"
      style={{
        // Pinned to the viewport rather than laid out in flow: this page
        // renders inside the app's root layout, whose background/spacing
        // would otherwise inset the frame and bleed into the 1200×630 capture.
        position: "fixed",
        top: 0,
        left: 0,
        width: 1200,
        height: 630,
        overflow: "hidden",
        background: "#000000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "stretch",
        padding: "0 88px",
      }}
    >
      <style>{`
        /* Static render — never catch an entrance animation mid-flight. */
        .og-identity .imsg-pop { animation: none !important; opacity: 1 !important; }
      `}</style>

      <div
        style={{
          fontFamily: "var(--font-geist-sans), -apple-system, system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 104,
          lineHeight: 1,
          letterSpacing: "-0.035em",
          color: "#ffffff",
          marginBottom: 52,
        }}
      >
        Wesley @ NASA
      </div>

      {/* Right-aligned: a sent message hugs the trailing edge, and the kit
          draws the tail on that side — left-aligning it would point the tail
          at empty space. */}
      <div style={{ zoom: ZOOM, maxWidth: "100%", display: "flex", justifyContent: "flex-end" }}>
        <IMessageScreen style={{ background: "transparent" }}>
          <ChatBubble text={message} variant="sent" position="solo" tail hideAvatar />
        </IMessageScreen>
      </div>
    </div>
  );
}
