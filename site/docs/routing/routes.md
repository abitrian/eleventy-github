---
title: Defining routes
eleventyNavigation:
  key: Routes
  parent: Routing
  order: 1
---

Open Cells, designed as a Single Page Application (SPA) framework, incorporates a routing system centered around the concept of pages. This system links each route path—identified by the fragment identifier in the URL—to a specific page intended for display. These pages are crafted using web components, enabling dynamic and modular page construction.

Whenever there is a change in the fragment identifier, commonly referred to as the hash path, Open Cells' routing mechanism springs into action. It identifies the page associated with the updated hash path and proceeds to render this page within a predetermined DOM element. This element acts as a container for the pages, seamlessly integrating the new content into the existing application layout. This process ensures a fluid user experience, where transitions between pages are smooth and efficient, maintaining the dynamism inherent in SPA frameworks.

## Configuring routes

In Open Cells, setting up your application's navigation involves mapping each URL path to its corresponding page. This is accomplished by supplying an array of objects, each representing a route's configuration.

Each route is defined by an object that includes the following attributes:

- **path**: A string specifying the route's hash path.
- **name**: A string representing the name of the page that should be displayed for the route.
- **component**: A string indicating the tag-name of the component responsible for rendering the page.
- **notFound**: A boolean flag. If set to `true`, this indicates that the route should be rendered when no other route matches the current path. The default is `false`, meaning that this route is not used as a fallback by default.
- **action**: A function tasked with loading the component. This is typically achieved through a dynamic import, allowing the build process to create a separate bundle for each page, optimizing load times and resource utilization.

```js
const routes: RouteDefinition[] = [
  {
    path: '/',
    name: 'home',
    component: 'home-page',
    action: async () => {
      await import('../pages/home-page/home-page.js');
    },
  },
  {
    path: '/category/:category',
    name: 'category',
    component: 'category-page',
    action: async () => {
      await import('../pages/category-page/category-page.js');
    },
  },
  {
    path: '/not-found',
    name: 'not-found',
    notFound: false,
    component: 'not-found-page',
    action: async () => {
      await import('../pages/not-found-page/not-found-page.js');
    },
  },
];
```

> Applications usually starts in the hash path `/` so don't forget to give a route definition for path: '/'.

## Handling invalid routes

When a user tries to access and invalid route (a path that is not defined as route) we can set a page to be shown in that case. To do that add a route definition with the property `notFound: true`.

```js
const routes: RouteDefinition[] = [
  ...
  {
    path: '/not-found',
    name: '404-page',
    notFound: false,
    component: 'not-found-page',
    action: async () => {
      await import('../pages/not-found-page/not-found-page.js');
    },
  },
  ...
];
```

## Navigating programmatically

Navigating between pages within your application is straightforward using the `navigate` method provided by both `ElementController` and `PageController`. This method allows you to transition from one page to another with ease. It requires two parameters: the name of the destination page and, optionally, an object containing parameters in a key-value format to pass to the destination page.

Below are examples demonstrating how to use the `navigate` method, given that the current page is `home`.

```js
const routes: RouteDefinition[] = [
  {
    path: '/',
    name: 'home',
    component: 'home-page',
    action: async () => {
      await import('../pages/home-page/home-page.js');
    },
  },
  {
    path: '/products',
    name: 'products',
    component: 'products-page',
    action: async () => {
      await import('../pages/products-page/products-page.js');
    },
  },
  {
    path: '/category/:name',
    name: 'category',
    component: 'category-page',
    action: async () => {
      await import('../pages/category-page/category-page.js');
    },
  },
];
```

- **Navigating without parameters**

This is the simplest way, just give the name of page to navigate to.

```js
this.controller.navigate('product');
```

Open Cells will update the url hash path from `/` to `#!/products` and the `products` page will be rendered.

- **Navigating with parameters**

Case 1: URL has variables

When the url has variables, like `/category/:name`, Open Cells will replace `:name` with the parameter value. See the example below.

```js
const params = {name: 'health'};
this.controller.navigate('category', params);
```

Open Cells updates the URL's hash path from `/` to `#!/category/health` in response to navigation actions. This change triggers Open Cells to identify the category page as the target, which is configured to accept a variable `:name` indicated by the `:` prefix. The value for `:name` is substituted with the corresponding entry from the parameters object provided during navigation. Additionally, Open Cells updates the `params` property of the `category`, making the navigation parameters readily accessible within the page. As a result, within the `category` page, accessing `this.params.name retrieves` the name of the category.

> If the path has been defined with variables, it's mandatory that the `navigate` method is executed with a parameter object having properties for each of those variables, otherwise the navigation will end in a `not found page` error.

Case 2: URL with query params

When the url has no variables, like `/product`, Open Cells will use the parameters as query params. The example below illustrates this case.

```js
const params = {category: 'health', inStock: true};
this.controller.navigate('product', params);
```

Open Cells dynamically alters the URL's hash path, transitioning it from `/` to `#!/products?category=health&inStock=true`. In scenarios like this, where the matched URL does not include path variables, Open Cells converts the parameters object into query parameters within the URL. To facilitate access to these parameters within the `products` page, Open Cells update the `params` property to the page. Consequently, within the `products` page, accessing parameter values, such as `this.params.inStock`, becomes straightforward.

Case 3: URL with variables and query params

There also could be that the URL has a variable, like `/category/:name` and the `navigate` method receives a parameter object with a key `name` plus other keys. In that case the `:name` variable will be replaced by the parameter `name` value and the remaining properties will be treated as query params.

```js
const params = {name: 'health', page: 3, sort: 'ASC'};
this.controller.navigate('category', params);
```

The resulting URL will be `category/health?page=3&sort=ASC`.

#### Accessing URL parameters from a page

In all cases where a URL has parameters, either as a variable in the path or as query parameters, Open Cells makes them accessible from the page that receives them. To do this, it is necessary that the page has a property called `params` defined, which will be an object in key-value format. This way, when Open Cells resolves the parameters, it updates the page's `params` property and the parameter values ​​can be read from the page by doing `this.params.<paramName>` where <paramName> is the parameter´s name.

For example, given this route definition:

```js
  {
    path: '/category/:categoryName',
    name: 'category',
    component: 'category-page',
    action: async () => {
      await import('../pages/category/category-page.js');
    },
```

and this code:

```js
@customElement('category-page')
export class CategoryPage extends LitElement {
  pageController = new PageController(this);
  ...

  @property({ type: Object })
  params: {
    categoryName: string
    sort?: string
  } = {};
```

When this page is accessed with the URL `category/health?sort=ASC`, Open Cells will cause the `params` property to have these values:

```js
params = {
  categoryName: 'health',
  sort: 'ASC',
};
```

and from within the page you can use this code to read `sort`'s value:

```js
this.params.sort;
```
