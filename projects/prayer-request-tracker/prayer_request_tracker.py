"""A simple terminal app for keeping track of prayer requests."""

import json
from datetime import date, datetime
from pathlib import Path


DATA_FILE = Path(__file__).with_name("prayer_requests.json")


def load_requests():
    """Load the saved prayer requests."""
    if not DATA_FILE.exists():
        return []

    try:
        with open(DATA_FILE, "r", encoding="utf-8") as file:
            return json.load(file)
    except (json.JSONDecodeError, OSError):
        print("There was a problem reading the prayer requests file.")
        return []


def save_requests(requests):
    """Save all prayer requests to the JSON file."""
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(requests, file, indent=4)


def add_request(requests):
    """Ask for a prayer request and add it to the list."""
    request_text = input("\nEnter your prayer request: ").strip()

    if not request_text:
        print("The prayer request cannot be empty.")
        return

    new_id = 1
    if requests:
        new_id = max(request["id"] for request in requests) + 1

    request = {
        "id": new_id,
        "request": request_text,
        "date_added": date.today().isoformat(),
        "answered": False,
        "date_answered": None,
    }

    requests.append(request)
    save_requests(requests)
    print("Prayer request added.")


def list_requests(requests):
    """Show all saved prayer requests."""
    if not requests:
        print("\nYou have not added any prayer requests yet.")
        return

    print("\nYour Prayer Requests")
    print("-" * 50)

    for request in requests:
        if request["answered"]:
            status = f"Answered on {request['date_answered']}"
        else:
            status = "Still praying"

        print(f"{request['id']}. {request['request']}")
        print(f"   Added: {request['date_added']} | {status}\n")


def get_answered_date():
    """Ask for the date the prayer was answered."""
    today = date.today().isoformat()

    while True:
        answer = input(
            f"Date answered (YYYY-MM-DD), or press Enter for {today}: "
        ).strip()

        if not answer:
            return today

        try:
            datetime.strptime(answer, "%Y-%m-%d")
            return answer
        except ValueError:
            print("Please enter the date in YYYY-MM-DD format.")


def mark_as_answered(requests):
    """Mark one prayer request as answered."""
    if not requests:
        print("\nThere are no prayer requests to update.")
        return

    list_requests(requests)
    choice = input("Enter the number of the answered prayer: ").strip()

    try:
        request_id = int(choice)
    except ValueError:
        print("Please enter a valid number.")
        return

    for request in requests:
        if request["id"] == request_id:
            if request["answered"]:
                print("That prayer request is already marked as answered.")
                return

            request["answered"] = True
            request["date_answered"] = get_answered_date()
            save_requests(requests)
            print("Praise God! The prayer request was marked as answered.")
            return

    print("A prayer request with that number was not found.")


def main():
    requests = load_requests()

    while True:
        print("\n" + "=" * 36)
        print("       Prayer Request Tracker")
        print("=" * 36)
        print("1. Add a prayer request")
        print("2. List all prayer requests")
        print("3. Mark a prayer as answered")
        print("4. Exit")

        choice = input("\nChoose an option: ").strip()

        if choice == "1":
            add_request(requests)
        elif choice == "2":
            list_requests(requests)
        elif choice == "3":
            mark_as_answered(requests)
        elif choice == "4":
            print("\nGoodbye. Keep praying!")
            break
        else:
            print("Please choose a number from 1 to 4.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nGoodbye. Keep praying!")
