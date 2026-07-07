# How the Debounce Timeout Works (Step-by-Step)

This docs contains information about the following file:

- [EpubViewer](https://github.com/Calcifer077/lumina-reader/blob/main/src/app/_components/reader/EpubViewer.tsx)
- [PdfViewer](https://github.com/Calcifer077/lumina-reader/blob/main/src/app/_components/reader/PdfViewer.tsx)

This pattern is called a **Debounce**. Its purpose is to wait until the user _stops_ doing an action (turning pages) before executing a heavy task (sending an API request).

To manage this across page turns, the code uses a **React Ref** (`saveTimeoutRef`) as a persistent clipboard to hold the ID of the active timer.

Here is exactly how the timer behaves when a user flips through pages quickly:

#### Step A: User turns to Page 1

1. The `relocated` event fires.
2. The code checks `saveTimeoutRef.current`. It's currently `null`.
3. It starts a new 2-second countdown timer via `setTimeout`.
4. `setTimeout` returns a unique ID (e.g., `105`). This ID is saved in `saveTimeoutRef.current`.

#### Step B: User turns to Page 2 (1 second later)

1. The `relocated` event fires again.
2. The code checks `saveTimeoutRef.current` and finds ID `105`.
3. **The Reset:** It calls `clearTimeout(105)`. The first timer is brutally murdered before it ever got to hit the 2-second mark. Page 1 will never be saved.
4. It starts a brand new 2-second countdown timer and saves the new ID (e.g., `106`) into `saveTimeoutRef.current`.

#### Step C: User stops to read Page 3 (Stays for 3 seconds)

1. The `relocated` event fires, clears timer `106`, and spawns timer `107`.
2. The user reads quietly. No more `relocated` events fire.
3. 2 seconds tick by. Timer `107` successfully reaches the finish line!
4. The callback executes:
   - It clears the ref: `saveTimeoutRef.current = null`.
   - It checks if the component was unmounted (`if (!cancelled)`).
   - It calls `saveProgress(locationStr)` to finally update the database.
