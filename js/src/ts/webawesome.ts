// Provide the WebAwesome component library built-in: importing this module registers every
// WebAwesome custom element with the browser, so a spaday tree of `wa-*` tags renders. It is a
// separate entry (not pulled into the core bundle) so spaday's core builds without the dependency;
// consumers that want WebAwesome import `spaday/webawesome`.
import "@awesome.me/webawesome";

export {};
