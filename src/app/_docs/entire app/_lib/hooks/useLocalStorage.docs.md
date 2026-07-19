# `useLocalStorage`

A custom hook which persists state to `localStorage` and syncs it back on mount.

## Import

```tsx
import useLocalStorage from "./useLocalStorage";
```

## Usage

```tsx
const [value, setValue] = useLocalStorage("key", initialValue);
```

Works like `useState`, but reads from and writes to `localStorage` under the given key.

```tsx
const [name, setName] = useLocalStorage("name", "");

return <input value={name} onChange={(e) => setName(e.target.value)} />;
```

## Props

| Prop           | Type     | Default | Description                                 |
| -------------- | -------- | ------- | ------------------------------------------- |
| `key`          | `string` | absent  | `localStorage` key to read/write            |
| `initialValue` | `T`      | absent  | Value used before saved data (if any) loads |

## Returns

| Value      | Type                          | Description                |
| ---------- | ----------------------------- | -------------------------- |
| `value`    | `T`                           | Current state value        |
| `setValue` | `Dispatch<SetStateAction<T>>` | Setter, same as `useState` |

## Behaviour

- **Initial render**: State starts as `initialValue`, since reading from `localStorage` happens in an effect (client-only), not during render.
- **Hydration**: On mount, if a value exists under `key` in `localStorage`, it's parsed and used to overwrite state.
- **Persistence**: Every time `value` changes, it's serialized with `JSON.stringify` and written back to `localStorage`.
- **Key change**: If `key` changes, the hook re-reads from the new key.

## Dependencies

- `useState`, `useEffect` from `react`

## Working notes

### Reading saved value on mount

```ts
useEffect(() => {
  const saved = window.localStorage.getItem(key);
  if (saved) {
    setValue(JSON.parse(saved));
  }
}, [key]);
```

### Writing value on change

```ts
useEffect(() => {
  window.localStorage.setItem(key, JSON.stringify(value));
}, [key, value]);
```

### Dependency arrays

```ts
[key]; // read effect
[key, value]; // write effect
```

## Notes / caveats

- `JSON.parse`/`JSON.stringify` means non-serializable values (functions, `undefined`, `Map`/`Set`) won't round-trip correctly.
- No `try/catch` around `JSON.parse`, so malformed data in `localStorage` (e.g. edited manually) will throw.
- Runs on every mount for a given `key`, so if two components use the same `key`, they won't stay in sync with each other's updates automatically (no `storage` event listener).
