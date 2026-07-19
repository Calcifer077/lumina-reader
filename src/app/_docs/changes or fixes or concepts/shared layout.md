# Shared Layout

In this application `/library`, `/books`, `/settings` show navbar and sidebar where as route of `/reader` don't show anything and goes full screen.

Earlier version of the app had dedicated layout for each route that needed sidebar and navbar.

But there is a concept (**Route Group**) in nextjs through which we can create conceptual folders. It will not actually create a route for the browser but will group related routes so that we can create shared layout, loading files and more.

```
(shared sidebar)/
│   ├── book/
|	│   └── [bookId]/
|	│       └── page.tsx
│   ├── layout.tsx
│   ├── library/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   └── settings/
|   │       └── page.tsx
```
