"""Python half of the Pyodide Web Worker example."""

from pydantic import BaseModel
from transports import Client, Server, Session, to_value

from spaday import SendPatch, WorkerApp, element, lit


class Counter(BaseModel):
    count: int = 0


session = Session()
authoritative = Counter()
model_id = session.host(authoritative)
server = Server(session, default_codec="msgpack")
client = Client(codec="msgpack")
for frame in server.open("browser", "msgpack"):
    client.recv(frame)


def build_page():
    return (
        element("section", id="counter-card")
        .child(element("p").classes("eyebrow").text("PYTHON · RUST · WEBASSEMBLY"))
        .child(element("h1").text("spaday in a Web Worker"))
        .child(
            element("p")
            .classes("intro")
            .text("Python and transports own this model. The browser stays responsive and applies only the component-tree patch returned by Python.")
        )
        .child(
            element("div")
            .classes("counter")
            .child(element("span").classes("label").text("Worker count"))
            .child(element("strong", id="count").text(str(client.model(model_id, Counter).count)))
        )
        .child(element("button", id="increment", type="button").text("Increment in Python").on("click", SendPatch("counter", "increment", lit(1))))
    )


def on_intent(intent: dict) -> None:
    detail = intent["detail"]
    if detail["model"] == "counter" and detail["field"] == "increment":
        proposal = client.model(model_id, Counter).model_copy()
        proposal.count += int(detail["value"])
        outbound = client.edit(model_id, to_value(proposal))
        for frame in server.recv("browser", outbound)["browser"]:
            client.recv(frame)


app = WorkerApp(build_page, on_intent)
