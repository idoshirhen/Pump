import { useMemo, useState } from 'react';
import { getExerciseMedia } from '../media/exerciseMedia';
import './ExerciseDemo.css';

export default function ExerciseDemo({ exerciseId, sex, language = 'he', compact = false }) {
  const media = useMemo(() => getExerciseMedia(exerciseId, sex), [exerciseId, sex]);
  const [failed, setFailed] = useState(false);

  if (!media || failed) {
    return (
      <div className={`exercise-demo exercise-demo--empty${compact ? ' exercise-demo--compact' : ''}`} aria-hidden="true">
        <span>{language === 'en' ? 'Demo unavailable' : 'הדגמה לא זמינה'}</span>
      </div>
    );
  }

  const alt = language === 'en' ? media.altEn : media.altHe;

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
      {media.quality !== 'approved' && (
        <figcaption className="exercise-demo__quality" data-quality={media.quality}>
          {language === 'en' ? 'Media under review' : 'הדגמה בבדיקה'}
        </figcaption>
      )}
    </figure>
  );
}
