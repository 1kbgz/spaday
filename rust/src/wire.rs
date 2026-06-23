//! Framed wire for the component tree and its patches, riding transports' envelope and codecs.
//!
//! spaday's tree (a [`crate::Node`]) and tree-patches (a [`crate::Patch`]) ship as transports
//! [`Frame`]s — the same length-prefixed, codec-tagged envelope transports uses for model state — so a
//! spaday app speaks one wire for both its UI tree and its data. The payload is the Node/Patch
//! serialized with the named codec (`application/json` or `application/msgpack`, the latter via
//! transports' `json_to_msgpack`). JSON is the default and byte-compatible with the older
//! `diff_json`/`apply_json` bridge; msgpack is the compact option, decoded back through transports.
//!
//! These are string/bytes facades (like [`crate::json`]) so the PyO3 and wasm bindings stay thin: a
//! server frames a Node or Patch JSON, the browser unframes it back to JSON for `mount`/`applyPatch`.

use transports::{Frame, FrameKind, ModelId};

const JSON: &str = "application/json";
const MSGPACK: &str = "application/msgpack";

fn kind_of(kind: &str) -> Result<FrameKind, String> {
    match kind {
        "snapshot" => Ok(FrameKind::Snapshot),
        "patch" => Ok(FrameKind::Patch),
        other => Err(format!("unknown frame kind: {other}")),
    }
}

fn kind_str(kind: FrameKind) -> &'static str {
    match kind {
        FrameKind::Snapshot => "snapshot",
        FrameKind::Patch => "patch",
    }
}

/// Frame a JSON-encoded tree (`Node`) or patch into transports' length-prefixed envelope bytes.
///
/// `kind` is `"snapshot"` (a whole tree) or `"patch"`; `codec` is `"application/json"` or
/// `"application/msgpack"`. `model_type` is a free label carried in the header (e.g. the root tag).
pub fn encode_frame(
    payload_json: &str,
    model_type: &str,
    kind: &str,
    rev: u64,
    codec: &str,
) -> Result<Vec<u8>, String> {
    let payload = match codec {
        JSON => payload_json.as_bytes().to_vec(),
        MSGPACK => transports::json_to_msgpack(payload_json)?,
        other => return Err(format!("unknown codec: {other}")),
    };
    Ok(Frame {
        codec: codec.to_string(),
        model_type: model_type.to_string(),
        target: ModelId(0),
        rev,
        kind: kind_of(kind)?,
        payload,
    }
    .encode())
}

/// Read one frame back to `{"model_type":..,"kind":"snapshot"|"patch","rev":..,"payload":<json>}`,
/// where `payload` is the decoded tree/patch as a JSON value ready for `mount`/`applyPatch`.
pub fn decode_frame(bytes: &[u8]) -> Result<String, String> {
    let (frame, _rest) = Frame::decode(bytes).map_err(|e| e.to_string())?;
    let payload_json = match frame.codec.as_str() {
        JSON => String::from_utf8(frame.payload).map_err(|e| e.to_string())?,
        MSGPACK => transports::msgpack_to_json(&frame.payload)?,
        other => return Err(format!("unknown codec: {other}")),
    };
    let payload: serde_json::Value =
        serde_json::from_str(&payload_json).map_err(|e| e.to_string())?;
    Ok(serde_json::json!({
        "model_type": frame.model_type,
        "kind": kind_str(frame.kind),
        "rev": frame.rev,
        "payload": payload,
    })
    .to_string())
}

#[cfg(test)]
mod wire_tests {
    use super::*;

    const TREE: &str = r#"{"tag":"wa-switch","props":{"checked":{"Bool":true}}}"#;

    fn payload_of(decoded: &str) -> serde_json::Value {
        serde_json::from_str::<serde_json::Value>(decoded).unwrap()["payload"].clone()
    }

    #[test]
    fn test_json_frame_round_trip() {
        let bytes = encode_frame(TREE, "wa-switch", "snapshot", 0, JSON).unwrap();
        let decoded = decode_frame(&bytes).unwrap();
        let obj: serde_json::Value = serde_json::from_str(&decoded).unwrap();
        assert_eq!(obj["kind"], "snapshot");
        assert_eq!(obj["model_type"], "wa-switch");
        assert_eq!(
            payload_of(&decoded),
            serde_json::from_str::<serde_json::Value>(TREE).unwrap()
        );
    }

    #[test]
    fn test_msgpack_frame_round_trips_to_same_tree_and_is_smaller() {
        let json = encode_frame(TREE, "t", "snapshot", 1, JSON).unwrap();
        let mp = encode_frame(TREE, "t", "snapshot", 1, MSGPACK).unwrap();
        // both decode back to the identical tree
        assert_eq!(
            payload_of(&decode_frame(&json).unwrap()),
            payload_of(&decode_frame(&mp).unwrap())
        );
        assert!(mp.len() < json.len());
    }

    #[test]
    fn test_patch_kind_and_rev_survive() {
        let patch = r#"{"ops":[]}"#;
        let bytes = encode_frame(patch, "p", "patch", 7, MSGPACK).unwrap();
        let obj: serde_json::Value = serde_json::from_str(&decode_frame(&bytes).unwrap()).unwrap();
        assert_eq!(obj["kind"], "patch");
        assert_eq!(obj["rev"], 7);
    }

    #[test]
    fn test_unknown_codec_and_kind_error() {
        assert!(encode_frame(TREE, "t", "snapshot", 0, "application/protobuf").is_err());
        assert!(encode_frame(TREE, "t", "bogus", 0, JSON).is_err());
    }
}
