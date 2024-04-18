---
title: Configuration
eleventyNavigation:
  parent: Application
  key: Configuration
  order: 2
---

The `startApp` function from Open Cells Core is essential for initializing your application. It requires a configuration object that must include at least the following two critical pieces of information:

- **routes**: The routing definitions for your application.
- **mainNode**: The ID of the HTML element where the pages will be rendered.

These mandatory properties ensure the basic operational setup of your application.

In addition to the required settings, Open Cells offers other optional properties that can be included in the configuration object to enhance functionality:

- **viewLimit**: Specifies the maximum number of pages that can be present in the DOM at any one time.
- **persistentPages**: An array with the page names that should not be removed from the DOM.
- **interceptor**: A function used to intercept and possibly modify routing behavior.
- **appConfig**: An object where specific application configurations can be stored according to individual needs.

## Application Configuration

Applications can utilize the `appConfig` property within the configuration object to tailor settings specific to their operational requirements. Open Cells Core provides the `getConfig` function to retrieve the current configuration object at any time, facilitating easy access to custom configurations throughout the application lifecycle.

**Example of Accessing Application Configuration**
To demonstrate accessing custom settings within your application, use the following example. This snippet retrieves the language setting based on the country specified in the application's configuration.

```js
import {getConfig} from '@open-cells/core';

const {appConfig} = getConfig(); // Retrieve the current configuration object
const lang = appConfig.country.lang; // Access language setting from the application configuration
```

## Organizing Configuration Files

For applications with extensive configuration needs, it is advisable to organize configurations into separate JavaScript modules. This approach keeps the setup clean and maintainable. Import these configurations into your main application file where you call startApp.

Example Setup:
Suppose you have defined your routes and custom configurations in separate files (routes.js and appConfig.js). Here's how you can import and use them:

```js
import {startApp} from '@open-cells/core';
import {routes} from './routes/routes.js'; // Adjust the path as necessary
import {appConfig} from './config/appConfig.js'; // Adjust the path as necessary

startApp({
  mainNode: 'app__content',
  routes,
  appConfig,
});
```

By following these guidelines, you can effectively configure and manage your application's setup using Open Cells, ensuring a robust and flexible application architecture.
