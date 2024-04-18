---
title: Getting Started
eleventyNavigation:
  key: Getting Started
  parent: Introduction
  order: 3
---

There are many ways to get started using Open Cells. This page will help you choose

## Install locally from npm

To create an application with Open Cells run:

```javascript
npm init @open-cells/app
```
You must to choose a blank app or a example app

You will be asked to enter a name for the application and once you confirm it a folder will be created with the application inside.

This will run an application generator. It'll ask you if you want an empty application (minimal sample) or a full sample application (cooking recipes application).

```mathematica
Root Directory/
|── web-dev-server.config.js
|── package.json
|── tsconfig.json
|── index.html
|── src/
    |── components/
    |── pages/
        └── home/
            └── home-page.ts
    |── css/
    └── routes/
        └── routes.ts
```

Now you can go to the application folder and install the dependencies:
```javascript
npm install
```
Now you can serve and try the application running:
```javascript
npm run start
```

## App creation
Once you have created the application using the steps above, you can start building your app. Here are the key steps involved in app creation:

- Pages and Routes: Define the pages and routes for navigation within your app.
- Pages and Components: Create the pages and components for your application.
- Building: Build your application to prepare it for deployment.
- Serving: Serve your application locally to test it before deployment.

These steps will guide you through the process of creating an Open Cells application from scratch.


### Pages and Routes

#### Routes

The routes.ts file has the following format and define the pages and routes for navigation within your app. The `routes.ts` file specifies the routes in your application, where each route is mapped to its respective page. It's important to note that there must always be a initial page configured at the root path `/`, and the `not-found` route is used when a requested route is not recognized.

```js
export const routes: object[] = [
  {
    path: '/',
    name: 'home',
    component: 'home-page',
    action: async () => {
      await import('../pages/home/home-page.js');
    },
  },
  {
    path: '/not-found',
    name: 'not-found',
    notFound: true,
    component: 'not-found-page',
    action: async () => {
      await import('../pages/not-found/not-found-page.js');
    },
  },
];
```

In addition, Open Cells offers a transition system that animates page navigation when switching between active and inactive states, This provides a more user-friendly experience by simplifying tasks for the developer.([see transitions section for more detail]({{ site.baseurl }}/docs/transitions/)).

### Adding a Second Page

After creating the initial page for your application, you may want to add a second page to display additional content. Here's a guide on how to create a second page and then add it to the `routes.ts` file to make it accessible from the application.

#### Step 1: Create the Page

1. **Create the Page File**: In the `pages` directory, create a new file for your second page. For example, you could name it `about-page.ts` if you want to create an "About" page.

2. **Develop the Content**: Inside the newly created file, you can develop the content of the page using HTML, CSS, and JavaScript as needed. This may include descriptive text, images, or any other elements you want to display on the page.

#### Step 2: Add the Page to the `routes.ts` File

Once you've created the page, it's time to add it to the `routes.ts` file so that the application can navigate to it properly.

1. Open the `routes.ts` File: Navigate to the `routes` directory and open the `routes.ts` file in your code editor.

2. Add a New Route: Within the `routes` array, add a new object representing the route for your second page. For example:

```js
{
  path: '/about',
  name: 'about',
  component: 'about-page',
  action: async () => {
    await import('../pages/about/about-page.js');
  },
},
```

### Pages and Components

In Open Cells, a page is typically represented by a custom element that extends LitElement. You can create a new TypeScript file for your page component and define the logic and rendering code for the page.

```js
import { LitElement, html, css } from 'lit';

@customElement('about-page')
export class MyPage extends LitElement {
  static styles = css`
    /* CSS styles for your page */
  `;

  render() {
    return html`
      <!-- HTML content for your page -->
    `;
  }
}
```
- Define Page Structure and Content:
Within the render() method of your page component, you define the HTML structure and content of your page using lit-html's html template literals. You can also include CSS styles using the css tagged template literal provided by Lit.

- Handle Interactivity and Data:
You can add interactivity to your page by handling user events (e.g., clicks, inputs) and updating the state or properties of your component accordingly. Lit provides decorators like @property and @state to define reactive properties and state within your component.

- Add Lifecycle Hooks:
Lit provides lifecycle hooks such as connectedCallback, disconnectedCallback, and firstUpdated that you can use to perform initialization, cleanup, or other actions when your component is added to or removed from the DOM, or when it's first updated.

Open Cells provides page controllers and element controllers that enable us to subscribe to information using the pub/sub pattern, navigate to other pages, and utilize the new lifecycle hooks onPageEnter and onPageLeave.

With the page controllers, developers can easily manage the state and behavior of pages within the application. These controllers facilitate communication between different parts of the application by allowing components to subscribe to specific data updates or events using the publish/subscribe pattern. This enables a more modular and decoupled architecture, enhancing the maintainability and scalability of the application.

Additionally, the introduction of lifecycle hooks such as onPageEnter and onPageLeave offers developers more control over the initialization and cleanup processes of individual pages. These hooks allow for executing specific actions when a page is entered or left, enabling tasks such as data fetching, animations, or resetting state.

Overall, the combination of page controllers, element controllers, and lifecycle hooks provided by Open Cells empowers developers to build more dynamic and responsive web applications with enhanced control over page navigation and lifecycle management([see state for more detail]({{ site.baseurl }}/docs/state/controllers/)).

Example

```javascript
import { PageController } from '@open-cells/page-controller';
import { ElementController } from '@open-cells/element-controller';
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('example-page')
export class ExamplePage extends LitElement {

pageController = new PageController(this);

@state()
  protected _randomData = null;

connectedCallback() {
  super.connectedCallback();
  this.pageController.subscribe('ch-custom-data', data => {
    this._randomData = data;
});

onPageLeave() {
  this.pageController.unsubscribe('ch-custom-data');
}

}

```
Using RXJS channels to subscribe to a data stream named 'ch-custom-data' using the subscribe method of a pageController object. When data is emitted in the 'ch-custom-data' stream, it is captured and assigned to the variable _randomData.
In OpenCells, we provide a channel-based system built on top of RXJS to manage the application state. This enables components to receive the necessary information and react accordingly([see channels section for more detail]({{ site.baseurl }}/docs/state/controllers/)) 

You can create your own custom elements by defining them in the "components" folder of your project. Alternatively, you can utilize custom elements from popular libraries such as Material Design or others.

### Adding components to the second Page

#### Step 1: adding the component

1. **Installing Dependencies**
In your project, install the "@material/web" library using npm
```js
npm i --save @material/web
```
2. **Import the web component inside your page**:
for example we are going to use a button 
```js
import '@material/web/button/outlined-button.js';
```

3. **Add tag in the render lifecycle**:
we are going to add the button in the render method
```js
render() {
   return html`

          <h2>Our button</h2>

          <md-outlined-button aria-label="button">
            <span>Button</span>
          </md-outlined-button>
   `
}
```

### Adding transitions to the second Page Using PageTransitionsMixin in Your Project

#### Step 1: Import the Mixing

To use the `PageTransitionsMixin`, you'll need to import it into your project. Follow these steps:

##### 1.1. Install the Package

If you haven't already, install the `@open-cells/page-transitions` package using npm 

```bash
npm install @open-cells/page-transitions
```
##### 1.2. Import the Mixin
Once the package is installed, you can import the PageTransitionsMixin into your project. Here's how to do it:
```js
import { PageTransitionsMixin } from '@open-cells/page-transitions';
```
#### 1.3 Extend your page 
```js
import { LitElement, html, css } from 'lit';

@customElement('about-page')
export class MyPage extends PageTransitionsMixin(LitElement) {
  static styles = css`
    /* CSS styles for your page */
  `;

  render() {
    return html`
      <!-- HTML content for your page -->
    `;
  }
}
```
#### Step 2: add default styles to the main container

Adding styles to pages container document
These styles must be applied to the document containing the pages. You can define your own CSS containing them.

This package exports a pageTransitionStyles Lit CSSResult with the styles for the default animations provided. You can add them to your parent component styles (in case your app and pages are inside the shadow root of a component) or to the global styles of your app.

Also, importing the page-transition-head-styles.js entrypoint to your app will automatically add them to a style tag in the head of the main document.


## Building
We use for build our applications vite. Vite is a build tool that has gained significant traction among developers for its speed, simplicity, and modern approach to web development. Here's why using Vite is great:

- Lightning-fast development: Vite, which means "fast" in French, lives up to its name. It leverages native ES module imports to serve dependencies on-demand during development. This eliminates the need for bundling during development, resulting in instant startup and faster hot module replacement (HMR) updates. Consequently, developers experience a significant boost in productivity as they no longer need to wait for lengthy rebuilds.

- Efficient bundling for production: While Vite skips bundling during development for speed, it still provides efficient bundling for production builds. By leveraging Rollup or esbuild, Vite generates optimized bundles with tree-shaking, code-splitting, and minification. This ensures that your production code remains lean and performs optimally, leading to faster loading times for end-users.

- Built-in support for modern JavaScript features: Vite natively supports modern JavaScript features such as ES modules, async/await, and dynamic import syntax. This allows developers to write code using the latest language features without worrying about compatibility issues. Additionally, Vite seamlessly integrates with popular frameworks like Vue.js and React, enabling developers to leverage framework-specific features effortlessly.

- Flexible plugin system: Vite's plugin system allows developers to extend and customize the build process to suit their specific needs. Whether it's adding support for CSS preprocessors, optimizing assets, or integrating with testing tools, Vite's plugin ecosystem offers a wide range of options to enhance your development workflow.

- Dev server with built-in features: Vite comes with a powerful development server that offers features like HMR, module replacement, and automatic reloading. This makes the development experience more interactive and enjoyable, as changes made to the code are reflected instantly in the browser without manual refreshing. Additionally, Vite's dev server provides built-in support for TypeScript, CSS preprocessors, and PostCSS, further streamlining the development process.

- Optimized for modern browsers: Vite is designed to take advantage of modern browser capabilities, such as native ES module support and HTTP/2 server push. By leveraging these features, Vite optimizes the loading and execution of your web applications, resulting in better performance and user experience for modern browsers

To build the application, use the command: 
```javascript
npm run build
```
## Serving

To serve the application, use the command:
```javascript
npm run dev
```