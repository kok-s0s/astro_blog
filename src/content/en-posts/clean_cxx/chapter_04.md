---
title: 'Basic Rules for Clean C++ Code'
description: 'Reading notes from Clean C++: naming, comments, functions, and avoiding C-style code in C++ projects.'
---

## Good Naming

> Programs must be written for people to read, and only incidentally for machines to execute. --- Hal Abelson and Gerald Jay Sussman, 1984

Source files, namespaces, classes, templates, functions, parameters, variables, constants, and so on should all have meaningful and expressive names.

### Names Should Explain Themselves

Self-explanatory code means code that does not need comments to explain its purpose.

Use simple names that explain and describe themselves.

### Use Domain Names

> Domain-Driven Design (DDD)
>
> DDD is an approach close to complex object-oriented development. It focuses mainly on the core domain and domain logic. Domain-driven design tries to map things and concepts from the business domain into code, making software a model of a real system.

Domain-driven design helps software development teams create a common model between the company's business and IT stakeholders. The team can use this model to communicate business requirements, data entity models, and process models.

Naming components, classes, and concepts after elements and concepts from the application domain allows developers to naturally express software design ideas.

### Choose Names at the Proper Level of Abstraction

### Avoid Redundant Names

- Do not repeat the class name in its members.
- Do not include a member's type in its name.

### Avoid Obscure Abbreviations

When naming variables or constants, use complete words instead of obscure abbreviations. The reason is obvious: obscure abbreviations significantly reduce readability. Also, when developers talk about their code, variable names should be easy to pronounce.

### Avoid Hungarian Notation and Name Prefixes

### Avoid Using the Same Name for Different Purposes

## Comments

> Truth can only be found in one place: the code. --- Robert C. Martin, Clean Code

In most cases, comments are a code smell.

Comments are necessary when code behavior needs explanation or clarification, but that usually means the developer could not write simple, self-explanatory code.

### Let Code Read Like a Story

Code should tell a story and explain itself. Comments should be avoided as much as possible.

> Any fool can write code that a computer can understand. Good programmers write code that humans can understand. --- Martin Fowler, 1999

### Do Not Comment Understandable Code

### Do Not Disable Code with Comments

Except for quick tests, do not disable code with comments. Also, use a version control system.

### Do Not Write Block Comments

### Comments Are Useful in Special Cases

- Make sure your comments add value to the code.
- Explain why something is done, not how it is done.
- Keep comments as short and expressive as possible.

## Functions

Functions, methods, procedures, services, and operations are the core of any software system. They are the first organizational unit above lines of code. Well-written functions significantly improve readability and maintainability. For this reason, they should be carefully designed and treated with care.

> **Cyclomatic complexity**
>
> Cyclomatic complexity is a quantitative software metric invented by American mathematician Thomas J. McCabe in 1976.
> It directly calculates the number of linearly independent paths through a piece of source code, such as a function. If a function has no if or switch statements and no for or while loops, there is only one path through it, so its cyclomatic complexity is 1. If a function contains one if statement representing a single decision point, there are two paths through the function, so its cyclomatic complexity is 2.
> When cyclomatic complexity is high, the affected code is usually harder to understand, test, and modify, and therefore more likely to have problems.

### Do Only One Thing

> Functions should do one thing. They should do it well. They should do it only. --- Robert C. Martin, Clean Code

A function must have a clearly defined task or capability, and its function signature should express that.

Signs that a function does too much:

1. The function body is large, meaning it contains many lines of code.
2. When trying to find a meaningful and expressive name, you cannot avoid conjunctions such as "and" or "or".
3. The function body is vertically separated by blank lines into several pieces representing subsequent steps, often with comments at the beginning of each piece.
4. Cyclomatic complexity is high, and the function contains too many if, else, or switch-case statements.
5. The function has many parameters, especially one or more bool parameters.

### Keep Functions as Small as Possible

> Functions should be small. Ideally 4 to 5 lines, at most 12 to 15 lines, and no more.

### Function Naming

Function names should start with a verb. Predicates, which are statements about whether something is true or false, should start with `is` or `has`.

### Use Easy-to-Understand Names

Function names should express intention and purpose, not explain how the function works.

### Function Parameters and Return Values

1. Number of parameters

Functions should have as few parameters as possible. One parameter is ideal. Class member functions usually have no parameters because they often operate on an object's internal state or query something from the object.

2. Avoid flag parameters

Bool types.

Enum types.

3. Avoid output parameters

Avoid output parameters at all costs.

4. Do not pass or return 0 (`NULL`, `nullptr`)

If returning a raw pointer from a function or method is unavoidable, do not return `nullptr`.

If you must handle pointers to resources, use smart pointers.

5. Use `const` correctly

## C-Style Code in C++ Projects

### Use C++ `string` and streams instead of C-style `char*`

### Avoid `printf()`, `sprintf()`, `gets()`, and similar functions

### Use standard library containers instead of C-style arrays

### Use C++ casts instead of C-style casts

### Avoid macros

