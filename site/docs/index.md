---
title: What is Open Cells?
eleventyNavigation:
  key: What is Open Cells?
  parent: Introduction
  order: 1
---

Open Cells  is a JavaScript framework for building user interfaces. It builds on top of standard HTML, CSS, and JavaScript and provides a declarative, component-based programming model with [Web Components](https://www.webcomponents.org/introduction) at the heart of it.  That's the way it embraces reusability and interoperability that helps you efficiently develop user interfaces of any complexity.

Open cells is an architecture built over the idea that instead of building applications it is better to build a set of reusable components (business modules) that are assembled and communicated to create applications.

Here is a minimal example of a Open Cells app:

In the index of our application, we place the main node and then execute the `startApp` function imported from `@open-cells/core`. This is done as follows:

```javascript
import { startApp } from '@open-cells/core';

// Define routes and other necessary configurations
const routes = [
  // Define your routes here you must have a inital page in root path 
  {
    path: '/',
    name: 'home',
    component: 'home-page',
    action: async () => {
      await import('../pages/home/home-page.js');
    },
  },
];

// Execute startApp with necessary options
startApp({
  routes,
  mainNode: 'app__content',
});
```

```html
<div id="app__content">
</div>
```

## Open cells ecosystem

There are several items that you need to know in the open cells ecosystem.

### Core

Open cells core is the library that provides applications with:

- State management through the use of pub/sub messaging pattern
- Routing mechanism
- App Configuration.
- Bootstrap.

The core implements the architectural publish/subscribe pattern with unidirectional data flow.

If your application logic involves a lot of data communications among components, it would be the case for which you can take the most advantage of this architecture.

### Web Components

You can explore an extensive collection of [Web Components](https://m3.material.io/) organized by families on the [Material Design Components for the Web](https://m3.material.io/) website, or you can check out [Shoelace](https://shoelace.style/), another resource for web components.

## Browser Support

Cells use Web Components built in main specifications (Web standards):

- [Custom Elements](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements)
- [Shadow DOM](https://dom.spec.whatwg.org/#shadow-trees)
- [HTML Templates](https://html.spec.whatwg.org/multipage/scripting.html#the-template-element/)
- [ES Modules](https://html.spec.whatwg.org/multipage/webappapis.html#integration-with-the-javascript-module-system)

open-cells is tested in the latest two versions of the following browsers:

- Chrome
- Edge
- Firefox
- Opera
- Safari

Critical bug fixes in earlier versions will be addressed based on their severity and impact.

## License
Open cells it’s available under the terms of the Apache-2.0 license.


