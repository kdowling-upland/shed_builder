import { useState, useCallback } from 'react';
import type { ShedDesign } from '../types/shed.ts';

const STORAGE_KEY = 'shed-builder-designs';

interface SavedDesigns {
  [name: string]: ShedDesign;
}

export function useLocalStorage() {
  const [savedDesigns, setSavedDesigns] = useState<SavedDesigns>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const saveDesign = useCallback((design: ShedDesign) => {
    setSavedDesigns((prev) => {
      const next = { ...prev, [design.name]: design };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const loadDesign = useCallback((name: string): ShedDesign | null => {
    return savedDesigns[name] ?? null;
  }, [savedDesigns]);

  const deleteDesign = useCallback((name: string) => {
    setSavedDesigns((prev) => {
      const next = { ...prev };
      delete next[name];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const designNames = Object.keys(savedDesigns);

  return { savedDesigns, designNames, saveDesign, loadDesign, deleteDesign };
}
