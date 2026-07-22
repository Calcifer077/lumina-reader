# Problem with useLocalStorage hook

The problem with this hook was that it was not using the values inside localstorage and always rewrote that value with `initialValue`.

Problematic file:

- [Github](https://github.com/Calcifer077/lumina-reader/commit/56ebeb08b838a23ce9bfe42b0b9b83b99785ccbd)

Same file from above commit:

```ts
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
```

In the above hook there was a race condition.

```ts
const [value, setValue] = useState<T>(initialValue); // value = initialValue

useEffect(() => {
  const saved = window.localStorage.getItem(key);
  if (saved) setValue(JSON.parse(saved)); // async — schedules a re-render, doesn't update `value` yet
}, [key]);

useEffect(() => {
  window.localStorage.setItem(key, JSON.stringify(value)); // uses THIS render's `value`
}, [key, value]);
```

1. First render: `value` = `initialValue`.
2. Both effects run after that first commit, in the order they're declared, both still closed over `value` = `initialValue`.
3. Read-effect runs: gets saved from storage, calls `setValue(saved)`. This only schedules an update — value in this pass is still `initialValue`.
4. Write-effect runs immediately after, in the same pass, using the stale value (`initialValue`) — so it immediately overwrites the real saved data back to `initialValue`.
5. React re-renders with the new value from step 3, so the UI briefly shows the correct saved value...
6. ...but the write-effect fires again on that render too (since value changed), which writes it back — so storage ends up correct, but there was a window where it got clobbered, and any consumer reading storage directly in between (or a second mount) would see the default.

## Fix:

```ts
"use client";

import { useEffect, useState } from "react";

function readValue<T>(key: string, initialValue: T): T {
  if (typeof window === "undefined") return initialValue;

  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : initialValue;
  } catch (err) {
    console.error(`Error reading localStorage key "${key}":`, err);
    return initialValue;
  }
}

function useLocalStorage<T>(key: string, initialValue: T) {
  // Lazy initializer runs once, synchronously, before first paint.
  const [value, setValue] = useState<T>(() => readValue(key, initialValue));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Error writing localStorage key "${key}":`, err);
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export default useLocalStorage;
```

Fix uses initialValue from the localstorage on the first call itself. It also wraps `JSON.parse` in try/catch to avoid any errors if somewhere in the code the value was written to localstorage without `JSON.stringify`.
