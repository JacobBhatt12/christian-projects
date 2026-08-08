import io
import unittest

from roadmap.app import RoadmapApp
from roadmap.console import Console
from roadmap.data import STAGES


def make_app(input_lines=None):
    inputs = iter(input_lines or [])
    out = io.StringIO()
    console = Console(no_color=True, input_func=lambda: next(inputs), out=out)
    return RoadmapApp(console), out


class ShowTests(unittest.TestCase):
    def test_show_known_stage_prints_its_resources(self):
        app, out = make_app()
        code = app.show("beginner")
        self.assertEqual(code, 0)
        text = out.getvalue()
        self.assertIn("freeCodeCamp", text)
        self.assertIn("https://www.freecodecamp.org/", text)
        self.assertNotIn("The Odin Project", text)

    def test_show_unknown_stage_warns_and_fails(self):
        app, out = make_app()
        code = app.show("expert")
        self.assertEqual(code, 1)
        self.assertIn("Unknown stage", out.getvalue())

    def test_resource_without_url_still_shows_its_description(self):
        app, out = make_app()
        app.show("intermediate")
        raw = out.getvalue()
        for border in "│╭╮╰╯─":
            raw = raw.replace(border, " ")
        text = " ".join(raw.split())
        self.assertIn("Build projects without following tutorials step by step.", text)


class ListAllTests(unittest.TestCase):
    def test_list_all_includes_every_stage_title(self):
        app, out = make_app()
        code = app.list_all()
        self.assertEqual(code, 0)
        text = out.getvalue()
        for stage in STAGES:
            self.assertIn(stage.title, text)


class MenuTests(unittest.TestCase):
    def test_quit_exits_immediately(self):
        app, out = make_app(["q"])
        code = app.menu()
        self.assertEqual(code, 0)
        self.assertIn("Keep building", out.getvalue())

    def test_choosing_a_stage_then_quitting(self):
        app, out = make_app(["1", "", "q"])
        code = app.menu()
        self.assertEqual(code, 0)
        self.assertIn("freeCodeCamp", out.getvalue())

    def test_show_everything_option(self):
        app, out = make_app(["a", "", "q"])
        app.menu()
        text = out.getvalue()
        self.assertIn("Exercism", text)
        self.assertIn("Contribute", text)

    def test_invalid_choice_reprompts(self):
        app, out = make_app(["9", "q"])
        code = app.menu()
        self.assertEqual(code, 0)
        self.assertIn("Choose 1-3, a, or q.", out.getvalue())


if __name__ == "__main__":
    unittest.main()
