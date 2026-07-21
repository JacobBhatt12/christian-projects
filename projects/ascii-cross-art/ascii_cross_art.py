"""ASCII Cross Art - prints a cross to the terminal with an encouraging verse."""

import random

CROSS = r"""
                     /=\
                    /===\
                  {==-+-==}
                   \=====/
                   ]==+==[
                .===========.
                |*         *|
                '==========='
                   ]==+==[
                   ]=-+-=[
 _                 ]==+==[                 _
| \________________]==+==[________________/ |
|+=================[{(@)}]=================+|
| /~~~~~~~~~~~~~~~~]==+==[~~~~~~~~~~~~~~~~\ |
 ~                 ]==+==[                 ~
                   ]==+==[
                   ]<=+=>[
                   ]==+==[
                   ]={@}=[
                   ]==+==[
                   ]=-+-=[
                   ]==+==[
                 _/=======\_
               [=============]
              /===============\
         .-=-=-=-=-=-=-=-=-=-=-=-=-.
         | +                     + |
         '-=-=-=-=-=-=-=-=-=-=-=-=-'
      [=====+                   +=====]
    .:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.
"""

VERSES = [
    ("Be strong and of a good courage; be not afraid, neither be thou "
     "dismayed: for the LORD thy God is with thee whithersoever thou goest.",
     "Joshua 1:9"),
    ("The LORD is my shepherd; I shall not want.",
     "Psalm 23:1"),
    ("I can do all things through Christ which strengtheneth me.",
     "Philippians 4:13"),
    ("Trust in the LORD with all thine heart; and lean not unto thine own "
     "understanding.",
     "Proverbs 3:5"),
    ("For God so loved the world, that he gave his only begotten Son, that "
     "whosoever believeth in him should not perish, but have everlasting life.",
     "John 3:16"),
    ("But they that wait upon the LORD shall renew their strength; they "
     "shall mount up with wings as eagles.",
     "Isaiah 40:31"),
    ("Come unto me, all ye that labour and are heavy laden, and I will give "
     "you rest.",
     "Matthew 11:28"),
    ("And we know that all things work together for good to them that love "
     "God.",
     "Romans 8:28"),
    ("The LORD is my light and my salvation; whom shall I fear?",
     "Psalm 27:1"),
    ("Casting all your care upon him; for he careth for you.",
     "1 Peter 5:7"),
]


def wrap_text(text, width):
    """Wrap text to the given width, returning a list of lines."""
    words = text.split()
    lines = []
    current = ""
    for word in words:
        if current and len(current) + 1 + len(word) > width:
            lines.append(current)
            current = word
        else:
            current = f"{current} {word}" if current else word
    if current:
        lines.append(current)
    return lines


def print_verse(width=45): 
    """Pick a random verse and print it centered under the cross. """
    text, reference = random.choice(VERSES)
    print()
    for line in wrap_text(f'"{text}"', width):
        print(line.center(width))
    print()
    print(f"- {reference}".center(width))
    print()

def main(): 
    print(CROSS)
    print_verse()


if __name__ == "__main__":
    main()