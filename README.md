# Electron Dashboard Application

A desktop dashboard application built with [Electron](https://www.electronjs.org/), using web technologies such as HTML, CSS, and JavaScript.

## Features

- Electron desktop app shell with context isolation enabled
- Bootstrap-based UI styling
- D3.js integration for data visualization
- PouchDB for local credential validation
- Electron Builder configuration for packaging

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm

### Installation

```bash
npm install
```

### Run the App

```bash
npm run electron:serve
```

### Build the App

```bash
npm run electron:build
```

### Run Tests

The Playwright/Electron test suite requires valid sign-in credentials via environment variables:

```bash
TEST_USERNAME=user@example.com TEST_PASSWORD=secret npm test
```

> Never commit real credentials to the repository. The test suite validates that `TEST_USERNAME` and `TEST_PASSWORD` are set before running.

## Project Structure

```
.
├── docs/                  # Documentation and task plans
├── src/
│   ├── assets/            # Static assets (images, icons, etc.)
│   ├── css/               # Application styles
│   ├── js/                # Main, preload, and renderer scripts
│   │   ├── main.js        # Electron main process
│   │   ├── preload.js     # Secure bridge between main and renderer
│   │   └── router.js      # Client-side routing placeholder
│   ├── pages/             # Page templates
│   └── index.html         # Application entry point
├── package.json           # Dependencies and scripts
└── README.md              # Project overview
```

## Scripts

| Script           | Description                          |
|------------------|--------------------------------------|
| `electron:serve` | Launches the Electron app            |
| `electron:build` | Packages the app with electron-builder |
| `test`           | Runs the Playwright/Electron test suite |

## Tech Stack

- [Electron](https://www.electronjs.org/)
- [Bootstrap 4](https://getbootstrap.com/docs/4.6/)
- [D3.js](https://d3js.org/)
- [PouchDB](https://pouchdb.com/)

## License

ISC
