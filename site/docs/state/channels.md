---
title: Channels
eleventyNavigation:
  key: Channels
  parent: State
  order: 1
---

Open Cells applications ar built ont top of a component-based architecture, facilitating inter-component communication through a publish/subscribe (pub/sub) messaging pattern. This approach is central to how Open Cells manages application state, ensuring components operate in a cohesive and reactive manner.

The framework employs channels, constructed using RxJS, to implement the pub/sub pattern. A **channel** is a named data conduit with a capacity for a single value at any given time. These channels enable components to function either as subscribers, which read data from the channel, or publishers, which send data into the channel.

For example, to facilitate communication between two components, A and B, Open Cells utilizes a channel. If component A has a message to be received by component B, A publishes this message to the designated channel. Component B, subscribed to this channel, automatically receives any new messages posted.

This mechanism not only simplifies state management across the application but also ensures that components react dynamically to changes.

Open Cells provides straightforward methods for subscribing to and publishing on channels, requiring only a channel name. If a channel does not exist, specifying a name automatically creates it.

Channels are designed to be shared across different pages, making them accessible to any component once established. Thanks to their single-value buffer, components subscribing to a channel can access the latest published value, even if the publication occurred before their subscription. This ensures consistent and up-to-date state information throughout the application.

## Application channels

Open Cells enables the creation and utilization of an unlimited number of channels within your application. A new channel is automatically generated the moment a component either subscribes to or publishes on a channel, assuming the channel does not already exist.

The capabilities to both publish to and subscribe from a channel are facilitated through the `ElementController`, providing a streamlined interface for component interaction and communication.

## Open Cells private channels

Beside the channels that you can create, Open Cells has its own channels. Generally they are read only channels (no component can publish to them). Open Cells private channels names begin with the prefix `__oc_`.

There are to kind of private channels:

- Private page channels
- Application channel

### Private page channels

Open Cells automatically generates a private channel for each page upon its initial activation, naming the channel according to the pattern `__oc_page_` + _`pageName`_. For instance, for a page named home, Open Cells creates a private channel named `__oc_page_home`. It's important to avoid creating channels that start with `__oc_page_` as this prefix is reserved for Open Cells' internal use.

These private channels are established the first time a page is loaded and remain active throughout the entire lifecycle of the application. Designed to be **read-only**, private channels allow for subscription but not publication.

Private channels serve a key role in signaling the activation status of a page. To facilitate interaction with these channels, Open Cells offers the `PageController`. This controller provides hooks that encapsulate the functionality of private channels, enabling developers to efficiently determine and respond to page activations and deactivations.

### Application context channel

When Open Cells starts it creates a special channel with the name `__oc_app`. This is a dedicated channel to keep track of the state of the application. The state is an object with the following information:

- _currentPage_ the name of the page that is active.
- _fromPage_ the name of the previous active page.

The application context channel remains active during the entire lifecycle of the application. Also, as any other private channel, this is a **read-only** one, so you can only subscribe to it.

With every navigation, the state is updated and published in the application context channel. Any component that needs to be notified about theses changes can subscribe to the channel `__oc_app`.
