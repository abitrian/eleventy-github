---
title: Bootstrapping
eleventyNavigation:
  parent: Application
  key: Bootstrapping
  order: 1
---

Open Cells provides the `startApp` function to initialize and launch your Single Page Application (SPA). This essential function sets up the routing system, initializes the communication channels, and brings the entire application to an operational state.

To get started, you first need to import the `startApp` function from the `@open-cellls/core` module. You then call this function with a configuration object. This configuration object has settings for routes and the main DOM node, plus other optional configurations for Open Cells.

Here’s a step-by-step example to illustrate the process:

1. In your main entry point file, for example `app-index.ts` import the `startApp` Function:
   Begin by importing `startApp` from the Open Cells core package.

```js
import {startApp} from '@open-cells/core';
```

2. Define the Configuration:
   Create a configuration object that specifies:

- **routes**: An object defining the application’s routing logic. **_Mandatory_**
- **mainNode**: The ID of the DOM element where the application will render. **_Mandatory_**
- **viewLimit**: The maximum number of views that can be present at the same time in the DOM. **_Optional_**
- **persistentPages**: An array of route names that should not be removed from the DOM. **_Optional_**

3. Initialize the Application:
   Pass the configuration object to `startApp` to initialize and start your application.

```js
startApp({
  routes,
  mainNode: 'app-content',
  viewLimit: 2,
  persistentPages: ['recipe'],
});
```

4. Include the script in the `index.html` file:

The main entry point file should then be linked to your `index.html` document via a script tag. The script tag should be marked with the `type="module"` attribute to ensure it is treated as a JavaScript module, allowing modern module bundlers to correctly manage the execution order based on dependencies. It's recommended to place this script tag near the end of the body element to ensure that all HTML elements are loaded prior to the execution of your script:

```html
<script type="module" src="/src/components/app-index.ts"></script>
```

By following these steps, your application will be correctly configured and ready to run using the Open Cells framework. This setup ensures that the SPA will start correctly, handling routing efficiently leveraging the framework's capabilities to efficiently manage the application lifecycle.
