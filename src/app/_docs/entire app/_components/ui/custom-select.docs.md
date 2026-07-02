# `CustomSelect` Component Documentation

A dependency-free dropdown/select component built to replace shadcn's Radix-based `Select`. It avoids body scroll locking and portals entirely, which prevents the layout-shift bug described in `select-layout-shift-fix.md`.

Location: `_components/ui/custom-select.tsx`

---

## Overview

`CustomSelect` renders a button (the trigger) and, when clicked, an absolutely-positioned dropdown panel with a list of options. It's a controlled component — the parent owns the selected value and receives change events via a callback, similar to how the original shadcn `Select` was used.

No portal, no `react-remove-scroll`, no global side effects. Everything lives inside a single `relative` positioned wrapper `div`.

---

## Props

| Prop            | Type                      | Required | Description                                                                    |
| --------------- | ------------------------- | -------- | ------------------------------------------------------------------------------ |
| `value`         | `string`                  | Yes      | The currently selected option's `value`. Controlled by the parent.             |
| `onValueChange` | `(value: string) => void` | Yes      | Called with the new `value` when the user selects an option.                   |
| `options`       | `CustomSelectOption[]`    | Yes      | Array of `{ text, value }` objects to render as options.                       |
| `className`     | `string`                  | No       | Extra classes applied to the outer wrapper (e.g. for spacing/width overrides). |

### `CustomSelectOption` type

```ts
interface CustomSelectOption {
  text: string; // label shown to the user
  value: string; // underlying value passed to onValueChange
}
```

---

## Usage

```tsx
import CustomSelect from "@/components/ui/custom-select";

const selectOptions = [
  { text: "recently added", value: "recently_added" },
  { text: "recently opened", value: "recently_opened" },
  { text: "Title A-Z", value: "title_a-z" },
  { text: "Title Z-A", value: "title_z-a" },
];

function Example() {
  const [value, setValue] = useState("recently_added");

  return (
    <CustomSelect
      value={value}
      onValueChange={setValue}
      options={selectOptions}
    />
  );
}
```

This is a drop-in replacement pattern: pass the current value and a setter, same shape as the old `Select`/`onValueChange` API.

---

## How It Works

### 1. Local `open` state

```tsx
const [open, setOpen] = useState(false);
```

Controls whether the dropdown panel is visible. Toggled when the trigger button is clicked.

### 2. Trigger button

```tsx
<button onClick={() => setOpen((prev) => !prev)}>
  {selected?.text}
  <IoChevronDown className={open ? "rotate-180" : ""} />
</button>
```

- Shows the label (`text`) of the currently selected option, looked up from `options` by matching `value`.
- The chevron icon rotates 180° when open, as a visual indicator — pure CSS transform, no extra state.

### 3. Dropdown panel

```tsx
{
  open && (
    <div role="listbox" className="absolute right-0 mt-2 ...">
      {options.map((option) => (
        <div role="option" onClick={() => handleSelect(option.value)}>
          {option.text}
        </div>
      ))}
    </div>
  );
}
```

- Only rendered in the DOM when `open` is `true` (simple conditional render, not `display: none`).
- Positioned with `absolute right-0 mt-2` relative to the wrapper `div` (which is `relative`), so it floats below the trigger without affecting document flow or page layout.
- `z-50` keeps it above surrounding content.

### 4. Selecting an option

```tsx
function handleSelect(optionValue: string) {
  onValueChange(optionValue);
  setOpen(false);
}
```

Calls the parent's callback with the new value, then closes the dropdown.

### 5. Closing on outside click

```tsx
useEffect(() => {
  function handleClickOutside(e: MouseEvent) {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setOpen(false);
    }
  }
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);
```

- `containerRef` is attached to the outer wrapper `div`.
- On every `mousedown` anywhere in the document, checks whether the click landed inside the component. If not, closes the dropdown.
- Listener is added/removed once on mount/unmount (empty dependency array) — it doesn't need to re-run per render since it reads `open` indirectly via `setOpen`, and refs don't need to be in the dependency array.

### 6. Closing on `Escape`

```tsx
useEffect(() => {
  function handleEscape(e: KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
  }
  document.addEventListener("keydown", handleEscape);
  return () => document.removeEventListener("keydown", handleEscape);
}, []);
```

Simple global key listener; closes the dropdown regardless of focus location.

### 7. Accessibility attributes (partial)

- `aria-haspopup="listbox"` and `aria-expanded={open}` on the trigger button.
- `role="listbox"` on the panel, `role="option"` + `aria-selected` on each item.
- These communicate the correct semantics to screen readers, but **keyboard navigation between options is not yet implemented** (see Limitations below).

---

## Styling

All styling is done via Tailwind utility classes directly in the component, matching the visual style of the original shadcn `Select`:

- Uppercase, centered, bold text for both trigger and options.
- `bg-background`, `border-gray-100`, `shadow-md` panel styling.
- `hover:bg-indigo-50` and a persistent `bg-indigo-50` on the currently selected option.

To adjust appearance, edit the class strings directly in `custom-select.tsx` — there's no theming layer or CSS variables involved beyond whatever your Tailwind config already defines (`bg-background`, `text-primary`, etc.).

---

## Why This Avoids the Layout Shift Bug

- **No portal**: the dropdown renders inline in the DOM tree, inside the same `relative` wrapper as the trigger. It can't attach content to `<body>` or affect layout outside its own subtree.
- **No scroll lock**: unlike Radix's `Select`, this component never calls `react-remove-scroll` or similar. Page scroll behavior is completely untouched when the dropdown opens.
- **No injected global styles**: nothing is written to `<body>` or `<html>` — the component only manages its own `open` state and DOM subtree.

---

## Known Limitations / Possible Follow-Ups

| Limitation              | Notes                                                                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| No keyboard navigation  | Arrow keys don't move between options; only click/tap selection works currently.                                                                                               |
| No focus return         | Focus isn't explicitly returned to the trigger button after closing via outside click or Escape.                                                                               |
| No `disabled` state     | There's no built-in way to disable the whole select or individual options.                                                                                                     |
| No auto-close on scroll | If the trigger scrolls out of view while open, the dropdown doesn't automatically close/reposition.                                                                            |
| Fixed positioning logic | Dropdown always opens `right-0`/`mt-2` below the trigger — no collision detection or flipping to open upward near screen edges (Radix's `Popper` provided this automatically). |

These can be added incrementally if/when needed — the component is intentionally minimal to keep it easy to reason about and free of hidden side effects.
