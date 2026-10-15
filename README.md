# Kanban

A simple kanban board app for organizing tasks into columns like To Do, In Progress, and Done.

## Quick Start

Download and run the Windows installer from [GitHub Releases](https://github.com/nightmarius/kanban/releases).

## Markdown Board Export

The app saves boards as markdown files in the following format:

```markdown
# To Do

- [x] This task is done
- [ ] This is not

# Tomorrow

- [ ] This will be done later

# Whenever

- [ ] Might never do
- [ ] Oh well
```

You can also import files with this format.

## Run it in Browser

With node.js and npm

```
npm start
```

or bun

```
bun start
```

## Build the binary yourself

With node.js and npm

```
npm run dist
```

or bun

```
bun run dist
```
