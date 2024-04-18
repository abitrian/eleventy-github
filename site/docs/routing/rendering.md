---
title: Rendering pages
eleventyNavigation:
  key: Rendering
  parent: Routing
  order: 2
---

Open Cells is a framework for Single Page Applications so it reacts to changes in the fragment identifier of the url (the hash part). Whenever it detects a change it will look for a page associated with that fragment and it will render the component page inside the DOM element defined in the `mainNode` property which is passed in the startApp function.
One unique feature of Open Cells is that each page that is rendered, is appended to the mainNode, instead of replacing the mainNode content as most of the SPA frameworks do. This is good because

Open Cells is a framework specifically designed for building Single Page Applications (SPAs). It monitors and responds to modifications in the URL's fragment identifier, commonly known as the hash part. Whenever there's a change detected in this fragment, Open Cells searches for a page linked to that particular fragment. Following the identification of the appropriate page, it renders the page's component within a designated area of the web document. This area is determined by the mainNode property, which is specified when initiating the application using the `startApp` function.

A distinctive characteristic of Open Cells, setting it apart from many other SPA frameworks, is its approach to rendering new pages. Instead of the traditional method where the new page content completely replaces the existing content within the `mainNode`, Open Cells adds each new page to the `mainNode`. This additive approach ensures that the content of previously rendered pages is preserved within the main node, rather than being overwritten. This technique is advantageous because it allows for a more dynamic and layered user experience, where multiple pages can be layered or navigated through without losing the context or content of previously interacted pages. It enhances the application's interactivity and can significantly improve user navigation and engagement by providing a seamless transition between pages and retaining a visual history of the user's journey through the app.

## Limiting the number of pages in the DOM

To ensure optimal performance and prevent the Document Object Model (DOM) from becoming overly cluttered with pages, Open Cells provides a feature to limit the number of pages retained in the DOM at any given time. This functionality is particularly useful for maintaining a clean and efficient application structure, especially in Single Page Applications (SPAs) where numerous pages can be loaded dynamically.

This limit can be easily configured through the startApp function by adjusting the viewLimit property within the configuration object. The viewLimit property specifies the maximum number of pages that can be stored in the DOM simultaneously.

```js
import {startApp} from '@open-cells/core';

startApp({
  routes,
  mainNode: 'appContent',
  viewLimit: 6; // Specifies the maximum number of pages allowed in the DOM
  ...
});
```

Determining the appropriate value for viewLimit requires consideration of several factors specific to your application:

- Total Number of Pages: The overall structure and size of your application will influence how you set this limit. A larger application with many pages may require a higher limit to accommodate the user's navigation patterns.
- Complexity of Pages: Pages with a high number of elements or complex layouts may consume more resources. In such cases, a lower limit might be necessary to ensure smooth performance.
- User Interaction and Repaint Frequency: Consider how often users are likely to switch between pages and how dynamic the page content is. Applications requiring frequent page updates or repaints may benefit from a carefully adjusted viewLimit to balance between performance and user experience.

By fine-tuning the viewLimit, developers can strike a balance between application responsiveness and memory usage, ensuring a fluid and efficient user experience while preventing excessive DOM bloat.

## Simple deallocation

Open Cells employs a First In, First Out (FIFO) approach to manage page deallocation, ensuring that memory usage remains efficient without compromising the user experience. For instance, consider an application with a `viewLimit` set to 4, loaded with pages in the following order: 'welcome', 'login', 'dashboard', and 'account'. All these pages are currently in the DOM. Upon navigating to the 'about' page, which is not yet in the DOM, Open Cells needs to load it. However, this action would exceed the specified viewLimit. To resolve this, Open Cells deallocates the oldest page ('welcome' in this case) to make room for 'about'. Consequently, the DOM will then contain 'login', 'dashboard', 'account', and 'about'. As navigation progresses and new pages need to be loaded, the FIFO principle ensures that the oldest loaded pages are deallocated first, maintaining the DOM's size within the set limit.

## Deallocation with persistent pages

Recognizing the performance impact of rendering complex or frequently visited pages, Open Cells allows for the specification of persistent pages. These are pages that, once loaded into the DOM, remain there without being deallocated, except under specific circumstances like a user logout. This feature is especially beneficial for pages that are resource-intensive to paint due to their complexity or because they contain heavyweight components.

Persistent pages are defined in the configuration object passed to the `startApp` function, allowing developers to easily designate which pages should remain in the DOM indefinitely:

```js
import {startApp} from '@open-cells/core';

startApp({
  routes,
  mainNode: 'appContent',
  viewLimit: 6;
  persistentPages: ['dashboard', 'cards']; // Ensures these pages remain in the DOM
  ...
});
```

#### Maximum number of pages in the DOM

Considering the inclusion of persistent pages, the maximum number of pages that can be simultaneously present in the DOM is calculated by adding the number of persistent pages to the `viewLimit`.

```
 MAX TOTAL PAGES IN DOM = viewLimit +  persistentPages.length()
```

This calculation ensures that the application can maintain optimal performance by dynamically managing the number of pages in the DOM, balancing between memory efficiency and the need for quick access to critical pages.

By implementing these strategies, Open Cells provides a robust framework for SPA development, offering developers fine-grained control over DOM management to optimize performance and use
