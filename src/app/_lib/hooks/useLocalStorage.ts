"use client";

import { useEffect, useState } from "react";

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const saved = window.localStorage.getItem(key);

    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(JSON.parse(saved));
    }
  }, [key]);

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

export default useLocalStorage;
