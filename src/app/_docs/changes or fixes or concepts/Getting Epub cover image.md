# Getting EPUB cover image

The main function that does it is `getEpubCoverImage` under `_lib/books.ts`.

We can't just directly interact with epub file and have to convert it to a file path, the buffer is temporarily written to disk, processed and then cleaned up.

```ts
const tmpPath = path.join(tmpdir(), `${randomUUID()}.epub`);
await writeFile(tmpPath, buffer);

// clean up
await unlink(tmpPath).catch(() => {});
```

Code of `getEpubCoverImage`

```ts
export async function getEpubCoverImage(
  buffer: Buffer,
): Promise<{ data: Buffer | undefined; mimeType: string | undefined } | null> {
  const tmpPath = path.join(tmpdir(), `${randomUUID()}.epub`);
  await writeFile(tmpPath, buffer);

  try {
    const epub = await openEpub(tmpPath);

    const coverId = epub.metadata.cover; // manifest id, e.g. "cover-image"
    if (!coverId) return null;

    const { data, mimeType } = await getImage(epub, coverId);
    return { data, mimeType };
  } catch (err) {
    console.error("Failed to extract EPUB cover:", err);
    return null;
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
}
```

First we open the epub file

### `openEpub(filePath: string): Promise<EPub>`

It wraps the callback-based `EPub` parsing in a Promise.

```ts
function openEpub(filePath: string): Promise<EPub> {
  return new Promise((resolve, reject) => {
    const epub = new EPub(filePath);
    epub.on("end", () => resolve(epub));
    epub.on("error", (err: Error) => reject(err));
    epub.parse();
  });
}
```

It resolves a fully parsed `EPub` instance once the `"end"` event fires.

After opening Epub we get image using another function called `getImage`

```ts
function getImage(
  epub: EPub,
  id: string,
): Promise<{ data: Buffer | undefined; mimeType: string | undefined }> {
  return new Promise((resolve, reject) => {
    epub.getImage(id, (err, data, mimeType) => {
      if (err) return reject(err);
      resolve({ data, mimeType });
    });
  });
}
```

It returns a promise that can be resolved to raw image bytes and its MIME type.

Our main function `getEpubCoverImage` returns these and now we can simply upload these files to our storage.

**Behavior / Flow**

1. Writes `buffer` to a temporary file (`{tmpdir}/{randomUUID()}.epub`).
2. Parses the EPUB via `openEpub`.
3. Reads `epub.metadata.cover` to get the manifest ID of the cover image.
   - Returns `null` immediately if no cover ID exists.
4. Fetches the image data via `getImage`.
5. **Always** deletes the temporary file in a `finally` block, regardless of success/failure (deletion errors are silently swallowed).

I have used this function in upload route so it gets the cover url at the time of uploading itself.
