# `useKeyPress`

A custom hook which basically removes a modal from view based on key press.

## Import

```tsx
import useKeyPress from "./useKeyPress";
```

## Usage

```tsx
useKeyPress("Escape", onClose, open);
```

## Props

| Prop      | Type                         | Default | Description                           |
| --------- | ---------------------------- | ------- | ------------------------------------- |
| `key`     | `string`                     | absent  | On which key press would the hook run |
| `handler` | `(e: KeyboardEvent) => void` | absent  | What would the hook do                |
| `active`  | `boolean`                    | `true`  | Is the modal open                     |

## Behaviour

- **Dismiss**: If correct key is pressed (as passed down by its caller), the modal will be closed (or the handler which the user intended to run). Will only run if the `active` is `true` or the modal is open.

## Dependencies

- `useEffect` from `react`

Hook also does clean up after running.

## Working notes

### Creating a listener

```ts
// listening for the key that was asked by the hook user
const listener = (event: KeyboardEvent) => {
  if (event.key === key) handler(event);
};
```

### Attaching event listeners

```ts
window.addEventListener("keydown", listener);
```

### Clean up

```ts
return () => window.removeEventListener("keydown", listener);
```

### Dependency array

```ts
[ref, handler, active];
```
