export default function EcgLine({ className = '' }) {
  // A single heartbeat waveform path, repeated 3x for a continuous strip,
  // drawn with a traveling highlight to suggest a live monitor.
  const beat = 'M0,20 L28,20 L34,20 L40,4 L46,36 L52,10 L58,20 L64,20 L200,20';

  return (
    <svg
      className={`ecg-line ${className}`}
      viewBox="0 0 600 40"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={`${beat} ${beat.replace(/M0/, 'M200')} ${beat.replace(/M0/, 'M400')}`}
        fill="none"
        stroke="var(--pulse)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="ecg-path"
      />
    </svg>
  );
}
