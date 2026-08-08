import json
import tempfile
import unittest
from pathlib import Path

from focus.storage import Storage, StorageError


class StorageTests(unittest.TestCase):
    def test_round_trip_uses_local_json(self):
        with tempfile.TemporaryDirectory() as directory:
            storage = Storage(Path(directory))
            storage.data["sessions"].append({"project": "Small tool"})
            storage.save_data()

            reloaded = Storage(Path(directory))
            self.assertEqual(reloaded.data["sessions"][0]["project"], "Small tool")
            self.assertTrue(reloaded.data_path.exists())

    def test_invalid_json_is_quarantined(self):
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory)
            home.mkdir(exist_ok=True)
            (home / "config.json").write_text("{not json", encoding="utf-8")

            storage = Storage(home)

            backups = list(home.glob("config.json.corrupt-*") )
            self.assertEqual(len(backups), 1)
            self.assertEqual(storage.config["timer_minutes"], 25)
            self.assertTrue(storage.warnings)

    def test_preferences_are_validated(self):
        with tempfile.TemporaryDirectory() as directory:
            storage = Storage(Path(directory))
            with self.assertRaises(StorageError):
                storage.update_preferences("Ada", "sometimes", 25)
            with self.assertRaises(StorageError):
                storage.update_preferences("Ada", "auto", 0)

    def test_changing_data_directory_copies_current_data(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            storage = Storage(root / "home")
            storage.data["prayer_notes"].append({"thanksgiving": "Grace"})
            storage.save_data()

            destination = root / "portable-data"
            storage.change_data_dir(destination)

            copied = json.loads((destination / "focus-data.json").read_text(encoding="utf-8"))
            self.assertEqual(copied["prayer_notes"][0]["thanksgiving"], "Grace")
            self.assertEqual(Path(storage.config["data_dir"]), destination.resolve())


if __name__ == "__main__":
    unittest.main()

