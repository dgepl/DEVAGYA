"use client";

import React, { useEffect } from "react";

/**
 * ContentProtectionProvider
 * Prevents text selection, copy, cut, drag, context menu, and keyboard selection shortcuts
 * across the site, while preserving normal input/textarea typing and editing capabilities.
 */
export function ContentProtectionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Helper to determine if the target element is an input or editable field
    const isInteractiveElement = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof HTMLElement)) return false;
      const tagName = target.tagName.toLowerCase();
      if (tagName === "input" || tagName === "textarea") return true;
      if (target.isContentEditable || target.closest("[contenteditable='true']")) return true;
      return false;
    };

    // 1. Prevent text selection via mouse drag or touch on non-interactive content
    const handleSelectStart = (e: Event) => {
      if (!isInteractiveElement(e.target)) {
        e.preventDefault();
      }
    };

    // 2. Prevent copying text
    const handleCopy = (e: ClipboardEvent) => {
      if (!isInteractiveElement(e.target)) {
        e.preventDefault();
        if (e.clipboardData) {
          e.clipboardData.clearData();
        }
      }
    };

    // 3. Prevent cutting text
    const handleCut = (e: ClipboardEvent) => {
      if (!isInteractiveElement(e.target)) {
        e.preventDefault();
      }
    };

    // 4. Prevent right-click context menu (which allows "Copy", "Select All", etc.)
    const handleContextMenu = (e: MouseEvent) => {
      if (!isInteractiveElement(e.target)) {
        e.preventDefault();
      }
    };

    // 5. Prevent dragging text or images out of the site
    const handleDragStart = (e: DragEvent) => {
      if (!isInteractiveElement(e.target)) {
        e.preventDefault();
      }
    };

    // 6. Prevent keyboard shortcuts like Ctrl+A (Select All), Ctrl+C (Copy), Ctrl+X (Cut), Ctrl+U (View Source)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (!isCtrlOrCmd) return;

      const key = e.key.toLowerCase();

      // View source shortcut (Ctrl+U)
      if (key === "u") {
        e.preventDefault();
        return;
      }

      // If outside an editable field, block Ctrl+A, Ctrl+C, Ctrl+X, Ctrl+S
      if (!isInteractiveElement(e.target)) {
        if (key === "a" || key === "c" || key === "x" || key === "s") {
          e.preventDefault();
        }
      }
    };

    // Attach listeners at document level (capturing phase where appropriate)
    document.addEventListener("selectstart", handleSelectStart, true);
    document.addEventListener("copy", handleCopy, true);
    document.addEventListener("cut", handleCut, true);
    document.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("dragstart", handleDragStart, true);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("selectstart", handleSelectStart, true);
      document.removeEventListener("copy", handleCopy, true);
      document.removeEventListener("cut", handleCut, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("dragstart", handleDragStart, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  return <>{children}</>;
}
