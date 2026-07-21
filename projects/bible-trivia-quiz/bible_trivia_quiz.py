"""A multiple-choice Bible trivia game for the terminal."""

import random


QUESTIONS = [
    {
        "question": "Who built the ark before the great flood?",
        "options": ["Moses", "Noah", "Abraham", "Elijah"],
        "answer": "b",
    },
    {
        "question": "How many days and nights did it rain during the flood?",
        "options": ["7", "12", "40", "100"],
        "answer": "c",
    },
    {
        "question": "Who was swallowed by a great fish?",
        "options": ["Jonah", "Peter", "Job", "Samson"],
        "answer": "a",
    },
    {
        "question": "Which shepherd boy defeated the giant Goliath?",
        "options": ["Saul", "Solomon", "Joseph", "David"],
        "answer": "d",
    },
    {
        "question": "Who led the Israelites out of slavery in Egypt?",
        "options": ["Joshua", "Moses", "Aaron", "Jacob"],
        "answer": "b",
    },
    {
        "question": "In which town was Jesus born?",
        "options": ["Nazareth", "Jerusalem", "Bethlehem", "Capernaum"],
        "answer": "c",
    },
    {
        "question": "How many disciples did Jesus choose?",
        "options": ["7", "10", "12", "14"],
        "answer": "c",
    },
    {
        "question": "Which disciple denied knowing Jesus three times?",
        "options": ["Peter", "John", "Thomas", "Andrew"],
        "answer": "a",
    },
    {
        "question": "What is the first book of the Bible?",
        "options": ["Exodus", "Genesis", "Psalms", "Matthew"],
        "answer": "b",
    },
    {
        "question": "Who was thrown into the lions' den for praying to God?",
        "options": ["Daniel", "Jeremiah", "Isaiah", "Ezekiel"],
        "answer": "a",
    },
    {
        "question": "What food did Jesus use to feed the five thousand?",
        "options": [
            "Bread and wine",
            "Five loaves and two fish",
            "Manna from heaven",
            "Figs and honey",
        ],
        "answer": "b",
    },
    {
        "question": "Which disciple betrayed Jesus for thirty pieces of silver?",
        "options": ["Judas Iscariot", "Matthew", "Philip", "James"],
        "answer": "a",
    },
    {
        "question": "What is the shortest verse in the Bible?",
        "options": [
            "God is love.",
            "Jesus wept.",
            "Pray continually.",
            "Rejoice always.",
        ],
        "answer": "b",
    },
    {
        "question": "On the road to which city was Paul converted?",
        "options": ["Rome", "Corinth", "Damascus", "Ephesus"],
        "answer": "c",
    },
    {
        "question": "Who was the first man God created?",
        "options": ["Abel", "Seth", "Cain", "Adam"],
        "answer": "d",
    },
]

LETTERS = ["a", "b", "c", "d"]


def ask_question(number, item):
    """Ask one question and return True if the answer was correct."""
    print(f"\nQuestion {number} of {len(QUESTIONS)}")
    print(item["question"])

    for letter, option in zip(LETTERS, item["options"]):
        print(f"  {letter}) {option}")

    while True:
        answer = input("Your answer: ").strip().lower()
        if answer in LETTERS:
            break
        print("Please answer with a, b, c, or d.")

    if answer == item["answer"]:
        print("Correct!")
        return True

    correct_index = LETTERS.index(item["answer"])
    correct_option = item["options"][correct_index]
    print(f"Not quite. The answer was {item['answer']}) {correct_option}.")
    return False


def show_final_score(score):
    """Print the final score with a short closing message."""
    total = len(QUESTIONS)
    print(f"\nYou got {score} out of {total} questions right.")

    if score == total:
        print("Perfect score! You really know your Bible.")
    elif score >= 12:
        print("Great job! Just a few slipped past you.")
    elif score >= 8:
        print("Not bad at all. A little more reading and you'll ace it.")
    else:
        print("Good try! Every question you missed is a story worth reading.")


def main():
    print("Welcome to the Bible Trivia Quiz!")
    print(f"There are {len(QUESTIONS)} questions. Answer with a, b, c, or d.")
    input("Press Enter when you are ready to start...")

    questions = QUESTIONS.copy()
    random.shuffle(questions)

    score = 0
    for number, item in enumerate(questions, start=1):
        if ask_question(number, item):
            score += 1

    show_final_score(score)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nThanks for playing!")
 