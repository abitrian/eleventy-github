---
title: Router Interceptor
eleventyNavigation:
  key: Interceptor
  parent: Routing
  order: 3
---

Open Cells gives the possibility to intercept a navigation request so that the application, based on its own state, can decide if the navigation should proceed or not.
To achieve this, Open Cells provides a hook function called `interceptor`. Whenever there is a request navigation, Open Cells calls the `interceptor` function and this function
decides if the navigation should be cancelled, redirected to another page or it can continue to the requested page. The default implementation provided by Open Cells always continue the navigation but applications can override this function according to its business logic.

It intercepts programmatically navigation, like `this.controller.navigate('dashboard')`, and user provoked navigation like pushing browser's back button.

## The `interceptor` function

`interceptor` is function that acts as a hook just before any navigation. This function receives two arguments: a `navigation` object and a `context` object. Both arguments are provided by Open Cells.

```js
// Open Cells default implementation
interceptor: function(navigation, ctx) {
  let intercept = false;
  let redirect;
  return {intercept, redirect};
}
```

The navigation object contains information about the page coming from and the page where it's intended to go. The object contains these properties:

```js
{
  to: {
    page: String,
    params: Object
  },
  from {
    page: String
    params: Object
  }
}
```

The `context` argument is an object that is defined by the application and has information that can be used to decide if the navigation must be intercepted. It's the application who defines and builds this context. (More detail will be given in the next section).

With `navigation` and `context` details, the interceptor must decide what action to take. The possibilities are:

- Don't intercept this navigation and go to the requested page.
- Intercept this navigation, and stay in the current page.
- Intercept this navigation, and redirect to another page.

So the `interceptor` must return an object that matches one of the previous choices:

- case _Don't intercept this navigation_:

```js
{
  intercept: false;
}
```

- case _Intercept this navigation, and stay in the current page_:

```js
{
  intercept: true;
}
```

- case _Intercept this navigation, and redirect to another page_:

```js
{
  intercept: true
  redirect: {
    page: String,
    params: Object
  }
}
```

The application must define `the interceptor` function and pass it to the `startApp` function. For example:

```js
import {startApp} from '@open-cells/core';

startApp({
  routes,
  mainNode: 'appContent',
  interceptor: function (navigation, ctx) {
    let intercept = false;
    let redirect;
    if (
      !ctx.userName &&
      navigation.to.page !== 'login' &&
      navigation.to.page !== 'help'
    ) {
      intercept = true;
      redirect = {page: 'login', params: {}};
    }
    return {intercept, redirect};
  },
});
```

In the example above, the user must be logged to access any page except for the `login` and `help` pages. The interceptor function checks that condition: if the context has no logged user, then it cancels the current navigation and redirects to the login page.

## Giving context

As it's been said, it's the application that provide pass its context according to its business logic. Open Cells just keeps that information and passes it to the `interceptor` function.
So how can the application build the context object? It does by calling the `updateInterceptorContext` or `setInterceptorContext` functions from ElementController and PageController.

The `updateInterceptorContext` receives an object that has properties and values defined by the application. Initially, Open Cells has a context that is an empty object (`{}`). Any time the
the `updateInterceptorContext` it's called, the context object is augmented with the passed object.

For example, initial context is `{}`. After invoking:

```js
this.controller.updateInterceptorContext({userName: 'Alice Smith'});
```

the context is:

```js
{
  userName: 'Alice Smith';
}
```

If the function is invoked again:

```js
this.controller.updateInterceptorContext({
  profile: {
    number: 23398,
    category: 'VIP',
  },
});
this.controller.updateInterceptorContext({
  hasFullAccess: true,
});
```

The updated context will be:

```js
{
  userName: 'Alice Smith',
  profile: {
    number: 23398,
    category: 'VIP'
  },
  hasFullAccess: true
}
```

The `setInterceptorContext` receives an object and replace the context with the new one provided. For example, if the current context is:

```js
{
  userName: 'Alice Smith',
  profile: {
    number: 23398,
    category: 'VIP'
  },
  hasFullAccess: true
}
```

And the `setInterceptorContext` is invoked like this:

```js
cells.setInterceptorContext({
  savings: {
    account: 'AC8990-90001-004',
    balance: 23398
  }
  userId: 'D81301439'
});
```

Then the new context will be:

```js
{
  savings: {
    account: 'AC8990-90001-004',
    balance: 23398
  }
  userId: 'D81301439'
});
```

Open Cells also has the `getInterceptorContext` method to retrieve a copy of the interceptor context.

When the use of `updateInterceptorContext` is not convenient because it will require to pass an object with deep properties, we recommend to use `setInterceptorContext` for example:

```js
const ctx = cells.getInterceptorContext();
ctx.profile.category = 'minor';
this.controller.getInterceptorContext(ctx);
```

The context is reset when the `resetInterceptorContext` method is invoked and also after a `logout`.

## Using Controllers

`ElementController` and also 'PageController` have the methods to handle the interceptor context as we have seen before. To summarize, the methods are:

- `getInterceptorContext`
- `setInterceptorContext`
- `updateInterceptorContext`
- `resetInterceptorContext`

## Cancelled navigation

When a navigation is intercepted, Open Cells notifies that by using its private channel `__oc_intercepted_navigation`. In that channel, Open Cells puts an object with information about the intercepted navigation that has these properties (the values are just an example):

```js
{
  "intercept": true,
  "from": {
    "page": "step-init",
    "params": {}
  },
  "to": {
    "page": "dashboard",
    "path": "/dashboard",
    "params": {}
  }
}
```

The application can react to this channel, for example asking to the user if she wants to cancel a process.

## Use cases

The interception of navigation can be used in many cases such us:

- Avoid users to go to pages that are not allowed for him.
- Redirect users to the login page when they are trying to access directly to a page without being logged.
- Detect if a user is going to abort a process just because its going back to a previous page.
