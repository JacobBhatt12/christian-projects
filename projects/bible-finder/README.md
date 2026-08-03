# Bible Finder

Bible Finder is a polished, terminal-only Python application for finding English Standard Version Bible verses related to any word or phrase. It supports direct keyword matches, exact phrases, and broader suggested-topic searches while keeping Scripture at the center of a quiet, readable interface.

It searches the complete ESV through Crossway's official [ESV passage-search API](https://api.esv.org/docs/passage-search/). The copyrighted ESV text is deliberately **not bundled, cached, or written to disk**. Verse text exists only in memory for the current search and comes directly from the API.

## Requirements

- Python 3.10 or newer
- Internet access
- A free ESV API key for eligible non-commercial use
- No third-party Python packages

## Configure the ESV API key

1. Sign in to ESV.org (or create an account) and [create an ESV API application](https://api.esv.org/account/create-application/).
2. Review and follow the [ESV API conditions of use](https://api.esv.org/).
3. Set the returned key in the terminal session where you will run Bible Finder:

```bash
export ESV_API_KEY="your-key-here"
python3 bible_finder.py
```

Never put the key in `bible_finder.py`, commit it, or share it. Bible Finder reads `ESV_API_KEY` at runtime and never prints or saves it. The included `.gitignore` also excludes `.env` files, though the application does not require or read one.

## Run Bible Finder

From this project directory, start the interactive experience:

```bash
python3 bible_finder.py
```

Or perform one search directly:

```bash
python3 bible_finder.py love
python3 bible_finder.py --topic anxiety
python3 bible_finder.py --exact "steadfast love"
python3 bible_finder.py --all peace
python3 bible_finder.py --no-color courage
```

Without `--all`, results are presented ten at a time. Press Enter for the next ten, `a` for all remaining permitted verses, or `q` to return to the prompt. ANSI colors turn off automatically when output is not a compatible terminal; `--no-color` and the standard `NO_COLOR` environment variable disable them explicitly.

## Interactive commands

| Command | Purpose |
| --- | --- |
| `:help` | Show instructions and result navigation |
| `:topic <subject>` | Search a curated set of related terms, merge results, and remove duplicate references |
| `:exact <phrase>` | Ask the ESV API for that exact quoted phrase |
| `:history` | Show searches from this process only; history is never saved |
| `:clear` | Clear the terminal |
| `:about` | Explain Bible Finder, its source, and topic-search boundaries |
| `:quit` | Exit safely |

A plain entry such as `love` performs a keyword search. An unrecognized topic gracefully falls back to a normal keyword search.

Topic mode includes related-term maps for love, peace, anxiety, fear, depression and sorrow, forgiveness, faith, hope, grace, salvation, prayer, wisdom, strength, courage, loneliness, grief, healing, temptation, sin, justice, marriage, friendship, money, work, humility, purpose, joy, patience, and kindness. Bible Finder always tells you which terms it used. These are human-curated study suggestions: they are not exhaustive, a substitute for reading passages in context, or divinely authoritative. Keyword and exact-phrase results are clearly distinguished from these broader associations.

## ESV attribution and licensing

Every result:

- is marked `ESV`;
- displays the complete verse text supplied by the search API without silent shortening;
- provides an encoded link to that passage on [ESV.org](https://www.esv.org/); and
- is accompanied on each displayed result page by the standard ESV copyright notice.

Bible Finder requests the API maximum of 100 search results per page and retrieves every page allowed by the license. It spaces requests to remain within the published 60-requests-per-minute rate limit. It will never retrieve or display more than 500 verses for one API query, and its merged display never shows more than 500 verses or more than half of a Bible book, with Crossway's stated single- and double-chapter exceptions. If more matches exist, the terminal says that additional results cannot be displayed under those limits. Topic searches deduplicate verses by Bible reference before display.

Scripture quotations marked “ESV” are from the ESV® Bible (The Holy Bible, English Standard Version®), © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved. The ESV text may not be quoted in any publication made available to the public by a Creative Commons license. The ESV may not be translated into any other language.

Users may not copy or download more than 500 verses of the ESV Bible or more than one half of any book of the ESV Bible.

See the current [ESV API terms and limits](https://api.esv.org/) before redistributing or adapting this project. The API is intended for eligible non-commercial use.

## Tests

The tests use mocked HTTP responses, so they need neither an API key nor internet access:

```bash
python3 -m unittest discover -s tests -v
```

They cover API pagination and its licensing cap, topic expansion, reference deduplication, exact-phrase syntax, encoded ESV.org links, missing keys, empty results, half-book limits, complete terminal output, and friendly API/network errors.
