import unittest

from focus.scripture import ScriptureLibrary


class ScriptureTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.library = ScriptureLibrary()

    def test_required_topics_are_available(self):
        required = {
            "wisdom",
            "perseverance",
            "anxiety",
            "excellence",
            "humility",
            "rest",
            "service",
        }
        self.assertTrue(required.issubset(set(self.library.topics)))

    def test_search_checks_reference_text_and_topics(self):
        results = self.library.search("James wisdom")
        self.assertEqual([verse.reference for verse in results], ["James 1:5"])
        self.assertTrue(self.library.search("careth for you"))

    def test_session_selection_uses_context(self):
        self.assertIn(
            "perseverance",
            self.library.for_session("fix a difficult bug", "the team").topics,
        )
        self.assertIn(
            "service",
            self.library.for_session("build a portal", "church volunteers").topics,
        )


if __name__ == "__main__":
    unittest.main()

