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
    #[wasm_bindgen(method)]
    fn emit(this: &Host, event: &str, detail: JsValue);
    #[wasm_bindgen(method, js_name = sendPatch)]
    fn send_patch(this: &Host, model: &str, field: &str, value: JsValue);
    #[wasm_bindgen(method, js_name = callEndpoint)]
    fn call_endpoint(this: &Host, method: &str, url: &str, body: JsValue);
    #[wasm_bindgen(method, js_name = callNamed)]
    fn call_named(this: &Host, handler: &str);
}

/// Interpret a serialized action (the core's DSL wire form) against the DOM primitives in `host`.
///
/// Behavior is data: the action is parsed + validated by the shared core, then evaluated here with no
/// `eval`. This is the browser-side half of the action DSL — the same model the Python binding authors.
#[wasm_bindgen]
pub fn interpret(action: &str, host: &Host) -> Result<(), JsError> {
    let action = spaday::parse_action(action).map_err(|e| JsError::new(&e))?;
    run(&action, host);
    Ok(())
}

fn run(action: &spaday::Action, host: &Host) {
    use spaday::Action::{CallEndpoint, Emit, If, NamedJs, SendPatch, Sequence, SetProp, Toggle};
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
        Sequence { actions } => {
            for a in actions {
                run(a, host);
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
                run(then, host);
            } else if let Some(e) = els {
                run(e, host);
            }
        }
        CallEndpoint { method, url, body } => {
            let b = body.as_ref().map_or(JsValue::UNDEFINED, |e| eval(e, host));
            host.call_endpoint(method, url, b);
        }
        NamedJs { handler } => host.call_named(handler),
    }
}

fn eval(expr: &spaday::Expr, host: &Host) -> JsValue {
    use spaday::Expr::{Event, Lit, Not, Prop};
    match expr {
        // json_compatible: JSON objects become plain JS objects (not Maps), so they round-trip through
        // `JSON.stringify` (e.g. a CallEndpoint body) and set cleanly as props.
        Lit { value } => value
            .serialize(&serde_wasm_bindgen::Serializer::json_compatible())
            .unwrap_or(JsValue::UNDEFINED),
        Event => host.event_value(),
        Not { of } => JsValue::from_bool(!truthy(&eval(of, host))),
        Prop { target, name } => {
            resolve(target, host).map_or(JsValue::NULL, |el| host.get_prop(&el, name))
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
