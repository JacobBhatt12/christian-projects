# Example terminal session

This transcript uses `--no-color`; a normal interactive terminal includes restrained gold, blue, and green accents.

```text
$ focus start --no-color

  ✦  FOCUS CLI
     Whatever you do, do it heartily, as to the Lord.
     — Colossians 3:23

  · Purpose is a response to grace, never a way to earn God’s favor.

  › What are you building?: A clearer onboarding command
  › Who will this work serve?: New contributors
╭ Scripture for this session ──────────────────────────────────────────────╮
│  “And whatsoever ye do, do it heartily, as to the Lord, and not unto     │
│  men; Knowing that of the Lord ye shall receive the reward of the        │
│  inheritance: for ye serve the Lord Christ.”                             │
│  — Colossians 3:23–24 (KJV)                                              │
╰──────────────────────────────────────────────────────────────────────────╯
  › Start a 25-minute focus timer? (Y/n): n
  ✓ Session saved. Work faithfully, and leave the outcome with God.
  · When you finish, run `focus reflect`.

$ focus debug --no-color

╭ Debug without panic ─────────────────────────────────────────────────────╮
│  Slow down and make the problem concrete. A bug is information, not a   │
│  verdict on your ability.                                                │
│  Work through the questions honestly; Focus will save the notes        │
│  locally.                                                                │
╰──────────────────────────────────────────────────────────────────────────╯
  › What did you expect to happen?: The config command should keep blank names
  › What actually happened?: It restored the old name
  › What changed recently?: I added defaults to the prompt
  › What have you already tried?: Reproduced it with a temporary data folder
  · Now walk the trail one careful step at a time.
  › Reproduce the problem with the smallest input you can. (y/N): y
  › Read the full error and inspect the values at the failure point. (y/N): y
  › Separate what you know from what you are assuming. (y/N): y
  › Narrow the change until one cause remains. (y/N): n
  › Add or update a test before calling the fix finished. (y/N): n
  ✓ Debug notes saved locally (3/5 checks marked).

$ focus reflect --no-color

╭ Close the loop ──────────────────────────────────────────────────────────╮
│  Project: A clearer onboarding command                                   │
│  Notice what God supplied, what remains unfinished, and whom the work    │
│  served.                                                                 │
╰──────────────────────────────────────────────────────────────────────────╯
  › What did you complete?: Fixed blank-name handling and added a test
  › What did you learn?: Prompt defaults need an explicit clear value
  › Where do you still need help?: A Windows terminal check
  › How did this work serve others?: New contributors get a calmer setup
  › Is this project now complete? (y/N): y
  ✓ Session complete — 42m 18s logged.
  · Faithfulness includes rest. Your worth was never riding on this session.

$ focus stats --no-color

╭ Faithful work, at a glance ──────────────────────────────────────────────╮
│  Coding sessions              1                                          │
│  Total focus time       42m 18s                                          │
│  Coding time logged     42m 18s                                          │
│  Current streak          1 day                                           │
│  Completed projects          1                                           │
│                                                                          │
│  Last 7 days  ████░░░░░░░░░░░░░░░░░░░░░░░░  1/7                          │
╰──────────────────────────────────────────────────────────────────────────╯
╭ Recent reflections ─────────────────────────────────────────────────────╮
│  2026-08-08  A clearer onboarding command                                │
│    Finished: Fixed blank-name handling and added a test                   │
│    Learned:  Prompt defaults need an explicit clear value                 │
╰──────────────────────────────────────────────────────────────────────────╯
  · These numbers are a record, not a measure of God’s love or your worth.
```

