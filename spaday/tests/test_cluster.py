"""The multi-worker cluster ticker must resume from the caught-up shared chart, never rewind to the seed
(so an elected/restarted leader doesn't reset every client). Skips unless transports has the clustering
API installed (RelayBroadcaster/ZmqBackplane)."""

import pytest

cluster = pytest.importorskip("spaday.examples.cluster", reason="needs a transports with the clustering API (RelayBroadcaster/ZmqBackplane)")


def test_resume_seeds_only_an_empty_chart():
    value, day, data, rng = cluster._resume({})
    assert len(data) == cluster.WINDOW
    assert min(data) == "2023-01-01"  # a cold start seeds from the beginning


def test_resume_continues_from_a_caught_up_chart_without_rewinding():
    later = {"2023-09-01": 50.0, "2023-09-02": 51.0}
    value, day, data, rng = cluster._resume(later)
    assert data == later  # keeps the caught-up window — no rewind to 2023-01-01
    assert day.isoformat() == "2023-09-03"  # next point is the day after the last
    assert value == 51.0  # continues from the last value
