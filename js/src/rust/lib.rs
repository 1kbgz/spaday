use std::future::Future;
use std::pin::Pin;

use serde::Serialize;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    /// The DOM primitives the browser supplies so the (DOM-free) core interpreter can run. The
    /// interpreter decides *what* to do; this thin host does the actual DOM poking.
    pub type Host;
    #[wasm_bindgen(method, js_name = currentTarget)]
    fn current_target(this: &Host) -> JsValue;
    #[wasm_bindgen(method, js_name = queryId)]
    fn query_id(this: &Host, id: &str) -> JsValue;
    #[wasm_bindgen(method, js_name = getProp)]
    fn get_prop(this: &Host, el: &JsValue, name: &str) -> JsValue;
    #[wasm_bindgen(method, js_name = setProp)]
    fn set_prop(this: &Host, el: &JsValue, name: &str, value: JsValue);
    #[wasm_bindgen(method, js_name = eventValue)]
    fn event_value(this: &Host) -> JsValue;
    #[wasm_bindgen(method, js_name = eventRaw)]
    fn event_raw(this: &Host) -> JsValue;
    #[wasm_bindgen(method, js_name = eventClosest)]
    fn event_closest(this: &Host, selector: &str) -> JsValue;
    #[wasm_bindgen(method, js_name = getField)]
    fn get_field(this: &Host, name: &str) -> JsValue;
    #[wasm_bindgen(method, js_name = getItem)]
    fn get_item(this: &Host, path: &str) -> JsValue;
    #[wasm_bindgen(method, js_name = getScope)]
    fn get_scope(this: &Host, name: &str, path: &str) -> JsValue;
    #[wasm_bindgen(method, js_name = setField)]
    fn set_field(this: &Host, name: &str, value: JsValue);
    #[wasm_bindgen(method)]
    fn emit(this: &Host, event: &str, detail: JsValue);
    #[wasm_bindgen(method, js_name = sendPatch)]
    fn send_patch(this: &Host, model: &str, field: &str, value: JsValue);
    #[wasm_bindgen(method, js_name = callEndpoint)]
    fn call_endpoint(
        this: &Host,
        method: &str,
        url: JsValue,
        body: JsValue,
        result: Option<&str>,
    ) -> JsValue;
    #[wasm_bindgen(method, js_name = refreshTree)]
    fn refresh_tree(this: &Host, url: Option<&str>) -> JsValue;
    #[wasm_bindgen(method, js_name = callNamed)]
    fn call_named(this: &Host, handler: &str);
    #[wasm_bindgen(method, js_name = callMethod)]
    fn call_method(this: &Host, el: &JsValue, method: &str, args: JsValue) -> JsValue;
    #[wasm_bindgen(method, js_name = setStorage)]
    fn set_storage(this: &Host, key: &str, value: JsValue);
    #[wasm_bindgen(method)]
    fn download(this: &Host, filename: JsValue, value: JsValue, content_type: Option<&str>);
}

/// Interpret a serialized action (the core's DSL wire form) against the DOM primitives in `host`.
///
/// Behavior is data: the action is parsed + validated by the shared core, then evaluated here with no
/// `eval`. This is the browser-side half of the action DSL — the same model the Python binding authors.
#[wasm_bindgen]
pub fn interpret(action: &str, host: Host) -> Result<(), JsError> {
    let action = spaday::parse_action(action).map_err(|e| JsError::new(&e))?;
    let mut fut = Box::pin(async move { run(&action, &host).await });
    // Drive synchronously to the first pending await: purely-sync action chains apply inline
    // (same-tick reads keep working); only a chain blocked on a real promise — an `invoke` of
    // an async method — continues on the microtask queue, preserving `seq` ordering across it.
    let waker = std::task::Waker::noop();
    let mut cx = std::task::Context::from_waker(waker);
    if fut.as_mut().poll(&mut cx).is_pending() {
        wasm_bindgen_futures::spawn_local(fut);
    }
    Ok(())
}

fn run<'a>(action: &'a spaday::Action, host: &'a Host) -> Pin<Box<dyn Future<Output = ()> + 'a>> {
    Box::pin(run_inner(action, host))
}

async fn run_inner(action: &spaday::Action, host: &Host) {
    use spaday::Action::{
        CallEndpoint, Download, Emit, If, Invoke, NamedJs, Refresh, SendPatch, Sequence, SetField,
        SetProp, SetStorage, Toggle, ToggleField,
    };
    match action {
        SetProp {
            target,
            prop,
            value,
        } => {
            if let Some(el) = resolve(target, host) {
                host.set_prop(&el, prop, eval(value, host));
            }
        }
        Toggle { target, prop } => {
            if let Some(el) = resolve(target, host) {
                let next = !truthy(&host.get_prop(&el, prop));
                host.set_prop(&el, prop, JsValue::from_bool(next));
            }
        }
        SetField { field, value } => {
            host.set_field(field, eval(value, host));
        }
        ToggleField { field } => {
            let next = !truthy(&host.get_field(field));
            host.set_field(field, JsValue::from_bool(next));
        }
        Sequence { actions } => {
            for a in actions {
                run(a, host).await;
            }
        }
        Emit { event, detail } => {
            let d = detail
                .as_ref()
                .map_or(JsValue::UNDEFINED, |e| eval(e, host));
            host.emit(event, d);
        }
        SendPatch {
            model,
            field,
            value,
        } => {
            host.send_patch(model, field, eval(value, host));
        }
        If { cond, then, els } => {
            if truthy(&eval(cond, host)) {
                run(then, host).await;
            } else if let Some(e) = els {
                run(e, host).await;
            }
        }
        CallEndpoint {
            method,
            url,
            body,
            result,
        } => {
            let u = match url {
                spaday::EndpointUrl::Static(value) => JsValue::from_str(value),
                spaday::EndpointUrl::Expr(expr) => eval(expr, host),
            };
            let b = body.as_ref().map_or(JsValue::UNDEFINED, |e| eval(e, host));
            let done = host.call_endpoint(method, u, b, result.as_deref());
            // await the round-trip so a `seq` continues after the response (and `result`) landed
            await_thenable(done).await;
        }
        Refresh { url } => {
            await_thenable(host.refresh_tree(url.as_deref())).await;
        }
        Invoke {
            target,
            method,
            args,
            result,
        } => {
            if let Some(el) = resolve(target, host) {
                let value = host.call_method(&el, method, eval_args(args, host));
                // await a returned promise so a `seq` continues only after the method settles;
                // rejections were already marked handled (and logged) by the host
                let thenable = value.is_object()
                    && js_sys::Reflect::has(&value, &JsValue::from_str("then")).unwrap_or(false);
                let resolved = if thenable {
                    wasm_bindgen_futures::JsFuture::from(js_sys::Promise::resolve(&value))
                        .await
                        .unwrap_or(JsValue::UNDEFINED)
                } else {
                    value
                };
                if let Some(field) = result {
                    host.set_field(field, resolved);
                }
            }
        }
        SetStorage { key, value } => {
            host.set_storage(key, eval(value, host));
        }
        Download {
            filename,
            value,
            content_type,
        } => {
            host.download(
                eval(filename, host),
                eval(value, host),
                content_type.as_deref(),
            );
        }
        NamedJs { handler } => host.call_named(handler),
    }
}

async fn await_thenable(value: JsValue) {
    let thenable = value.is_object()
        && js_sys::Reflect::has(&value, &JsValue::from_str("then")).unwrap_or(false);
    if thenable {
        let _ = wasm_bindgen_futures::JsFuture::from(js_sys::Promise::resolve(&value)).await;
    }
}

fn eval_args(args: &[spaday::Expr], host: &Host) -> JsValue {
    let out = js_sys::Array::new();
    for arg in args {
        out.push(&eval(arg, host));
    }
    out.into()
}

fn eval(expr: &spaday::Expr, host: &Host) -> JsValue {
    use spaday::Expr::{
        All, Any, Arr, Call, Concat, Cond, Eq, Event, EventClosest, EventProp, Field, Item, Lit,
        Not, Obj, Prop, Scope,
    };
    match expr {
        // json_compatible: JSON objects become plain JS objects (not Maps), so they round-trip through
        // `JSON.stringify` (e.g. a CallEndpoint body) and set cleanly as props.
        Lit { value } => value
            .serialize(&serde_wasm_bindgen::Serializer::json_compatible())
            .unwrap_or(JsValue::UNDEFINED),
        Event { path } => {
            let mut value = host.event_value();
            if let Some(path) = path {
                for key in path.split('.').filter(|part| !part.is_empty()) {
                    if value.is_null() || value.is_undefined() {
                        break;
                    }
                    value = js_sys::Reflect::get(&value, &JsValue::from_str(key))
                        .unwrap_or(JsValue::UNDEFINED);
                }
            }
            value
        }
        EventProp { path } => {
            // Read from the raw DOM event object (e.g. `clientX`, `shiftKey`) — `Event` above
            // walks the smart-default *value* (checked / value / detail) instead.
            let mut value = host.event_raw();
            for key in path.split('.').filter(|part| !part.is_empty()) {
                if value.is_null() || value.is_undefined() {
                    break;
                }
                value = js_sys::Reflect::get(&value, &JsValue::from_str(key))
                    .unwrap_or(JsValue::UNDEFINED);
            }
            value
        }
        EventClosest { selector, path } => {
            // Walk from the closest ancestor of the event target matching `selector` (the host
            // resolves `event.target.closest(selector)`); an empty path is the element itself.
            let mut value = host.event_closest(selector);
            for key in path.split('.').filter(|part| !part.is_empty()) {
                if value.is_null() || value.is_undefined() {
                    break;
                }
                value = js_sys::Reflect::get(&value, &JsValue::from_str(key))
                    .unwrap_or(JsValue::UNDEFINED);
            }
            value
        }
        Call {
            target,
            method,
            args,
        } => resolve(target, host).map_or(JsValue::UNDEFINED, |el| {
            host.call_method(&el, method, eval_args(args, host))
        }),
        Field { name } => host.get_field(name),
        Item { path } => host.get_item(path),
        Scope { name, path } => host.get_scope(name, path),
        Not { of } => JsValue::from_bool(!truthy(&eval(of, host))),
        Eq { a, b } => JsValue::from_bool(js_sys::Object::is(&eval(a, host), &eval(b, host))),
        All { of } => JsValue::from_bool(of.iter().all(|value| truthy(&eval(value, host)))),
        Any { of } => JsValue::from_bool(of.iter().any(|value| truthy(&eval(value, host)))),
        Cond {
            test,
            then,
            otherwise,
        } => {
            if truthy(&eval(test, host)) {
                eval(then, host)
            } else {
                eval(otherwise, host)
            }
        }
        Prop { target, name } => {
            resolve(target, host).map_or(JsValue::NULL, |el| host.get_prop(&el, name))
        }
        // Compose a plain JS object from each field's evaluated value — e.g. a whole model assembled from
        // live control values for a CallEndpoint body. Plain object => round-trips through JSON.stringify.
        Obj { fields } => {
            let obj = js_sys::Object::new();
            for (name, sub) in fields {
                let _ = js_sys::Reflect::set(&obj, &JsValue::from_str(name), &eval(sub, host));
            }
            obj.into()
        }
        Concat { parts } => {
            let values = js_sys::Array::new();
            for part in parts {
                values.push(&eval(part, host));
            }
            values.join("").into()
        }
        // Compose a plain JS array from each element's evaluated value — the list-building
        // counterpart of Obj (e.g. wrap a dynamic value in a one-element list for a list-typed prop).
        Arr { of } => {
            let values = js_sys::Array::new();
            for element in of {
                values.push(&eval(element, host));
            }
            values.into()
        }
    }
}

fn resolve(target: &spaday::Ref, host: &Host) -> Option<JsValue> {
    use spaday::Ref::{Id, This};
    let el = match target {
        This => host.current_target(),
        Id { id } => host.query_id(id),
    };
    (!el.is_null() && !el.is_undefined()).then_some(el)
}

/// JS truthiness for the values the DSL deals in (bool / number / string / null).
fn truthy(v: &JsValue) -> bool {
    if let Some(b) = v.as_bool() {
        return b;
    }
    if v.is_null() || v.is_undefined() {
        return false;
    }
    if let Some(n) = v.as_f64() {
        return n != 0.0;
    }
    if let Some(s) = v.as_string() {
        return !s.is_empty();
    }
    true
}

/// Diff two JSON-encoded component trees, returning the JSON-encoded patch.
///
/// Thin wrapper over the shared core (`spaday::diff_json`); the same code runs in the PyO3 binding.
#[wasm_bindgen]
pub fn diff(old: &str, new: &str) -> Result<String, JsError> {
    spaday::diff_json(old, new).map_err(|e| JsError::new(&e.to_string()))
}

/// Apply a JSON-encoded patch to a JSON-encoded tree, returning the JSON-encoded result.
#[wasm_bindgen]
pub fn apply(root: &str, patch: &str) -> Result<String, JsError> {
    spaday::apply_json(root, patch).map_err(|e| JsError::new(&e.to_string()))
}

/// Parse a `custom-elements.json` manifest into the JSON-encoded list of component schemas.
#[wasm_bindgen]
pub fn parse_cem(manifest: &str) -> Result<String, JsError> {
    spaday::parse_cem(manifest).map_err(|e| JsError::new(&e.to_string()))
}

/// Frame a JSON-encoded tree/patch into transports' length-prefixed envelope bytes.
///
/// `kind` is `"snapshot"` or `"patch"`; `codec` is `"application/json"` or `"application/msgpack"`.
/// `rev` is a `u32` (not `u64`) so JS passes a plain number rather than a BigInt.
#[wasm_bindgen]
pub fn encode_frame(
    payload: &str,
    model_type: &str,
    kind: &str,
    rev: u32,
    codec: &str,
) -> Result<Vec<u8>, JsError> {
    spaday::encode_frame(payload, model_type, kind, rev as u64, codec).map_err(|e| JsError::new(&e))
}

/// Decode one frame back to a `{"model_type","kind","rev","payload"}` JSON string.
#[wasm_bindgen]
pub fn decode_frame(frame: &[u8]) -> Result<String, JsError> {
    spaday::decode_frame(frame).map_err(|e| JsError::new(&e))
}
