# Contributing

This repository is a growing collection of Christian projects and public
ministry content.

## Adding a project

Place each project in its own directory under `projects/`. Every project should
include a `README.md` that explains:

- what the project does;
- how to install and run it;
- which Bible translation or other content sources it uses;
- any licenses or attribution required by those sources.

Then add the project to the table in the root `README.md`.

## Security and privacy

- Never commit credentials, tokens, private keys, personal data, or populated
  `.env` files.
- Use environment variables for configuration that differs between machines.
- Review staged changes and Git history for sensitive data before pushing.
- Report vulnerabilities privately according to `SECURITY.md`, not through a
  public issue.

## Naming

- Use lowercase, hyphen-separated directory names.
- Give media files descriptive names when practical, such as
  `2026-07-12-john-3-16.jpg`.
- Prefer ISO dates (`YYYY-MM-DD`) so content sorts chronologically.

## Scripture and media rights

Record the Bible translation used by each project. Not every translation is
public domain. Also confirm that photos, music, fonts, and other media can be
redistributed in a public repository, and add attribution where required.
