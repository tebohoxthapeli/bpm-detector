---
triggers:
  - "explain"
  - "what does this"
  - "how does this"
  - "walk me through"
  - "help me understand"
---

# Code Explanation Skill

When explaining code, optimize for clarity and learning.

## Explanation Structure

### 1. One-Sentence Summary
Start with what the code does at the highest level. No jargon.

### 2. Key Concepts
List 2-4 concepts someone needs to understand this code. Link each to what's in the code.

### 3. Step-by-Step Walkthrough
Go through the code in logical order (not necessarily line order):
- Start with the "main" function or entry point
- Explain the data flow
- Highlight the key decisions/branches
- Show how pieces connect

### 4. Why This Way?
Explain the design decisions:
- Why refs instead of state here?
- Why this cleanup pattern?
- Why this particular library choice?

### 5. Gotchas
Call out non-obvious things:
- Browser quirks being handled
- Edge cases covered
- Things that could break if changed

## Style Guidelines

- Use analogies when helpful
- Point to specific line numbers
- Avoid "simply" and "just" - nothing is simple when learning
- Break complex ideas into digestible pieces
- Use code snippets to illustrate points

## For This Project Specifically

When explaining Web Audio API code:
- Explain the audio graph concept (source → nodes → destination)
- Clarify AudioContext lifecycle (created → running → suspended → closed)
- Note browser compatibility issues handled

When explaining React hooks:
- Show the dependency flow
- Explain why certain things are refs vs state
- Trace the cleanup path
