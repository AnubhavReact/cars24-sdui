import React, { createContext, useContext, useState } from 'react';

// Lets the fallback debug overlays (unknown-component / version-mismatch
// boxes, see UnknownComponent.tsx) be toggled off at runtime in a debug
// build, to preview exactly what a real user's release build would show
// without needing a separate rebuild. The toggle UI itself only renders in
// __DEV__ (see App.tsx) -- this context has no effect in a release build
// regardless of its state, because UnknownComponent still hard-gates on
// __DEV__ first.
interface DevModeContextValue {
  showDebugOverlays: boolean;
  toggle: () => void;
}

const DevModeContext = createContext<DevModeContextValue | null>(null);

export function useDevMode(): DevModeContextValue {
  const ctx = useContext(DevModeContext);
  if (!ctx) throw new Error('useDevMode must be used within DevModeProvider');
  return ctx;
}

export function DevModeProvider({ children }: { children: React.ReactNode }) {
  const [showDebugOverlays, setShowDebugOverlays] = useState(true);
  return (
    <DevModeContext.Provider value={{ showDebugOverlays, toggle: () => setShowDebugOverlays((v) => !v) }}>
      {children}
    </DevModeContext.Provider>
  );
}
