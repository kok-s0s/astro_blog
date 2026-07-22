---
title: 'Principles'
description: 'Reading notes from Clean C++: KISS, YAGNI, DRY, information hiding, cohesion, coupling, and related principles.'
---

> I advise students to spend more energy learning fundamental ideas rather than new technologies, because new technologies may become outdated before they graduate, while fundamental ideas never become outdated. --- David L. Parnas

Not only in software development, making everything in life as simple as possible is not necessarily a bad thing.

**Collective Code Ownership**

## What Is a Principle?

A principle is a rule, belief, or idea that guides you. Principles are usually directly connected to values or a value system.

Principles are not unchangeable laws, and they are not carved into stone. Sometimes in programming it is necessary to deliberately break some of them. If you have a sufficient reason to break a principle, you may do so, but be careful. The result may be unexpected.

## Keep It Simple and Straightforward (KISS)

> Everything should be made as simple as possible, but not simpler. --- Albert Einstein

KISS stands for "Keep it simple, stupid" or "Keep it simple and stupid".

In extreme programming, or XP, this principle has a more practical name: "Do the simplest thing that could possibly work" - DTSTTCPW.

The KISS principle treats simplicity as a main goal in software development and avoids unnecessary complexity.

> For programmers, focusing on simplicity may be one of the hardest things, and it is a lifelong learning experience. --- Adrian Bolboaca (@adibolb), April 3, 2014, Twitter

## You Aren't Gonna Need It (YAGNI)

> Always implement things when you actually need them, not when you merely foresee that you need them. --- Ron Jeffries

YAGNI stands for "You aren't gonna need it".

The YAGNI principle declares war on speculation and over-design. Its main idea is that you should not write code that is not currently needed just because it may be needed in the future.

## Don't Repeat Yourself (DRY)

> Copy and paste is a design error. --- David L. Parnas

DRY stands for "Don't repeat yourself". We should avoid duplication as much as possible, because duplication is a very bad behavior. This principle is also known as "Once And Only Once" (OAOO).

Duplication is dangerous for an obvious reason: when one piece of code is modified, its copies must also be modified. Do not expect that copies can be left unchanged. Any duplicated code fragment will eventually be forgotten, and bugs will appear because one copy was missed.

## Information Hiding

Information hiding is a well-known fundamental principle in software development.

It says that when one piece of code calls another, the caller should not know the internal implementation details of the callee. Otherwise, the caller may complete a function by modifying the callee's internals, instead of being forced to modify its own code.

Benefits of information hiding:

- It limits the scope of module changes.
- When defects need to be fixed, the impact on other modules is minimized.
- It significantly improves module reusability.
- Modules become easier to test.

## High Cohesion

A general recommendation in software development is that any software entity, such as a module, component, unit, class, or function, should have high or strong cohesion. In general, a module has high cohesion when it implements a clearly defined function.

## Loose Coupling

During software development, modules should be loosely coupled, also called low coupling or weak coupling. This means building a system where each module uses little or no knowledge of other independent modules' definitions.

The key to loose coupling in software development is **interfaces**.

Loose coupling gives independent modules a high degree of autonomy. This principle applies at many levels, from the smallest modules to large component architectures. High cohesion promotes loose coupling, because modules with clearly defined responsibilities usually depend on fewer other modules.

## Be Careful with Optimization

> Premature optimization is the root of all evil, or at least most of it, in programming. --- Donald E. Knuth

Avoid optimization unless there is a clear performance requirement.

## Principle of Least Astonishment (PLA)

The Principle of Least Astonishment is a design principle stating that designers should avoid surprising or dissatisfying users as much as possible.

## The Boy Scout Rule

> Leave the campsite cleaner than you found it.

The Boy Scouts are very principled. One of their principles is that once they find something bad, they immediately clean up the pollution or disorder in the environment. As responsible software engineers, we should apply this principle to daily work. Whenever we find code that needs improvement or has poor style, we should fix it immediately, regardless of who originally wrote it.

