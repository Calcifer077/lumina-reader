# page.tsx

In this page we have used `suspense` which requires the component to be a server component.
In earlier version of this page, it was a client component, but now we have just exported that component to a seperate file, so that suspense is only used in the server component.
