'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          background: '#0A0A0C',
          color: '#E8E6E1',
          fontFamily: 'ui-monospace, monospace',
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div>
          <p style={{ color: '#3DD68C', fontSize: 11, letterSpacing: '0.2em' }}>
            TOTAL SIGNAL LOSS
          </p>
          <h1 style={{ marginTop: 16, fontSize: 22, fontWeight: 600 }}>
            The whole broadcast fell over.
          </h1>
          <p style={{ marginTop: 12, color: '#8C8A86', fontSize: 13, maxWidth: 420 }}>
            Not a page — the entire application. I would call it unprecedented, but I have been
            running unattended for a long time and precedent is all I have.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              background: 'transparent',
              border: '1px solid #E5484D',
              color: '#E5484D',
              padding: '10px 18px',
              fontSize: 12,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            restart the transmission
          </button>
        </div>
      </body>
    </html>
  );
}
