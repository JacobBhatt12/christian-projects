import io
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from focus.console import Console


PROJECT_ROOT = Path(__file__).resolve().parents[1]


class ConsoleAndCliTests(unittest.TestCase):
    def test_no_color_environment_variable_wins(self):
        with patch.dict(os.environ, {"NO_COLOR": "1"}):
            console = Console(color_mode="always", out=io.StringIO())
            self.assertFalse(console.color)
            self.assertEqual(console.style("plain", "green"), "plain")

    def test_progress_bar_is_bounded(self):
        console = Console(color_mode="never", out=io.StringIO())
        self.assertEqual(console.progress_bar(2, 4, width=4), "██░░")
        self.assertEqual(console.progress_bar(9, 4, width=4), "████")

    def test_stats_command_runs_with_flag_after_subcommand(self):
        with tempfile.TemporaryDirectory() as directory:
            environment = os.environ.copy()
            environment["FOCUS_HOME"] = directory
            result = subprocess.run(
                [sys.executable, "-m", "focus", "stats", "--no-color"],
                cwd=PROJECT_ROOT,
                env=environment,
                text=True,
                capture_output=True,
                timeout=10,
                check=False,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn("Faithful work, at a glance", result.stdout)
            self.assertNotIn("\033[", result.stdout)

    def test_interactive_menu_can_exit_cleanly(self):
        with tempfile.TemporaryDirectory() as directory:
            environment = os.environ.copy()
            environment["FOCUS_HOME"] = directory
            environment["NO_COLOR"] = "1"
            result = subprocess.run(
                [sys.executable, "-m", "focus"],
                cwd=PROJECT_ROOT,
                env=environment,
                input="q\n",
                text=True,
                capture_output=True,
                timeout=10,
                check=False,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn("Choose an action", result.stdout)
            self.assertIn("Go in peace", result.stdout)

    def test_launcher_is_executable(self):
        launcher = PROJECT_ROOT / "bin" / "focus"
        self.assertTrue(os.access(launcher, os.X_OK))

    def test_windows_launcher_uses_location_independent_entry_script(self):
        launcher = (PROJECT_ROOT / "focus.cmd").read_text(encoding="utf-8")
        self.assertIn("%~dp0run_focus.py", launcher)


if __name__ == "__main__":
    unittest.main()
