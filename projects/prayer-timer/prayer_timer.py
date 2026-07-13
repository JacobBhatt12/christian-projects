"""Prayer Timer - a simple terminal countdown for focused prayer time."""

import sys
import time


def ask_minutes():
    """Ask the user how many minutes they want to pray."""
    while True:
        answer = input("How many minutes would you like to pray? ")
        try:
            minutes = float(answer)
        except ValueError:
            print("Please enter a number, e.g. 5 or 12.5")
            continue
        if minutes <= 0:
            print("Please enter a number greater than zero.")
            continue
        return minutes


def countdown(total_seconds):
    """Show a live countdown in the terminal, updating once per second."""
    remaining = int(total_seconds)
    while remaining > 0:
        mins, secs = divmod(remaining, 60)
        sys.stdout.write(f"\rTime remaining: {mins:02d}:{secs:02d} ")
        sys.stdout.flush()
        time.sleep(1)
        remaining -= 1
    sys.stdout.write("\rTime remaining: 00:00 \n")


def main():
    print("=" * 40)
    print("        Prayer Timer")
    print("=" * 40)
    minutes = ask_minutes()
    print(f"\nStarting {minutes:g} minute(s) of prayer. Be still...\n")
    try:
        countdown(minutes * 60)
    except KeyboardInterrupt:
        print("\n\nPrayer time ended early. Every moment counts.")
        return
    print("\nWell done, keep your heart close to God.")


if __name__ == "__main__":
    main()
