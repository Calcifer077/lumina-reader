# Fixing Layout Shift Caused by shadcn/Radix `Select` Component

## Problem

Opening the sort dropdown (`Select`) in `Toolbar` caused visible content on the page — specifically the `GridView` book grid — to shift horizontally to the left. Closing the dropdown reversed the shift.

- [Problem Version](https://github.com/Calcifer077/lumina-reader/blob/149b33fce6bc4241fed4f8559bbd8d5a9be5dfdb/src/app/_components/home/Toolbar.tsx)
- [Fixed Version](https://github.com/Calcifer077/lumina-reader/blob/340700291c321fcae4487b26eb1381af997463ed/src/app/_components/home/Toolbar.tsx)

## Root Cause

The `Select` component in the project was built on **Radix UI**, via shadcn's `Select` wrapper. Radix uses an internal library called `react-remove-scroll` to lock body scroll whenever a popover/dialog/select opens (so the page doesn't scroll behind the open menu).

Instead of relying solely on the browser's native scrollbar collapse, `react-remove-scroll` actively injects styles onto `<body>` while the lock is active:

```css
body {
  position: relative !important;
  padding-right: 0;
  padding-left: 0;
  padding-top: 0;
  margin-top: 0;
  margin-left: 0;
  margin-right: 15px !important;
}
```

That `margin-right: 15px` compensates for the scrollbar width — but it also shrinks the visible content area, pushing everything (including the book grid) to the left. This happens on every `Select` open/close, independent of any native scrollbar behavior.

## Attempted Fix (Did Not Fully Work)

The standard fix for scrollbar-related layout shift is:

```css
html {
  scrollbar-gutter: stable;
}
```

This reserves space for the scrollbar at all times, so removing/re-adding it doesn't change page width. However, this only addresses **native browser scrollbar collapse** — it does nothing to stop Radix's `react-remove-scroll` from injecting its own `margin-right` on `<body>`. Since Radix's lock is applied manually (not via native `overflow: hidden`), `scrollbar-gutter` alone didn't solve the issue.

Other approaches considered:

- Overriding `body[data-scroll-locked]` styles via CSS — fragile, dependent on Radix/shadcn version and CSS load order, since the injected styles can carry `!important`.
- Setting `modal={false}` on `Select` — disables the scroll lock but changes focus-trapping/accessibility behavior and still depends on Radix internals that could change between versions.

## Final Solution: Custom `Select` Component

To fully eliminate the problem, the shadcn/Radix `Select` was replaced with a lightweight custom-built dropdown with **no scroll locking, no portal, and no injected body styles**.

### `components/ui/custom-select.tsx`

Key implementation details:

- Renders as a plain `relative` positioned container with an `absolute` positioned dropdown — no `React Portal`, so it can't affect anything outside the toolbar.
- Closes on outside click (`mousedown` listener) and `Escape` key.
- No dependency on `react-remove-scroll` or any body-level side effects.
- Matches the original visual styling (uppercase text, centered options, indigo hover state, rounded shadowed panel).

### Updated `toolbar.tsx`

The `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` imports from shadcn were removed and replaced with a single `CustomSelect` component, wired to the same `value` / `onValueChange` props as before — no changes needed to the surrounding sort/view logic.

## Result

- Opening/closing the dropdown no longer touches `<body>` styles.
- `GridView` and all other page content stay perfectly still.
- `scrollbar-gutter: stable` remains in global CSS as a general best practice for native scrollbar handling, but is no longer load-bearing for this specific bug.

## Possible Follow-Ups

- **Keyboard navigation**: arrow keys to move between options, Enter/Space to select — not yet implemented in the custom component.
- **Focus management**: returning focus to the trigger button after closing, for full accessibility parity with Radix.
- **Auto-close on scroll**: closing the dropdown if the trigger scrolls out of view.

## Files Changed

| File                              | Change                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------- |
| `components/ui/custom-select.tsx` | New file — custom dropdown implementation                                     |
| `components/toolbar.tsx`          | Replaced shadcn `Select` usage with `CustomSelect`                            |
| `globals.css`                     | Added `scrollbar-gutter: stable` (general hygiene, kept but not the core fix) |
