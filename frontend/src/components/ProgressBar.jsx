export default function ProgressBar({ total, current }) {
  const percent = Math.round((current / total) * 100);
  return (
    <div className="progress-wrap" aria-label={`Progress ${percent}%`}>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <small>
        Question {current} of {total}
      </small>
    </div>
  );
}
