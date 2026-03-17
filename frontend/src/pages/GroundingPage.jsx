import { useState } from 'react';
import { Link } from 'react-router-dom';

const groundingSteps = [
  { sense: '5 things you can see', prompt: 'Look around and name five visible things in detail.' },
  { sense: '4 things you can feel', prompt: 'Notice four physical sensations such as fabric, temperature, or your feet on the floor.' },
  { sense: '3 things you can hear', prompt: 'Focus on three sounds, near or far, without judging them.' },
  { sense: '2 things you can smell', prompt: 'Identify two scents around you, or imagine calming scents if none are obvious.' },
  { sense: '1 thing you can taste', prompt: 'Notice one taste in your mouth or take a sip of water mindfully.' },
];

export default function GroundingPage() {
  const [completed, setCompleted] = useState(false);

  return (
    <div className="page-container center-wrap">
      <div className="soft-panel grounding-panel">
        <h2>5-4-3-2-1 Grounding Technique</h2>
        <p>Use this exercise to return attention to the present moment, one sense at a time.</p>

        <div className="grounding-steps">
          {groundingSteps.map((step, index) => (
            <div className="grounding-step-card" key={step.sense}>
              <span className="grounding-number">{index + 1}</span>
              <div>
                <h3>{step.sense}</h3>
                <p>{step.prompt}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="row-gap">
          <button className="pill-btn primary" type="button" onClick={() => setCompleted(true)}>
            Mark Grounding Complete
          </button>
          <Link className="pill-btn" to="/breathing">
            Continue with Breathing
          </Link>
        </div>

        {completed ? <p className="soft-note">Great work. You completed a grounding round.</p> : null}
      </div>
    </div>
  );
}
