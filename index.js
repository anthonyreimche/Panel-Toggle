// Panel Toggle for Safelight
// Copyright (c) 2026 Anthony Reimche. MIT License.
//
// Adds a preview-off "eye" to every Develop panel header that has an effect the
// renderer can neutralize — the built-in adjustment panels (White Balance,
// Basic, Tone Curve, Color Grading, Detail, Lens Correction, Effects, HSL,
// Masking, Heal), Crop & Straighten, Transform, and any installed extension
// panel whose extension owns a GPU stage.
//
// Interaction is PRESS-AND-HOLD, not click: hold the eye to preview the image
// with that panel switched off, release to see the current image again. It is
// view-only and momentary — it never edits the photo, never writes history, and
// never persists, so it can't diverge from what thumbnails and export produce.
//
// All the heavy lifting lives in core: holding sets the panel's bypass flag in
// the develop store (`setPanelBypass`), and the renderer neutralizes that
// panel's contribution for the live view (core params reset to defaults;
// extension stage params dropped so their uniforms fall back to neutral). This
// extension is just the button.

const ACCESSORY_ID = "panel-click-to-toggle.eye";

// 13px eye / eye-off icons, drawn with the host's React (no JSX, no bundler).
function eyeOpen(h) {
  return h(
    "svg",
    {
      width: 13, height: 13, viewBox: "0 0 24 24", fill: "none",
      stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round",
      strokeLinejoin: "round", "aria-hidden": true,
    },
    h("path", { key: "p", d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" }),
    h("circle", { key: "c", cx: 12, cy: 12, r: 3 }),
  );
}

function eyeOff(h) {
  return h(
    "svg",
    {
      width: 13, height: 13, viewBox: "0 0 24 24", fill: "none",
      stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round",
      strokeLinejoin: "round", "aria-hidden": true,
    },
    h("path", { key: "a", d: "M9.88 9.88a3 3 0 1 0 4.24 4.24" }),
    h("path", { key: "b", d: "M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" }),
    h("path", { key: "c", d: "M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" }),
    h("line", { key: "l", x1: 2, y1: 2, x2: 22, y2: 22 }),
  );
}

export function activate(api) {
  const React = api.react;
  const h = React.createElement;
  const useDevelopStore = api.stores.useDevelopStore;

  // Rendered by core in EVERY panel's dock header; props carry that panel's
  // identity. Returns null for panels with no previewable effect or outside the
  // Develop module, so the eye only appears where holding it does something.
  function PanelEye(props) {
    const { panelId, title, module, previewable } = props;

    // Hooks must run unconditionally (rules of hooks) — decide visibility after.
    const held = useDevelopStore((s) => !!s.bypassedPanels[panelId]);
    const setOff = React.useCallback(
      (off) => useDevelopStore.getState().setPanelBypass(panelId, off),
      [panelId],
    );
    // Safety net: if the panel unmounts (closed/relaid-out) mid-hold, or the
    // extension reloads, never leave the image stuck in its previewed-off state.
    React.useEffect(() => () => setOff(false), [setOff]);

    const show = previewable !== false && (!module || module === "develop");
    if (!show) return null;

    const press = (e) => {
      // Stop the header from treating this as the start of a panel drag.
      e.stopPropagation();
      e.preventDefault();
      // Capture so we still get the matching pointerup even if the cursor slides
      // off the tiny button while held.
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
      setOff(true);
    };
    const release = (e) => {
      e.stopPropagation();
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
      setOff(false);
    };

    const label = held
      ? `Previewing “${title}” off — release to restore`
      : `Hold to preview “${title}” off`;

    return h(
      "button",
      {
        type: "button",
        title: label,
        "aria-label": label,
        "aria-pressed": held,
        onPointerDown: press,
        onPointerUp: release,
        onPointerCancel: release,
        onLostPointerCapture: () => setOff(false),
        // A hold can end in a click; swallow it so nothing else reacts.
        onClick: (e) => e.stopPropagation(),
        onContextMenu: (e) => e.preventDefault(),
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "none",
          padding: 0,
          margin: 0,
          cursor: "pointer",
          lineHeight: 0,
          touchAction: "none",
          color: held ? "var(--color-text-muted)" : "var(--color-text-secondary)",
        },
      },
      held ? eyeOff(h) : eyeOpen(h),
    );
  }

  api.registerPanelHeaderAccessory({
    id: ACCESSORY_ID,
    component: PanelEye,
    order: 0, // sit at the far left of the header, before the title
  });
}

export function deactivate() {
  // Nothing to tear down: core sweeps the registered accessory on disable, and
  // the bypass map only ever holds a value while a button is physically held.
}
