# Pegasus Appointments

Pegasus Appointments is a small desktop app built to replace the overly bureaucratic appointment system I’m required to use at work.

The goal is simple: **make something cleaner, faster, and nicer to use** — remove complexity.

> This is primarily a personal project, although it may be useful to someone else out there.

## ⭐ Features

- Simple and clean UI
- No unnecessary steps or bureaucracy
- Local-first data storage
- Fast, offline desktop experience

## 🛠️ Tech Stack

- **TypeScript** — type safety
- **Vite** — build tooling
- **Tauri** — desktop app framework
- **React** — UI
- **Tailwind CSS** — styling
- **SQLite** — local database

## ⚠️ Project Status

- **Status:** Work in Progress (WIP)
- **Audience:** I'm the audience c:

This project also exists as:

- A test ground for some desktop app ideas
- A hands-on way to learn more about Tauri

## 📦 Data Storage

All data is stored locally using SQLite.
No cloud, no sync — just the app and your data.

## 💻 Development

### Prerequisites

First install **Tauri**, **Rust**, and any related system configuration required by Tauri for your operating system.

- [Rust + Tauri configuration](https://tauri.app/start/prerequisites/)

This project specifically uses **pnpm**, if you want to use a different package manager, make sure to modify the scripts in **package.json**.

---

### Setup

Navigate into the project directory and install dependencies:

```bash
pnpm install
```

### Run in development mode

```bash
pnpm tauri:dev
```

### Build project

```bash
pnpm tauri:build
```

### Build output

- Development builds: `/src-tauri/target/debug`
- Release builds: `/src-tauri/target/release`
