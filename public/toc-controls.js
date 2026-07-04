(() => {
  const root = document.documentElement;
  const stateKey = "docs-center:toc-state";
  const widthKey = "docs-center:toc-width";
  const defaultWidth = 280;
  const minWidth = 192;
  const maxWidth = 448;

  let width = readWidth();
  let state = readState();
  let toggleButton;

  function clampWidth(value) {
    return Math.min(maxWidth, Math.max(minWidth, Math.round(value || defaultWidth)));
  }

  function readState() {
    try {
      return localStorage.getItem(stateKey) === "collapsed" ? "collapsed" : "open";
    } catch {
      return "open";
    }
  }

  function readWidth() {
    try {
      return clampWidth(Number(localStorage.getItem(widthKey)) || defaultWidth);
    } catch {
      return defaultWidth;
    }
  }

  function persist(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore private mode or disabled storage. The control still works for the session.
    }
  }

  function applyWidth(nextWidth, shouldPersist = true) {
    width = clampWidth(nextWidth);
    if (state !== "collapsed") {
      root.style.setProperty("--docs-toc-width", `${width}px`);
    }
    if (shouldPersist) {
      persist(widthKey, String(width));
    }
  }

  function updateButton() {
    if (!toggleButton) return;
    const expanded = state !== "collapsed";
    toggleButton.setAttribute("aria-expanded", String(expanded));
    toggleButton.setAttribute("aria-label", expanded ? "收起本页目录" : "展开本页目录");
    toggleButton.title = expanded ? "收起本页目录" : "展开本页目录";
  }

  function setState(nextState, shouldPersist = true) {
    state = nextState === "collapsed" ? "collapsed" : "open";
    root.setAttribute("data-docs-toc", state);

    if (state === "collapsed") {
      root.style.removeProperty("--docs-toc-width");
    } else {
      applyWidth(width, false);
    }

    if (shouldPersist) {
      persist(stateKey, state);
    }
    updateButton();
  }

  function createControls() {
    const sidebar = document.querySelector(".right-sidebar");
    const panel = document.querySelector(".right-sidebar-panel");
    if (!sidebar || !panel || document.querySelector(".docs-toc-toggle")) return;

    if (!panel.id) {
      panel.id = "docs-right-toc";
    }

    toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = "docs-toc-toggle";
    toggleButton.setAttribute("aria-controls", panel.id);
    toggleButton.addEventListener("click", () => {
      setState(state === "collapsed" ? "open" : "collapsed");
    });

    const resizer = document.createElement("div");
    resizer.className = "docs-toc-resizer";
    resizer.role = "separator";
    resizer.tabIndex = 0;
    resizer.setAttribute("aria-orientation", "vertical");
    resizer.setAttribute("aria-label", "拖拽调整本页目录宽度");

    resizer.addEventListener("pointerdown", (event) => {
      if (state === "collapsed") return;
      event.preventDefault();

      const startX = event.clientX;
      const startWidth = width;
      root.setAttribute("data-docs-toc-dragging", "true");

      const onMove = (moveEvent) => {
        applyWidth(startWidth + startX - moveEvent.clientX);
      };

      const onEnd = () => {
        root.removeAttribute("data-docs-toc-dragging");
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onEnd);
        window.removeEventListener("pointercancel", onEnd);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onEnd, { once: true });
      window.addEventListener("pointercancel", onEnd, { once: true });
    });

    resizer.addEventListener("keydown", (event) => {
      if (state === "collapsed") return;
      if (event.key === "ArrowLeft") {
        applyWidth(width + 16);
      } else if (event.key === "ArrowRight") {
        applyWidth(width - 16);
      } else if (event.key === "Home") {
        applyWidth(minWidth);
      } else if (event.key === "End") {
        applyWidth(maxWidth);
      } else {
        return;
      }
      event.preventDefault();
    });

    resizer.addEventListener("dblclick", () => {
      applyWidth(defaultWidth);
    });

    document.body.append(toggleButton, resizer);
    updateButton();
  }

  function init() {
    createControls();
    applyWidth(width, false);
    setState(state, false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
