# Markdown Notebook System

This repository contains scripts for setting up an automatically compiling markdown system.
By default, the `/Users/dev/docs/notes/` directory is watched for changes.

Every newly created or changed file will automatically be compiled into a pdf and html version using [md-to-pdf](https://github.com/simonhaenisch/md-to-pdf).

## TODO

- [ ] define how searching works (by file content + tags)
- [ ] define tagging system: first line after front matter
- [ ] create file templates:
  - yaml front matter (date + location)
  - line with tags
  - participants (in italics)
  - regular content
- [ ] delete compiled files if original is deleted / moved
