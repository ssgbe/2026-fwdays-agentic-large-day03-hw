import React from "react";

import { KEYS } from "@excalidraw/common";

import { Excalidraw } from "../index";

import { API } from "./helpers/api";
import { Keyboard, UI } from "./helpers/ui";
import { act, render } from "./test-utils";

// Radix UI's useSize hook requires ResizeObserver; polyfill it for jsdom.
const mockResizeObserver = () => {
  (global as any).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
};

describe("zen mode — color picker shortcuts", () => {
  beforeEach(async () => {
    mockResizeObserver();
    await render(<Excalidraw handleKeyboardGlobally={true} />);
    // Create and keep a selected element so that showSelectedShapeActions
    // returns true and .selected-shape-actions is rendered in the DOM.
    UI.createElement("rectangle", { size: 100 });
  });

  // ─── LayerUI behaviour (directly tests the transition-left fix) ───────────

  it("selected-shape-actions has transition-left when zenMode is on and no popup open", () => {
    API.setAppState({ zenModeEnabled: true });

    const panel = document.querySelector(".selected-shape-actions");
    expect(panel).not.toBeNull();
    expect(panel!.classList.contains("transition-left")).toBe(true);
  });

  it("selected-shape-actions loses transition-left when elementStroke popup opens in zenMode", () => {
    API.setAppState({ zenModeEnabled: true });
    act(() => Keyboard.keyPress(KEYS.S));

    const panel = document.querySelector(".selected-shape-actions");
    expect(panel).not.toBeNull();
    expect(panel!.classList.contains("transition-left")).toBe(false);
  });

  it("selected-shape-actions loses transition-left when elementBackground popup opens in zenMode", () => {
    API.setAppState({ zenModeEnabled: true });
    act(() => Keyboard.keyPress(KEYS.G));

    const panel = document.querySelector(".selected-shape-actions");
    expect(panel).not.toBeNull();
    expect(panel!.classList.contains("transition-left")).toBe(false);
  });

  it("selected-shape-actions regains transition-left when popup closes in zenMode", () => {
    API.setAppState({ zenModeEnabled: true, openPopup: "elementStroke" });

    const panelBefore = document.querySelector(".selected-shape-actions");
    expect(panelBefore!.classList.contains("transition-left")).toBe(false);

    API.setAppState({ openPopup: null });

    const panelAfter = document.querySelector(".selected-shape-actions");
    expect(panelAfter!.classList.contains("transition-left")).toBe(true);
  });

  it("selected-shape-actions has no transition-left outside zenMode regardless of popup state", () => {
    API.setAppState({ zenModeEnabled: false, openPopup: "elementStroke" });

    const panel = document.querySelector(".selected-shape-actions");
    expect(panel).not.toBeNull();
    expect(panel!.classList.contains("transition-left")).toBe(false);
  });

  // ─── Keyboard shortcuts still set openPopup (guard smoke test) ───────────

  it("S/G with selection tool and no selected elements do nothing in zen mode", () => {
    UI.createElement("rectangle", { size: 100 });
    // Don't select the element — keep selectedElementIds empty via clearSelection
    API.setAppState({
      zenModeEnabled: true,
      selectedElementIds: {},
      activeTool: {
        type: "selection",
        customType: null,
        locked: false,
        fromSelection: false,
        lastActiveTool: null,
      },
    });

    Keyboard.keyPress(KEYS.S);
    Keyboard.keyPress(KEYS.G);

    const { h } = window;
    expect(h.state.openPopup).toBeNull();
  });
});
