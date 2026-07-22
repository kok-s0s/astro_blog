export type EnPostMeta = {
  title: string
  description: string
  points: string[]
}

export const enPostMeta: Record<string, EnPostMeta> = {
  apple_apps_summary: {
    title: 'Notes on Recent iOS App Projects',
    description:
      'A stage review of several recent Apple mobile app projects on GitHub: from life fragments and daily item cost tracking to Japanese vocabulary learning.',
    points: [
      'The projects focus on local-first iOS application loops before adding accounts, servers, or cloud synchronization.',
      'Suipian explores life-fragment recording with SwiftUI, SwiftData, media, location, tags, stories, and review workflows.',
      'Daywise adds a time dimension to purchases by tracking daily cost over the lifetime of an item.',
      'KotobaNyan is becoming a vocabulary learning system, but should first close a small loop around browsing, marking, review, and simple quizzes.',
    ],
  },
  astro: {
    title: 'Building This Blog with Astro',
    description:
      'Notes on using Astro as a Markdown-friendly static site generator with modular construction, custom CSS, and a workflow that fits personal technical writing.',
    points: [
      'Astro works well for a personal blog because Markdown content and hand-written CSS can coexist without heavy framework overhead.',
      'The project structure encourages small components, layouts, and static routes, which makes the site easier to evolve.',
      'The blog also records practical issues encountered while building and deploying a static site.',
    ],
  },
  chatgpt: {
    title: 'Notes on Using ChatGPT',
    description: 'Personal notes after using ChatGPT for a period of time.',
    points: [
      'AI tools are useful when treated as assistants for thinking, searching, drafting, and coding rather than as final decision makers.',
      'The important part is still defining the problem clearly and reviewing the output critically.',
      'Good prompts and good engineering judgment reinforce each other.',
    ],
  },
  code_review: {
    title: 'Code Review Is a Technical Skill',
    description:
      'Notes on practical code review habits from the perspective of a developer approaching three years of professional experience.',
    points: [
      'Strict self-review during development is cheaper than finding defects after the product reaches users.',
      'Code review should focus on behavior, readability, maintainability, testability, and risks around edge cases.',
      'Formatting and review discipline are among the highest-value practices in team development.',
    ],
  },
  crash_investigation_record: {
    title: 'Software Crash Investigation Notes',
    description: 'A record of recent crash investigation work and the debugging pressure around it.',
    points: [
      'Crash investigation requires reproducible clues, careful log reading, and a habit of narrowing the failure surface.',
      'The article records the practical process rather than presenting crashes as abstract theory.',
      'The main value is building a repeatable way to reason about product failures.',
    ],
  },
  cxx_crud_file: {
    title: 'A C++ Wheel-Building Experience',
    description:
      'A record of a self-led C++ project after returning to C++ development: replacing selected Qt-dependent file utilities and reflecting on testing, scope, and tooling.',
    points: [
      'Avoid building new wheels in C++ unless the project constraints really require it.',
      'When building infrastructure code, unit tests are not optional decoration.',
      'AI tools can help improve implementation details, but the design scope still needs human judgment.',
    ],
  },
  cxx_thread: {
    title: 'Building a C++ Thread Base Class',
    description:
      'A project created to replace Qt QThread in selected scenarios with a modern C++ thread abstraction and a signal-slot-like usage style.',
    points: [
      'The thread base class is designed around synchronization, asynchronous work, and timer-like worker behavior.',
      'The goal is not to replace all of Qt, but to reduce unnecessary dependency in reusable logic.',
      'Modern C++ mutexes and condition variables provide the foundation for the implementation.',
    ],
  },
  modbus_rtu: {
    title: 'Practicing the Modbus RTU Industrial Communication Protocol',
    description:
      'Notes from working with an RS485 + Modbus RTU setup for business data transmission and processing.',
    points: [
      'Industrial communication protocols have practical constraints that differ from general networking coursework.',
      'The article records how Modbus RTU is used in an actual development scenario.',
      'The focus is on understanding the protocol enough to support product-side data exchange.',
    ],
  },
  qt_dev: {
    title: 'Qt Development Notes',
    description: 'A collection of Qt development notes from projects and conversations with AI assistants.',
    points: [
      'The article collects practical Qt snippets and solutions encountered during desktop application work.',
      'Topics include Windows touch keyboard behavior, GUI details, and implementation notes.',
      'It is a growing reference rather than a single polished essay.',
    ],
  },
  replace_the_macro: {
    title: 'Replacing #pragma once with #ifndef',
    description: 'A small Python automation task for processing many files instead of repetitive manual editing.',
    points: [
      'When the same edit must be applied across many files, scripting is more reliable than manual copy and paste.',
      'The task is small, but it demonstrates the value of automation in daily development.',
      'Python is often the most direct tool for this kind of file-processing job.',
    ],
  },
  vscode_extension: {
    title: 'Developing a VS Code Extension for a Language',
    description: 'A note about building a VS Code extension with code formatting and syntax highlighting.',
    points: [
      'A language extension starts with small but useful editor features such as highlighting and formatting.',
      'The work connects editor ergonomics with language tooling.',
      'The article records the practical process of building and packaging the extension.',
    ],
  },
  weather_cli: {
    title: 'Building a Weather Query TUI Program',
    description: 'A goal-driven record of gradually building a terminal UI weather query program.',
    points: [
      'The project follows a goal-driven process: split the target into small executable steps.',
      'A TUI is a good fit for lightweight personal tools and command-line workflows.',
      'The article documents both implementation and iteration.',
    ],
  },
}

export function getEnPostSlug(url: string) {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  const clean = url.replace(/\/$/, '')
  const withoutBase =
    base && base !== '/' && (clean === base || clean.startsWith(`${base}/`))
      ? clean.slice(base.length) || '/'
      : clean
  return withoutBase.replace(/^\/posts\//, '').replace(/\/$/, '')
}

export function getEnPostUrl(url: string) {
  return `/en/posts/${getEnPostSlug(url)}`
}

export function getEnPostMeta(url: string, frontmatter: any): EnPostMeta {
  const slug = getEnPostSlug(url)
  return enPostMeta[slug] ?? {
    title: frontmatter.title,
    description:
      frontmatter.description ||
      'An English companion page for this article is available. A fuller translation can be added as this post becomes a priority.',
    points: [
      'This page keeps the English site navigable while the full translation is prepared.',
      'The original Chinese article remains the source of truth for now.',
    ],
  }
}
