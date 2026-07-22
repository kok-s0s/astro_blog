---
title: 'Building a Safety Net'
description: 'Reading notes from Clean C++: testing, QA, unit tests, and principles for useful test code.'
---

> Testing is a skill, although this may surprise some people. It is a fact. --- Mark Fewster and Dorothy Graham, Software Test Automation, 1999

POUT - Plain Old Unit Testing

TDD - Test-Driven Development

## Why Testing Is Necessary

Accidents caused by software errors:

1. 1962: NASA Mariner 1
2. 1986: THERAC-25 medical accelerator disaster
3. AT&T telephone network crash

In complex systems, software quality is not negotiable. **There is absolutely no room for negotiation.**

## Unit Testing

> "Refactoring" without tests is not refactoring. It is just moving garbage code around. --- Corey Haines (@coreyhaines), December 20, 2013, Twitter

C++ unit testing frameworks:

- CppUnit
- Boost.Test
- CUTE
- Google Test

## About QA

> QA - Quality Assurance

> I have said this before, and I will say it again: although your company may have a separate QA group to test software, the development team's goal should be that QA finds no defects. --- Robert C. Martin, The Clean Coder

Delivering 100% defect-free software is a very hard goal.

QA is the second line of defense in the safety system.

## Principles of Good Unit Tests

1. Quality of unit test code

Product code should be high quality, and unit test code should be held to the same standard.

In theory, there should be no difference between product code and test code. They are born equal.

2. Naming unit tests

- The precondition of the unit test, which is the state of the SUT before execution.
- The part being tested, usually the name of the tested process, function, or method (API).
- The expected result of the unit test.

3. Independence of unit tests

Every unit test must be independent from all other unit tests.

4. One assertion per test

Limit each unit test to one assertion. This is controversial, so developers should judge according to the real situation.

5. Independent initialization of the unit test environment

When all unit tests run, each unit test must be an independent runnable instance of the application. Each test must fully set up and initialize the environment it needs. The same applies to cleanup after execution.

6. Do not unit test getters and setters

These functions are too simple to need testing.

Of course, this still depends on the real situation.

7. Do not unit test third-party code

Not using libraries or frameworks that have no unit tests of their own or have suspicious quality is a wise architectural choice.

8. Do not unit test external systems

Ignore those. Test your own code, not **other people's code**.

9. How to handle database access

> My first and most important suggestion on this issue is: if you can avoid using a database in unit tests, avoid using a database in unit tests. --- Gerard Meszaros, xUnit Patterns

Mock the database and run all unit tests in memory.

If the system uses a database, test it at the system integration and system test levels.

10. Do not mix test code and product code.
11. Tests must run quickly.
12. Test doubles.

