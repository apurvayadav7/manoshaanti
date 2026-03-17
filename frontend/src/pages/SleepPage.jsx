import { sleepResources } from '../features/sleep/resources';

export default function SleepPage() {
  return (
    <div className="page-container sleep-page">
      <div className="section-intro">
        <h2>Sleep Hygiene</h2>
        <p>Choose soothing audio, white noise, ASMR, or relaxing videos.</p>
      </div>

      <div className="sleep-grid">
        {sleepResources.map((item) => (
          <article className="soft-panel sleep-card" key={item.id}>
            <div className="sleep-card-head">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
            {item.type === 'audio' ? (
              <audio controls src={item.src} className="media-player">
                Your browser does not support audio.
              </audio>
            ) : (
              <iframe
                className="media-frame"
                src={item.src}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
