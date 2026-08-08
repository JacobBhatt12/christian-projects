import io
import os
import subprocess
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

from roadmap.console import Console


PROJECT_ROOT = Path(__file__).resolve().parents[1]


class ConsoleAndCliTests(unittest.TestCase):
    def test_no_color_environment_variable_wins(self):
        with patch.dict(os.environ, {"NO_COLOR": "1"}):
            console = Console(out=io.StringIO())
            self.assertFalse(console.color)
            self.assertEqual(console.style("plain", "green"), "plain")

    def test_no_color_flag_disables_color_without_env_var(self):
        with patch.dict(os.environ, {}, clear=True):
            console = Console(no_color=True, out=io.StringIO())
            self.assertFalse(console.color)

    def test_list_command_runs(self):
        result = subprocess.run(
            [sys.executable, "-m", "roadmap", "list", "--no-color"],
            cwd=PROJECT_ROOT,
            text=True,
            capture_output=True,
            timeout=10,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("CODE ROADMAP", result.stdout)
        self.assertIn("freeCodeCamp", result.stdout)
        self.assertIn("Exercism", result.stdout)
        self.assertIn("Contribute", result.stdout)
        self.assertNotIn("\033[", result.stdout)

    def test_show_command_with_unknown_stage_is_rejected_by_argparse(self):
        result = subprocess.run(
            [sys.executable, "-m", "roadmap", "show", "wizard"],
            cwd=PROJECT_ROOT,
            text=True,
            capture_output=True,
            timeout=10,
            check=False,
        )
        self.assertNotEqual(result.returncode, 0)

    def test_interactive_menu_can_exit_cleanly(self):
        environment = os.environ.copy()
        environment["NO_COLOR"] = "1"
        result = subprocess.run(
            [sys.executable, "-m", "roadmap"],
            cwd=PROJECT_ROOT,
            env=environment,
            input="q\n",
            text=True,
            capture_output=True,
            timeout=10,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Choose a stage", result.stdout)
        self.assertIn("Keep building", result.stdout)

    def test_launcher_is_executable(self):
        launcher = PROJECT_ROOT / "bin" / "roadmap"
        self.assertTrue(os.access(launcher, os.X_OK))

    def test_windows_launcher_uses_location_independent_entry_script(self):
        launcher = (PROJECT_ROOT / "roadmap.cmd").read_text(encoding="utf-8")
        self.assertIn("%~dp0run_roadmap.py", launcher)


if __name__ == "__main__":
    unittest.main()
