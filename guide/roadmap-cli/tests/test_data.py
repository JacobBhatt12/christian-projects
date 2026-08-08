import unittest

from roadmap.data import CLOSING_NOTE, STAGES


class DataTests(unittest.TestCase):
    def test_stage_keys_are_unique(self):
        keys = [stage.key for stage in STAGES]
        self.assertEqual(len(keys), len(set(keys)))

    def test_every_stage_has_resources(self):
        for stage in STAGES:
            self.assertTrue(stage.resources, f"{stage.key} has no resources")

    def test_every_resource_has_a_name_and_description(self):
        for stage in STAGES:
            for resource in stage.resources:
                self.assertTrue(resource.name.strip())
                self.assertTrue(resource.description.strip())

    def test_urls_use_https_when_present(self):
        for stage in STAGES:
            for resource in stage.resources:
                if resource.url is not None:
                    self.assertTrue(resource.url.startswith("https://"))

    def test_closing_note_mentions_building(self):
        self.assertIn("building", CLOSING_NOTE.lower())


if __name__ == "__main__":
    unittest.main()
