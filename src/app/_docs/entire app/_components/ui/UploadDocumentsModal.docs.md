# UploadDocumentsModal

A modal dialog for uploading documents (PDF, EPUB) to the library. Supports drag-and-drop, multi-file selection, and displays per-file upload progress. UI only — _upload handling is stubbed and needs to be wired up to a real backend_.

## Import

```tsx
import UploadDocumentsModal from "./UploadDocumentsModal";
```

## Usage

I have used this component in the Navbar. As the navbar already contains the _upload button_, I just wired it up there only.

```tsx
import { useState } from "react";
import UploadDocumentsModal from "./UploadDocumentsModal";

export function LibraryPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsUploadOpen(true)}>Upload documents</button>

      <UploadDocumentsModal
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </>
  );
}
```

## Props

| Prop      | Type         | Default    | Description                                                                                                         |
| --------- | ------------ | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| `open`    | `boolean`    | `true`     | Whether the modal is visible. Parent owns this state.                                                               |
| `onClose` | `() => void` | `() => {}` | Called when the user clicks the close icon, backdrop-adjacent cancel button, or (once wired up) finishes an upload. |

The component renders `null` when `open` is `false` — mount it unconditionally and toggle `open`, or mount/unmount it from the parent, either works.

## Behaviour

- **Dismiss**: clicking outside the modal card or pressing <kbd>Esc</kbd> calls `onClose`. Handled by two reusable hooks — `useOnClickOutside` and `useKeyPress` — rather than inline logic in the component.
- **Drag and drop**: dragging files over the dropzone highlights it (`border-primary` + tinted background) and dropping calls the same file-add handler as the file picker.
- **Browse files**: clicking "Browse files" opens the native file picker (`accept=".pdf,.epub,.mobi"`, `multiple`).
- **File list**: every added file appears in a scrollable list (`max-h-60`) showing name, size, and status (`Waiting`, `NN%`, or `Complete`). Files mid-upload or complete show a thin progress bar.
- **Remove**: the trailing icon button removes a file from the list before/while uploading. On completed files it currently just shows a checkmark — decide whether removal should stay available post-complete once real upload logic lands.
- **Upload button**: disabled whenever the file list is empty (`disabled:opacity-40`), otherwise it's a no-op placeholder button.

## Dependencies

- [`lucide-react`](https://lucide.dev/) for icons (`X`, `UploadCloud`, `FileText`, `CheckCircle2`, `XCircle`).
- Tailwind v4 with the token setup shown in your `globals.css` (`@theme inline` + light/dark custom properties).

## Styling

- `inset-0`: It is used to position anchor elements. It applies `0px` to all four directions simultaneously.

```css
top: 0px;
right: 0px;
bottom: 0px;
left: 0px;
```

## Drag and drop behaviour

First, I have used state to check if the user is dragging something or not.

```tsx
const [isDragging, setIsDragging] = useState(false);
```

This is purely used for styling purposes.

React gives us events for dragging and dropping of elements which we can access and perform our operations.

```tsx
<label
    htmlFor="file-upload-input"

    onDragOver={(e) => {
	    e.preventDefault();
        setIsDragging(true);
    }}
	onDragLeave={() => setIsDragging(false)}

    onDrop={(e) => {
	    e.preventDefault();
	    setIsDragging(false);
	    if(e.dataTransfer.files.length)
		    addFiles(e.dataTransfer.files);
	}}

	 className={`flex flex-col items-center gap-2 rounded-md border-2 border-dashed px-6 py-8 text-center cursor-pointer ${
    isDragging
    ? "border-primary bg-secondary-container/40"
    : "border-outline-variant"
    }`}
>
```

`onDragOver` and `onDragLeave` are just used for setting state `isDragging` which is used for styling.

`onDrop` is used for adding items to state which will be sent to the database (not done yet) by just calling `addFiles`.

## What's stubbed (needs real implementation)

- `INITIAL_FILES` seeds the list with 3 fake files purely for demo purposes — replace with `[]` in production.
- `addFiles` only updates local state; it doesn't validate file type/size against `MAX_SIZE_MB` or start any real upload/network request.
- No actual progress reporting — `progress`/`status` never change after a file is added.
- The "Upload to library" button has no `onClick` — needs to trigger the real upload flow and probably call `onClose` on success.

## Accessibility notes / follow-ups

- The backdrop `<div>` doesn't yet have `role="dialog"`, `aria-modal`, or a labelled heading association — add those back (`aria-labelledby` pointing at the `<h2>`) for screen reader support.
- There's no focus trap or Escape-to-close handling yet; consider a modal primitive (e.g. Radix `Dialog`) if this needs to be fully accessible.
- Icon-only buttons (close, remove file) rely on visual context only — add `aria-label`s before shipping.

## Hooks

### `useOnClickOutside`

```ts
useOnClickOutside(ref, handler, active?)
```

| Param     | Type                                        | Description                                                                                                    |
| --------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `ref`     | `RefObject<T \| null>`                      | Ref attached to the element that should be considered "inside".                                                |
| `handler` | `(event: MouseEvent \| TouchEvent) => void` | Called when a `mousedown`/`touchstart` happens outside `ref.current`.                                          |
| `active`  | `boolean` (default `true`)                  | Set to `false` to skip attaching listeners — pass your modal's `open` state so it doesn't listen while closed. |

Attaches/removes `document` listeners inside a `useEffect`, re-running whenever `ref`, `handler`, or `active` change. Works for both mouse and touch input.

### `useKeyPress`

```ts
useKeyPress(key, handler, active?)
```

| Param     | Type                             | Description                                                         |
| --------- | -------------------------------- | ------------------------------------------------------------------- |
| `key`     | `string`                         | The `KeyboardEvent.key` value to match, e.g. `"Escape"`, `"Enter"`. |
| `handler` | `(event: KeyboardEvent) => void` | Called when that key is pressed.                                    |
| `active`  | `boolean` (default `true`)       | Set to `false` to skip attaching the listener.                      |

Attaches a `window` `keydown` listener inside a `useEffect`. Generic enough to reuse for other shortcuts (e.g. `useKeyPress("Enter", handleSubmit)`).

### Usage in this component

```tsx
const modalRef = useRef<HTMLDivElement>(null);

useOnClickOutside(modalRef, onClose, open);
useKeyPress("Escape", onClose, open);
```

`modalRef` is attached to the modal card (not the backdrop), so `useOnClickOutside` fires `onClose` whenever the click/tap lands outside the card — including on the backdrop itself. Both hooks are gated by `open` so they don't do any work while the modal is closed.
