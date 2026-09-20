# PUMP 3 exercise media

Canonical runtime media lives here and nowhere else:

```text
public/exercises/
  female/
    squat.webp
    push-up.webp
    ...
  male/
    squat.webp
    push-up.webp
    ...
```

## Rules

- Folder names are always `female` and `male`.
- File names always use the canonical exercise id from `src/training/data/exercise-manifest.json`.
- Only final runtime assets belong here. Source collages and working PNG files do not.
- A missing sex-specific asset is never silently substituted with the other sex.
- The UI resolves media through `src/training/media/exerciseMedia.js` instead of hard-coded paths.
- Every replacement keeps the same canonical filename so exercise ids remain stable.

## Known blockers

- `female/band-chest-press.webp` is currently missing.
- `seated-scapular-retraction.webp` and `gentle-scapular-retraction.webp` are currently duplicate content in both folders and are marked `replace` in the manifest.
