import io
import tempfile
import unittest
from datetime import date, datetime, timezone
from pathlib import Path

from focus.app import FocusApp, consistency_streak
from focus.console import Console
from focus.scripture import ScriptureLibrary
from focus.storage import Storage


class AnswerStream:
    def __init__(self, answers):
        self.answers = iter(answers)

    def __call__(self):
        return next(self.answers)


class SequenceClock:
    def __init__(self, *values):
        self.values = iter(values)

    def __call__(self):
        return next(self.values)


class AppTests(unittest.TestCase):
    def make_app(self, directory, answers=(), clock=None, timer=None):
        output = io.StringIO()
        console = Console(
            color_mode="never", input_func=AnswerStream(answers), out=output
        )
        storage = Storage(Path(directory))
        app = FocusApp(
            storage,
            console,
            ScriptureLibrary(),
            clock=clock or (lambda: datetime(2026, 8, 8, 15, tzinfo=timezone.utc)),
            timer=timer or (lambda minutes, console: (minutes * 60, True)),
        )
        return app, storage, output

    def test_start_without_timer_saves_active_session(self):
        with tempfile.TemporaryDirectory() as directory:
            app, storage, output = self.make_app(directory)

            result = app.start("A release helper", "maintainers", no_timer=True)

            self.assertEqual(result, 0)
            self.assertEqual(storage.data["active_session"]["project"], "A release helper")
            self.assertFalse(storage.data["active_session"]["timer_used"])
            self.assertIn("response to grace", output.getvalue())

    def test_start_timer_result_is_persisted(self):
        with tempfile.TemporaryDirectory() as directory:
            calls = []

            def fake_timer(minutes, console):
                calls.append(minutes)
                return 90, False

            app, storage, _ = self.make_app(directory, timer=fake_timer)
            app.start("Documentation", "new contributors", timer_minutes=3)

            self.assertEqual(calls, [3])
            self.assertEqual(storage.data["active_session"]["timer_seconds"], 90)
            self.assertFalse(storage.data["active_session"]["timer_completed"])

    def test_reflect_closes_session_and_tracks_project(self):
        with tempfile.TemporaryDirectory() as directory:
            started = datetime(2026, 8, 8, 14, tzinfo=timezone.utc)
            ended = datetime(2026, 8, 8, 15, 30, tzinfo=timezone.utc)
            clock = SequenceClock(started, ended)
            answers = [
                "Shipped the parser",
                "Boundary tests matter",
                "Need a naming review",
                "It saves maintainers time",
                "yes",
            ]
            app, storage, output = self.make_app(directory, answers, clock=clock)
            app.start("Release helper", "maintainers", no_timer=True)

            result = app.reflect()

            self.assertEqual(result, 0)
            self.assertIsNone(storage.data["active_session"])
            session = storage.data["sessions"][0]
            self.assertEqual(session["coding_seconds"], 5400)
            self.assertEqual(session["focus_seconds"], 5400)
            self.assertTrue(session["project_completed"])
            self.assertIn("1h 30m logged", output.getvalue())

    def test_debug_flow_saves_answers_and_checklist(self):
        with tempfile.TemporaryDirectory() as directory:
            answers = [
                "A JSON object",
                "A KeyError",
                "Renamed one field",
                "Printed the input",
                "yes",
                "yes",
                "no",
                "yes",
                "no",
            ]
            app, storage, output = self.make_app(directory, answers)

            app.debug()

            saved = storage.data["debug_sessions"][0]
            self.assertEqual(saved["actual"], "A KeyError")
            self.assertEqual(len(saved["checklist"]), 5)
            self.assertEqual(sum(item["completed"] for item in saved["checklist"]), 3)
            self.assertIn("3/5", output.getvalue())

    def test_prayer_notes_can_be_saved_or_discarded(self):
        with tempfile.TemporaryDirectory() as directory:
            answers = ["Holy and good", "", "For patience", "Help my team", "yes"]
            app, storage, _ = self.make_app(directory, answers)
            app.pray()
            self.assertEqual(len(storage.data["prayer_notes"]), 1)

        with tempfile.TemporaryDirectory() as directory:
            answers = ["Holy", "", "", "", "no"]
            app, storage, _ = self.make_app(directory, answers)
            app.pray()
            self.assertEqual(storage.data["prayer_notes"], [])

    def test_stats_include_required_measures_and_reflections(self):
        with tempfile.TemporaryDirectory() as directory:
            app, storage, output = self.make_app(directory)
            storage.data["sessions"] = [
                {
                    "project": "Release helper",
                    "local_day": "2026-08-08",
                    "focus_seconds": 1500,
                    "coding_seconds": 1800,
                    "project_completed": True,
                    "completed": "Parser",
                    "learned": "Test edges",
                }
            ]
            app.stats()
            rendered = output.getvalue()
            self.assertIn("Coding sessions", rendered)
            self.assertIn("Total focus time", rendered)
            self.assertIn("Current streak", rendered)
            self.assertIn("Completed projects", rendered)
            self.assertIn("Recent reflections", rendered)
            self.assertIn("25m 00s", rendered)

    def test_consistency_streak_allows_yesterday_as_current(self):
        sessions = [
            {"local_day": "2026-08-05"},
            {"local_day": "2026-08-06"},
            {"local_day": "2026-08-07"},
        ]
        self.assertEqual(consistency_streak(sessions, date(2026, 8, 8)), 3)
        self.assertEqual(consistency_streak(sessions, date(2026, 8, 9)), 0)

    def test_stats_ignore_malformed_user_edited_values(self):
        with tempfile.TemporaryDirectory() as directory:
            app, storage, output = self.make_app(directory)
            storage.data["sessions"] = [
                {
                    "project": "Hand-edited record",
                    "local_day": "not-a-date",
                    "focus_seconds": "unknown",
                    "coding_seconds": None,
                    "completed": "Something",
                    "learned": "Be careful editing JSON",
                }
            ]
            self.assertEqual(app.stats(), 0)
            self.assertIn("Hand-edited record", output.getvalue())


if __name__ == "__main__":
    unittest.main()
