#!/usr/bin/env python3
"""Scripture Flashcards - a terminal quiz for memorizing Bible verses."""

import random

# Verse text from the King James Version (public domain).
VERSES = {
    "John 3:16": (
        "For God so loved the world, that he gave his only begotten Son, "
        "that whosoever believeth in him should not perish, but have "
        "everlasting life."
    ),
    "Psalm 23:1": "The LORD is my shepherd; I shall not want.",
    "Proverbs 3:5": (
        "Trust in the LORD with all thine heart; and lean not unto thine "
        "own understanding."
    ),
    "Philippians 4:13": (
        "I can do all things through Christ which strengtheneth me."
    ),
    "Romans 8:28": (
        "And we know that all things work together for good to them that "
        "love God, to them who are the called according to his purpose."
    ),
    "Genesis 1:1": (
        "In the beginning God created the heaven and the earth."
    ),
    "Jeremiah 29:11": (
        "For I know the thoughts that I think toward you, saith the LORD, "
        "thoughts of peace, and not of evil, to give you an expected end."
    ),
    "Isaiah 40:31": (
        "But they that wait upon the LORD shall renew their strength; they "
        "shall mount up with wings as eagles; they shall run, and not be "
        "weary; and they shall walk, and not faint."
    ),
    "Matthew 6:33": (
        "But seek ye first the kingdom of God, and his righteousness; and "
        "all these things shall be added unto you."
    ),
    "Joshua 1:9": (
        "Have not I commanded thee? Be strong and of a good courage; be not "
        "afraid, neither be thou dismayed: for the LORD thy God is with "
        "thee whithersoever thou goest."
    ),
    "Psalm 119:105": (
        "Thy word is a lamp unto my feet, and a light unto my path."
    ),
    "Romans 3:23": (
        "For all have sinned, and come short of the glory of God;"
    ),
    "Ephesians 2:8": (
        "For by grace are ye saved through faith; and that not of "
        "yourselves: it is the gift of God:"
    ),
    "1 John 1:9": (
        "If we confess our sins, he is faithful and just to forgive us our "
        "sins, and to cleanse us from all unrighteousness."
    ),
    "Micah 6:8": (
        "He hath shewed thee, O man, what is good; and what doth the LORD "
        "require of thee, but to do justly, and to love mercy, and to walk "
        "humbly with thy God?"
    ),
}


def ask_yes_no(prompt):
    """Keep asking until the user answers y or n."""
    while True:
        answer = input(prompt).strip().lower()
        if answer in ("y", "yes"):
            return True
        if answer in ("n", "no"):
            return False
        print("Please answer y or n.")


def quiz():
    print("=" * 50)
    print("       SCRIPTURE FLASHCARDS")
    print("=" * 50)
    print("You'll be shown a verse reference. Try to recite")
    print("the verse, then press Enter to see the answer.")
    print("Grade yourself honestly! Press Ctrl+C to quit.\n")

    references = list(VERSES)
    random.shuffle(references)
    score = 0
    asked = 0

    for number, reference in enumerate(references, start=1):
        print(f"Card {number} of {len(references)}: {reference}")
        input("Your guess (type it out or say it aloud), then press Enter... ")
        print(f'\n"{VERSES[reference]}"\n')
        asked += 1
        if ask_yes_no("Did you get it right? (y/n): "):
            score += 1
            print("Amen! Well done.\n")
        else:
            print("Keep at it - hide it in your heart.\n")

    return score, asked


def main():
    score, asked = 0, 0
    try:
        score, asked = quiz()
    except (KeyboardInterrupt, EOFError):
        print("\n\nEnding early.")

    if asked:
        percent = 100 * score / asked
        print(f"Final score: {score} out of {asked} ({percent:.0f}%)")
        if score == asked:
            print("Perfect! Every word treasured.")
        elif percent >= 60:
            print("Great work - keep practicing!")
        else:
            print("Good start - review and try again soon.")
    else:
        print("No cards answered this time. Come back soon!")


if __name__ == "__main__":
    main()
