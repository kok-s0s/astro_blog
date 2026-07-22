---
title: 'Notes on Recent iOS App Projects'
description: 'A stage review of several recent Apple mobile app projects on GitHub: from life fragments and daily item cost tracking to Japanese vocabulary learning.'
---

> This time I am not reviewing one isolated feature. Instead, I looked at several recent Apple mobile app projects on my GitHub together. None of them is a "large project", but they show some of the tradeoffs I have been making while moving from desktop applications, toolchains, and C++/Qt experience toward native iOS app development.

The three repositories I mainly looked at are:

- [Suipian](https://github.com/kok-s0s/Suipian): an iOS diary app for recording fragments of life
- [Daywise](https://github.com/kok-s0s/Daywise): an app for tracking the average daily cost of items
- [KotobaNyan](https://github.com/kok-s0s/KotobaNyan): an early prototype for learning Japanese vocabulary

From recent commits, `Suipian` and `Daywise` are the two most active projects. `Suipian` had a series of commits between 2026-06-08 and 2026-06-15 around the fragment feed, tab statistics, toolbars, storylines, and media handling. `Daywise` had a 2026-06-15 commit focused on cost tracking and amount handling. `KotobaNyan` is more like a learning app whose foundation is already in place while the feature route is still being planned.

## A Shared Direction: Close the Local Loop First

One thing these projects clearly share is that they do not start by rushing into servers, account systems, or cloud sync. Instead, they first try to make the core loop of a mobile app work locally.

`SwiftUI` expresses the interface. `SwiftData` or a local database stores the data. System frameworks provide access to mobile capabilities. This route fits personal projects well: I do not have to lay out a large architecture at the beginning, and I can first verify whether an idea holds up in daily use.

The advantage is a short feedback cycle. Whether an idea works is not first judged by whether the server-side model is elegant. It is judged by whether I can open the app and complete one record, one search, one filter, or one review within ten seconds.

## Suipian: Turning "Recording" into a Feed

`Suipian` is the most feature-rich of the three. It is an iOS diary app for recording fragments of life. Its stack is `SwiftUI + SwiftData`, and its target system is iOS 17+.

It is not a traditional diary with only a title, body, and date. It treats a "fragment" as the core data unit. A fragment can contain text, images, video, audio, mood, location, tags, storyline membership, currently playing music metadata, and it can also be marked private or pinned.

This design makes it feel more like a personal life database than a simple Markdown diary. The same record can be rediscovered from different angles:

- From time: today entry, history on this day, and random review
- From space: location map and place aggregation
- From narrative: storylines and timelines
- From statistics: heatmaps, mood trends, and tag distribution

This direction is interesting because the problem is not "Can I write a piece of text?" The problem is "Can I meet this part of my life again later?" So `MapKit`, `WidgetKit`, `Core Spotlight`, `LocalAuthentication`, and `UserNotifications` are not decorations. They embed the act of recording into the daily usage patterns of iOS.

Recent commits repeatedly mention toolbar work, tab indicators, fragment feed filter state, storylines, and media handling. That also shows the project has moved past simply stacking features. It is now about making the entry points and browsing experience smoother.

## Daywise: Adding a Time Dimension to Spending

`Daywise` has a smaller target, but its concept is sharp: record an item's purchase price and service time, then calculate how much it actually costs per day.

It does not ask only whether something was expensive at purchase time. It asks whether the item still feels worth it after the cost is spread across time. This is very suitable for a mobile app, because the recording scenario is naturally fragmented: buy something, record it; use it for a while, then check how the daily cost changes.

The core formula in the project README is simple:

```text
daily cost = purchase price / days in service
```

If an item is sold, the resale value is deducted to calculate net cost. Around this model, the app supports item management, categories, custom categories, in-service / retired / sold states, search and filtering, sorting, statistical dashboards, and CSV export.

The engineering structure is also clear: a lightweight MVVM style with `View + @Model + Service`, and no third-party dependencies. For this kind of personal efficiency tool, that is a stable choice. The codebase does not become heavier just because it tries to look like a large project.

From the recent commit `Improve cost tracking and amount handling`, the key of this project is not UI tricks. It is amount handling, cost calculation, and state transitions. In other words, what needs the most polishing is "calculate correctly, classify clearly, export reliably", and only after that come visuals and animation.

## KotobaNyan: Growing from a Vocabulary Tool into a Learning System

`KotobaNyan` is currently more like the foundation of a learning app. The completed parts include database design and initialization, vocabulary input and display, search, category browsing, pronunciation, and basic UI.

Its future direction is relatively clear: add N1/N2 vocabulary, grouping, learning progress, favorites, spaced repetition, quizzes, dictation, and possibly `CoreML + Vision` image recognition to map English labels to Japanese meanings.

This type of app can easily fall into a trap. Vocabulary, quizzes, review, pronunciation, and image recognition can all expand further, and the result can become a learning platform that is never finished. So I think the next stage should first shrink into a clear loop:

1. Browse words by topic or JLPT level
2. Favorite words and mark mastery status
3. Review a small group every day
4. Create feedback through pronunciation and simple quizzes

It will be easier to make something people can use for a long time if the app first completes the act of "remembering one word", and only then considers more complex ideas such as image recognition or lines from movies and TV.

## Differences Between the Three Projects

When I put these apps together, the differences are quite clear.

`Suipian` is the thickest in terms of features, and its focus is information organization. The same set of life records should be reachable again through time, location, storylines, tags, statistics, and system search.

`Daywise` is the most restrained in its model. It focuses on calculation: one item, one period of time, one price, and finally one "daily cost" number. As long as that metric is clear enough, the app has a reason to exist.

`KotobaNyan` has the most open-ended route. Its focus is the learning loop. The vocabulary database is only the beginning. The value will be decided by the review mechanism, learning progress, and feedback method.

They correspond well to three common types of personal apps:

- Recording app: accumulates data over time, and its value comes from long-term review
- Tool app: centers on one formula or process, and its value comes from quick decisions
- Learning app: centers on repeated training, and its value comes from continuous feedback

## Thoughts on Technical Choices

All three projects target iOS 17+, which means they can naturally use `SwiftData` and newer `SwiftUI` patterns. For personal projects, this has a benefit: there is less historical baggage, and I can design directly around current system capabilities.

But mobile software is different from desktop tools. Desktop tools often benefit from having many complete entry points. Mobile apps care more about whether the main path is short. For example:

- The key for `Suipian` is not how many media types it supports, but whether the recording entry is fast enough
- The key for `Daywise` is not how many charts it has, but whether adding an item and checking daily cost feels smooth
- The key for `KotobaNyan` is not how large the roadmap is, but whether a user can complete one round of learning after opening it each day

That is also why `Suipian` recently spent time polishing the toolbar and tab state. Phone screens are small. Once the entry points become messy, more features start to feel like more burden.

## What to Polish Next

If I continue developing them, I think there are three separate lines.

For `Suipian`, the priority is to keep polishing the experience of revisiting information. Recording is already rich. The next valuable step is to make it easier for users to rediscover old content: better search result ranking, more natural storyline generation, and lighter yearly or monthly reviews.

For `Daywise`, the priority is to make amount and state logic reliable. Different currencies, refunds, gifts, partial resale, and depreciation intervals are all edge cases. Once those are handled clearly, it can grow from a small tool into a trustworthy personal spending ledger.

For `KotobaNyan`, the priority is to build the smallest learning loop. Do not spread every idea out too early. First let vocabulary, mastery status, daily review, and pronunciation feedback form a rhythm that can be used continuously.

## Summary

Looking at these iOS projects together, the clearest change is that the development focus is moving from "making a technical point work" toward "making a daily scenario work on a phone."

`Suipian` handles life memories. `Daywise` handles spending judgment. `KotobaNyan` handles learning feedback. None of them necessarily needs a large backend or a complex architecture. What matters more is continuously polishing a small problem until it becomes smooth enough.

That is also the most charming part of personal projects: they do not have to begin as something huge. They can start from a small entry point that I would actually use, then gradually grow into their own shape.
