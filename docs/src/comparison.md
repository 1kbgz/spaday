# How spaday compares to alternatives

This page is for someone choosing how to put a Python-backed UI in front of users. It compares spaday
with the other ways to do that and says when each one is the better pick. Read
[How spaday works](concepts.md) first; this page repeats only what the comparison needs.

## Where does the code run?

Every Python UI tool has to answer one question: when a user clicks, where does the code that responds
run? Most of the differences between these tools come from that answer. There are three common
answers.

**In Python, on the server.** The browser reports the event, a Python process handles it, and the
browser shows the result. [Streamlit](https://streamlit.io), [Gradio](https://www.gradio.app), [Dash](https://dash.plotly.com), [Panel](https://panel.holoviz.org), [Shiny](https://shiny.posit.co/py/), [Solara](https://solara.dev), [NiceGUI](https://nicegui.io), and [Reflex](https://reflex.dev) all work
this way. They differ in how much of the page gets recomputed per event and in how the server keeps
per-user state, but every interaction is a round trip.

**In JavaScript you wrote.** A frontend built with [React](https://react.dev), [Vue](https://vuejs.org), or [Svelte](https://svelte.dev) talks to Python over an API.
Python runs only when the frontend asks it to.

**In the browser, from a description Python wrote.** This is spaday's answer. Python builds the
component tree and attaches behavior as data: actions such as `Toggle` and `SetProp`, and bindings that
keep props in step with a state store. The browser runtime interprets those. Python is called only when
an action says so, through a model edit (`SendPatch`) or an endpoint call (`CallEndpoint`).

The answer decides how many users one server can hold, what the app can do while the network is slow,
how much JavaScript the team writes, and where the components come from. The sections below go through
each family.

## Script re-run: Streamlit and Gradio

Streamlit runs your script from the top on every interaction and keeps a Python session per browser
tab. It is the fastest way to turn an analysis into a page other people can use, and the model is easy
to hold in your head: the page is whatever the script printed last. The cost is that every interaction
goes to the server. A checkbox that hides a panel is a round trip and a partial re-run, and the server
holds a session for every open tab. Custom widgets are React components in an iframe, with their own
build.

Gradio is organized around functions instead of scripts. Declare the inputs and outputs, and Gradio
builds the form and calls the function on submit. It is the usual way to demo a model, and it is good at
that.

In spaday, hiding a panel is a client-side action and Python is not involved. The trade cuts both ways:
spaday has no "write Python and it appears" path. Logic that needs Python is an explicit endpoint call
or model edit, and the rest of the behavior is written as data. For a throwaway script that exists to
show one analysis, Streamlit or Gradio gets a page up faster, and that is the case to use them for.

## Callbacks: Dash, NiceGUI, and Reflex

Dash is the closest of the server-side tools to spaday in shape. The layout is a tree declared in
Python, and behavior is separate from it: callbacks are Python functions with declared inputs and
outputs, and each one runs over HTTP when an input changes. The server is stateless by design, which is
why Dash scales out more easily than the session-per-tab tools. For logic that must not round trip,
Dash has clientside callbacks, which are JavaScript source strings evaluated in the page.

spaday differs in both halves. Dash's tree is built from Dash components, which are React components
wrapped for Python, so a new component means a React build. spaday's tree is built from any
web-component library that publishes a [Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest), with no wrapper code. Dash's default
for behavior is a Python function; spaday's default is a client-side action. spaday's escape hatch is a
handler registered by name, never an evaluated string, and that is what makes a tree safe to send to
clients you do not trust.

NiceGUI puts Vue and [Quasar](https://quasar.dev) components behind Python event handlers that run over a socket, with each
client's state kept in the Python process. Reflex compiles a Python description into a [Next.js](https://nextjs.org) app;
state and event handlers are Python classes on the backend, and events travel over a WebSocket. Both are
pleasant to write. Both keep the Python process in the loop for every event, and Reflex adds a Node
build to deployment.

## Server-side reactivity: Panel, Shiny, and Solara

Panel, Shiny for Python, and Solara give you a reactive graph in Python. Widgets are inputs to it,
dependent values recompute when inputs change, and a Python process per session holds the graph. When
the interesting work is in Python, this is a strong model: you write the analysis as a reactive graph and
the UI comes with it. Panel runs on the [Bokeh](https://bokeh.org) server and also offers JavaScript links between widgets
for cases that should not round trip. Shiny's reactivity is per session and fine-grained. Solara writes
React-style components in Python on top of [ipywidgets](https://ipywidgets.readthedocs.io).

spaday's reactive engine lives in the browser and is narrower by design: it evaluates field bindings
and computed expressions over a signal store rather than arbitrary Python. That narrowness is what makes
it shippable as data and lets a two-way control or a derived value update with no server. These tools
and spaday also combine. spaday's widget is an [anywidget](https://anywidget.dev), so a spaday tree can sit inside a Panel,
Solara, Shiny, or [Marimo](https://marimo.io) app when one of those is the host you want.

## Notebook widgets: ipywidgets and Voilà

ipywidgets sync widget state over the Jupyter comm, and [Voilà](https://voila.readthedocs.io) turns a notebook into an app by running a
kernel per viewer. spaday's notebook host is the same engine as its web host with a different wire. A
tree developed in a notebook is served as a web app unchanged, and the web app needs no kernel per
viewer.

## A Python server with a JavaScript frontend

A [FastAPI](https://fastapi.tiangolo.com) or [Django](https://www.djangoproject.com) API with a frontend written in React, Vue, or Svelte is the most flexible option and
the one most web teams reach for. Everything the browser can do is available, the frontend scales as far
as the API does, and the component ecosystem is all of npm. The costs are a second codebase, a build
pipeline, an API contract between the two, and the fact that people who only write Python cannot change
the UI.

spaday keeps this architecture (client-side logic, static assets, a plain API) and lets you write it
from Python. The components are real web components, the assets are static files, and any Python server
can serve the tree. The difference is where JavaScript goes. In a frontend you write it inline,
anywhere. In spaday the tree carries a fixed action vocabulary, and JavaScript lives in handlers
registered on the page and called by name with `NamedJs`, or in a [wrapper](wrappers.md) around an
imperative library. You can still write any JavaScript you need; it is referenced from the tree instead
of embedded in it, which is what keeps the tree serializable. If you already have a JavaScript frontend,
spaday does not replace it. The `fragment` rung of the integration ladder puts a spaday tree in one node
of a page you own.

## Server-rendered HTML: templates and htmx

Django or [Jinja](https://jinja.palletsprojects.com) templates, with [htmx](https://htmx.org) or [Turbo](https://turbo.hotwired.dev) for partial updates, render HTML on the server and swap
fragments into the page. This is a good fit for CRUD apps with modest interactivity, and it needs no
client framework at all. Each interaction is still a request, client-side state is whatever the DOM
holds, and the components are the HTML you write. spaday differs on all three counts. The price is a
wasm runtime in the page, about a megabyte for the core and another for transports before compression,
which is the size of an ordinary React bundle and an order of magnitude under a [Pyodide](https://pyodide.org) download.

## Python in the browser: PyScript, Pyodide, Shinylive, and Panel's convert

[PyScript](https://pyscript.net), [Shinylive](https://shinylive.io/py/), and [`panel convert`](https://panel.holoviz.org/how_to/wasm/convert.html) take a different route to getting the server out of the
interaction loop: they run Python itself in the browser through Pyodide. That works, at the cost of a
multi-megabyte download and several seconds of startup before the first render.

spaday runs in Pyodide as well; the [standalone examples](pyodide.md) are built that way. The difference
is that it does not depend on it. Because the tree and its behavior are data, the browser needs only the
wasm runtime. The Python that produced the tree can be on a server, in a notebook kernel, in Pyodide, or
already exited: once the tree is written out, Python is not needed to run it.

## The Quansight criteria, with spaday added

In 2022 Quansight published
[Dash, Voilà, Panel, and Streamlit: our thoughts on the big four dashboarding tools](https://quansight.com/post/dash-voila-panel-streamlit-our-thoughts-on-the-big-four-dashboarding-tools/).
It is still the most useful short comparison of those four, and it uses more criteria than the one
question above: where the tool came from, Jupyter integration, scalability, multi-page apps, ease of
use, authentication, big data, and styling. Its conclusions hold up. Voilà is the simplest and starts a
kernel per visitor. Streamlit has the tightest feedback loop and does not scale. Dash keeps state in the
client and scales, but needs web knowledge for anything advanced. Panel is the one for full applications
in pure Python. This section runs spaday through the same eight criteria so the two can be read
together.

**Where it came from.** The four were built to publish data science work: a notebook, a script, or a
Plotly figure, put in front of colleagues. spaday was built for applications with many concurrent users
and long-lived pages, such as dashboards and control panels, where a server round trip per interaction
is the thing to avoid. That origin explains most of what follows.

**Jupyter.** Voilà and Panel are notebook-native, Streamlit and Dash are not. spaday's widget is an
anywidget, so a tree renders in a cell with its state synced over the comm, and the same tree is served
as a web page without change. The [tutorial](tutorial.md) is a notebook for that reason. This is closer
to Panel than to Dash, with one difference: the web app does not need a kernel or a Python session per
viewer to run what the notebook ran.

**Scalability.** Quansight's ranking comes down to where state lives: Dash keeps it in the client,
Panel and Streamlit keep a session per user, Voilà keeps a kernel per user. spaday keeps UI state in the
client too, in the browser's signal store. The server holds only a transports model per session, or a
shared model in a multi-tenant `Hub`, or nothing at all when the page is a static tree plus REST calls.
Assets are static files. That puts spaday with Dash on this criterion, with one addition: toggles,
bindings, and routing never reach the server either.

**Multi-page applications.** The post found this hard in Streamlit and Voilà, possible in Dash with web
knowledge, and covered in Panel by its pipelines. spaday has two layers. A `Switch` bound to a URL
parameter routes inside one page on the client, with history entries and back/forward, and `Lazy`
fetches a branch the first time it is shown. For a conventional site, `mount_site` takes a mapping of
paths to pages and mounts one set of assets for all of them, on Starlette, FastAPI, aiohttp, Flask, or
Tornado. See [Serve and embed](serving.md).

**Ease of use.** Getting started is as easy as with any of the four: build a tree, call `serve`, and
the [standalone examples](pyodide.md) show most of the basics in a few lines each. The components are
typed Python classes generated from each library's manifest, so an editor completes props and a bad prop
value fails in Python before anything is served. There is a learning curve after that, and it is in
proportion to what becomes reachable: an action vocabulary, bindings against a store, several models on
one page, routing, and the escape hatches. A Streamlit script has less to learn because it has less to
reach. In shape spaday is closest to Dash: declare a layout, then attach behavior, except the behavior
is client-side data instead of Python callbacks.

**Authentication.** None of the four ships it in the open-source version, and neither does spaday. The
routes spaday needs are ordinary routes on the host framework, so a FastAPI dependency or Starlette
middleware guards them the same way it guards any other endpoint. A login page can be served with its
tree inline, so the only route an anonymous user can reach is one HTML page.

**Big data.** The post gives this to Panel for its [Dask](https://www.dask.org) and [Datashader](https://datashader.org) integration, and that is a
real advantage when the work is a server-side computation whose result is a picture or an aggregate.
spaday takes a different route to the same problem and holds its own on it. The UI state never
carries the data. Data moves as incremental, revisioned patches over transports, so a table of
100,000 rows is sent once and then receives only the rows that changed, and
[spaday-regular-table](https://github.com/1kbgz/spaday-regular-table) renders only the cells in the
viewport. [spaday-perspective](https://github.com/1kbgz/spaday-perspective) goes further: rows
stream as Arrow into a browser-side engine that computes views, group-bys, and aggregations locally,
or the browser holds only the visible slice and every scroll and sort is answered by the server
engine. In both cases the interaction is fully virtualized, the browser holds only what it shows,
and spaday syncs the few kilobytes of layout and configuration around it. spaday does not bundle a
compute engine of its own; it connects to the one you already run, whether that is Perspective, a
database, or a Dask cluster behind an endpoint.

**Customization and styling.** Dash needs CSS, Streamlit offers little, Panel gained templates. spaday's
answer is the design systems it binds to, eight of them at the time of writing, each with its own
components and theming. Colors and tokens are set from Python through `css()`, dark and light page
modes follow one root class, and a package's bundle or a single element can be swapped for your own.
See [Ship your own variant](customizing.md).

| Criterion      | [Dash](https://dash.plotly.com) | [Voilà](https://voila.readthedocs.io) | [Panel](https://panel.holoviz.org) | [Streamlit](https://streamlit.io) | spaday                                      |
| -------------- | ------------------------------- | ------------------------------------- | ---------------------------------- | --------------------------------- | ------------------------------------------- |
| Built for      | standalone dashboards           | publishing notebooks                  | full data applications             | scripts to tools                  | multi-tenant applications                   |
| Jupyter        | no                              | native                                | native                             | no                                | anywidget; same tree as the web app         |
| Scales         | yes, client state               | kernel per user                       | session per user                   | session per tab                   | yes, client state; small server model       |
| Multi-page     | with web knowledge              | no                                    | pipelines                          | awkward                           | client routing and `mount_site`             |
| Ease of use    | moderate                        | easiest                               | moderate                           | easiest                           | easy start; curve scales with reach         |
| Authentication | enterprise                      | host                                  | host                               | host                              | host framework                              |
| Big data       | enterprise                      | kernel                                | Dask, Datashader                   | memory-bound                      | patches over transports; virtualized tables |
| Styling        | CSS                             | notebook themes                       | templates                          | limited                           | design-system packages, Python tokens       |

## Side by side

| Tool                                  | Interaction logic runs                                            | Server state per user       | Components                                      | Hosts                            |
| ------------------------------------- | ----------------------------------------------------------------- | --------------------------- | ----------------------------------------------- | -------------------------------- |
| [Streamlit](https://streamlit.io)     | Python, script re-run                                             | session per tab             | Streamlit widgets, iframe customs               | web                              |
| [Gradio](https://www.gradio.app)      | Python function per submit                                        | little                      | Gradio components                               | web                              |
| [Dash](https://dash.plotly.com)       | Python callbacks over HTTP; optional JS strings                   | none                        | React wrappers                                  | web                              |
| [NiceGUI](https://nicegui.io)         | Python handlers over a socket                                     | per client                  | Vue and Quasar                                  | web                              |
| [Reflex](https://reflex.dev)          | Python handlers over a WebSocket                                  | per client                  | React, Next.js build                            | web                              |
| [Panel](https://panel.holoviz.org)    | Python reactive graph; optional JS links                          | session                     | Bokeh models, ipywidgets                        | web, notebook, Pyodide           |
| [Shiny](https://shiny.posit.co/py/)   | Python reactive graph                                             | session                     | Shiny components                                | web, Shinylive                   |
| [Solara](https://solara.dev)          | Python components on ipywidgets                                   | session                     | [ipywidgets](https://ipywidgets.readthedocs.io) | web, notebook                    |
| [Voilà](https://voila.readthedocs.io) | Python kernel                                                     | kernel per viewer           | [ipywidgets](https://ipywidgets.readthedocs.io) | web                              |
| JS frontend + Python API              | your JavaScript                                                   | as designed                 | npm                                             | web                              |
| Templates + htmx                      | Python per request                                                | as designed                 | your HTML                                       | web                              |
| spaday                                | browser-interpreted actions and bindings; Python by explicit call | a transports model, or none | any web-component library with a manifest       | web, embedded, notebook, Pyodide |

## Trade-offs

**Interactions that need Python: on par.** Exploratory analysis and per-click model inference are the
clearest cases. In Streamlit, Panel, or Shiny the handler is a Python function. In spaday it is the same
function behind an endpoint, called with `CallEndpoint`, or a model edit sent with `SendPatch` that the
server answers. The Python runs in the same place and costs the same. What differs is everything around
it: the rest of the page keeps working without a round trip, and the server does not need a session to
make that call possible.

**Custom JavaScript: any you need, by reference.** The action vocabulary is small so that a tree
stays data that is safe to serialize and ship. When a page needs more, `NamedJs` calls a handler
registered on the page by name, and a [wrapper](wrappers.md) puts an imperative library behind a
component with typed props. Both keep the tree serializable. Both are about as much JavaScript as a
Dash clientside callback or a Panel link, written once and referenced from Python instead of pasted
inline.

**An existing frontend: embed spaday in it.** The integration ladder runs from `serve` down to a
`fragment`, which renders a spaday tree in one node of a page you own, and the assets can be mounted
under a prefix of your app. A team with a React or Vue frontend adds a Python-authored region without
giving anything up, and two libraries on one page can [share one engine](customizing.md).

**Multi-tenancy: ahead.** This is where the families separate most. Voilà starts a kernel per viewer.
Streamlit keeps a session per tab. Panel, Shiny, and Solara keep a session per user with the reactive
graph inside it. Each user costs an interpreter or a slice of one, and that caps how many users one
server can hold. spaday was built for the opposite case. Interaction logic runs in the browser, the
server keeps a small transports model per session, and a `Hub` routes each connection to its own tenant
session while sharing models across tenants where they should be shared. A page can mirror several
models at once under separate namespaces, so a global model, a per-tenant model, and a per-tab form can
all sit on one page with no glue code. A server's cost per user is a model, not a process, and the same
tree serves one viewer or a thousand. See [Sync a UI to a server](transports.md).

**Age: behind.** Streamlit and Dash have had years of components, hosting options, and answered
questions. spaday and its component packages are newer, and its ecosystem is the web-component libraries
it binds to rather than a catalog of its own. That is a bet that web-component libraries outlast any one
Python catalog, and the bet is too young to judge.
