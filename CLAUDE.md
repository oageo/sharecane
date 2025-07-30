# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 重要: ユーザーからの指示
* このプロジェクトは日本語が母語の日本人によって開発されています。可能な限り日本語で回答してください。
* ただし、技術的な用語は無理に翻訳を行わずとも問題ありません。

## Project Overview

This is "sharecane" - a browser extension that allows sharing content to SNS platforms with customizable styles, extending beyond the standard browser "share" button. Built with WXT (Web Extension Toolkit) and TypeScript.

## Development Commands

### Core Development
- `npm run dev` - Start development server for Chrome
- `npm run dev:firefox` - Start development server for Firefox  
- `npm run build` - Build extension for Chrome
- `npm run build:firefox` - Build extension for Firefox
- `npm run compile` - TypeScript type checking (no emit)
- `npm run zip` - Create distributable zip for Chrome
- `npm run zip:firefox` - Create distributable zip for Firefox

### Setup
- `npm run postinstall` - Prepare WXT environment (runs automatically after npm install)

## Architecture

### WXT Framework Structure
This project uses WXT, a modern web extension framework that provides:
- TypeScript support with automatic configuration
- Multi-browser compatibility (Chrome/Firefox)
- Hot module reloading in development
- Automatic manifest generation

### Entry Points
- `entrypoints/background.ts` - Service worker/background script
- `entrypoints/content.ts` - Content script (currently matches Google domains)
- `entrypoints/popup/` - Extension popup UI with HTML, TypeScript, and CSS

### Components
- `components/counter.ts` - Reusable UI components (currently contains demo counter)

### Configuration
- `wxt.config.ts` - WXT framework configuration (currently using defaults)
- `tsconfig.json` - Extends WXT's TypeScript configuration
- TypeScript path mapping: `@/` maps to project root

### Browser Compatibility
The extension is configured to support both Chrome and Firefox with separate build commands and development modes.