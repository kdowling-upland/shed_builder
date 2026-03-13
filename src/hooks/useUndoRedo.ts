import { useCallback } from 'react';
import { useShedStore } from '../store/useShedStore.ts';

export function useUndoRedo() {
  const store = useShedStore.temporal;

  const undo = useCallback(() => {
    store.getState().undo();
  }, [store]);

  const redo = useCallback(() => {
    store.getState().redo();
  }, [store]);

  const canUndo = store.getState().pastStates.length > 0;
  const canRedo = store.getState().futureStates.length > 0;

  return { undo, redo, canUndo, canRedo };
}
