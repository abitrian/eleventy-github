---
title: Controllers
eleventyNavigation:
  key: Controllers
  parent: State
  order: 2
---

Open Cells puts its functionality to handle channels and state inside reactive controllers. Controllers
are a way to bundle state and behavior related to a feature. You can learn more about controllers in [Lit's documentation](https://lit.dev/docs/composition/controllers/).

These controllers are:

- **ElementController**: it has methods for publishing and subscribing to channels, as for navigating to pages.
- **PageController**: it adds all methods that has ElementController plus hooks for handling entering and leaving pages.

## ElementController

It provides the core methods from Open Cells that allow you to manage application state (through the use of channels) and to interact with Open Cells router.

To use the ElementController just follow these steps:

1. Import ElementController.

```js
import {ElementController} from '@open-cells/element-controller';
```

2. In your component´s constructor create an instance of ElementController passing it self (`this`) as an argument.

```js
class MyComponent extends LitElement {
  constructor() {
    super();
    this.elementController = new ElementController(this);
  }
```

Now the component becomes a host for the ElementController and that way the controller receives lifecycle callbacks from the component while the component can execute the API provided by the ElementController.

> Note that our component extends from `LitElement`. This is required because LitElement implements the reactive controller pattern, otherwise you should implement it.

3. Use the methods provided by ElementController

```js
this.elementController.publish('ch_user_info', data);
```

### State

#### **_subscribe_**(channelName: string, callback: Function)

Subscribe to the channel named `channelName` and executes the given `callback` function when it reacts to state change. If there is no channel with name `channelName`, then it is created.

```js
import {ElementController} from '@open-cells/element-controller';

class MyComponent extends LitElement {
  constructor() {
    super();
    this.elementController = new ElementController(this);
    this._handleConnections();
  }

  _handleConnections() {
    // subscribe to ch_user channel and executes _updateUserData with given channel value when channel state mutates.
    this.elementController.subscribe('ch_user', (userList : Array<User>) =>
      this._updateUserData(userList)
    );
  }

  _updateCustomerData(userList) {
    ...
  }
}
```

#### **_unsubscribe_**(channelName: string)

Unsubscribe from the given channel.

#### **_publishOn_**(channelName: string , htmlElement: HTMLElement, eventName: string)

Automatically publish on the channel named `channelName` the payload from event of type `eventName` dispatched by `htmlElement`. If there is no channel with name `channelName`, then it is created.

```js
import {ElementController} from '@open-cells/element-controller';

class MyDataComponent extends LitElement {
  constructor() {
    super();
    this.elementController = new ElementController(this);
    this._handleConnections();
  }

  _handleConnections() {
    // 'change' event payload will be stored in 'ch_user' channel.
    this.publishOn('ch_user', this.userInput, 'change');
  }
}
```

#### **_publish_**(channelName: string, value: Object)

Publish a value to a channel named `channelName`. If there is no channel with name `channelName`, then it is created.

> For a more detailed information see:
>
> - [Channels](../channels)

### Routing

#### **_navigate_**(pageName: string, params: Object)

Navigation to the route that is associated with the page named `pageName`. Params are optional and are given as an object with key-value format.

#### **_getInterceptorContext_**(): Object

Get the context object that has the Router Interceptor.

#### **_setInterceptorContext_**(context: Object)

Set a new context object for the Router Interceptor.

#### **_updateInterceptorContext_**(context: Object)

Update the Router Interceptor context.

#### **_resetInterceptorContext_**()

Reset the Router Interceptor context (set an empty object {}).

#### **_backStep_**()

Navigate to the last page visited.

#### **_getCurrentRoute_**(): Object

Returns an object with the current route information.

> For a more detailed information see:
>
> - [Navigating programmatically](../../routing/routes/#navigating-programmatically)
> - [Router interceptor](../../routing/interceptor/)

## PageController

This controller provides the same functionality that `ElementController` offers (described above) plus hooks to control page lifecycle: `onPageEnter` and `onPageLeave`. These two hooks ease the implementation of custom logic that is a common requirement on pages.

If the page implements the methods `onPageEnter` and `onPageLeave`, PageController will execute them.

### Hooks

#### onPageEnter()

Executed by PageController each time the route changes and the page enters into view.

```javascript
import {html, LitElement} from 'lit';
import {PageController} from '@open-cells/page-controller';
import {customElement} from 'lit/decorators.js';

@customElement('favorite-recipes-page')
export class FavoriteRecipesPage extends LitElement {
  pageController = new PageController(this);

  onPageEnter() {
    // my custom logic to be executed each time the page enters into view
  }
}
```

#### onPageLeave()

Executed by PageController each time the route changes and the current page leaves the view disappearing.

```javascript
import {html, LitElement} from 'lit';
import {PageController} from '@open-cells/page-controller';
import {customElement} from 'lit/decorators.js';

@customElement('favorite-recipes-page')
export class FavoriteRecipesPage extends LitElement {
  pageController = new PageController(this);

  onPageLeave() {
    // my custom logic to be executed each time before leaving the view.
  }
}
```
