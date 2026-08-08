import io
import unittest

from focus.console import Console
from focus.focus_timer import format_duration, run_focus_timer


class TickClock:
    def __init__(self, values):
        self.values = iter(values)

    def __call__(self):
        return next(self.values)


class FocusTimerTests(unittest.TestCase):
    def test_duration_formatting(self):
        self.assertEqual(format_duration(0), "0s")
        self.assertEqual(format_duration(65), "1m 05s")
        self.assertEqual(format_duration(5400), "1h 30m")

    def test_timer_reaches_completion_without_real_sleep(self):
        output = io.StringIO()
        console = Console(color_mode="never", out=output)
        clock = TickClock([0, 0, 30, 60])

        elapsed, completed = run_focus_timer(
            1, console, monotonic=clock, sleep=lambda _: None
        )

        self.assertEqual(elapsed, 60)
        self.assertTrue(completed)
        self.assertIn("Focus block complete", output.getvalue())

    def test_timer_handles_keyboard_interrupt(self):
        output = io.StringIO()
        console = Console(color_mode="never", out=output)
        clock = TickClock([0, 0, 7])

        def interrupt(_):
            raise KeyboardInterrupt

        elapsed, completed = run_focus_timer(
            1, console, monotonic=clock, sleep=interrupt
        )

        self.assertEqual(elapsed, 7)
        self.assertFalse(completed)
        self.assertIn("Timer stopped", output.getvalue())


if __name__ == "__main__":
    unittest.main()
