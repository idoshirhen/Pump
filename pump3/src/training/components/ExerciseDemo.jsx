import { useMemo, useState } from 'react';
import { getExerciseMedia } from '../media/exerciseMedia';
import { instructionForExercise } from '../data/exercise-instructions';
import { getExerciseById } from '../media/exerciseMedia';
import './ExerciseDemo.css';

export default function ExerciseDemo({ exerciseId, sex, language = 'he', compact = false, allowUnapproved = false }) {
  const media = useMemo(() => getExerciseMedia(exerciseId, sex, { allowUnapproved }), [exerciseId, sex, allowUnapproved]);
  const instructions = useMemo(() => instructionForExercise(exerciseId), [exerciseId]);
  const exercise = useMemo(() => getExerciseById(exerciseId), [exerciseId]);
  const [failed, setFailed] = useState(false);
  const lang = language === 'en' ? 'en' : 'he';

  if (!media || failed) {
    const cues = instructions?.[lang] ?? [];
    const name = exercise?.names?.[lang] ?? exerciseId;
    return (
      <section
        className={`exercise-demo exercise-demo--fallback${compact ? ' exercise-demo--compact' : ''}`}
        aria-label={lang === 'en' ? `${name} instructions` : `הוראות לתרגיל ${name}`}
      >
        <strong className="exercise-demo__fallback-title">
          {lang === 'en' ? 'How to perform' : 'איך לבצע'}
        </strong>
        {cues.length > 0 ? (
          <ol className="exercise-demo__cues">
            {cues.map((cue) => <li key={cue}>{cue}</li>)}
          </ol>
        ) : (
          <span className="exercise-demo__unavailable">
            {lang === 'en' ? 'Instructions unavailable' : 'הוראות לא זמינות'}
          </span>
        )}
      </section>
    );
  }

  const alt = lang === 'en' ? media.altEn : media.altHe;

  return (
    <figure className={`exercise-demo${compact ? ' exercise-demo--compact' : ''}`}>
      <img
        src={media.src}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable="false"
        onError={() => setFailed(true)}
      />
      {allowUnapproved && media.quality !== 'approved' && (
        <figcaption className="exercise-demo__quality" data-quality={media.quality}>
          {lang === 'en' ? 'Legacy media — replace' : 'מדיה ישנה — להחלפה'}
        </figcaption>
      )}
    </figure>
  );
}
