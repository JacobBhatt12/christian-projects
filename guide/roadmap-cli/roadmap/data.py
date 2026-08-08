from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Resource:
    name: str
    description: str
    url: str | None = None


@dataclass(frozen=True)
class Stage:
    key: str
    title: str
    tagline: str
    resources: tuple[Resource, ...]


STAGES: tuple[Stage, ...] = (
    Stage(
        key="beginner",
        title="Beginner",
        tagline="Start here if you are new to programming.",
        resources=(
            Resource(
                "freeCodeCamp",
                "Guided lessons and beginner projects.",
                "https://www.freecodecamp.org/",
            ),
            Resource(
                "CS50x",
                "Programming and computer science fundamentals.",
                "https://cs50.harvard.edu/x/",
            ),
            Resource(
                "MDN Learn",
                "HTML, CSS, and JavaScript.",
                "https://developer.mozilla.org/en-US/docs/Learn",
            ),
            Resource(
                "GitHub Skills",
                "Git and GitHub basics.",
                "https://skills.github.com/",
            ),
        ),
    ),
    Stage(
        key="intermediate",
        title="Intermediate",
        tagline="For coders who know the basics and want to build real skill.",
        resources=(
            Resource(
                "The Odin Project",
                "Full-stack development through projects.",
                "https://www.theodinproject.com/",
            ),
            Resource(
                "Exercism",
                "Practice problems in many languages.",
                "https://exercism.org/",
            ),
            Resource(
                "Full Stack Open",
                "React, Node.js, databases, testing, and APIs.",
                "https://fullstackopen.com/en/",
            ),
            Resource(
                "Go off-script",
                "Build projects without following tutorials step by step.",
            ),
        ),
    ),
    Stage(
        key="professional",
        title="Professional",
        tagline="For coders preparing for, or working in, the field.",
        resources=(
            Resource(
                "Read the docs",
                "Read official documentation for your chosen language and tools.",
            ),
            Resource(
                "Study the fundamentals",
                "Study data structures, algorithms, system design, testing, security, "
                "and performance.",
            ),
            Resource(
                "Contribute",
                "Contribute to open-source projects on GitHub.",
                "https://github.com/topics/good-first-issue",
            ),
            Resource(
                "Ship it",
                "Build and deploy complete applications used by real people.",
            ),
            Resource(
                "Review and be reviewed",
                "Review other developers’ code and request reviews of your own code.",
            ),
        ),
    ),
)

CLOSING_NOTE = "The most important step at every level is to keep building projects."