export const EXAMPLES = {
  "webawesome-forms": {
    title: "WebAwesome settings form",
    module: "spaday.examples.webawesome_forms",
    stateAttribute: "INITIAL_STATE",
    distributions: ["spaday-webawesome"],
    assets: ["webawesome"],
    note: "Save settings needs the server endpoint; local controls, validation, and reset run in this preview.",
  },
  "webawesome-navigation": {
    title: "WebAwesome navigation",
    module: "spaday.examples.webawesome_navigation",
    stateAttribute: "INITIAL_STATE",
    distributions: ["spaday-webawesome"],
    assets: ["webawesome"],
  },
  "webawesome-feedback": {
    title: "WebAwesome feedback",
    module: "spaday.examples.webawesome_feedback",
    stateAttribute: "INITIAL_STATE",
    distributions: ["spaday-webawesome"],
    assets: ["webawesome"],
  },
  "webawesome-content": {
    title: "WebAwesome content",
    module: "spaday.examples.webawesome_content",
    distributions: ["spaday-webawesome"],
    assets: ["webawesome"],
  },
  "webawesome-observers": {
    title: "WebAwesome observers",
    module: "spaday.examples.webawesome_observers",
    stateAttribute: "INITIAL_STATE",
    distributions: ["spaday-webawesome"],
    assets: ["webawesome"],
    note: "The include component's /partial.html endpoint is unavailable on the static site.",
  },
  "data-dashboard": {
    title: "Local data dashboard",
    module: "spaday.examples.data_dashboard",
    stateAttribute: "INITIAL_STATE",
    distributions: ["spaday-webawesome", "spaday-lightweight-charts"],
    assets: ["webawesome", "lightweight-charts"],
  },
  reactive: {
    title: "Reactive transports binding",
    module: "spaday.examples.reactive",
    treeAttribute: "page",
    requirements: ["transports==0.8.0", "starlette", "uvicorn"],
    assets: [],
  },
};

export const ASSETS = {
  webawesome: [
    { type: "css", path: "../../components/webawesome/css/webawesome.css" },
    { type: "js", path: "../../components/webawesome/cdn/index.js" },
  ],
  "lightweight-charts": [
    { type: "css", path: "../../components/lightweight-charts/css/index.css" },
    { type: "js", path: "../../components/lightweight-charts/cdn/index.js" },
  ],
};
