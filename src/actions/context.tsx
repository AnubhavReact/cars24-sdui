import React, { createContext, useCallback, useContext, useState } from 'react';
import { Linking } from 'react-native';
import type { Action } from '../schema/types';

interface NavEntry {
  screenId: string;
  params?: Record<string, string>;
}

interface SheetEntry {
  sheetId: string;
  params?: Record<string, unknown>;
}

interface SduiContextValue {
  state: Record<string, unknown>;
  dispatch: (action: Action) => void;
  stack: NavEntry[];
  pop: () => void;
  activeSheet: SheetEntry | null;
  closeSheet: () => void;
}

const SduiContext = createContext<SduiContextValue | null>(null);

export function useSdui(): SduiContextValue {
  const ctx = useContext(SduiContext);
  if (!ctx) throw new Error('useSdui must be used within SduiProvider');
  return ctx;
}

export function SduiProvider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: Record<string, unknown>;
}) {
  const [state, setState] = useState<Record<string, unknown>>(initialState ?? {});
  const [stack, setStack] = useState<NavEntry[]>([]);
  const [activeSheet, setActiveSheet] = useState<SheetEntry | null>(null);

  const pop = useCallback(() => setStack((s) => s.slice(0, -1)), []);
  const closeSheet = useCallback(() => setActiveSheet(null), []);

  const dispatch = useCallback((action: Action) => {
    switch (action.type) {
      case 'navigate':
        setStack((s) => [...s, { screenId: action.screen, params: action.params }]);
        break;
      case 'openUrl':
        Linking.openURL(action.url).catch(() => {});
        break;
      case 'openSheet':
        setActiveSheet({ sheetId: action.sheet, params: action.params });
        break;
      case 'call':
        Linking.openURL(`tel:${action.phoneNumber}`).catch(() => {});
        break;
      case 'setState':
        setState((s) => ({ ...s, [action.key]: action.value }));
        break;
      case 'toggleState':
        setState((s) => ({ ...s, [action.key]: !s[action.key] }));
        break;
      case 'composite':
        action.actions.forEach((a) => dispatch(a));
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SduiContext.Provider value={{ state, dispatch, stack, pop, activeSheet, closeSheet }}>
      {children}
    </SduiContext.Provider>
  );
}
