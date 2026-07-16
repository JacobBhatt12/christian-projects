#!/usr/bin/env python3
"""Read a psalm one verse at a time in the terminal."""

import time


# Scripture text from the King James Version (public domain).
PSALMS = {
    23: [
        "The LORD is my shepherd; I shall not want.",
        "He maketh me to lie down in green pastures: he leadeth me beside "
        "the still waters.",
        "He restoreth my soul: he leadeth me in the paths of righteousness "
        "for his name's sake.",
        "Yea, though I walk through the valley of the shadow of death, I "
        "will fear no evil: for thou art with me; thy rod and thy staff "
        "they comfort me.",
        "Thou preparest a table before me in the presence of mine enemies: "
        "thou anointest my head with oil; my cup runneth over.",
        "Surely goodness and mercy shall follow me all the days of my life: "
        "and I will dwell in the house of the LORD for ever.",
    ],
    91: [
        "He that dwelleth in the secret place of the most High shall abide "
        "under the shadow of the Almighty.",
        "I will say of the LORD, He is my refuge and my fortress: my God; "
        "in him will I trust.",
        "Surely he shall deliver thee from the snare of the fowler, and "
        "from the noisome pestilence.",
        "He shall cover thee with his feathers, and under his wings shalt "
        "thou trust: his truth shall be thy shield and buckler.",
        "Thou shalt not be afraid for the terror by night; nor for the "
        "arrow that flieth by day;",
        "Nor for the pestilence that walketh in darkness; nor for the "
        "destruction that wasteth at noonday.",
        "A thousand shall fall at thy side, and ten thousand at thy right "
        "hand; but it shall not come nigh thee.",
        "Only with thine eyes shalt thou behold and see the reward of the "
        "wicked.",
        "Because thou hast made the LORD, which is my refuge, even the most "
        "High, thy habitation;",
        "There shall no evil befall thee, neither shall any plague come "
        "nigh thy dwelling.",
        "For he shall give his angels charge over thee, to keep thee in all "
        "thy ways.",
        "They shall bear thee up in their hands, lest thou dash thy foot "
        "against a stone.",
        "Thou shalt tread upon the lion and adder: the young lion and the "
        "dragon shalt thou trample under feet.",
        "Because he hath set his love upon me, therefore will I deliver "
        "him: I will set him on high, because he hath known my name.",
        "He shall call upon me, and I will answer him: I will be with him "
        "in trouble; I will deliver him, and honour him.",
        "With long life will I satisfy him, and shew him my salvation.",
    ],
    100: [
        "Make a joyful noise unto the LORD, all ye lands.",
        "Serve the LORD with gladness: come before his presence with "
        "singing.",
        "Know ye that the LORD he is God: it is he that hath made us, and "
        "not we ourselves; we are his people, and the sheep of his pasture.",
        "Enter into his gates with thanksgiving, and into his courts with "
        "praise: be thankful unto him, and bless his name.",
        "For the LORD is good; his mercy is everlasting; and his truth "
        "endureth to all generations.",
    ],
}

VERSE_PAUSE = 1.5


def choose_psalm():
    """Ask until the reader chooses one of the available psalms."""
    while True:
        choice = input("Choose a psalm (23, 91, or 100): ").strip()
        try:
            number = int(choice)
        except ValueError:
            number = 0

        if number in PSALMS:
            return number

        print("Please enter 23, 91, or 100.\n")


def read_psalm(number):
    """Print the selected psalm with a short pause after each verse."""
    verses = PSALMS[number]
    print(f"\nPsalm {number} (KJV)\n")

    for verse_number, verse in enumerate(verses, start=1):
        print(f"{verse_number}. {verse}", flush=True)
        if verse_number < len(verses):
            time.sleep(VERSE_PAUSE)

    print("\nAmen.")


def main():
    print("=" * 34)
    print("          Psalm Reader")
    print("=" * 34)
    print("Read slowly. Let the words flow.\n")

    try:
        number = choose_psalm()
        read_psalm(number)
    except (KeyboardInterrupt, EOFError):
        print("\n\nReader closed.")


if __name__ == "__main__":
    main()
