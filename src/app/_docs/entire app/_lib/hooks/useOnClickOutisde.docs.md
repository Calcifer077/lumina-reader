# `useOnClickOutside`

A custom hook which removes a modal from the viewport if the user clicks outside of it.

## Import

```tsx
import useOnClickOutside from "./useOnClickOutside";
```

## Usage

```tsx
useOnClickOutside(modalRef, onClose, open);
```

Have to create a `ref` which points to the DOM element to look for.

```tsx
const modalRef = useRef<HTMLDivElement>(null);

return <div ref={modalRef}>// ...</div>;
```

## Props

| Prop      | Type                                    | Default | Description             |
| --------- | --------------------------------------- | ------- | ----------------------- |
| `ref`     | `RefObject`                             | absent  | DOM element to look for |
| `handler` | `(e: MouseEvent \| TouchEvent) => void` | absent  | What would the hook do  |
| `active`  | `boolean`                               | `true`  | Is the modal open       |

## Behaviour

- **Dismiss**: If user clicks outside of the element asked for, `handler` will run for both `mousedown` and `touchstart` event.

## Dependencies

- `useEffect` from `react`

## Working notes

### Creating a listener

```ts
// 'ref' contains the element outside of which we will detect the click
const listener = (event: MouseEvent | TouchEvent) => {
  // we can access that element using 'ref.current'
  const el = ref.current;

  // If there is no 'ref' or 'ref' contains the element that was just clicked, don't do anything.
  if (!el || el.contains(event.target as Node)) return;

  // Escaped the guard clause (above), remove the modal
  handler(event);
};
```

### Attaching event listeners

```ts
document.addEventListener("mousedown", listener);
document.addEventListener("touchstart", listener);
```

### Clean up

```ts
return () => {
  document.removeEventListener("mousedown", listener);
  document.removeEventListener("touchstart", listener);
};
```

### Dependency array

```ts
[ref, handler, active];
```
