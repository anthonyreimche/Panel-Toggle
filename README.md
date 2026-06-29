# Panel Toggle

Hold-to-preview visibility buttons for every Safelight Develop panel.

## What it does

Installs a small eye button in the header of every Develop panel that has an
effect the renderer can switch off:

- the built-in adjustment panels — White Balance, Basic, Tone Curve, Color
  Grading, Detail, Lens Correction, Effects, HSL, Masking, Heal
- Crop & Straighten and Transform (preview the un-cropped / un-transformed
  frame, so you can see exactly what the framing is doing)
- any installed extension panel whose extension contributes a GPU stage

Panels with nothing to preview — Histogram, Edit, Presets — don't get a button.

## How to use it

**Press and hold** the eye to preview the image with that panel switched off.
**Release** to see the current image again.

It is deliberately *hold*, not click:

- It is **view-only and momentary**. It never edits the photo, never adds an
  undo step, and never persists — so the moment you let go, you're back to your
  real edit.
- Because nothing is stored, there's no way for the Develop view to disagree
  with your thumbnails or your exports. What you export is always your full edit.

## Notes

- Holding the eye on **Crop** or **Transform** temporarily hides that panel's
  interactive overlay handles so they don't float over the re-framed preview.
- Preview-off for an **extension** panel resets that extension's GPU stage(s) to
  their neutral defaults. If one extension owns several panels, holding any one
  of them previews all of that extension's stages off (the panel↔stage link
  isn't exposed to do anything finer).

## Requirements

Safelight with the `registerPanelHeaderAccessory` extension API (panel
header accessories + per-panel preview-off).

## License

MIT — see [LICENSE](LICENSE).
