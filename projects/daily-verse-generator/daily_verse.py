import random
import shutil
import textwrap

from colorama import Fore, Style, init


VERSES = [
    {
        "reference": "John 3:16",
        "text": (
            "For God so loved the world, that he gave his only begotten Son, "
            "that whosoever believeth in him should not perish, but have "
            "everlasting life."
        ),
    },
    {
        "reference": "Philippians 4:13",
        "text": "I can do all things through Christ which strengtheneth me.",
    },
    {
        "reference": "Psalm 23:1",
        "text": "The Lord is my shepherd; I shall not want.",
    },
    {
        "reference": "Proverbs 3:5-6",
        "text": (
            "Trust in the Lord with all thine heart; and lean not unto thine "
            "own understanding. In all thy ways acknowledge him, and he shall "
            "direct thy paths."
        ),
    },
    {
        "reference": "Jeremiah 29:11",
        "text": (
            "For I know the thoughts that I think toward you, saith the Lord, "
            "thoughts of peace, and not of evil, to give you an expected end."
        ),
    },
    {
        "reference": "Romans 8:28",
        "text": (
            "And we know that all things work together for good to them that "
            "love God, to them who are the called according to his purpose."
        ),
    },
    {
        "reference": "Psalm 46:10",
        "text": "Be still, and know that I am God.",
    },
    {
        "reference": "Isaiah 40:31",
        "text": (
            "But they that wait upon the Lord shall renew their strength; they "
            "shall mount up with wings as eagles; they shall run, and not be "
            "weary; and they shall walk, and not faint."
        ),
    },
    {
        "reference": "Matthew 11:28",
        "text": (
            "Come unto me, all ye that labour and are heavy laden, and I will "
            "give you rest."
        ),
    },
    {
        "reference": "Joshua 1:9",
        "text": (
            "Have not I commanded thee? Be strong and of a good courage; be "
            "not afraid, neither be thou dismayed: for the Lord thy God is "
            "with thee whithersoever thou goest."
        ),
    },
    {
        "reference": "Psalm 119:105",
        "text": "Thy word is a lamp unto my feet, and a light unto my path.",
    },
    {
        "reference": "1 Corinthians 13:13",
        "text": (
            "And now abideth faith, hope, charity, these three; but the greatest "
            "of these is charity."
        ),
    },
    {
        "reference": "Romans 12:12",
        "text": "Rejoicing in hope; patient in tribulation; continuing instant in prayer.",
    },
    {
        "reference": "Psalm 34:8",
        "text": (
            "O taste and see that the Lord is good: blessed is the man that "
            "trusteth in him."
        ),
    },
    {
        "reference": "Galatians 5:22-23",
        "text": (
            "But the fruit of the Spirit is love, joy, peace, longsuffering, "
            "gentleness, goodness, faith, meekness, temperance: against such "
            "there is no law."
        ),
    },
    {
        "reference": "Matthew 5:16",
        "text": (
            "Let your light so shine before men, that they may see your good "
            "works, and glorify your Father which is in heaven."
        ),
    },
    {
        "reference": "Hebrews 11:1",
        "text": (
            "Now faith is the substance of things hoped for, the evidence of "
            "things not seen."
        ),
    },
    {
        "reference": "Psalm 37:4",
        "text": (
            "Delight thyself also in the Lord; and he shall give thee the "
            "desires of thine heart."
        ),
    },
    {
        "reference": "Colossians 3:23",
        "text": (
            "And whatsoever ye do, do it heartily, as to the Lord, and not "
            "unto men."
        ),
    },
    {
        "reference": "Numbers 6:24-26",
        "text": (
            "The Lord bless thee, and keep thee: The Lord make his face shine "
            "upon thee, and be gracious unto thee: The Lord lift up his "
            "countenance upon thee, and give thee peace."
        ),
    },
]


def display_verse(verse: dict[str, str]) -> None:
    card_width = min(max(shutil.get_terminal_size().columns - 4, 40), 76)
    inside_width = card_width - 4
    wrapped_lines = textwrap.wrap(f'“{verse["text"]}”', width=inside_width)

    border_color = Fore.CYAN
    text_color = Fore.WHITE
    reference_color = Fore.YELLOW + Style.BRIGHT

    print()
    print(border_color + "╔" + "═" * (card_width - 2) + "╗")
    print("║" + Style.BRIGHT + " DAILY VERSE ".center(card_width - 2) + Style.NORMAL + "║")
    print("╠" + "═" * (card_width - 2) + "╣")

    for line in wrapped_lines:
        print(border_color + "║  " + text_color + line.ljust(inside_width) + border_color + "  ║")

    print("║" + " " * (card_width - 2) + "║")
    reference = f"— {verse['reference']}"
    print(
        border_color
        + "║  "
        + reference_color
        + reference.rjust(inside_width)
        + border_color
        + "  ║"
    )
    print("╚" + "═" * (card_width - 2) + "╝" + Style.RESET_ALL)
    print()


def main() -> None:
    """Choose a random verse and display it."""

    # autoreset prevents colors from spilling into later terminal output.
    init(autoreset=True)
    verse = random.choice(VERSES)
    display_verse(verse)


if __name__ == "__main__":
    main()
