import type { Module, PracticeItem } from './types';

export const LESSON_PLAN: Module[] = [
  {
    id: "module-1",
    title: "Module 1: Python Basics",
    lessons: [
      {
        id: "m1-intro1",
        title: "What is Programming?",
        type: "learn",
        content: `
# Welcome to Programming! 🎉

Before we write our first line of code, let's understand what programming actually is.

## Programming is Giving Instructions

Think of a computer as an incredibly fast but very literal assistant. It will do **exactly** what you tell it—no more, no less. Programming is the art of writing instructions that a computer can understand and execute.

### Real-World Analogy: A Recipe

Imagine you're writing a recipe for someone who has never cooked before:
- "Add some flour" ❌ (How much is "some"?)
- "Add 2 cups of flour" ✅ (Precise!)

Computers need this same level of precision.

## Why Python?

Python is one of the most popular programming languages because:
- 📖 **Readable**: Code looks almost like English
- 🚀 **Beginner-Friendly**: Less confusing symbols than other languages
- 💼 **Powerful**: Used by Google, NASA, Netflix, and more!

## What You'll Learn in This Module

In this module, you'll master the fundamentals:
1. **Output**: Making the computer "speak" using \`print()\`
2. **Comments**: Leaving notes for yourself and others
3. **Variables**: Storing and remembering data

> 💡 **Key Takeaway**: Programming is about giving precise, step-by-step instructions to a computer. Python makes this easy because its syntax is clear and readable.
        `,
        goal: "Understand what programming is and why Python is great for beginners.",
        startingCode: "",
        objective: "Learn the fundamentals of what programming means.",
      },
      {
        id: "m1-intro2",
        title: "Understanding the Print Function",
        type: "learn",
        content: `
# The \`print()\` Function Deep Dive 🖨️

Before you write your first print statement, let's understand exactly how it works.

## Anatomy of a Print Statement

\`\`\`python
print("Hello World!")
\`\`\`

Let's break this down piece by piece:

| Part | What It Is | Purpose |
|------|------------|---------|
| \`print\` | Function name | Tells Python what action to perform |
| \`(\` and \`)\` | Parentheses | Contains what you want to print |
| \`"Hello World!"\` | String (text) | The actual message to display |

## Why Quotes Matter

The quotes tell Python: *"This is text, not a command."*

\`\`\`python
print("hello")  # ✅ Prints: hello
print(hello)    # ❌ Error! Python looks for a variable named hello
\`\`\`

## Single vs Double Quotes

Both work the same way:
\`\`\`python
print("Hello")  # Double quotes ✅
print('Hello')  # Single quotes ✅
\`\`\`

Choose one style and be consistent!

## Trace Through: What Happens When You Run This?

\`\`\`python
print("Line 1")
print("Line 2")
\`\`\`

**Step 1:** Python reads line 1 → Outputs "Line 1"
**Step 2:** Python reads line 2 → Outputs "Line 2"

Each print statement creates a new line of output!

> 💡 **Key Takeaway**: The \`print()\` function displays text. Quotes are essential—they tell Python what is text vs. code.
        `,
        goal: "Master the anatomy of print statements before writing your own.",
        startingCode: "",
        objective: "Understand how print() works before using it.",
      },
      {
        id: "m1-intro3",
        title: "Reading Error Messages",
        type: "learn",
        content: `
# Don't Fear Errors! 🐛

Errors are not failures—they're Python trying to help you! Learning to read error messages is a superpower.

## Common Error Types

### 1. SyntaxError - "I don't understand your grammar"

\`\`\`python
print("Hello"
# SyntaxError: '(' was never closed
\`\`\`

**What it means:** You forgot the closing parenthesis!
**The fix:** Add \`)\` at the end

### 2. NameError - "I don't know what that is"

\`\`\`python
print(Hello)
# NameError: name 'Hello' is not defined
\`\`\`

**What it means:** Python thinks \`Hello\` is a variable, but you never created it.
**The fix:** Add quotes → \`print("Hello")\`

### 3. TypeError - "You can't do that with this type"

\`\`\`python
print("Age: " + 25)
# TypeError: can only concatenate str (not "int") to str
\`\`\`

**What it means:** You can't mix text and numbers directly.
**The fix:** Convert the number → \`print("Age: " + str(25))\`

## How to Read an Error

\`\`\`
File "main.py", line 3
    print("Hello"
                 ^
SyntaxError: '(' was never closed
\`\`\`

1. **Line number:** The error is on line 3
2. **Arrow (^):** Points to where Python got confused
3. **Error type:** SyntaxError
4. **Message:** Explains what went wrong

> 💡 **Key Takeaway**: Error messages are your friends—they tell you exactly what went wrong and where. Always read the line number and error type first!
        `,
        goal: "Learn to decode Python error messages like a pro.",
        startingCode: "",
        objective: "Understand how to read and interpret error messages.",
      },
      {
        id: "m1-intro4",
        title: "Code Tracing Practice",
        type: "learn",
        content: `
# Trace Through Code Like a Detective 🔍

Before running code, good programmers can predict what it will do. This skill is called **code tracing**.

## The Rules of Code Tracing

1. **Start at the top** - Python runs line by line, top to bottom
2. **One line at a time** - Don't skip ahead
3. **Write down what happens** - Track outputs and variable values

## Practice: Trace This Code

\`\`\`python
print("Welcome!")
print("This is Python.")
print("Let's code!")
\`\`\`

### Step-by-Step Trace:

| Line | Code | Output |
|------|------|--------|
| 1 | \`print("Welcome!")\` | Welcome! |
| 2 | \`print("This is Python.")\` | This is Python. |
| 3 | \`print("Let's code!")\` | Let's code! |

**Final Output:**
\`\`\`
Welcome!
This is Python.
Let's code!
\`\`\`

## Challenge: What Does This Output?

\`\`\`python
print("A")
print("B")
print("C")
print("A")
\`\`\`

**Answer (click to trace mentally):**
- Line 1: A
- Line 2: B  
- Line 3: C
- Line 4: A

So the output is: A, B, C, A (each on a new line)

> 💡 **Key Takeaway**: Python executes code from top to bottom, one line at a time. Code tracing helps you predict output and catch bugs before running your code.
        `,
        goal: "Practice predicting code output before running it.",
        startingCode: "",
        objective: "Learn to trace through code and predict output.",
      },
      {
        id: "m1-l1",
        title: "Hello World!",
        content: `
Welcome to your journey as a Python developer! The first tradition for every programmer, whether at Google or NASA, is to make the computer speak.

In Python, we use the \`print()\` function. 

### How it works:
1.  **The Function:** \`print\` is a command that tells Python to output information to the console (the terminal window below).
2.  **The Parentheses:** \`()\` act like a container. Whatever you put inside them gets processed.
3.  **The String:** Text must be wrapped in quotes (\`""\` or \`''\`). This tells Python, "This is text, not a command."

**Example:**
\`\`\`python
print("This is a string")
print('Single quotes work too')
\`\`\`
        `,
        goal: 'Write a program that prints exactly: "Hello World!" (Case sensitive).',
        startingCode: `# Write your code below\n`,
        objective: 'The user must print the exact string "Hello World!".',
        expectedOutput: "Hello World!",
        commonMistakes: `
*   **Missing Quotes:** \`print(Hello World)\` causes an error because Python looks for variables named Hello and World.
*   **Capitalization:** \`Print\` is not the same as \`print\`. Python is case-sensitive.
*   **Missing Parentheses:** Python 3 requires parentheses. \`print "Hello"\` will fail.
        `,
      },
      {
        id: "m1-l2",
        title: "Comments",
        content: `
Code isn't just for computers; it's for humans too. **Comments** are lines of text that Python ignores completely. They are used to document your code so you (or others) can understand it later.

### Types of Comments:
*   **Single-line comments:** Start with a hash symbol \`#\`. Everything after the \`#\` on that line is invisible to the computer.
*   **Inline comments:** You can put a comment at the very end of a line of code.

**Example:**
\`\`\`python
# This entire line is skipped
print("This runs") # This is a note
# print("This won't run")
\`\`\`
        `,
        goal: 'Write a print statement that says "Coding is fun". On the line **above** it, write a comment saying `# My first comment`.',
        startingCode: `# Your code here\n`,
        objective:
          'The user must print "Coding is fun" and include a comment on the line above it.',
        expectedOutput: "Coding is fun",
        commonMistakes: `
*   **Nesting:** You cannot put code *inside* a comment and expect it to run.
*   **Wrong Slash:** Comments use \`#\`, not \`//\` (that's JavaScript/C++).
        `,
      },
      {
        id: "m1-l3",
        title: "Variables",
        content: `
Imagine a variable as a labeled box where you store data. You can put data in, take it out, or look at it later. This allows your program to remember things.

### Rules:
1.  **Assignment:** Use the \`=\` sign. \`variable_name = value\`.
2.  **Naming:** Variables cannot have spaces. Use \`snake_case\` (words separated by underscores).
3.  **No Quotes:** When using a variable, don't use quotes, or you'll print the *name* of the box, not what's inside.

**Example:**
\`\`\`python
user_name = "Alice"  # Storing "Alice" in the box "user_name"
print(user_name)     # Prints: Alice
print("user_name")   # Prints: user_name (Oops!)
\`\`\`
        `,
        goal: 'Create a variable `hero` with the value "Link". Create a variable `hearts` with value 3. Print the `hero` variable.',
        startingCode: `# Define variables below\n`,
        objective:
          'The user must define `hero` as "Link", `hearts` as 3 (integer), and print the `hero` variable.',
        expectedOutput: "Link",
        commonMistakes: `
*   **Backwards Assignment:** \`"Link" = hero\` is invalid. The variable name must be on the LEFT.
*   **Using Spaces:** \`my hero = "Link"\` is a syntax error. Use \`my_hero\`.
*   **Printing Strings instead of Vars:** \`print("hero")\` prints the word "hero", not the value "Link".
        `,
      },
      {
        id: "m1-l4",
        title: "Final Quiz: Basics",
        type: "quiz",
        content: `
You've learned output, comments, and variables. Let's verify your knowledge before moving to dynamic logic.
        `,
        goal: "Score 100% on the quiz to unlock the next module.",
        startingCode: "",
        objective: "Pass the quiz with 100% accuracy.",
        quizQuestions: [
          {
            id: "q1",
            text: "What happens if you run: print(Hello)",
            options: [
              "It prints Hello",
              "It crashes (NameError)",
              'It prints "Hello"',
              "Nothing happens",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "q2",
            text: "Which variable name is valid in Python?",
            options: ["2nd_player", "my variable", "user_score", "def"],
            correctAnswerIndex: 2,
          },
          {
            id: "q3",
            text: "What does the # symbol do?",
            options: [
              "Starts a variable",
              "Ends the program",
              "Imports a library",
              "Starts a comment",
            ],
            correctAnswerIndex: 3,
          },
        ],
      },
    ],
  },
  {
    id: "module-2",
    title: "Module 2: Variable Logic",
    lessons: [
      {
        id: "m2-intro1",
        title: "How Variables Store Data",
        type: "quiz",
        content: `
# Understanding Memory: The Box Analogy 📦

Before we manipulate variables, let's deeply understand what happens when you create one.

## Variables Are Like Labeled Boxes

When you write \`score = 100\`, Python:
1. **Creates a box** in computer memory
2. **Labels it** "score"
3. **Stores** the value 100 inside

\`\`\`python
# Creating a box labeled "score" with 100 inside
score = 100
\`\`\`

## Visualizing Memory

| Variable Name | Value in Memory |
|---------------|-----------------|
| score | 100 |
| lives | 3 |
| name | "Player1" |

Each variable is a separate box with its own label and contents.

## The Assignment Operator (=)

The \`=\` is NOT "equals" in programming. It means **"put this value into this box"**.

Think of it as an arrow pointing left: \`score ← 100\`

\`\`\`python
player = "Mario"  # Put "Mario" into box labeled "player"
\`\`\`

## Multiple Boxes

You can create as many variables as you need:

\`\`\`python
health = 100    # Box 1
coins = 0       # Box 2
level = 1       # Box 3
\`\`\`

Each line creates a new labeled box in memory.
        `,
        goal: "Understand how variables store data in memory.",
        startingCode: "",
        objective: "Learn the memory model for variables.",
        quizQuestions: [
          {
            id: "m2i1-q1",
            text: "What does the = sign do in Python?",
            options: [
              "Checks if values are equal",
              "Puts a value into a variable (box)",
              "Deletes a variable",
              "Creates an error",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m2i1-q2",
            text: "When you write: name = \"Alice\", what is the label of the box?",
            options: ["Alice", "name", "=", "The whole line"],
            correctAnswerIndex: 1,
          },
          {
            id: "m2i1-q3",
            text: "Can you create multiple variables (boxes) in one program?",
            options: [
              "No, only one allowed",
              "Yes, as many as you need",
              "Only 10 maximum",
              "Only with special permission",
            ],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m2-intro2",
        title: "Tracing Variable Changes",
        type: "quiz",
        content: `
# Following Values Through Time ⏱️

Variables can change! Let's practice tracking their values as code executes.

## The Golden Rule

When a variable is **reassigned**, the old value is **replaced** forever.

\`\`\`python
score = 10      # score is now 10
score = 50      # score is now 50 (10 is gone!)
score = 100     # score is now 100 (50 is gone!)
\`\`\`

## Trace Table Practice

For this code, let's track what \`x\` holds after each line:

\`\`\`python
x = 5       # Line 1
x = 10      # Line 2
x = 20      # Line 3
print(x)    # Line 4
\`\`\`

| After Line | Value of x |
|------------|------------|
| Line 1 | 5 |
| Line 2 | 10 |
| Line 3 | 20 |
| Line 4 | 20 (prints 20) |

## Multiple Variables Trace

\`\`\`python
a = 1       # a=1
b = 2       # a=1, b=2
a = 5       # a=5, b=2
b = a       # a=5, b=5
\`\`\`

Notice: \`b = a\` copies the **current value** of a into b. They don't stay connected!
        `,
        goal: "Practice tracing variable values through code execution.",
        startingCode: "",
        objective: "Learn to track variable changes step by step.",
        quizQuestions: [
          {
            id: "m2i2-q1",
            text: "After: x = 5, then x = 10, what is x?",
            options: ["5", "10", "15", "Error"],
            correctAnswerIndex: 1,
          },
          {
            id: "m2i2-q2",
            text: "After: a = 3, b = a, a = 7... what is b?",
            options: ["3", "7", "10", "Error"],
            correctAnswerIndex: 0,
          },
          {
            id: "m2i2-q3",
            text: "When you reassign a variable, what happens to the old value?",
            options: [
              "It is saved in a backup",
              "It stays in memory",
              "It is replaced/lost forever",
              "It creates a new variable",
            ],
            correctAnswerIndex: 2,
          },
        ],
      },
      {
        id: "m2-intro3",
        title: "Understanding Assignment Flow",
        type: "quiz",
        content: `
# Right-to-Left Evaluation ➡️⬅️

One of the most important concepts in programming is understanding HOW assignment works.

## The Secret: Right Side First!

When Python sees \`x = expression\`, it:
1. **First:** Calculates everything on the RIGHT side
2. **Then:** Stores the result in the variable on the LEFT

\`\`\`python
result = 5 + 3   # Python calculates 8 first, then stores it
\`\`\`

## This Explains Self-Reference!

\`\`\`python
count = 10
count = count + 1
\`\`\`

Step by step:
1. Read right side: \`count + 1\` → \`10 + 1\` → \`11\`
2. Store 11 in \`count\`
3. Now count holds 11

## Complex Example

\`\`\`python
x = 5
y = 3
z = x + y      # Right side: 5 + 3 = 8, z becomes 8
z = z * 2      # Right side: 8 * 2 = 16, z becomes 16
\`\`\`

## Why This Matters

This is why \`x = x + 1\` doesn't cause an infinite loop!
Python calculates the right side ONCE, gets a number, and stores it.
        `,
        goal: "Understand right-to-left evaluation in assignments.",
        startingCode: "",
        objective: "Learn how Python processes assignment statements.",
        quizQuestions: [
          {
            id: "m2i3-q1",
            text: "In x = 5 + 3, what happens first?",
            options: [
              "x is created",
              "5 + 3 is calculated",
              "The left side is read",
              "Nothing",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m2i3-q2",
            text: "After: count = 10, then count = count + 5... what is count?",
            options: ["10", "5", "15", "Error"],
            correctAnswerIndex: 2,
          },
          {
            id: "m2i3-q3",
            text: "Why doesn't x = x + 1 cause an infinite loop?",
            options: [
              "Python has special protection",
              "The right side is calculated ONCE and stored",
              "It actually does loop forever",
              "x cannot reference itself",
            ],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m2-intro4",
        title: "The Swap Problem Explained",
        type: "quiz",
        content: `
# The Classic Swap Problem 🔄

One of the most famous beginner challenges is swapping two variables. Let's understand WHY it's tricky.

## The Naive Approach (WRONG!)

\`\`\`python
a = 5
b = 10
# Try to swap:
a = b     # a is now 10
b = a     # b is now... 10? NOT 5!
\`\`\`

**What went wrong?** When we did \`a = b\`, we **lost** the value 5!

## The Problem Visualized

| Step | a | b | Problem |
|------|---|---|---------|
| Start | 5 | 10 | - |
| a = b | 10 | 10 | We lost 5! |
| b = a | 10 | 10 | Both are 10 |

## The Solution: A Temporary Box

We need a THIRD variable to "hold" one value while we move things around.

\`\`\`python
a = 5
b = 10
temp = a    # temp "holds" 5 safely
a = b       # a becomes 10
b = temp    # b becomes 5 (from temp!)
\`\`\`

## Solution Visualized

| Step | a | b | temp |
|------|---|---|------|
| Start | 5 | 10 | - |
| temp = a | 5 | 10 | 5 |
| a = b | 10 | 10 | 5 |
| b = temp | 10 | 5 | 5 |

Now a=10 and b=5. Swapped!
        `,
        goal: "Understand why swapping requires a temporary variable.",
        startingCode: "",
        objective: "Learn the swap algorithm conceptually.",
        quizQuestions: [
          {
            id: "m2i4-q1",
            text: "Why can't you just do a=b then b=a to swap?",
            options: [
              "Python doesn't allow it",
              "The first assignment loses the original value of a",
              "b cannot be assigned",
              "It actually works fine",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m2i4-q2",
            text: "What is the purpose of the temp variable in swapping?",
            options: [
              "To make code longer",
              "To temporarily save a value before it gets overwritten",
              "To speed up the code",
              "Python requires it",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m2i4-q3",
            text: "In the correct swap, what should temp hold?",
            options: [
              "The first variable's original value",
              "The second variable's value",
              "Zero",
              "Nothing",
            ],
            correctAnswerIndex: 0,
          },
        ],
      },
      {
        id: "m2-l1",
        title: "Reassigning Values",
        content: `
Variables are dynamic. Just because \`score\` is 10 now doesn't mean it stays that way. You can overwrite the value in the "box" by assigning it again.

**Code Flow:**
Python executes line-by-line from top to bottom. If you print a variable, change it, and print it again, you will see two different values.

**Example:**
\`\`\`python
money = 100
print(money) # Prints 100
money = 50   # Old value is lost forever!
print(money) # Prints 50
\`\`\`
        `,
        goal: "1. Set `speed` to 0. \n2. Print `speed`. \n3. Update `speed` to 60. \n4. Print `speed` again.",
        startingCode: `speed = 0\n# Your code here`,
        objective: "User must print 0, reassign speed to 60, and print 60.",
        expectedOutput: "0\n60",
        commonMistakes: `
*   **Expecting Auto-Update:** Changing a variable does not update previous print statements that already ran.
*   **Creating New Vars:** Writing \`speed2 = 60\` instead of updating the existing \`speed\` variable.
        `,
      },
      {
        id: "m2-l2",
        title: "Self-Referencing Math",
        content: `
A very common pattern in programming is updating a variable based on its *current* value. For example, adding points to a score or taking damage.

**The Logic:**
1. Calculate the right side first (\`lives - 1\`)
2. Save the result into the left side variable (\`lives\`)

**Example:**
\`\`\`python
lives = 3
lives = lives - 1 
# lives is now 2
\`\`\`
        `,
        goal: "Start with `xp = 100`. Add 50 to `xp` using self-referencing logic (`xp = ...`). Then subtract 10. Print the final `xp`.",
        startingCode: `xp = 100\n# Update xp twice, then print`,
        objective: "User must update xp to 150, then to 140, and print 140.",
        expectedOutput: "140",
        commonMistakes: `
*   **Math Error:** Writing \`xp - 10\` without assigning it (\`xp = xp - 10\`) does nothing to the variable.
*   **Syntax:** \`100 + 50 = xp\` is invalid. Variable name always on the left.
        `,
      },
      {
        id: "m2-l3",
        title: "Multiple Variable Logic",
        content: `
Programs usually juggle many variables at once. You can use values from different variables to create new ones.

**Example:**
\`\`\`python
first = "John"
last = "Doe"
# We can combine them
full_name = first + " " + last
print(full_name)
\`\`\`
        `,
        goal: 'Create `item = "Sword"` and `bonus = "Golden"`. Create a new variable `full_name` that combines them to say "Golden Sword". Print `full_name`.',
        startingCode: `# Define variables and print\n`,
        objective:
          'User must define the variables correctly and print "Golden Sword".',
        expectedOutput: "Golden Sword",
        commonMistakes: `
*   **Missing Space:** \`"Golden" + "Sword"\` results in \`"GoldenSword"\`. You need to add a space string \`" "\` in the middle.
*   **Variable Typos:** Ensure variable names match exactly what you defined.
        `,
      },
      {
        id: "m2-final",
        title: "Final Project: Value Swapper",
        content: `
This is a classic programming interview question.
You have two variables, \`a\` and \`b\`. You need to swap their values so that \`a\` holds \`b\`'s value and \`b\` holds \`a\`'s value.

**Challenge:** You cannot just reassign them manually like \`a=10\`. You must use logic that works for any values.
        `,
        goal: "1. Create `a = 5` and `b = 10`. \n2. Create a temp variable to hold `a`. \n3. Set `a` to `b`. \n4. Set `b` to temp. \n5. Print `a` then `b`.",
        startingCode: `a = 5\nb = 10\n# Swap logic here\nprint(a)\nprint(b)`,
        objective: "Output must be 10 then 5.",
        expectedOutput: "10\n5",
        commonMistakes: `
*   **Overwriting too soon:** If you do \`a = b\`, you lose the value of 5 forever. You must save it in a temporary variable first.
        `,
      },
    ],
  },
  {
    id: "module-3",
    title: "Module 3: Data Types",
    lessons: [
      {
        id: "m3-intro1",
        title: "Introduction to Data Types",
        type: "quiz",
        content: `
# Why Types Matter 🏷️

In Python, every piece of data has a **type**. Understanding types is crucial because different types behave differently!

## The Main Types

| Type | Name | Example | Use Case |
|------|------|---------|----------|
| \`int\` | Integer | \`42\`, \`-7\`, \`0\` | Counting, whole numbers |
| \`float\` | Float | \`3.14\`, \`0.5\`, \`-2.0\` | Decimals, precision |
| \`str\` | String | \`"Hello"\`, \`'Hi'\` | Text, words, characters |
| \`bool\` | Boolean | \`True\`, \`False\` | Yes/No, On/Off |

## Types Are Like Categories

Think of types as categories that determine what operations make sense:
- **Numbers** (int, float): Math operations (\`+\`, \`-\`, \`*\`, \`/\`)
- **Strings** (str): Text operations (joining, splitting)
- **Booleans** (bool): Logic (and, or, not)

## Same Symbol, Different Behavior!

The \`+\` operator behaves differently based on type:

\`\`\`python
# With numbers: ADDITION
print(5 + 3)        # 8

# With strings: CONCATENATION (joining)
print("5" + "3")    # "53"
\`\`\`

This is why knowing your types is essential!
        `,
        goal: "Understand Python's main data types and why they matter.",
        startingCode: "",
        objective: "Learn about int, float, str, and bool types.",
        quizQuestions: [
          {
            id: "m3i1-q1",
            text: "Which type is used for decimal numbers?",
            options: ["int", "float", "str", "bool"],
            correctAnswerIndex: 1,
          },
          {
            id: "m3i1-q2",
            text: "What does \"5\" + \"3\" produce?",
            options: ["8", "53", "Error", "5 + 3"],
            correctAnswerIndex: 1,
          },
          {
            id: "m3i1-q3",
            text: "Which type has only two possible values?",
            options: ["int", "float", "str", "bool"],
            correctAnswerIndex: 3,
          },
        ],
      },
      {
        id: "m3-intro2",
        title: "Checking Types with type()",
        type: "quiz",
        content: `
# Discovering Types 🔍

Python gives you a tool to check any value's type: the \`type()\` function.

## How to Use type()

\`\`\`python
print(type(42))        # <class 'int'>
print(type(3.14))      # <class 'float'>
print(type("Hello"))   # <class 'str'>
print(type(True))      # <class 'bool'>
\`\`\`

## Checking Variables

You can check variables too:

\`\`\`python
age = 25
name = "Alice"
price = 19.99

print(type(age))    # <class 'int'>
print(type(name))   # <class 'str'>
print(type(price))  # <class 'float'>
\`\`\`

## Surprise! Quotes Change Everything

\`\`\`python
a = 100
b = "100"

print(type(a))  # <class 'int'>
print(type(b))  # <class 'str'>  (Different!)
\`\`\`

The value \`100\` and \`"100"\` look similar to humans, but Python sees them as completely different types!

## Division Always Makes Floats

\`\`\`python
result = 10 / 2
print(result)       # 5.0 (not 5!)
print(type(result)) # <class 'float'>
\`\`\`

Even "clean" division produces a float.
        `,
        goal: "Learn to use the type() function to check data types.",
        startingCode: "",
        objective: "Understand how to discover and verify types.",
        quizQuestions: [
          {
            id: "m3i2-q1",
            text: "What is type(\"42\")?",
            options: ["int", "str", "float", "number"],
            correctAnswerIndex: 1,
          },
          {
            id: "m3i2-q2",
            text: "What is type(10 / 2)?",
            options: ["int", "float", "str", "bool"],
            correctAnswerIndex: 1,
          },
          {
            id: "m3i2-q3",
            text: "Are 5 and \"5\" the same type?",
            options: [
              "Yes, both are numbers",
              "No, one is int and one is str",
              "Depends on context",
              "Neither has a type",
            ],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m3-intro3",
        title: "Understanding Type Errors",
        type: "quiz",
        content: `
# When Types Collide 💥

Mixing types incorrectly causes **TypeErrors**. Let's understand why and how to fix them.

## The Classic TypeError

\`\`\`python
print("Your score is: " + 100)
# TypeError: can only concatenate str (not "int") to str
\`\`\`

**What happened?** Python doesn't know how to combine text and numbers directly.

## Why This Happens

Think about it: What would "Hello" + 5 mean?
- "Hello5"? (Attach the number as text)
- Some other result?

Python doesn't guess—it asks you to be explicit!

## The Solution: Type Conversion

Convert the number to a string first:

\`\`\`python
score = 100
print("Your score is: " + str(score))  # Works!
# Output: Your score is: 100
\`\`\`

## The Other Direction

Sometimes you have text that should be a number:

\`\`\`python
user_input = "50"
# Can't do math with it directly!
# user_input + 10  → TypeError!

# Convert first:
number = int(user_input)
result = number + 10  # Works! Result is 60
\`\`\`

## Conversion Functions

| To convert to... | Use... | Example |
|------------------|--------|---------|
| String | \`str(x)\` | \`str(42)\` → \`"42"\` |
| Integer | \`int(x)\` | \`int("42")\` → \`42\` |
| Float | \`float(x)\` | \`float("3.14")\` → \`3.14\` |
        `,
        goal: "Understand why TypeErrors occur and how to fix them.",
        startingCode: "",
        objective: "Learn about type conversion to avoid errors.",
        quizQuestions: [
          {
            id: "m3i3-q1",
            text: 'Why does "Score: " + 50 cause an error?',
            options: [
              "50 is too large",
              "Python can't combine string and integer directly",
              "Strings don't work with +",
              "print is broken",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m3i3-q2",
            text: 'How do you fix: "Age: " + 25?',
            options: [
              'Remove the quotes: Age: + 25',
              'Use: "Age: " + str(25)',
              "Use: Age: + 25",
              "It cannot be fixed",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m3i3-q3",
            text: 'To do math with "100" (a string), what do you do?',
            options: [
              "Just use it directly",
              "Convert it: int(\"100\")",
              "Remove the quotes from the code",
              "Use float(100)",
            ],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m3-intro4",
        title: "Type Identification Challenge",
        type: "quiz",
        content: `
# Type Detective Challenge 🕵️

Let's practice identifying types from values. This skill is essential for debugging!

## Quick Reference

- **Integers**: Whole numbers without quotes: \`42\`, \`-7\`, \`0\`
- **Floats**: Numbers with decimals: \`3.14\`, \`0.0\`, \`-2.5\`
- **Strings**: Anything in quotes: \`"hello"\`, \`"42"\`, \`""\`
- **Booleans**: \`True\` or \`False\` (capitalized, no quotes)

## Tricky Cases

| Value | Type | Why? |
|-------|------|------|
| \`42\` | int | No quotes, no decimal |
| \`"42"\` | str | Has quotes |
| \`42.0\` | float | Has decimal point |
| \`True\` | bool | Special keyword |
| \`"True"\` | str | Has quotes! |
| \`0\` | int | Zero is an integer |
| \`0.0\` | float | Zero with decimal |

## Variables Don't Change Type Names

\`\`\`python
my_number = 5
# my_number is an int (because 5 is an int)

my_text = "five"
# my_text is a str (because "five" is a str)
\`\`\`

The variable's type comes from its value!

## Test Yourself

Before answering, think carefully about each value!
        `,
        goal: "Practice identifying types from values.",
        startingCode: "",
        objective: "Become confident identifying Python types.",
        quizQuestions: [
          {
            id: "m3i4-q1",
            text: 'What type is: "3.14"?',
            options: ["int", "float", "str", "bool"],
            correctAnswerIndex: 2,
          },
          {
            id: "m3i4-q2",
            text: "What type is: False?",
            options: ["int", "str", "float", "bool"],
            correctAnswerIndex: 3,
          },
          {
            id: "m3i4-q3",
            text: 'What type is: "False"?',
            options: ["bool", "str", "None", "Error"],
            correctAnswerIndex: 1,
          },
          {
            id: "m3i4-q4",
            text: "What type is: 7.0?",
            options: ["int", "float", "str", "bool"],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m3-l1",
        title: "Integers vs Strings",
        content: `
Data types matter! 
*   **Integer (int):** A whole number for math. \`5\`
*   **String (str):** Text characters. \`"5"\`

You cannot do math on strings directly in the same way.
\`"5" + "5"\` results in \`"55"\` (text gluing), not \`10\` (math addition).

**Example:**
\`\`\`python
print(5 + 5)     # 10 (Math)
print("5" + "5") # 55 (Concatenation)
\`\`\`
        `,
        goal: 'Create a variable `num` with the integer 100. Create a variable `text` with the string "100". Print `num + num` and then `text + text` to see the difference.',
        startingCode: `# Your code here`,
        objective: 'User must print 200 and "100100" in that order.',
        expectedOutput: "200\n100100",
        commonMistakes: `
*   **Confusing Quotes:** \`num = "100"\` makes it a string. \`num = 100\` makes it an integer.
*   **Type Error:** Trying \`print(10 + "10")\` causes an error. You can't add numbers to text directly.
        `,
      },
      {
        id: "m3-l2",
        title: "Floats (Decimals)",
        content: `
When you need precision, use **Floats**. These are numbers with decimal points.
Even if the decimal is zero (\`5.0\`), Python treats it as a float.

**Pro Tip:** Dividing two integers *always* results in a float in Python.
\`10 / 2\` becomes \`5.0\`.
        `,
        goal: "Create `price = 9.99`. Calculate `tax = price * 0.1`. Create `total = price + tax`. Print the `total`.",
        startingCode: `# Your code here`,
        objective: "User must perform float math. 9.99 + 0.999 = 10.989.",
        expectedOutput: "10.989",
        commonMistakes: `
*   **Using Commas:** \`9,99\` is not a number in Python. Use a dot \`9.99\`.
*   **Variable naming:** Ensure you use the exact variable names for the calculation.
        `,
      },
      {
        id: "m3-l3",
        title: "String Concatenation",
        content: `
"Concatenation" is a fancy word for joining strings together using the \`+\` operator.
**Crucial:** Python does not add spaces automatically. You must include them yourself.

**Example:**
\`\`\`python
a = "Super"
b = "man"
print(a + b) # Superman
print(a + " " + b) # Super man
\`\`\`
        `,
        goal: 'Create variables: `greeting="Hi"`, `name="User"`, `emoji=":)"`. Combine them to print exactly: "Hi, User! :)"',
        startingCode: `greeting = "Hi"\nname = "User"\nemoji = ":)"\n# Combine and print`,
        objective:
          "User must concatenate variables with strict formatting, including the comma and space.",
        expectedOutput: "Hi, User! :)",
        commonMistakes: `
*   **Forgetting Separators:** You often need to manually add \`" "\` or \`", "\` between variables.
*   **Adding Numbers:** If you try to add a number to these strings, it will fail.
        `,
      },
      {
        id: "m3-l4",
        title: "Type Conversion (Casting)",
        content: `
Sometimes you have a string \`"50"\` (like from user input) but you need to do math on it. You can convert types using functions:
*   \`int("50")\` -> \`50\` (String to Integer)
*   \`str(50)\` -> \`"50"\` (Integer to String)
*   \`float("3.14")\` -> \`3.14\` (String to Float)

**Example:**
\`\`\`python
age_text = "20"
age_num = int(age_text) + 1
print(age_num) # 21
\`\`\`
        `,
        goal: 'You are given `s_points = "500"`. Convert it to an integer, add 50 to it, convert the result BACK to a string, and print it.',
        startingCode: `s_points = "500"\n# Convert, add, convert back, print`,
        objective:
          'User must cast string->int, add, then int->string, then print "550".',
        expectedOutput: "550",
        commonMistakes: `
*   **Forgetting Reassignment:** \`int(s_points)\` doesn't change the variable itself, it just returns a number. You must save it: \`points = int(s_points)\`.
*   **Invalid Conversion:** \`int("hello")\` will crash because "hello" isn't a number.
        `,
      },
      {
        id: "m3-l5",
        title: "Input",
        content: `
Programs are interactive. The \`input()\` function pauses the program and waits for the user to type something.
**Important:** \`input()\` ALWAYS returns a **string**, even if the user types a number.

**Example:**
\`\`\`python
name = input("Who are you? ")
print("Hi " + name)
\`\`\`
        `,
        goal: 'Ask the user for their `name` and their `quest`. Then print "Name: [name], Quest: [quest]".',
        startingCode: `# Your code here`,
        objective:
          "User must call input() twice, save results, and print formatted string.",
        commonMistakes: `
*   **Syntax Error:** \`input = "Question"\` destroys the input function. Use parentheses: \`input("Question")\`.
*   **Formatting:** Pay close attention to the commas and colons in the final print statement.
        `,
      },
      {
        id: "m3-final",
        title: "Final Quiz: Data Types",
        type: "quiz",
        content: `
Verify your understanding of strings, integers, floats, and type conversion.
        `,
        goal: "Score 100% to unlock the next module.",
        startingCode: "",
        objective: "Pass the quiz.",
        quizQuestions: [
          {
            id: "m3q1",
            text: 'What is the type of: "10.5"',
            options: ["int", "float", "str", "bool"],
            correctAnswerIndex: 2,
          },
          {
            id: "m3q2",
            text: "Which function converts a string to a number?",
            options: ["str()", "num()", "int()", "convert()"],
            correctAnswerIndex: 2,
          },
          {
            id: "m3q3",
            text: 'What is the result of: "A" + "B"',
            options: ["Error", "AB", "A B", "NaN"],
            correctAnswerIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: "module-4",
    title: "Module 4: Control Flow",
    lessons: [
      {
        id: "m4-intro1",
        title: "How Decisions Work",
        type: "quiz",
        content: `
# Making Your Code Smart 🧠

So far, your programs run every line, top to bottom. But real programs need to make **decisions**!

## The Basic Idea

\`\`\`python
if it_is_raining:
    bring_umbrella()
\`\`\`

The code inside the \`if\` block only runs when the condition is **True**.

## True and False

Every decision is based on a **Boolean** value: \`True\` or \`False\`.

\`\`\`python
is_sunny = True    # Yes, it's sunny
is_raining = False # No, it's not raining
\`\`\`

## Comparison Creates Booleans

\`\`\`python
5 > 3     # True (5 is greater than 3)
5 < 3     # False (5 is NOT less than 3)
5 == 5    # True (5 equals 5)
5 != 3    # True (5 is NOT equal to 3)
\`\`\`

## Real-World Examples

| Scenario | Code Representation |
|----------|---------------------|
| User is logged in | \`if logged_in:\` |
| Score over 100 | \`if score > 100:\` |
| Password matches | \`if password == "secret":\` |
| Lives not zero | \`if lives != 0:\` |

## The Power of If

Without \`if\`, programs can only do one thing.
With \`if\`, programs can react to different situations!
        `,
        goal: "Understand how conditional logic works.",
        startingCode: "",
        objective: "Learn the concept of Boolean decisions.",
        quizQuestions: [
          {
            id: "m4i1-q1",
            text: "What type of value does every if condition evaluate to?",
            options: ["String", "Integer", "Boolean (True/False)", "Float"],
            correctAnswerIndex: 2,
          },
          {
            id: "m4i1-q2",
            text: "What is the result of: 10 > 5?",
            options: ["True", "False", "10", "5"],
            correctAnswerIndex: 0,
          },
          {
            id: "m4i1-q3",
            text: "What operator checks if two values are equal?",
            options: ["=", "==", "!=", ">="],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m4-intro2",
        title: "Understanding Code Branching",
        type: "quiz",
        content: `
# Code Paths: Branching 🌳

When you use \`if/else\`, your code splits into different **paths**. Only ONE path runs!

## Visualizing if/else

\`\`\`
        ┌─────────────┐
        │  condition  │
        └──────┬──────┘
               │
      ┌────────┴────────┐
      │                 │
   [True]            [False]
      │                 │
      ▼                 ▼
┌───────────┐    ┌───────────┐
│ if block  │    │ else block│
└───────────┘    └───────────┘
      │                 │
      └────────┬────────┘
               │
               ▼
        [continues...]
\`\`\`

## Trace Example

\`\`\`python
age = 15
if age >= 18:
    print("Adult")
else:
    print("Minor")
print("Done")
\`\`\`

**Trace:**
1. age = 15 ✓
2. Is 15 >= 18? → **False**
3. Skip "Adult" block
4. Enter else block → print "Minor"
5. Continue → print "Done"

**Output:**
\`\`\`
Minor
Done
\`\`\`

## Key Insight

The \`else\` block is SKIPPED when condition is True!
The \`if\` block is SKIPPED when condition is False!

Only ONE branch ever runs.
        `,
        goal: "Understand how code branches work.",
        startingCode: "",
        objective: "Learn to trace through branching code.",
        quizQuestions: [
          {
            id: "m4i2-q1",
            text: "In if/else, how many branches can run?",
            options: ["Both always run", "Only the if runs", "Only one runs", "Neither runs"],
            correctAnswerIndex: 2,
          },
          {
            id: "m4i2-q2",
            text: "If the condition is False, which block runs?",
            options: ["The if block", "The else block", "Both blocks", "None"],
            correctAnswerIndex: 1,
          },
          {
            id: "m4i2-q3",
            text: "After if/else completes, what happens?",
            options: [
              "Program ends",
              "Loop restarts",
              "Code continues to next line",
              "Error occurs",
            ],
            correctAnswerIndex: 2,
          },
        ],
      },
      {
        id: "m4-intro3",
        title: "Loop Visualization",
        type: "quiz",
        content: `
# Understanding Loops 🔄

Loops let you repeat code without copy-pasting. Let's visualize how they work!

## The For Loop Flow

\`\`\`
┌──────────────────┐
│ for i in range(3)│
└────────┬─────────┘
         │
         ▼
    ┌────────────┐
    │  i = 0     │ ──▶ Run block ──▶ Back to top
    │  i = 1     │ ──▶ Run block ──▶ Back to top
    │  i = 2     │ ──▶ Run block ──▶ Back to top
    │  (done)    │
    └────────────┘
         │
         ▼
   [Code continues]
\`\`\`

## Trace: Counting Loop

\`\`\`python
for i in range(3):
    print(i)
print("Done")
\`\`\`

| Iteration | i value | Output |
|-----------|---------|--------|
| 1st | 0 | 0 |
| 2nd | 1 | 1 |
| 3rd | 2 | 2 |
| (exit) | - | Done |

## Understanding range()

\`range(n)\` generates: 0, 1, 2, ..., n-1

| Code | Numbers Generated |
|------|-------------------|
| \`range(3)\` | 0, 1, 2 |
| \`range(5)\` | 0, 1, 2, 3, 4 |
| \`range(1, 4)\` | 1, 2, 3 |

**Remember:** range(n) stops BEFORE n!
        `,
        goal: "Visualize how loops execute.",
        startingCode: "",
        objective: "Understand loop execution flow.",
        quizQuestions: [
          {
            id: "m4i3-q1",
            text: "How many times does range(5) loop?",
            options: ["4 times", "5 times", "6 times", "Depends on condition"],
            correctAnswerIndex: 1,
          },
          {
            id: "m4i3-q2",
            text: "What values does range(3) produce?",
            options: ["1, 2, 3", "0, 1, 2", "0, 1, 2, 3", "1, 2"],
            correctAnswerIndex: 1,
          },
          {
            id: "m4i3-q3",
            text: "What happens after the loop finishes all iterations?",
            options: [
              "Program ends",
              "Loop restarts",
              "Code continues to next line",
              "Error",
            ],
            correctAnswerIndex: 2,
          },
        ],
      },
      {
        id: "m4-intro4",
        title: "Choosing the Right Loop",
        type: "quiz",
        content: `
# For vs While: When to Use Each 🤔

Python has two main loops. Each has its ideal use case.

## For Loop: Known Number of Iterations

Use \`for\` when you know HOW MANY times to repeat:

\`\`\`python
# Print 5 stars
for i in range(5):
    print("⭐")

# Process each item in a list
for item in shopping_list:
    print(item)
\`\`\`

## While Loop: Until a Condition Changes

Use \`while\` when you repeat UNTIL something happens:

\`\`\`python
# Keep asking until correct
password = ""
while password != "secret":
    password = input("Enter password: ")

# Game loop running forever
while game_running:
    handle_input()
\`\`\`

## Quick Decision Guide

| Situation | Use |
|-----------|-----|
| "Do this 10 times" | for |
| "Do this for each item" | for |
| "Keep going until X" | while |
| "Unknown number of tries" | while |

## Warning: Infinite Loops!

\`\`\`python
# DANGER: This never stops!
while True:
    print("Forever!")

# SAFE: This will stop
count = 5
while count > 0:
    print(count)
    count = count - 1  # Eventually becomes 0
\`\`\`

Always ensure your while loop can exit!
        `,
        goal: "Learn when to use for vs while loops.",
        startingCode: "",
        objective: "Understand the difference between loop types.",
        quizQuestions: [
          {
            id: "m4i4-q1",
            text: "Which loop is best for \"repeat 10 times\"?",
            options: ["while", "for", "Either works equally well", "Neither"],
            correctAnswerIndex: 1,
          },
          {
            id: "m4i4-q2",
            text: "Which loop is best for \"repeat until password correct\"?",
            options: ["for", "while", "Neither can do this", "Both required"],
            correctAnswerIndex: 1,
          },
          {
            id: "m4i4-q3",
            text: "What causes an infinite loop?",
            options: [
              "Using range()",
              "A condition that never becomes False",
              "Using break",
              "Too many variables",
            ],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m4-l1",
        title: "If/Else Logic",
        content: `
Code often needs to make decisions. We use \`if\` statements for this.
**Indentation is mandatory** in Python. The code inside the \`if\` block must be pushed in (usually 4 spaces or 1 tab).

**Structure:**
\`\`\`python
if condition:
    # This runs if True
else:
    # This runs if False
\`\`\`
        `,
        goal: 'Create `battery = 15`. If battery is less than 20, print "Low". Else, print "Good". Then change battery to 80 and copy the if/else block to check again.',
        startingCode: `battery = 15\n# Write logic, then update battery and repeat`,
        objective:
          "User must write correct if/else logic and run it against two different values (15 and 80).",
        expectedOutput: "Low\nGood",
        commonMistakes: `
*   **Missing Colon:** You must put a \`:\` after the condition and after \`else\`.
*   **Bad Indentation:** The print statements MUST be indented. \`else\` must be aligned with \`if\`.
*   **Comparison:** Use \`<\` for less than.
        `,
      },
      {
        id: "m4-l2",
        title: "Multiple Conditions (Elif)",
        content: `
Life isn't always black and white (True/False). Sometimes there are many options. Use \`elif\` (Else If).
Python checks conditions from top to bottom. As soon as one is True, it runs that block and **skips the rest**.

**Example:**
\`\`\`python
place = 2
if place == 1:
    print("Gold")
elif place == 2:
    print("Silver")
else:
    print("Participant")
\`\`\`
        `,
        goal: 'Create `temp = 25`. If temp > 30 print "Hot". Elif temp > 20 print "Nice". Elif temp > 10 print "Cool". Else print "Cold".',
        startingCode: `temp = 25\n# Write chain logic`,
        objective:
          'User must implement the elif chain correctly. For 25, it should print "Nice".',
        expectedOutput: "Nice",
        commonMistakes: `
*   **Order Matters:** If you checked \`temp > 10\` first, it would be True for 25, and "Cool" would print. Order from specific/highest to lowest.
*   **Syntax:** \`else if\` is invalid in Python. Use \`elif\`.
        `,
      },
      {
        id: "m4-l3",
        title: "The For Loop",
        content: `
Don't copy-paste code to run it multiple times. Use a loop.
The \`range(start, stop)\` function generates numbers.
*   It starts at \`start\`.
*   It stops **before** \`stop\`.

**Example:**
\`\`\`python
# Prints 1, 2, 3
for i in range(1, 4):
    print(i)
\`\`\`
        `,
        goal: "Calculate the sum of numbers from 1 to 10 using a loop. Create a variable `total = 0` before the loop, add `i` to it inside the loop, and print `total` at the end.",
        startingCode: `total = 0\n# Loop 1 to 10 and add to total\n# Print total`,
        objective:
          "User must accumulate sum (55) using a loop. High complexity increase.",
        expectedOutput: "55",
        commonMistakes: `
*   **Range Stop:** \`range(1, 10)\` stops at 9. Use \`range(1, 11)\` to include 10.
*   **Indentation:** The print statement for the result must be *outside* (unindented) the loop, or it will print every step.
        `,
      },
      {
        id: "m4-l4",
        title: "The While Loop",
        content: `
A \`while\` loop keeps running as long as its condition is True.
**Warning:** If you don't change the variable inside the loop so the condition eventually becomes False, it will run forever (Infinite Loop).

**Example:**
\`\`\`python
fuel = 5
while fuel > 0:
    print("Driving...")
    fuel = fuel - 1 # Important!
\`\`\`
        `,
        goal: 'Create `n = 10`. While `n` is greater than 0, print `n`, then subtract 2 from `n`. Finally print "Done".',
        startingCode: `n = 10\n# While loop`,
        objective: "User must print 10, 8, 6, 4, 2, Done.",
        expectedOutput: "10\n8\n6\n4\n2\nDone",
        commonMistakes: `
*   **Infinite Loop:** Forgetting \`n = n - 2\` will make the loop run forever because 10 is always > 0.
*   **Logic:** \`n - 2\` alone does nothing. You must assign it: \`n = n - 2\`.
        `,
      },
      {
        id: "m4-final",
        title: "Final Project: Grade Checker",
        content: `
Let's combine user input (from previous lessons) with logic.
You need to determine a letter grade based on a score.
        `,
        goal: 'Create a variable `score = 85`. If score >= 90 print "A". Elif >= 80 print "B". Else print "C".',
        startingCode: `score = 85\n# Grade logic here`,
        objective: 'Print "B".',
        expectedOutput: "B",
        type: "coding",
      },
    ],
  },
  {
    id: "module-5",
    title: "Module 5: Randomness",
    lessons: [
      {
        id: "m5-intro1",
        title: "What is Randomness?",
        type: "quiz",
        content: `
# Adding Unpredictability 🎲

Games, simulations, and many apps need **randomness**. Let's understand what random means in programming!

## Why Random?

| Application | Use Case |
|-------------|----------|
| Games | Enemy spawn locations, loot drops |
| Security | Password generation |
| Science | Simulations, experiments |
| Art | Generative patterns |

## Computer "Random" vs True Random

Computers are **deterministic** - they follow exact instructions. So how do they generate random numbers?

They use **pseudo-random** number generators:
- Mathematical formulas that produce unpredictable-seeming sequences
- Good enough for games and most applications
- Not truly random (patterns exist if you look hard enough)

## The random Module

Python's \`random\` module gives us tools for randomness:

\`\`\`python
import random

# Random integer between 1 and 6 (inclusive)
dice = random.randint(1, 6)

# Random item from a list
colors = ["red", "blue", "green"]
pick = random.choice(colors)
\`\`\`

## Key Insight

Each time you run code with randomness, you may get **different output**!
This is normal and expected.
        `,
        goal: "Understand the concept of randomness in programming.",
        startingCode: "",
        objective: "Learn why and how we use random numbers.",
        quizQuestions: [
          {
            id: "m5i1-q1",
            text: "Why do games use randomness?",
            options: [
              "To create bugs",
              "To make gameplay unpredictable and exciting",
              "Computers require it",
              "To slow down the game",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m5i1-q2",
            text: "What does 'pseudo-random' mean?",
            options: [
              "Truly random",
              "Not random at all",
              "Appears random but is mathematically generated",
              "Broken random",
            ],
            correctAnswerIndex: 2,
          },
          {
            id: "m5i1-q3",
            text: "What happens when you run random code multiple times?",
            options: [
              "Same output every time",
              "Different output each time (usually)",
              "Error every time",
              "Computer crashes",
            ],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m5-intro2",
        title: "Understanding Imports",
        type: "quiz",
        content: `
# Python's Toolbox System 🧰

Python comes with thousands of tools, but they're not all loaded by default. You need to **import** them!

## Why Not Load Everything?

- **Speed**: Loading thousands of tools would slow down every program
- **Organization**: Keeps code clean and focused
- **Memory**: Only uses resources you actually need

## The import Statement

\`\`\`python
import random  # Now we can use random.anything()
\`\`\`

After importing, you access functions with \`module.function()\`:

\`\`\`python
import random
print(random.randint(1, 10))  # Uses random's randint function
\`\`\`

## Common Modules

| Module | Purpose | Example Function |
|--------|---------|------------------|
| \`random\` | Random numbers | \`random.randint()\` |
| \`math\` | Advanced math | \`math.sqrt()\` |
| \`time\` | Time operations | \`time.sleep()\` |
| \`os\` | Operating system | \`os.listdir()\` |

## Import Once at the Top

Convention: Put all imports at the very top of your file:

\`\`\`python
import random
import math

# ... rest of your code
\`\`\`

This makes it clear what your program needs!
        `,
        goal: "Understand how Python imports work.",
        startingCode: "",
        objective: "Learn the import system.",
        quizQuestions: [
          {
            id: "m5i2-q1",
            text: "Why do we need to import modules?",
            options: [
              "Python is broken without them",
              "To keep programs fast and organized",
              "Random requirement",
              "To make code longer",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m5i2-q2",
            text: "After import random, how do you call randint?",
            options: [
              "randint(1, 6)",
              "random.randint(1, 6)",
              "import.randint(1, 6)",
              "call random randint 1 6",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m5i2-q3",
            text: "Where should import statements go?",
            options: [
              "At the end of the file",
              "At the top of the file",
              "Inside functions",
              "Anywhere randomly",
            ],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m5-intro3",
        title: "Understanding Probability",
        type: "quiz",
        content: `
# Programming Probability 📊

Random functions generate numbers within ranges. Understanding ranges = understanding probability!

## randint(min, max)

Generates any integer from min to max, **inclusive**.

\`\`\`python
random.randint(1, 6)  # Can be 1, 2, 3, 4, 5, or 6
random.randint(0, 1)  # Can be 0 or 1 (coin flip!)
\`\`\`

## Calculating Chances

| Code | Possible Values | Chance of Each |
|------|-----------------|----------------|
| \`randint(1, 2)\` | 1 or 2 | 50% each |
| \`randint(1, 4)\` | 1, 2, 3, or 4 | 25% each |
| \`randint(1, 100)\` | 1 to 100 | 1% each |

## Creating Probability Tiers

Want a 20% chance? Check if the number is small enough:

\`\`\`python
roll = random.randint(1, 100)
if roll <= 20:  # 20 out of 100 = 20%
    print("Rare drop!")
\`\`\`

## Example: Loot Rarity

\`\`\`python
import random
roll = random.randint(1, 100)

if roll <= 5:        # 5% chance
    print("Legendary!")
elif roll <= 20:     # 15% chance (5+15=20)
    print("Rare")
elif roll <= 50:     # 30% chance
    print("Uncommon")
else:                # 50% chance
    print("Common")
\`\`\`
        `,
        goal: "Understand probability in random code.",
        startingCode: "",
        objective: "Learn to create percentage-based chances.",
        quizQuestions: [
          {
            id: "m5i3-q1",
            text: "What is randint(1, 4) equally likely to return?",
            options: [
              "Only 1 or 4",
              "1, 2, 3, or 4",
              "0, 1, 2, 3, or 4",
              "Any number",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m5i3-q2",
            text: "To create a 10% chance with randint(1, 100), what condition?",
            options: [
              "roll == 10",
              "roll <= 10",
              "roll >= 10",
              "roll = 10",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m5i3-q3",
            text: "randint(1, 6) simulates what real object?",
            options: ["A coin", "A 6-sided dice", "A card", "A roulette wheel"],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m5-intro4",
        title: "Debugging Random Code",
        type: "quiz",
        content: `
# Testing the Unpredictable 🐛

Random code is tricky to test because output changes! Here's how to handle it.

## The Challenge

\`\`\`python
roll = random.randint(1, 6)
print(roll)  # Could be anything 1-6!
\`\`\`

How do you know if something is "wrong" when the output is supposed to vary?

## Strategy 1: Check the Range

Your random numbers should stay within their range:

\`\`\`python
roll = random.randint(1, 6)
# roll should NEVER be 0 or 7
# If it is, there's a bug!
\`\`\`

## Strategy 2: Test Many Times

Run code in a loop to see all possibilities:

\`\`\`python
for i in range(20):
    roll = random.randint(1, 6)
    print(roll)
# After many runs, you should see 1s, 2s, 3s, 4s, 5s, AND 6s
\`\`\`

## Common Random Bugs

| Bug | Code | Problem |
|-----|------|---------|
| Off-by-one | \`randint(1, 5)\` when you wanted 1-6 | Missing highest value |
| Wrong range | \`randint(0, 6)\` for dice | 0 is not on a dice! |
| Not importing | \`randint(1, 6)\` | NameError without import |

## Pro Tip: Set a Seed for Testing

\`\`\`python
random.seed(42)  # Makes random predictable
print(random.randint(1, 6))  # Always same result with this seed
\`\`\`

Useful for debugging, but remove for production!
        `,
        goal: "Learn how to debug random code.",
        startingCode: "",
        objective: "Understand strategies for testing randomness.",
        quizQuestions: [
          {
            id: "m5i4-q1",
            text: "What's the main challenge with testing random code?",
            options: [
              "It runs slowly",
              "Output changes each run",
              "Python doesn't allow it",
              "Random is always buggy",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m5i4-q2",
            text: "If randint(1, 6) returns 0, what happened?",
            options: [
              "Normal behavior",
              "Bug - wrong range was probably used",
              "Computer is broken",
              "Random is truly random",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m5i4-q3",
            text: "What does random.seed() do?",
            options: [
              "Plants a garden",
              "Makes random output predictable for testing",
              "Speeds up random",
              "Crashes the program",
            ],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m5-l1",
        title: "Importing Modules",
        content: `
Python has a "battery included" philosophy. It comes with many tools (modules) installed, but you have to load them to keep your program lightweight.
To use random numbers, we \`import random\`.

\`\`\`python
import random
roll = random.randint(1, 6) # 1 to 6 inclusive
\`\`\`
        `,
        goal: 'Simulate a coin toss. Generate a random number 0 or 1. If 0, print "Heads". If 1, print "Tails".',
        startingCode: `# Import and logic`,
        objective: "User must import random, generate int, and use if/else.",
        commonMistakes: `
*   **Missing Import:** You must write \`import random\`.
*   **Function Name:** It is \`randint\`, not \`randomInt\`.
        `,
      },
      {
        id: "m5-l2",
        title: "Random Chance Logic",
        content: `
Games rely on randomness. We can combine \`random\` with \`if\` statements to create probability.

**Example:**
\`\`\`python
# 10% chance (1 in 10)
if random.randint(1, 10) == 1:
    print("Rare drop!")
\`\`\`
        `,
        goal: 'Simulate a weather system. Generate a number 1-100. If < 20, print "Storm". Elif < 80, print "Cloudy". Else print "Sunny".',
        startingCode: `import random\n# Logic here`,
        objective:
          "User must implement percentage chance logic correctly with multiple tiers.",
        commonMistakes: `
*   **Logic Gaps:** Ensure your ranges cover all numbers 1-100.
*   **Comparison:** \`<\` 20 covers 1-19.
        `,
      },
      {
        id: "m5-l3",
        title: "Shuffling Lists",
        content: `
Want to mix up a playlist or a deck of cards? Use \`random.shuffle()\`.
**Note:** This modifies the list *in place*. It doesn't return a new list.

\`\`\`python
deck = ["A", "K", "Q", "J"]
random.shuffle(deck) # Changes 'deck' directly
print(deck)
\`\`\`
        `,
        goal: "Create a list of 5 distinct numbers. Shuffle them. Print the list. Then shuffle again. Print again.",
        startingCode: `import random\nnums = [1, 2, 3, 4, 5]\n# Shuffle, print, shuffle, print`,
        objective:
          "User must apply shuffle twice and print twice to observe changes.",
        commonMistakes: `
*   **Assignment Error:** \`new_list = random.shuffle(nums)\` is wrong. \`new_list\` will be \`None\`. Just call the function.
        `,
      },
      {
        id: "m5-l4",
        title: "Random Choice",
        content: `
If you just want to pick *one* winner from a list, use \`random.choice()\`.

\`\`\`python
menu = ["Pizza", "Burger", "Salad"]
dinner = random.choice(menu)
\`\`\`
        `,
        goal: 'Create a list of 3 moves: "Rock", "Paper", "Scissors". Pick a random move for the computer and print "Computer chose: [move]".',
        startingCode: `import random\nmoves = ["Rock", "Paper", "Scissors"]\n# Logic`,
        objective: "User must use random.choice and string concatenation.",
        commonMistakes: `
*   **Choice vs Randint:** You don't need numbers here. \`choice\` picks the item directly.
        `,
      },
      {
        id: "m5-final",
        title: "Final Quiz: Randomness",
        type: "quiz",
        content: "Test your luck and knowledge.",
        goal: "Pass to unlock the next module.",
        startingCode: "",
        objective: "Pass quiz.",
        quizQuestions: [
          {
            id: "m5q1",
            text: "Which function picks one item from a list?",
            options: [
              "random.pick()",
              "random.choice()",
              "random.one()",
              "random.select()",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m5q2",
            text: "Does random.shuffle(list) return a new list?",
            options: [
              "Yes",
              "No, it modifies in place",
              "Sometimes",
              "It returns a boolean",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m5q3",
            text: "What range does random.randint(1, 5) cover?",
            options: ["1 to 4", "0 to 5", "1 to 5 (inclusive)", "1 to 6"],
            correctAnswerIndex: 2,
          },
        ],
      },
    ],
  },
  {
    id: "module-6",
    title: "Module 6: Functions",
    lessons: [
      {
        id: "m6-intro1",
        title: "Why Functions Exist",
        type: "quiz",
        content: `
# The DRY Principle 🔄

Functions are one of the most important concepts in programming. They solve a major problem!

## The Problem: Repetition

Imagine you need to greet three users:

\`\`\`python
# Without functions (BAD!)
print("Welcome!")
print("Have a great day!")

print("Welcome!")
print("Have a great day!")

print("Welcome!")
print("Have a great day!")
\`\`\`

This is repetitive, error-prone, and hard to maintain!

## The Solution: Functions

\`\`\`python
def greet():
    print("Welcome!")
    print("Have a great day!")

greet()
greet()
greet()
\`\`\`

**DRY = Don't Repeat Yourself**

## Benefits of Functions

| Benefit | Explanation |
|---------|-------------|
| **Reusability** | Write once, use many times |
| **Maintainability** | Change one place, affects everywhere |
| **Readability** | Give code meaningful names |
| **Organization** | Break big programs into parts |

## Real-World Analogy

Functions are like recipes:
- Define the recipe once
- Follow it whenever you want that dish
- Change the recipe, and all future dishes change too!
        `,
        goal: "Understand why we use functions.",
        startingCode: "",
        objective: "Learn the DRY principle and function benefits.",
        quizQuestions: [
          {
            id: "m6i1-q1",
            text: "What does DRY stand for?",
            options: [
              "Do Run Yesterday",
              "Don't Repeat Yourself",
              "Define Run Yield",
              "Debug Repeat Yes",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m6i1-q2",
            text: "What's wrong with copying the same code many times?",
            options: [
              "Nothing, it's fine",
              "Hard to maintain, easy to make mistakes",
              "Computer can't run it",
              "Python doesn't allow it",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m6i1-q3",
            text: "If you need to change greeting behavior, where do you change it?",
            options: [
              "Every place you copied it",
              "Just the function definition",
              "In a config file",
              "You can't change it",
            ],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m6-intro2",
        title: "Anatomy of a Function",
        type: "quiz",
        content: `
# Building Blocks of Functions 🧱

Let's break down every part of a function!

## The Structure

\`\`\`python
def greet(name):
    message = "Hello, " + name
    print(message)

greet("Alice")
\`\`\`

## Part by Part

| Part | Example | Purpose |
|------|---------|---------|
| Keyword | \`def\` | Tells Python we're defining a function |
| Name | \`greet\` | What we call the function |
| Parameters | \`(name)\` | Input the function accepts |
| Colon | \`:\` | Marks the start of the body |
| Body | Indented lines | The code that runs |
| Call | \`greet("Alice")\` | Actually runs the function |

## Definition vs Call

**Definition**: Creating the function (like writing a recipe)
\`\`\`python
def say_hi():     # This doesn't print anything yet!
    print("Hi!")
\`\`\`

**Call**: Using the function (like cooking the recipe)
\`\`\`python
say_hi()  # NOW it prints "Hi!"
\`\`\`

## Parameters: Making Functions Flexible

Without parameters: Function always does the same thing
\`\`\`python
def greet():
    print("Hello, World!")
\`\`\`

With parameters: Function can handle different data
\`\`\`python
def greet(name):
    print("Hello, " + name + "!")
\`\`\`
        `,
        goal: "Learn the parts of a function.",
        startingCode: "",
        objective: "Understand function structure.",
        quizQuestions: [
          {
            id: "m6i2-q1",
            text: "Which keyword starts a function definition?",
            options: ["function", "def", "func", "define"],
            correctAnswerIndex: 1,
          },
          {
            id: "m6i2-q2",
            text: "Does defining a function run its code?",
            options: [
              "Yes, immediately",
              "No, only when you call it",
              "It depends",
              "Only once",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m6i2-q3",
            text: "What goes inside the parentheses in a definition?",
            options: [
              "The function name",
              "Nothing ever",
              "Parameters (inputs)",
              "The output",
            ],
            correctAnswerIndex: 2,
          },
        ],
      },
      {
        id: "m6-intro3",
        title: "Understanding Return",
        type: "quiz",
        content: `
# Getting Values Back 📤

Functions can give values back to the code that called them. This is called **returning**!

## Print vs Return

**Print**: Shows something to the human
**Return**: Sends a value back to the program

\`\`\`python
# Print version - shows "6"
def add_print(a, b):
    print(a + b)

# Return version - gives 6 back
def add_return(a, b):
    return a + b
\`\`\`

## Why Return Matters

\`\`\`python
# With print - can't use the result
def add_print(a, b):
    print(a + b)

result = add_print(2, 3)  # result is None!

# With return - can use the result
def add_return(a, b):
    return a + b

result = add_return(2, 3)  # result is 5
result = result * 2        # Now 10!
\`\`\`

## Trace Through

\`\`\`python
def double(n):
    return n * 2

x = double(5)  # x becomes 10
y = double(x)  # y becomes 20
print(y)       # Outputs: 20
\`\`\`

| Line | What Happens |
|------|--------------|
| x = double(5) | double runs, returns 10, x = 10 |
| y = double(x) | double runs with 10, returns 20, y = 20 |
| print(y) | Outputs 20 |

## Return Ends the Function

\`\`\`python
def test():
    return 5
    print("Never runs!")  # This line is skipped!
\`\`\`
        `,
        goal: "Understand return statements.",
        startingCode: "",
        objective: "Learn the difference between print and return.",
        quizQuestions: [
          {
            id: "m6i3-q1",
            text: "What does return do?",
            options: [
              "Prints a value",
              "Sends a value back to the caller",
              "Ends the program",
              "Starts a loop",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m6i3-q2",
            text: "If a function prints but doesn't return, what is its return value?",
            options: ["0", "The printed value", "None", "Error"],
            correctAnswerIndex: 2,
          },
          {
            id: "m6i3-q3",
            text: "What happens to code after a return statement?",
            options: [
              "It runs normally",
              "It never runs",
              "It runs twice",
              "It causes an error",
            ],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m6-intro4",
        title: "Variable Scope Explained",
        type: "quiz",
        content: `
# Where Variables Live 🏠

Variables have **scope** - they only exist in certain parts of your code!

## Local vs Global

**Local**: Created inside a function, only exists there
**Global**: Created outside functions, exists everywhere

\`\`\`python
global_var = "I'm global!"  # Lives everywhere

def my_function():
    local_var = "I'm local!"  # Only lives in this function
    print(global_var)  # ✅ Can see global
    print(local_var)   # ✅ Can see local

my_function()
print(global_var)  # ✅ Can see global
print(local_var)   # ❌ ERROR! local_var doesn't exist here
\`\`\`

## Visualizing Scope

\`\`\`
┌─────────────────────────────────────┐
│ GLOBAL SCOPE                        │
│  global_var = "..."                 │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ my_function SCOPE             │  │
│  │   local_var = "..."           │  │
│  │   Can see: local_var ✅       │  │
│  │   Can see: global_var ✅      │  │
│  └───────────────────────────────┘  │
│                                     │
│  Can see: global_var ✅             │
│  Can see: local_var ❌              │
└─────────────────────────────────────┘
\`\`\`

## Same Name, Different Variables

\`\`\`python
x = 10  # Global x

def test():
    x = 5  # Local x (different variable!)
    print(x)  # Prints 5

test()
print(x)  # Prints 10 (global unchanged!)
\`\`\`

The local \`x\` "shadows" the global one inside the function.
        `,
        goal: "Understand variable scope.",
        startingCode: "",
        objective: "Learn about local and global variables.",
        quizQuestions: [
          {
            id: "m6i4-q1",
            text: "Where does a local variable exist?",
            options: [
              "Everywhere in the program",
              "Only inside the function where it was created",
              "Only in the global scope",
              "In all functions",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m6i4-q2",
            text: "Can code inside a function see global variables?",
            options: ["Yes", "No", "Only with import", "Only with return"],
            correctAnswerIndex: 0,
          },
          {
            id: "m6i4-q3",
            text: "If a function creates x = 5, does it change a global x = 10?",
            options: [
              "Yes, x becomes 5 everywhere",
              "No, they are different variables",
              "It causes an error",
              "Both become 15",
            ],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m6-l1",
        title: "Defining Functions",
        content: `
As your code gets longer, you'll find yourself copying the same lines. Stop!
**Functions** let you name a block of code and reuse it.

1.  Use keyword \`def\`.
2.  Name the function (use snake_case).
3.  Add \`():\`
4.  Indent the code belonging to the function.

\`\`\`python
def launch_alert():
    print("Warning!")
    print("Launch detected.")
\`\`\`
        `,
        goal: 'Define a function `greet` that prints "Hello". Then call the function 3 times.',
        startingCode: `# Define and call 3 times`,
        objective:
          "User must define the function correctly and invoke it multiple times.",
        expectedOutput: "Hello\nHello\nHello",
        commonMistakes: `
*   **Not Calling It:** Defining a function doesn't run it. You must write \`greet()\` unindented at the bottom.
*   **Indentation:** The code inside the function must be indented.
        `,
      },
      {
        id: "m6-l2",
        title: "Parameters",
        content: `
Functions are powerful when they can handle different data. We use **parameters** (variables inside the parentheses) to pass data in.

\`\`\`python
def welcome(name):
    # 'name' only exists inside here
    print("Welcome, " + name)

welcome("Neo") # "Neo" is the argument
welcome("Trinity")
\`\`\`
        `,
        goal: "Define a function `add_score(current, points)` that prints the result of `current + points`. Call it with (100, 50) and (0, 10).",
        startingCode: `# Define function with 2 parameters`,
        objective: "User must handle two parameters, perform math, and print.",
        expectedOutput: "150\n10",
        commonMistakes: `
*   **Argument Count:** You must pass exactly 2 values if you defined 2 parameters.
*   **Variable Scope:** Don't try to use variables from outside the function if you didn't pass them in.
        `,
      },
      {
        id: "m6-l3",
        title: "The Return Statement",
        content: `
Printing is useful for humans, but often we want a function to calculate a value and give it back to the program to use later. We use \`return\`.
**Note:** \`return\` ends the function immediately.

\`\`\`python
def double_it(x):
    return x * 2

val = double_it(10) # val becomes 20
print(val + 5)      # 25
\`\`\`
        `,
        goal: "Write a function `to_seconds(minutes)` that returns `minutes * 60`. Call it with 5, save the result to a variable, and print the result.",
        startingCode: `# Define and use return`,
        objective:
          "User must return the calculation, capture it in a variable, and print it. Result: 300.",
        expectedOutput: "300",
        commonMistakes: `
*   **Print vs Return:** If you print inside the function, the variable \`val\` will be \`None\`. You MUST use \`return\`.
*   **Unreachable Code:** Code written after the \`return\` line will never run.
        `,
      },
      {
        id: "m6-l4",
        title: "Scope",
        content: `
Variables created *inside* a function are **local**. They disappear when the function finishes.
Variables created *outside* are **global**.

\`\`\`python
def test():
    secret = 123 # Local

test()
print(secret) # Error! 'secret' doesn't exist here.
\`\`\`
        `,
        goal: 'Create a global variable `msg = "Global"`. Define a function that creates a local variable `msg = "Local"` and prints it. Call the function, then print `msg` outside to see they are different.',
        startingCode: `msg = "Global"\n# Define function, print inside, call it, print outside`,
        objective:
          'User must demonstrate shadowing variables. Output should be "Local" then "Global".',
        expectedOutput: "Local\nGlobal",
        commonMistakes: `
*   **Confusion:** Changing the local \`msg\` does NOT change the global \`msg\`.
        `,
      },
      {
        id: "m6-final",
        title: "Final Project: Temperature Converter",
        content: `
Create a utility function to convert Celsius to Fahrenheit.
Formula: (C * 9/5) + 32
        `,
        goal: "Define `convert(c)` that returns the F value. Call it with `convert(0)` and print the result (should be 32.0).",
        startingCode: `# Define function`,
        objective: "Implement function with return and call it.",
        expectedOutput: "32.0",
        type: "coding",
      },
    ],
  },
  {
    id: "module-7",
    title: "Module 7: Logic & Operators",
    lessons: [
      {
        id: "m7-intro1",
        title: "Boolean Logic Explained",
        type: "quiz",
        content: `
# The Logic of True and False 🔌

Boolean logic is the foundation of all computer decisions. Let's master it!

## Boolean Values

There are only two: \`True\` and \`False\` (capitalized in Python!)

\`\`\`python
is_sunny = True
is_raining = False
\`\`\`

## Comparison Operators

These operators PRODUCE Boolean values:

| Operator | Meaning | Example | Result |
|----------|---------|---------|--------|
| \`==\` | Equals | \`5 == 5\` | True |
| \`!=\` | Not equals | \`5 != 3\` | True |
| \`>\` | Greater than | \`5 > 3\` | True |
| \`<\` | Less than | \`5 < 3\` | False |
| \`>=\` | Greater or equal | \`5 >= 5\` | True |
| \`<=\` | Less or equal | \`3 <= 5\` | True |

## = vs ==

A VERY common mistake:
- \`=\` is **assignment** (put value in variable)
- \`==\` is **comparison** (check if equal)

\`\`\`python
x = 5      # Assignment: x now holds 5
x == 5     # Comparison: returns True
\`\`\`

## Everything Becomes Boolean

When used in \`if\`, Python converts values to Boolean:
- **Falsy**: \`0\`, \`""\`, \`[]\`, \`None\`
- **Truthy**: Everything else

\`\`\`python
if 0:       # False
if 5:       # True
if "":      # False
if "hello": # True
\`\`\`
        `,
        goal: "Understand Boolean values and comparison operators.",
        startingCode: "",
        objective: "Learn the basics of Boolean logic.",
        quizQuestions: [
          {
            id: "m7i1-q1",
            text: "What are the two Boolean values in Python?",
            options: [
              "true and false",
              "True and False",
              "1 and 0",
              "yes and no",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m7i1-q2",
            text: "What is the result of: 10 != 10?",
            options: ["True", "False", "Error", "10"],
            correctAnswerIndex: 1,
          },
          {
            id: "m7i1-q3",
            text: "What's the difference between = and ==?",
            options: [
              "No difference",
              "= assigns, == compares",
              "= compares, == assigns",
              "Both compare",
            ],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m7-intro2",
        title: "Understanding Truth Tables",
        type: "quiz",
        content: `
# AND, OR, NOT: Combining Conditions 🔗

Boolean operators let you combine conditions!

## The NOT Operator

Flips True to False, and False to True.

\`\`\`python
not True   # False
not False  # True
not (5 > 3)  # False (because 5 > 3 is True)
\`\`\`

## The AND Operator

Returns True only if BOTH sides are True.

| A | B | A and B |
|---|---|---------|
| True | True | **True** |
| True | False | False |
| False | True | False |
| False | False | False |

Think: "Both must agree!"

## The OR Operator

Returns True if AT LEAST ONE side is True.

| A | B | A or B |
|---|---|--------|
| True | True | True |
| True | False | True |
| False | True | True |
| False | False | **False** |

Think: "At least one must agree!"

## Real Examples

\`\`\`python
age = 25
has_license = True

# Both conditions must be true
if age >= 18 and has_license:
    print("Can drive!")

# Either condition is enough
if age < 18 or age > 65:
    print("Discount available!")
\`\`\`
        `,
        goal: "Master AND, OR, and NOT operators.",
        startingCode: "",
        objective: "Learn Boolean operators and truth tables.",
        quizQuestions: [
          {
            id: "m7i2-q1",
            text: "What is True and False?",
            options: ["True", "False", "Error", "None"],
            correctAnswerIndex: 1,
          },
          {
            id: "m7i2-q2",
            text: "What is True or False?",
            options: ["True", "False", "Error", "None"],
            correctAnswerIndex: 0,
          },
          {
            id: "m7i2-q3",
            text: "What is not True?",
            options: ["True", "False", "Error", "not"],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m7-intro3",
        title: "Compound Conditions",
        type: "quiz",
        content: `
# Building Complex Logic 🏗️

Real programs need multiple conditions. Let's learn to build them!

## Combining Multiple Checks

\`\`\`python
score = 85
level = 10
is_premium = True

# All three must be true
if score > 80 and level >= 10 and is_premium:
    print("Unlock bonus!")
\`\`\`

## Grouping with Parentheses

Parentheses clarify order:

\`\`\`python
# Is this (A and B) or C?
# Or is it A and (B or C)?

if (age > 18 and has_id) or is_vip:
    print("Entry allowed")

# Different meaning!
if age > 18 and (has_id or is_vip):
    print("Different logic!")
\`\`\`

## Common Patterns

| Pattern | When to Use |
|---------|-------------|
| A and B | Both must be true |
| A or B | Either works |
| not A | Opposite condition |
| (A or B) and C | At least one of A/B, plus C |

## Short-Circuit Evaluation

Python stops early when possible:

\`\`\`python
# If first is False, and never checks second
if False and some_slow_function():  # some_slow_function() never runs!
    pass

# If first is True, or never checks second
if True or some_slow_function():  # some_slow_function() never runs!
    pass
\`\`\`
        `,
        goal: "Build complex Boolean expressions.",
        startingCode: "",
        objective: "Learn to combine multiple conditions.",
        quizQuestions: [
          {
            id: "m7i3-q1",
            text: "What does (True and True) or False evaluate to?",
            options: ["True", "False", "Error", "Both"],
            correctAnswerIndex: 0,
          },
          {
            id: "m7i3-q2",
            text: "Why use parentheses in Boolean expressions?",
            options: [
              "They're required",
              "To clarify evaluation order",
              "They make code faster",
              "To avoid errors",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m7i3-q3",
            text: "In 'False and X', does X get evaluated?",
            options: [
              "Yes, always",
              "No, Python short-circuits",
              "Depends on X",
              "Causes an error",
            ],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m7-intro4",
        title: "Operator Precedence",
        type: "quiz",
        content: `
# Order of Operations 📐

Just like math has order of operations (PEMDAS), Python has precedence rules!

## The Order (High to Low)

| Priority | Operators | Example |
|----------|-----------|---------|
| 1 (highest) | \`()\` Parentheses | \`(2 + 3) * 4\` |
| 2 | \`**\` Exponent | \`2 ** 3\` |
| 3 | \`*\`, \`/\`, \`//\`, \`%\` | \`10 / 2\` |
| 4 | \`+\`, \`-\` | \`5 + 3\` |
| 5 | \`<\`, \`>\`, \`<=\`, \`>=\`, \`==\`, \`!=\` | \`5 > 3\` |
| 6 | \`not\` | \`not True\` |
| 7 | \`and\` | \`x and y\` |
| 8 (lowest) | \`or\` | \`x or y\` |

## Examples

\`\`\`python
# Math happens before comparison
5 + 3 > 6    # (5 + 3) > 6 → 8 > 6 → True

# Comparison before and/or
5 > 3 and 2 < 4    # (5 > 3) and (2 < 4) → True and True → True

# not before and before or
not True or False and True
# = (not True) or (False and True)
# = False or False
# = False
\`\`\`

## When in Doubt: Use Parentheses!

Even if Python knows the order, humans might not:

\`\`\`python
# Confusing:
x > 5 and y < 10 or z == 0

# Clear:
(x > 5 and y < 10) or (z == 0)
\`\`\`

Explicit parentheses make your intentions clear!
        `,
        goal: "Understand operator precedence.",
        startingCode: "",
        objective: "Learn the order of operations in Python.",
        quizQuestions: [
          {
            id: "m7i4-q1",
            text: "What is evaluated first: 5 + 3 > 6?",
            options: [
              "5 + 3, then compare",
              "> first, then add",
              "Left to right always",
              "Right to left always",
            ],
            correctAnswerIndex: 0,
          },
          {
            id: "m7i4-q2",
            text: "Between and/or, which has higher precedence?",
            options: ["or", "and", "Same precedence", "Depends"],
            correctAnswerIndex: 1,
          },
          {
            id: "m7i4-q3",
            text: "What's the best practice when precedence is confusing?",
            options: [
              "Memorize all rules",
              "Use parentheses",
              "Avoid operators",
              "Ask Python",
            ],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m7-l1",
        title: "The Modulo Operator",
        content: `
You know \`+\`, \`-\`, \`*\`, \`/\`. Meet **Modulo** \`%\`.
It gives you the **remainder** of a division.
*   \`10 % 3\` is 1 (because 3 goes into 10 three times, with 1 left over).
*   \`4 % 2\` is 0 (perfect division).

This is commonly used to check for even/odd numbers (any number % 2 == 0 is even).
        `,
        goal: "Use a loop to check numbers 1 through 10. If a number is even (`num % 2 == 0`), print it.",
        startingCode: `# Loop 1-10, if even print`,
        objective: "User must combine loop, modulo, and if statement.",
        expectedOutput: "2\n4\n6\n8\n10",
        commonMistakes: `
*   **Wrong Operator:** \`/\` divides. \`%\` gets remainder.
*   **Equality Check:** Remember to use \`==\` to check if the remainder IS zero.
        `,
      },
      {
        id: "m7-l2",
        title: "Comparison Operators",
        content: `
We use these to compare values. They result in a Boolean (\`True\` or \`False\`).
*   \`==\` Equal to (Don't confuse with \`=\` assignment!)
*   \`!=\` Not Equal
*   \`>\`, \`<\`, \`>=\`, \`<=\`

\`\`\`python
print(5 != 10) # True
\`\`\`
        `,
        goal: 'Create a function `check_pass(input_pass)`. If `input_pass` equals "secret", return True. Else return False. Test it.',
        startingCode: `# Define function`,
        objective: "User must use equality operator == inside a function.",
        expectedOutput: "True\nFalse",
        commonMistakes: `
*   **Assignment vs Comparison:** \`if x = 5\` sets x to 5 (and crashes in if). \`if x == 5\` checks if x is 5.
        `,
      },
      {
        id: "m7-l3",
        title: "Logical Operators",
        content: `
Build complex logic by combining comparisons.
*   \`and\`: All parts must be True.
*   \`or\`: At least one part must be True.
*   \`not\`: Flips True to False.

\`\`\`python
if age > 18 and has_ticket:
    print("Enter")
\`\`\`
        `,
        goal: "Loop from 1 to 30. If a number is greater than 10 AND less than 20, print it.",
        startingCode: `# Loop and complex check`,
        objective:
          "User must correctly combine conditions with `and` to filter range 11-19.",
        expectedOutput: "11\n12\n13\n14\n15\n16\n17\n18\n19",
        commonMistakes: `
*   **English Syntax:** \`if x > 10 and < 20\` is invalid. You must repeat the variable: \`if x > 10 and x < 20\`.
        `,
      },
      {
        id: "m7-l4",
        title: "Assignment Operators",
        content: `
Programmers are efficient. Instead of \`x = x + 1\`, we write \`x += 1\`.
Works for other math too: \`-=\`, \`*=\`, \`/=\`.

\`\`\`python
health = 100
health -= 10 # health is 90
health *= 2  # health is 180
\`\`\`
        `,
        goal: "Start with `score = 0`. In a loop of range 5, add 10 to score each time using `+=`. Print final score.",
        startingCode: `score = 0\n# Loop and accumulate`,
        objective:
          "User must use shorthand assignment operator in a loop. Result 50.",
        expectedOutput: "50",
        commonMistakes: `
*   **Typo:** \`=+\` is not an operator (it just sets positive value). Use \`+=\`.
        `,
      },
      {
        id: "m7-final",
        title: "Final Quiz: Logic Gates",
        type: "quiz",
        content: "Verify your boolean logic skills.",
        goal: "Pass the quiz.",
        startingCode: "",
        objective: "Pass quiz.",
        quizQuestions: [
          {
            id: "m7q1",
            text: "What is 10 % 3?",
            options: ["3", "1", "0", "3.33"],
            correctAnswerIndex: 1,
          },
          {
            id: "m7q2",
            text: "True or False is...",
            options: ["True", "False", "None", "Error"],
            correctAnswerIndex: 0,
          },
          {
            id: "m7q3",
            text: 'Which means "Not Equal"?',
            options: ["<>", "!=", "not =", "!=="],
            correctAnswerIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: "module-8",
    title: "Module 8: Advanced Math",
    lessons: [
      {
        id: "m8-intro1",
        title: "Math in Programming",
        type: "quiz",
        content: `
# Where Math Meets Code 🧮

Math is everywhere in programming! Let's see real applications.

## Real-World Uses

| Application | Math Involved |
|-------------|---------------|
| Games | Physics, collision detection |
| Finance | Interest, percentages |
| Graphics | Coordinates, transformations |
| Science | Statistics, simulations |
| Web | Layout calculations |

## Python's Math Operators

| Operator | Name | Example | Result |
|----------|------|---------|--------|
| \`+\` | Addition | \`5 + 3\` | 8 |
| \`-\` | Subtraction | \`5 - 3\` | 2 |
| \`*\` | Multiplication | \`5 * 3\` | 15 |
| \`/\` | Division | \`6 / 4\` | 1.5 |
| \`//\` | Floor Division | \`6 // 4\` | 1 |
| \`%\` | Modulo | \`6 % 4\` | 2 |
| \`**\` | Exponent | \`2 ** 3\` | 8 |

## Combining Operations

\`\`\`python
# Calculate compound interest
principal = 1000
rate = 0.05
years = 3
amount = principal * (1 + rate) ** years
print(amount)  # 1157.625
\`\`\`

## Order Matters!

Python follows standard math order:
1. Parentheses \`()\`
2. Exponents \`**\`
3. Multiplication/Division \`* / // %\`
4. Addition/Subtraction \`+ -\`

\`\`\`python
2 + 3 * 4    # = 2 + 12 = 14 (not 20!)
(2 + 3) * 4  # = 5 * 4 = 20
\`\`\`
        `,
        goal: "Understand math operations in Python.",
        startingCode: "",
        objective: "Learn Python's mathematical operators.",
        quizQuestions: [
          {
            id: "m8i1-q1",
            text: "What is 2 ** 4?",
            options: ["6", "8", "16", "64"],
            correctAnswerIndex: 2,
          },
          {
            id: "m8i1-q2",
            text: "What is 7 // 2?",
            options: ["3.5", "3", "4", "2"],
            correctAnswerIndex: 1,
          },
          {
            id: "m8i1-q3",
            text: "What is 2 + 3 * 4?",
            options: ["20", "14", "24", "Error"],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m8-intro2",
        title: "Floor vs True Division",
        type: "quiz",
        content: `
# Two Types of Division ➗

Python has two division operators that behave differently!

## True Division (/)

Always returns a float, even if the result is "clean":

\`\`\`python
print(10 / 2)   # 5.0 (float!)
print(10 / 3)   # 3.333...
print(7 / 2)    # 3.5
\`\`\`

## Floor Division (//)

Returns an integer, rounding DOWN:

\`\`\`python
print(10 // 2)  # 5 (integer!)
print(10 // 3)  # 3 (not 3.333, rounded down)
print(7 // 2)   # 3 (not 3.5 or 4)
\`\`\`

## Comparison

| Expression | / (True) | // (Floor) |
|------------|----------|------------|
| 10 ÷ 3 | 3.333... | 3 |
| 7 ÷ 2 | 3.5 | 3 |
| 9 ÷ 3 | 3.0 | 3 |

## When to Use Each

**Use /** when you need:
- Exact decimal results
- Percentages, averages

**Use //** when you need:
- Whole items only (e.g., how many full boxes?)
- Array/list indices
- Integer-only calculations

\`\`\`python
items = 17
per_box = 5
full_boxes = items // per_box  # 3 boxes
leftover = items % per_box      # 2 items
\`\`\`
        `,
        goal: "Understand the difference between / and //.",
        startingCode: "",
        objective: "Learn floor vs true division.",
        quizQuestions: [
          {
            id: "m8i2-q1",
            text: "What type does 10 / 2 return?",
            options: ["int", "float", "str", "bool"],
            correctAnswerIndex: 1,
          },
          {
            id: "m8i2-q2",
            text: "What is 17 // 5?",
            options: ["3", "3.4", "4", "2"],
            correctAnswerIndex: 0,
          },
          {
            id: "m8i2-q3",
            text: "When would you use // instead of /?",
            options: [
              "When you need decimals",
              "When you need whole numbers only",
              "Never, they're the same",
              "For multiplication",
            ],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m8-intro3",
        title: "Float Precision Issues",
        type: "quiz",
        content: `
# The 0.1 + 0.2 Problem 🤯

Floats can behave unexpectedly. This isn't a Python bug—it's how computers store decimals!

## The Famous Example

\`\`\`python
print(0.1 + 0.2)
# Expected: 0.3
# Actual: 0.30000000000000004
\`\`\`

## Why This Happens

Computers store numbers in binary (1s and 0s). Just like 1/3 = 0.333... never ends in decimal, some decimal numbers never end in binary!

0.1 in binary is something like: \`0.0001100110011001...\` (repeats forever)

The computer has to round it, causing tiny errors.

## When It Matters

Usually it doesn't! But be careful with:
- Money calculations
- Equality checks

\`\`\`python
# DANGER: May not work!
if 0.1 + 0.2 == 0.3:  # False!
    print("Equal")

# SAFER: Check if "close enough"
if abs((0.1 + 0.2) - 0.3) < 0.0001:
    print("Close enough!")
\`\`\`

## Solutions

1. **For money**: Use integers (cents instead of dollars)
\`\`\`python
# Instead of $1.50
cents = 150
\`\`\`

2. **For comparisons**: Use a tolerance
\`\`\`python
def nearly_equal(a, b, tolerance=0.0001):
    return abs(a - b) < tolerance
\`\`\`
        `,
        goal: "Understand floating-point precision.",
        startingCode: "",
        objective: "Learn about float representation issues.",
        quizQuestions: [
          {
            id: "m8i3-q1",
            text: "Is 0.1 + 0.2 == 0.3 in Python?",
            options: ["True", "False", "Error", "Sometimes"],
            correctAnswerIndex: 1,
          },
          {
            id: "m8i3-q2",
            text: "Why do float precision issues happen?",
            options: [
              "Python is buggy",
              "Binary can't represent all decimals exactly",
              "Computers are slow",
              "We made a mistake",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m8i3-q3",
            text: "How should you handle money in code?",
            options: [
              "Use floats for dollars",
              "Use integers for cents",
              "Avoid money entirely",
              "Round everything",
            ],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m8-intro4",
        title: "The Math Library Tour",
        type: "quiz",
        content: `
# Python's math Module 📚

For advanced math, import the \`math\` module!

## Importing math

\`\`\`python
import math
\`\`\`

## Essential Functions

| Function | Description | Example |
|----------|-------------|---------|
| \`math.sqrt(x)\` | Square root | \`math.sqrt(16)\` → 4.0 |
| \`math.pow(x, y)\` | Power | \`math.pow(2, 3)\` → 8.0 |
| \`math.floor(x)\` | Round down | \`math.floor(3.7)\` → 3 |
| \`math.ceil(x)\` | Round up | \`math.ceil(3.2)\` → 4 |
| \`math.abs(x)\` | Absolute value | \`abs(-5)\` → 5 |

## Constants

\`\`\`python
print(math.pi)   # 3.141592653589793
print(math.e)    # 2.718281828459045
\`\`\`

## Practical Examples

\`\`\`python
import math

# Distance formula
def distance(x1, y1, x2, y2):
    dx = x2 - x1
    dy = y2 - y1
    return math.sqrt(dx**2 + dy**2)

# Circle area
def circle_area(radius):
    return math.pi * radius ** 2

print(distance(0, 0, 3, 4))  # 5.0
print(circle_area(10))        # 314.159...
\`\`\`

## When to Use Built-in vs Math

- **Built-in** \`**\`: For simple exponents
- **math.pow()**: When you specifically need a float result
- **math.sqrt()**: More readable than \`** 0.5\`
        `,
        goal: "Explore the math module.",
        startingCode: "",
        objective: "Learn math library functions and constants.",
        quizQuestions: [
          {
            id: "m8i4-q1",
            text: "What is math.sqrt(25)?",
            options: ["5", "5.0", "25", "12.5"],
            correctAnswerIndex: 1,
          },
          {
            id: "m8i4-q2",
            text: "What does math.ceil(3.1) return?",
            options: ["3", "4", "3.1", "3.0"],
            correctAnswerIndex: 1,
          },
          {
            id: "m8i4-q3",
            text: "Which constant is approximately 3.14159...?",
            options: ["math.e", "math.pi", "math.tau", "math.inf"],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m8-l1",
        title: "Area Calculation",
        content: `
Let's put math to use. Area of a rectangle is \`width * length\`.
        `,
        goal: "Define a function `get_area(w, l)`. Return the area. Call it with arguments 10 and 5 and print the result.",
        startingCode: `# Define function`,
        objective:
          "User must define function with parameters and return math result.",
        expectedOutput: "50",
        commonMistakes: `
*   **Forgetting Return:** The function must return the value to be printed.
        `,
      },
      {
        id: "m8-l2",
        title: "Division & Integers",
        content: `
Regular division \`/\` returns a float.
Floor division \`//\` returns an integer (rounds down).

\`\`\`python
print(10 / 3)  # 3.3333...
print(10 // 3) # 3
\`\`\`
        `,
        goal: "You have 100 seconds. Calculate how many full minutes that is using `//`. Print the result.",
        startingCode: `seconds = 100\n# Calculate minutes`,
        objective: "User must use // operator to get 1.",
        expectedOutput: "1",
        commonMistakes: `
*   **Using /:** \`100 / 60\` gives \`1.66\`, which is not "full minutes".
        `,
      },
      {
        id: "m8-l3",
        title: "Exponents (Powers)",
        content: `
For $x^y$, use \`**\`.

\`\`\`python
print(4 ** 2) # 16
print(4 ** 0.5) # Square root (2.0)
\`\`\`
        `,
        goal: "Calculate the volume of a cube with side length 4 ($4^3$). Print it.",
        startingCode: `side = 4\n# Calculate volume`,
        objective: "User must use ** operator. Result 64.",
        expectedOutput: "64",
        commonMistakes: `
*   **Wrong Operator:** \`^\` is XOR in Python, not power. You MUST use \`**\`.
        `,
      },
      {
        id: "m8-l4",
        title: "Math Library",
        content: `
For complex things like Pi, square roots, or trig, import \`math\`.

\`\`\`python
import math
print(math.pi)
print(math.sqrt(16))
\`\`\`
        `,
        goal: "Calculate the area of a circle with radius 5 ($A = \\pi r^2$). Use `math.pi`. Print the result.",
        startingCode: `import math\nr = 5\n# Calculate area`,
        objective: "User must combine math.pi and exponent operator.",
        expectedOutput: "78.53981633974483",
        commonMistakes: `
*   **Typo:** \`Math.pi\` (capital M) will fail. It is lowercase \`math\`.
        `,
      },
      {
        id: "m8-l5",
        title: "Final Project: Hypotenuse",
        content: `
Pythagorean theorem: $a^2 + b^2 = c^2$.
So, $c = \\sqrt{a^2 + b^2}$.
        `,
        goal: "Given `a=3` and `b=4`, calculate `c` using `math.sqrt` and exponents. Print `c`.",
        startingCode: `import math\na = 3\nb = 4\n# Calculate c`,
        objective:
          "User must implement the theorem logic. Result should be 5.0.",
        expectedOutput: "5.0",
        commonMistakes: `
*   **Order of Ops:** Ensure you add a^2 and b^2 *inside* the sqrt parenthesis.
        `,
      },
    ],
  },
  {
    id: "module-9",
    title: "Module 9: Lists Deep Dive",
    lessons: [
      {
        id: "m9-intro1",
        title: "What Are Lists?",
        type: "quiz",
        content: `
# Collections of Data 📋

Lists let you store multiple items in a single variable. They're one of Python's most powerful features!

## Why Lists?

Without lists:
\`\`\`python
item1 = "Apple"
item2 = "Banana"
item3 = "Cherry"
# What if you have 100 items?!
\`\`\`

With lists:
\`\`\`python
items = ["Apple", "Banana", "Cherry"]
# Easy to manage any number!
\`\`\`

## Creating Lists

\`\`\`python
# Square brackets, comma-separated
numbers = [1, 2, 3, 4, 5]
names = ["Alice", "Bob", "Charlie"]
mixed = [1, "two", 3.0, True]  # Can mix types!
empty = []  # Empty list
\`\`\`

## Lists Are Ordered

Items stay in the order you put them:

\`\`\`python
letters = ["c", "a", "b"]
# letters[0] is "c", NOT "a"!
# Order is preserved, not sorted
\`\`\`

## Real-World Examples

| Use Case | Example List |
|----------|--------------|
| Shopping cart | \`["Apple", "Milk", "Bread"]\` |
| High scores | \`[1000, 850, 720]\` |
| User data | \`["John", 25, "NYC"]\` |
| Game inventory | \`["Sword", "Shield", "Potion"]\` |
        `,
        goal: "Understand what lists are and why we use them.",
        startingCode: "",
        objective: "Learn the concept of lists.",
        quizQuestions: [
          {
            id: "m9i1-q1",
            text: "What symbols create a list?",
            options: ["()", "{}", "[]", "<>"],
            correctAnswerIndex: 2,
          },
          {
            id: "m9i1-q2",
            text: "Can a list contain different types?",
            options: [
              "No, only one type",
              "Yes, lists can mix types",
              "Only numbers",
              "Only strings",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m9i1-q3",
            text: "Are lists ordered?",
            options: [
              "No, items are random",
              "Yes, items keep their order",
              "They're automatically sorted",
              "Order depends on type",
            ],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m9-intro2",
        title: "Understanding Indices",
        type: "quiz",
        content: `
# Addressing List Items 📍

Every item in a list has an **index** - its position number.

## Zero-Based Indexing

**Critical:** Computers start counting at 0, not 1!

\`\`\`python
fruits = ["Apple", "Banana", "Cherry", "Date"]
#           0        1          2        3
\`\`\`

| Item | Index |
|------|-------|
| Apple | 0 |
| Banana | 1 |
| Cherry | 2 |
| Date | 3 |

## Accessing Items

\`\`\`python
fruits = ["Apple", "Banana", "Cherry"]

print(fruits[0])  # Apple
print(fruits[1])  # Banana
print(fruits[2])  # Cherry
\`\`\`

## Negative Indexing

Python lets you count from the end:

\`\`\`python
fruits = ["Apple", "Banana", "Cherry"]
#           -3       -2        -1

print(fruits[-1])  # Cherry (last)
print(fruits[-2])  # Banana (second to last)
\`\`\`

## Common Error: IndexError

\`\`\`python
fruits = ["Apple", "Banana", "Cherry"]
print(fruits[3])  # IndexError! Only 0, 1, 2 exist
\`\`\`

Remember: A list of 3 items has indices 0, 1, 2 (not 1, 2, 3!)
        `,
        goal: "Master list indexing.",
        startingCode: "",
        objective: "Learn zero-based indexing.",
        quizQuestions: [
          {
            id: "m9i2-q1",
            text: "What is the index of the FIRST item?",
            options: ["1", "0", "-1", "first"],
            correctAnswerIndex: 1,
          },
          {
            id: "m9i2-q2",
            text: "In ['a', 'b', 'c'], what is the index of 'c'?",
            options: ["3", "2", "1", "-1"],
            correctAnswerIndex: 1,
          },
          {
            id: "m9i2-q3",
            text: "What does index -1 refer to?",
            options: [
              "First item",
              "Last item",
              "Error",
              "Nothing",
            ],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m9-intro3",
        title: "Lists Are Mutable",
        type: "quiz",
        content: `
# Lists Can Change! 🔄

Lists are **mutable** - you can modify them after creation.

## Changing Items

\`\`\`python
colors = ["red", "green", "blue"]
colors[1] = "yellow"
# Now: ["red", "yellow", "blue"]
\`\`\`

## Adding Items

\`\`\`python
fruits = ["apple"]
fruits.append("banana")  # Add to end
# Now: ["apple", "banana"]

fruits.insert(0, "mango")  # Add at index 0
# Now: ["mango", "apple", "banana"]
\`\`\`

## Removing Items

\`\`\`python
numbers = [1, 2, 3, 4, 5]

numbers.remove(3)  # Remove value 3
# Now: [1, 2, 4, 5]

numbers.pop()  # Remove and return last
# Now: [1, 2, 4]

del numbers[0]  # Delete by index
# Now: [2, 4]
\`\`\`

## Contrast with Strings

Strings are **immutable** - cannot be changed:

\`\`\`python
name = "hello"
name[0] = "H"  # ERROR! Strings can't change

colors = ["red"]
colors[0] = "blue"  # Works! Lists can change
\`\`\`

This is a key difference between lists and strings!
        `,
        goal: "Understand list mutability.",
        startingCode: "",
        objective: "Learn how to modify lists.",
        quizQuestions: [
          {
            id: "m9i3-q1",
            text: "What does 'mutable' mean?",
            options: [
              "Cannot be created",
              "Can be changed after creation",
              "Only holds numbers",
              "Cannot be deleted",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m9i3-q2",
            text: "Can you change a letter in a string?",
            options: [
              "Yes, strings are mutable",
              "No, strings are immutable",
              "Only with import",
              "Only in Python 3",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m9i3-q3",
            text: "What method adds an item to the end of a list?",
            options: ["add()", "push()", "append()", "insert()"],
            correctAnswerIndex: 2,
          },
        ],
      },
      {
        id: "m9-intro4",
        title: "List versus String",
        type: "quiz",
        content: `
# Lists vs Strings: Similarities & Differences 🔍

Lists and strings have a lot in common, but key differences too!

## Similarities

| Feature | String | List |
|---------|--------|------|
| Indexing | \`"hello"[0]\` → "h" | \`[1,2,3][0]\` → 1 |
| Slicing | \`"hello"[1:3]\` → "el" | \`[1,2,3][1:3]\` → [2,3] |
| Length | \`len("hello")\` → 5 | \`len([1,2,3])\` → 3 |
| Looping | \`for c in "hi":\` | \`for x in [1,2]:\` |
| \`in\` operator | \`"e" in "hello"\` | \`2 in [1,2,3]\` |

## Key Differences

| Feature | String | List |
|---------|--------|------|
| Mutability | Immutable ❌ | Mutable ✅ |
| Contents | Only characters | Any data type |
| Modify | Create new string | Change in place |

## Example: Modifying

\`\`\`python
# String: Must create new
name = "Cat"
name = "B" + name[1:]  # "Bat"

# List: Change directly
pets = ["Cat", "Dog"]
pets[0] = "Bat"  # ["Bat", "Dog"]
\`\`\`

## Converting Between Them

\`\`\`python
# String → List of characters
list("hello")  # ['h', 'e', 'l', 'l', 'o']

# List of strings → String
"".join(['h', 'e', 'l', 'l', 'o'])  # "hello"
"-".join(['a', 'b', 'c'])  # "a-b-c"
\`\`\`
        `,
        goal: "Compare lists and strings.",
        startingCode: "",
        objective: "Understand similarities and differences.",
        quizQuestions: [
          {
            id: "m9i4-q1",
            text: "Can both strings and lists use slicing?",
            options: ["Only lists", "Only strings", "Yes, both", "Neither"],
            correctAnswerIndex: 2,
          },
          {
            id: "m9i4-q2",
            text: "What is the main difference between strings and lists?",
            options: [
              "Length",
              "Strings are immutable, lists are mutable",
              "Speed",
              "They're the same",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m9i4-q3",
            text: "What does list(\"abc\") return?",
            options: ["\"abc\"", "['abc']", "['a', 'b', 'c']", "Error"],
            correctAnswerIndex: 2,
          },
        ],
      },
      {
        id: "m9-l1",
        title: "List Indexing",
        content: `
Lists are ordered. We access items by position (index).
**Remember:** Computers start counting at 0.

\`\`\`python
       #  0    1    2
nums = [10, 20, 30]
print(nums[0]) # 10
\`\`\`
        `,
        goal: "Create a list `colors` with 4 colors. Print the first color and the third color.",
        startingCode: `# Create list and print`,
        objective: "User must access index 0 and index 2.",
        commonMistakes: `
*   **Off by One:** The third item is at index 2, not 3. Index 3 is the fourth item.
        `,
      },
      {
        id: "m9-l2",
        title: "Negative Indexing",
        content: `
Python has a cool trick. Index \`-1\` means "the last item". \`-2\` is "second to last".
This is useful when you don't know how long the list is.

\`\`\`python
arr = [1, 2, ... 99]
print(arr[-1]) # 99
\`\`\`
        `,
        goal: "Given a list `data = [10, 20, 30, 40]`. Print the last item using a negative index, and the second-to-last item.",
        startingCode: `data = [10, 20, 30, 40]\n# Print items`,
        objective: "User must use index -1 and -2.",
        expectedOutput: "40\n30",
        commonMistakes: `
*   **-0:** Index \`-0\` is the same as \`0\` (the first item).
        `,
      },
      {
        id: "m9-l3",
        title: "Adding & Removing",
        content: `
Lists are mutable (changeable).
*   \`list.append(x)\`: Adds x to the end.
*   \`list.pop()\`: Removes and returns the last item.
*   \`list.remove(x)\`: Finds the first x and deletes it.

\`\`\`python
todo = ["Sleep"]
todo.append("Eat")
\`\`\`
        `,
        goal: 'Create an empty list. Append "A", "B", "C". Remove "B". Pop the last item. Print the list.',
        startingCode: `my_list = []\n# Manipulate list`,
        objective: 'User must perform correct sequence. Result: ["A"].',
        expectedOutput: "['A']",
        commonMistakes: `
*   **Remove vs Pop:** \`remove\` takes a value ("B"). \`pop\` takes an index (or nothing).
*   **Removing Missing:** If you try to remove "Z" and it's not there, Python crashes.
        `,
      },
      {
        id: "m9-l4",
        title: "Slicing",
        content: `
Slicing extracts a portion of a list.
Syntax: \`list[start:stop]\`
*   It includes \`start\`.
*   It excludes \`stop\`.

\`\`\`python
# Indices: 0  1  2  3
chars = ['a','b','c','d']
print(chars[1:3]) # ['b', 'c']
\`\`\`
        `,
        goal: "Given `nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]`. Print a slice containing `[4, 5, 6]`.",
        startingCode: `nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]\n# Print slice`,
        objective: "User must slice correctly using [4:7].",
        expectedOutput: "[4, 5, 6]",
        commonMistakes: `
*   **Stop Index:** To get index 6, you must stop at 7.
        `,
      },
      {
        id: "m9-final",
        title: "Final Quiz: Lists",
        type: "quiz",
        content: "Prove your mastery of Python lists.",
        goal: "Pass quiz.",
        startingCode: "",
        objective: "Pass quiz.",
        quizQuestions: [
          {
            id: "m9q1",
            text: "Index of the first item?",
            options: ["1", "0", "-1", "start"],
            correctAnswerIndex: 1,
          },
          {
            id: "m9q2",
            text: "my_list = [10, 20]; print(my_list[-1])",
            options: ["10", "20", "Error", "None"],
            correctAnswerIndex: 1,
          },
          {
            id: "m9q3",
            text: "Which method adds to the end?",
            options: ["push", "add", "append", "insert"],
            correctAnswerIndex: 2,
          },
        ],
      },
    ],
  },
  {
    id: "module-10",
    title: "Module 10: Advanced Loops",
    lessons: [
      {
        id: "m10-intro1",
        title: "Visualizing Nested Loops",
        type: "quiz",
        content: `
# Loops Inside Loops 🔄🔄

Nested loops are loops within loops. They're powerful but can be tricky!

## How Nested Loops Work

\`\`\`python
for i in range(3):      # Outer loop
    for j in range(2):  # Inner loop
        print(i, j)
\`\`\`

For EACH iteration of the outer loop, the inner loop runs COMPLETELY.

## Visualizing Execution

\`\`\`
Outer i=0:
  Inner j=0 → print(0, 0)
  Inner j=1 → print(0, 1)
Outer i=1:
  Inner j=0 → print(1, 0)
  Inner j=1 → print(1, 1)
Outer i=2:
  Inner j=0 → print(2, 0)
  Inner j=1 → print(2, 1)
\`\`\`

## Total Iterations

Outer runs 3 times × Inner runs 2 times = **6 total iterations**

| Outer | Inner | Iterations |
|-------|-------|------------|
| 3 | 2 | 3 × 2 = 6 |
| 5 | 5 | 5 × 5 = 25 |
| 10 | 10 | 10 × 10 = 100 |

## Common Uses

- 2D grids (game boards)
- Tables (rows × columns)
- Matrix operations
- Comparing all pairs
        `,
        goal: "Understand how nested loops execute.",
        startingCode: "",
        objective: "Learn nested loop behavior.",
        quizQuestions: [
          {
            id: "m10i1-q1",
            text: "In a nested loop with outer(3) and inner(4), how many total iterations?",
            options: ["7", "12", "3", "4"],
            correctAnswerIndex: 1,
          },
          {
            id: "m10i1-q2",
            text: "For each outer loop iteration, how many times does inner run?",
            options: [
              "Once",
              "Completely (all its iterations)",
              "Never",
              "Halfway",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m10i1-q3",
            text: "Nested loops are useful for working with...",
            options: [
              "Single numbers",
              "2D structures like grids",
              "Nothing specific",
              "Only strings",
            ],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m10-intro2",
        title: "Break and Continue",
        type: "quiz",
        content: `
# Controlling Loop Flow 🎮

Sometimes you need to exit a loop early or skip iterations. Meet \`break\` and \`continue\`!

## Break: Exit the Loop

\`break\` immediately exits the ENTIRE loop.

\`\`\`python
for i in range(10):
    if i == 5:
        break  # Stop here!
    print(i)
# Output: 0, 1, 2, 3, 4
\`\`\`

## Continue: Skip This Iteration

\`continue\` skips to the next iteration.

\`\`\`python
for i in range(5):
    if i == 2:
        continue  # Skip this one!
    print(i)
# Output: 0, 1, 3, 4 (2 is skipped)
\`\`\`

## Comparison

| Keyword | Effect | Rest of Loop? |
|---------|--------|---------------|
| \`break\` | Exit loop completely | Stops |
| \`continue\` | Skip current iteration | Continues |

## Practical Examples

\`\`\`python
# Break: Find first match
for name in names:
    if name == "Alice":
        print("Found!")
        break

# Continue: Skip invalid entries
for score in scores:
    if score < 0:
        continue  # Skip negative scores
    total += score
\`\`\`

## With While Loops

Works the same way:
\`\`\`python
while True:
    answer = input("Password: ")
    if answer == "secret":
        break  # Exit infinite loop
\`\`\`
        `,
        goal: "Master break and continue statements.",
        startingCode: "",
        objective: "Learn loop control flow.",
        quizQuestions: [
          {
            id: "m10i2-q1",
            text: "What does break do?",
            options: [
              "Pauses the loop",
              "Exits the loop completely",
              "Skips to next iteration",
              "Restarts the loop",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m10i2-q2",
            text: "What does continue do?",
            options: [
              "Exits the loop",
              "Skips to the next iteration",
              "Repeats current iteration",
              "Ends the program",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m10i2-q3",
            text: "In for i in range(10): break... how many iterations run?",
            options: ["10", "0", "1", "5"],
            correctAnswerIndex: 2,
          },
        ],
      },
      {
        id: "m10-intro3",
        title: "The Enumerate Function",
        type: "quiz",
        content: `
# Getting Index AND Value 🔢

Often you need both the item AND its position. \`enumerate()\` gives you both!

## The Problem

\`\`\`python
fruits = ["apple", "banana", "cherry"]
# How do I know I'm on item #2?
for fruit in fruits:
    print(fruit)  # No index information!
\`\`\`

## The Old Way (Works but Clunky)

\`\`\`python
for i in range(len(fruits)):
    print(i, fruits[i])
\`\`\`

## The Elegant Way: enumerate()

\`\`\`python
for index, fruit in enumerate(fruits):
    print(index, fruit)
# Output:
# 0 apple
# 1 banana
# 2 cherry
\`\`\`

## How It Works

\`enumerate()\` pairs each item with its index:

\`\`\`python
list(enumerate(["a", "b", "c"]))
# [(0, 'a'), (1, 'b'), (2, 'c')]
\`\`\`

## Practical Example

\`\`\`python
scores = [85, 92, 78]

for i, score in enumerate(scores):
    print(f"Student {i+1}: {score}")

# Output:
# Student 1: 85
# Student 2: 92
# Student 3: 78
\`\`\`

## Starting from 1

\`\`\`python
for i, item in enumerate(items, start=1):
    print(i, item)  # 1, 2, 3... instead of 0, 1, 2...
\`\`\`
        `,
        goal: "Learn to use enumerate() for indexed iteration.",
        startingCode: "",
        objective: "Understand the enumerate function.",
        quizQuestions: [
          {
            id: "m10i3-q1",
            text: "What does enumerate() give you?",
            options: [
              "Just the items",
              "Just the indices",
              "Both index and item",
              "The length",
            ],
            correctAnswerIndex: 2,
          },
          {
            id: "m10i3-q2",
            text: "What is the first index from enumerate()?",
            options: ["1", "0", "-1", "None"],
            correctAnswerIndex: 1,
          },
          {
            id: "m10i3-q3",
            text: "How do you start enumerate at 1 instead of 0?",
            options: [
              "enumerate(list, 1)",
              "enumerate(list, start=1)",
              "enumerate(1, list)",
              "Can't do that",
            ],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m10-intro4",
        title: "Common Loop Patterns",
        type: "quiz",
        content: `
# Loop Recipes 📝

Here are patterns you'll use over and over in programming!

## Pattern 1: Counting/Summing

\`\`\`python
numbers = [1, 2, 3, 4, 5]
total = 0
for num in numbers:
    total += num
print(total)  # 15
\`\`\`

## Pattern 2: Finding

\`\`\`python
items = ["apple", "banana", "cherry"]
target = "banana"
found_at = -1

for i, item in enumerate(items):
    if item == target:
        found_at = i
        break

print(found_at)  # 1
\`\`\`

## Pattern 3: Filtering

\`\`\`python
numbers = [1, 2, 3, 4, 5, 6]
evens = []

for num in numbers:
    if num % 2 == 0:
        evens.append(num)

print(evens)  # [2, 4, 6]
\`\`\`

## Pattern 4: Transforming

\`\`\`python
words = ["hello", "world"]
upper_words = []

for word in words:
    upper_words.append(word.upper())

print(upper_words)  # ["HELLO", "WORLD"]
\`\`\`

## Pattern 5: Max/Min Finding

\`\`\`python
scores = [72, 85, 90, 63]
highest = scores[0]

for score in scores:
    if score > highest:
        highest = score

print(highest)  # 90
\`\`\`

These patterns are building blocks for most programs!
        `,
        goal: "Learn common loop patterns.",
        startingCode: "",
        objective: "Recognize and use standard loop patterns.",
        quizQuestions: [
          {
            id: "m10i4-q1",
            text: "To sum a list, you typically start with...",
            options: [
              "total = 1",
              "total = 0",
              "total = None",
              "No initialization",
            ],
            correctAnswerIndex: 1,
          },
          {
            id: "m10i4-q2",
            text: "The filtering pattern creates...",
            options: [
              "A new list with only matching items",
              "The same list modified",
              "A number",
              "Nothing",
            ],
            correctAnswerIndex: 0,
          },
          {
            id: "m10i4-q3",
            text: "To find maximum, compare each item to...",
            options: [
              "Zero",
              "The first item (initially)",
              "Infinity",
              "None",
            ],
            correctAnswerIndex: 1,
          },
        ],
      },
      {
        id: "m10-l1",
        title: "Nested Loops",
        content: `
You can put a loop inside a loop. This is often used for 2D grids or coordinates.
For every *one* step of the outer loop, the inner loop runs *completely*.

\`\`\`python
for x in range(3):
    for y in range(2):
        print(x, y)
\`\`\`
        `,
        goal: "Use nested loops to verify the multiplication table. Loop `i` from 1 to 3. Loop `j` from 1 to 3. Print `i * j`.",
        startingCode: `# Nested loops`,
        objective:
          "User must implement multiplication table logic printing 1, 2, 3, 2, 4, 6, 3, 6, 9.",
        expectedOutput: "1\n2\n3\n2\n4\n6\n3\n6\n9",
        commonMistakes: `
*   **Variable Names:** Don't use \`i\` for both loops! Use \`i\` and \`j\` (or meaningful names).
*   **Indentation:** The print must be inside the INNER loop (double indented).
        `,
      },
      {
        id: "m10-l2",
        title: "Skipping (Continue)",
        content: `
The \`continue\` statement tells the loop: "Done with this item, skip to the next one immediately."
It doesn't stop the loop, just the current iteration.
        `,
        goal: "Loop from 1 to 10. If the number is even, `continue`. Otherwise, print the number. (This prints only odd numbers).",
        startingCode: `# Loop with continue`,
        objective: "User must use modulo and continue to filter output.",
        expectedOutput: "1\n3\n5\n7\n9",
        commonMistakes: `
*   **Order:** The print must be *after* the continue check. If you print before checking, continue does nothing helpful.
        `,
      },
      {
        id: "m10-l3",
        title: "Breaking Out",
        content: `
The \`break\` statement stops the loop immediately. It effectively "cancels" the rest of the looping.
Useful for searching: "I found what I needed, stop looking."
        `,
        goal: 'Loop from 1 to 100. If the number is 50, print "Found 50!" and `break`. Ensure the loop stops there.',
        startingCode: `# Loop with break`,
        objective: "User must stop execution at 50.",
        expectedOutput: "Found 50!",
        commonMistakes: `
*   **Indentation:** Break must be inside the \`if\`.
        `,
      },
      {
        id: "m10-l4",
        title: "Looping Lists",
        content: `
The most common loop in Python is "for each" item in a list.

\`\`\`python
for name in ["Sam", "Dean"]:
    print("Hello " + name)
\`\`\`
        `,
        goal: "Given `prices = [10, 20, 5]`. Create `total = 0`. Loop through prices, adding each to total. Print `total` at the end.",
        startingCode: `prices = [10, 20, 5]\n# Calculate sum manually`,
        objective: "User must accumulate sum via loop. Result 35.",
        expectedOutput: "35",
        commonMistakes: `
*   **Resetting Total:** Do not set \`total = 0\` *inside* the loop, or it will reset every time.
        `,
      },
      {
        id: "m10-final",
        title: "Final Project: Countdown",
        content: "Use a while loop to count backwards.",
        goal: 'Create `n = 10`. While n > 0, print n, decrease n. Print "Blastoff!" at the end.',
        startingCode: `n = 10\n# Countdown logic`,
        objective: "Output 10 down to 1 then Blastoff.",
        expectedOutput: "10\n9\n8\n7\n6\n5\n4\n3\n2\n1\nBlastoff!",
        type: "coding",
      },
    ],
  },
  {
    id: "module-11",
    title: "Module 11: List Manipulation",
    lessons: [
      {
        id: "m11-l1",
        title: "Modifying by Index",
        content: `
You can change an item in a list just like a variable, if you know its index.

\`\`\`python
box = ["Empty", "Book"]
box[0] = "Cat"
# box is now ["Cat", "Book"]
\`\`\`
        `,
        goal: "Given `grades = [50, 80, 100]`. Change the first grade to 60. Change the last grade to 95. Print the list.",
        startingCode: `grades = [50, 80, 100]\n# Update and print`,
        objective: "User must modify list index 0 and 2 (or -1).",
        expectedOutput: "[60, 80, 95]",
        commonMistakes: `
*   **Index Error:** \`grades[3] = 90\` will crash because index 3 doesn't exist.
        `,
      },
      {
        id: "m11-l2",
        title: "Length of List",
        content: `
How many items are in my list? Use \`len()\`.

\`\`\`python
users = ["A", "B", "C"]
count = len(users) # 3
\`\`\`
        `,
        goal: "Write a function `is_long(lst)` that returns True if the list has more than 5 items, else False. Test it with a short and long list.",
        startingCode: `# Define function`,
        objective: "User must use len() inside a function logic.",
        expectedOutput: "False\nTrue",
        commonMistakes: `
*   **Zero Indexing:** Length is the count (1-based). Index is position (0-based). Don't confuse them.
        `,
      },
      {
        id: "m11-l3",
        title: "Sum and Max",
        content: `
Python has helper functions for number lists.
*   \`sum(list)\`: Adds them all up.
*   \`max(list)\`: Finds the biggest.
*   \`min(list)\`: Finds the smallest.
        `,
        goal: "Given `scores = [4, 8, 15, 16, 23, 42]`. Calculate the average score (sum divided by length). Print it.",
        startingCode: `scores = [4, 8, 15, 16, 23, 42]\n# Calculate average`,
        objective: "User must combine sum() and len() to find average.",
        expectedOutput: "18.0",
        commonMistakes: `
*   **Math:** Average is sum / count.
        `,
      },
      {
        id: "m11-l4",
        title: "Sorting",
        content: `
To organize data, use \`list.sort()\`.
**Note:** This changes the original list.

\`\`\`python
nums = [3, 1, 2]
nums.sort()
print(nums) # [1, 2, 3]
\`\`\`
        `,
        goal: "Define a function `get_largest(lst)` that sorts the list and returns the last item (the largest). Test it.",
        startingCode: `# Define function`,
        objective: "User must sort and return index -1.",
        commonMistakes: `
*   **Return None:** \`return lst.sort()\` is WRONG. \`sort\` returns None. You must sort first, then return the item.
        `,
      },
      {
        id: "m11-final",
        title: "Final Quiz: List Methods",
        type: "quiz",
        content: "Test your knowledge of list functions.",
        goal: "Pass the quiz.",
        startingCode: "",
        objective: "Pass quiz.",
        quizQuestions: [
          {
            id: "m11q1",
            text: "What does sum([1, 2, 3]) return?",
            options: ["6", "5", "123", "Error"],
            correctAnswerIndex: 0,
          },
          {
            id: "m11q2",
            text: "What does list.sort() return?",
            options: ["The sorted list", "None", "True", "A new list"],
            correctAnswerIndex: 1,
          },
          {
            id: "m11q3",
            text: "Which gets the smallest number?",
            options: ["least()", "small()", "min()", "low()"],
            correctAnswerIndex: 2,
          },
        ],
      },
    ],
  },
  {
    id: "module-12",
    title: "Module 12: Capstone Project",
    lessons: [
      {
        id: "m12-l1",
        title: "The Shopping Manager",
        content: `
We are going to build a Shopping Cart program.
Step 1: Setup.
We need a list to hold items and a budget variable.
        `,
        goal: 'Initialize an empty list `cart` and a float variable `budget` set to 50.00. Print "Starting Cart...".',
        startingCode: `# Setup variables`,
        objective: "User must create empty list and float budget.",
        expectedOutput: "Starting Cart...",
        commonMistakes: `
*   **Empty List:** Use \`[]\`.
        `,
      },
      {
        id: "m12-l2",
        title: "Adding Inventory",
        content: `
The user wants to buy things. Let's define a function to help.
        `,
        goal: 'Define `add_item(item)`. It should append the item to the global `cart`. Call it to add "Apple" and "Banana".',
        startingCode: `cart = []\n# Define function and use it`,
        objective: "User must use append inside a function.",
        commonMistakes: `
*   **Global:** Since lists are mutable, you don't strictly need the \`global\` keyword to append, but remember you are modifying the outside list.
        `,
      },
      {
        id: "m12-l3",
        title: "Logic Check",
        content: `
We need to check if we have "Apple" in the cart.
The \`in\` keyword checks for existence.

\`\`\`python
if "Milk" in cart:
    print("Got milk")
\`\`\`
        `,
        goal: 'Write a check: If "Apple" is in the cart, print "Healthy choice". Else print "Add an apple!".',
        startingCode: `cart = ["Apple", "Banana"]\n# Check logic`,
        objective: "User must use `in` operator.",
        expectedOutput: "Healthy choice",
        commonMistakes: `
*   **Case Sensitivity:** "apple" is not "Apple".
        `,
      },
      {
        id: "m12-l4",
        title: "Checkout (Looping)",
        content: `
Let's print a receipt. Iterate through the list and print each item nicely.
        `,
        goal: 'Loop through the `cart`. For each item, print "Item: [Item Name]".',
        startingCode: `cart = ["Apple", "Banana"]\n# Loop here`,
        objective: "User must loop and format output string.",
        expectedOutput: "Item: Apple\nItem: Banana",
        commonMistakes: `
*   **Variable Name:** \`for item in cart:\`. Use \`item\` inside the print, not \`cart\`.
        `,
      },
      {
        id: "m12-l5",
        title: "Final Project: Calculator",
        content: `
The shopping trip is over. Let's calculate the total cost.
Assume every item costs $2.50.
        `,
        goal: '1. Calculate `total = len(cart) * 2.5`. \n2. If `total > budget`, print "Over budget!". Else, print "Remaining: " and the remaining money.',
        startingCode: `budget = 5.0\ncart = ["Apple", "Banana", "Cookie"]\n# Calculate logic`,
        objective:
          "User must combine len, math, and if/else logic. 3 items * 2.5 = 7.5. Budget 5. Should print Over budget.",
        expectedOutput: "Over budget!",
        commonMistakes: `
*   **Logic:** Ensure you subtract total from budget for the remaining amount.
        `,
        type: "coding",
      },
    ],
  },
];

export const PRACTICE_ITEMS: PracticeItem[] = [
  // Practice Quizzes
  {
    id: "pq-1",
    title: "Python Basics Quiz",
    description:
      "Test your knowledge on variables, print statements, data types, and comments.",
    type: "quiz",
    difficulty: "Easy",
    quizQuestions: [
      {
        id: "pq1-q1",
        text: "Which function prints text to the screen?",
        options: ["echo()", "print()", "log()", "write()"],
        correctAnswerIndex: 1,
      },
      {
        id: "pq1-q2",
        text: "How do you create a comment?",
        options: ["//", "<!-- -->", "#", "/* */"],
        correctAnswerIndex: 2,
      },
      {
        id: "pq1-q3",
        text: "Which is a valid variable name?",
        options: ["1user", "user-name", "user_name", "User Name"],
        correctAnswerIndex: 2,
      },
      {
        id: "pq1-q4",
        text: "What is the output of: print(type(5))",
        options: ['<class "str">', '<class "int">', '<class "float">', "int"],
        correctAnswerIndex: 1,
      },
      {
        id: "pq1-q5",
        text: "What is the result of 10 // 3?",
        options: ["3.33", "3", "3.0", "4"],
        correctAnswerIndex: 1,
      },
      {
        id: "pq1-q6",
        text: "Which operator is used for exponents (powers)?",
        options: ["^", "pow", "**", "//"],
        correctAnswerIndex: 2,
      },
      {
        id: "pq1-q7",
        text: "What is the value of: bool(0)",
        options: ["True", "False", "None", "Error"],
        correctAnswerIndex: 1,
      },
      {
        id: "pq1-q8",
        text: "How do you make a string?",
        options: [
          "Just type text",
          "Use brackets []",
          "Use quotes \"\" or ''",
          "Use parentheses ()",
        ],
        correctAnswerIndex: 2,
      },
      {
        id: "pq1-q9",
        text: 'What is the result of: print("A" * 3)',
        options: ["A3", "AAA", "Error", "3A"],
        correctAnswerIndex: 1,
      },
      {
        id: "pq1-q10",
        text: "Which is NOT a valid way to make a number?",
        options: ["x = 5", "x = 5.0", "x = 5,0", 'x = int("5")'],
        correctAnswerIndex: 2,
      },
    ],
  },
  {
    id: "pq-2",
    title: "Control Flow Quiz",
    description: "Challenge yourself on if/else statements, logic, and loops.",
    type: "quiz",
    difficulty: "Medium",
    quizQuestions: [
      {
        id: "pq2-q1",
        text: "What keyword checks a second condition?",
        options: ["else if", "elseif", "elif", "check"],
        correctAnswerIndex: 2,
      },
      {
        id: "pq2-q2",
        text: "How many times does range(5) loop?",
        options: ["4", "5", "6", "Depends on start"],
        correctAnswerIndex: 1,
      },
      {
        id: "pq2-q3",
        text: "Which loop runs while a condition is true?",
        options: ["for", "foreach", "while", "loop"],
        correctAnswerIndex: 2,
      },
      {
        id: "pq2-q4",
        text: "How do you stop a loop immediately?",
        options: ["stop", "return", "exit", "break"],
        correctAnswerIndex: 3,
      },
      {
        id: "pq2-q5",
        text: 'What does the "continue" keyword do?',
        options: [
          "Stops the program",
          "Skips to the next iteration",
          "Restarts the loop",
          "Exits the loop",
        ],
        correctAnswerIndex: 1,
      },
      {
        id: "pq2-q6",
        text: 'Which operator means "Not Equal"?',
        options: ["<>", "!=", "!==", "not="],
        correctAnswerIndex: 1,
      },
      {
        id: "pq2-q7",
        text: "What is the result of: True and False",
        options: ["True", "False", "None", "Error"],
        correctAnswerIndex: 1,
      },
      {
        id: "pq2-q8",
        text: "Which statement runs if all if/elif checks fail?",
        options: ["then", "finally", "default", "else"],
        correctAnswerIndex: 3,
      },
      {
        id: "pq2-q9",
        text: "What does range(2, 5) generate?",
        options: ["2, 3, 4, 5", "2, 3, 4", "3, 4", "2, 4, 5"],
        correctAnswerIndex: 1,
      },
      {
        id: "pq2-q10",
        text: "What evaluates to True?",
        options: ["5 < 2", "not True", '5 == "5"', "10 > 5 or 1 > 5"],
        correctAnswerIndex: 3,
      },
    ],
  },
  {
    id: "pq-3",
    title: "Functions & Lists Quiz",
    description:
      "Verify your understanding of reusable code and data structures.",
    type: "quiz",
    difficulty: "Medium",
    quizQuestions: [
      {
        id: "pq3-q1",
        text: "Which keyword defines a function?",
        options: ["func", "def", "function", "define"],
        correctAnswerIndex: 1,
      },
      {
        id: "pq3-q2",
        text: "How do you send data back from a function?",
        options: ["send", "output", "return", "give"],
        correctAnswerIndex: 2,
      },
      {
        id: "pq3-q3",
        text: "What is the index of the first item in a list?",
        options: ["1", "0", "-1", "None"],
        correctAnswerIndex: 1,
      },
      {
        id: "pq3-q4",
        text: "How do you add an item to the end of a list?",
        options: ["push()", "add()", "insert()", "append()"],
        correctAnswerIndex: 3,
      },
      {
        id: "pq3-q5",
        text: "What does len(my_list) return?",
        options: [
          "The last item",
          "The size (count) of items",
          "The memory size",
          "The first item",
        ],
        correctAnswerIndex: 1,
      },
      {
        id: "pq3-q6",
        text: "How do you access the last item in a list?",
        options: ["list[last]", "list[len]", "list[-1]", "list[0]"],
        correctAnswerIndex: 2,
      },
      {
        id: "pq3-q7",
        text: 'What symbol ends the "def" line?',
        options: [";", ".", ":", "}"],
        correctAnswerIndex: 2,
      },
      {
        id: "pq3-q8",
        text: "Can lists contain other lists?",
        options: ["No", "Yes", "Only integers", "Only strings"],
        correctAnswerIndex: 1,
      },
      {
        id: "pq3-q9",
        text: "What does list.pop(0) do?",
        options: [
          "Removes first item",
          "Removes last item",
          'Removes item "0"',
          "Nothing",
        ],
        correctAnswerIndex: 0,
      },
      {
        id: "pq3-q10",
        text: "Which keyword exits a function with a value?",
        options: ["break", "exit", "return", "output"],
        correctAnswerIndex: 2,
      },
    ],
  },
  {
    id: "pq-4",
    title: "Debugging & Errors",
    description: "Learn to spot common Python errors and fix them.",
    type: "quiz",
    difficulty: "Medium",
    quizQuestions: [
      {
        id: "pq4-q1",
        text: 'What error occurs here: print("Hello"',
        options: ["SyntaxError", "TypeError", "NameError", "ValueError"],
        correctAnswerIndex: 0,
      },
      {
        id: "pq4-q2",
        text: 'What error occurs here: 5 + "5"',
        options: ["ValueError", "TypeError", "SyntaxError", "MathError"],
        correctAnswerIndex: 1,
      },
      {
        id: "pq4-q3",
        text: "What error: print(unknown_var)",
        options: ["SyntaxError", "NameError", "KeyError", "IndexError"],
        correctAnswerIndex: 1,
      },
      {
        id: "pq4-q4",
        text: "Which is an IndentationError?",
        options: [
          "x = 5",
          "def func():\nprint(x)",
          "if True:\n    pass",
          "print(x)",
        ],
        correctAnswerIndex: 1,
      },
      {
        id: "pq4-q5",
        text: "What happens if you divide by zero?",
        options: [
          "Returns 0",
          "Returns Infinity",
          "ZeroDivisionError",
          "Crash",
        ],
        correctAnswerIndex: 2,
      },
      {
        id: "pq4-q6",
        text: "my_list = [1,2]; print(my_list[5])",
        options: ["None", "0", "IndexError", "5"],
        correctAnswerIndex: 2,
      },
      {
        id: "pq4-q7",
        text: 'd = {"a":1}; print(d["b"])',
        options: ["None", "KeyError", "1", "False"],
        correctAnswerIndex: 1,
      },
      {
        id: "pq4-q8",
        text: 'int("hello")',
        options: ["0", "NaN", "ValueError", "TypeError"],
        correctAnswerIndex: 2,
      },
      {
        id: "pq4-q9",
        text: "Which fixes: if x = 5:",
        options: ["x == 5", "x := 5", "x equal 5", "x is 5"],
        correctAnswerIndex: 0,
      },
      {
        id: "pq4-q10",
        text: "What creates an infinite loop?",
        options: [
          "while False:",
          "for i in range(10):",
          "while True:",
          "if True:",
        ],
        correctAnswerIndex: 2,
      },
    ],
  },
  {
    id: "pq-5",
    title: "OOP Concepts",
    description: "Test your understanding of Classes and Objects.",
    type: "quiz",
    difficulty: "Medium",
    quizQuestions: [
      {
        id: "pq5-q1",
        text: "Keyword to define a class?",
        options: ["def", "class", "struct", "object"],
        correctAnswerIndex: 1,
      },
      {
        id: "pq5-q2",
        text: "What is __init__?",
        options: [
          "A constructor",
          "A destructor",
          "A regular method",
          "A variable",
        ],
        correctAnswerIndex: 0,
      },
      {
        id: "pq5-q3",
        text: "Keyword to refer to the current instance?",
        options: ["this", "me", "self", "it"],
        correctAnswerIndex: 2,
      },
      {
        id: "pq5-q4",
        text: "How to create an object of class Dog?",
        options: ["new Dog()", "Dog()", "create Dog()", "Dog.new()"],
        correctAnswerIndex: 1,
      },
      {
        id: "pq5-q5",
        text: "What is inheritance?",
        options: [
          "Copying code",
          "A class deriving from another",
          "Importing modules",
          "Looping",
        ],
        correctAnswerIndex: 1,
      },
    ],
  },
  {
    id: "pq-6",
    title: "File Handling Quiz",
    description: "Basics of reading and writing files.",
    type: "quiz",
    difficulty: "Medium",
    quizQuestions: [
      {
        id: "pq6-q1",
        text: "Function to open a file?",
        options: ["read()", "file()", "open()", "load()"],
        correctAnswerIndex: 2,
      },
      {
        id: "pq6-q2",
        text: 'Mode "w" stands for?',
        options: ["Watch", "Write", "Wrap", "Web"],
        correctAnswerIndex: 1,
      },
      {
        id: "pq6-q3",
        text: "Method to read a single line?",
        options: ["read()", "readlines()", "readline()", "scan()"],
        correctAnswerIndex: 2,
      },
      {
        id: "pq6-q4",
        text: "Why close a file?",
        options: [
          "To save memory/changes",
          "To delete it",
          "No need",
          "To format it",
        ],
        correctAnswerIndex: 0,
      },
      {
        id: "pq6-q5",
        text: 'Mode "a" stands for?',
        options: ["Add", "Append", "Apply", "After"],
        correctAnswerIndex: 1,
      },
    ],
  },
  {
    id: "pq-7",
    title: "Advanced Concepts",
    description: "Lambdas, generators, and more.",
    type: "quiz",
    difficulty: "Hard",
    quizQuestions: [
      {
        id: "pq7-q1",
        text: "What is a lambda?",
        options: [
          "A named function",
          "An anonymous function",
          "A list",
          "A module",
        ],
        correctAnswerIndex: 1,
      },
      {
        id: "pq7-q2",
        text: "Syntax for lambda adding x and y?",
        options: [
          "lambda x,y: x+y",
          "def(x,y) => x+y",
          "function(x,y) {x+y}",
          "x,y -> x+y",
        ],
        correctAnswerIndex: 0,
      },
      {
        id: "pq7-q3",
        text: "What does list comprehension do?",
        options: [
          "Creates lists concisely",
          "Deletes lists",
          "Sorts lists",
          "Prints lists",
        ],
        correctAnswerIndex: 0,
      },
      {
        id: "pq7-q4",
        text: "Example of list comprehension?",
        options: [
          "[x for x in range(5)]",
          "for x in range(5): list.add(x)",
          "list(range(5))",
          "x = 0..5",
        ],
        correctAnswerIndex: 0,
      },
      {
        id: "pq7-q5",
        text: "What keyword yields a value from a generator?",
        options: ["return", "yield", "send", "emit"],
        correctAnswerIndex: 1,
      },
    ],
  },
  {
    id: "pq-8",
    title: "Standard Libraries",
    description: "Math, Random, Date, and JSON.",
    type: "quiz",
    difficulty: "Easy",
    quizQuestions: [
      {
        id: "pq8-q1",
        text: "Module for math functions?",
        options: ["calc", "math", "numbers", "algebra"],
        correctAnswerIndex: 1,
      },
      {
        id: "pq8-q2",
        text: "Module for random numbers?",
        options: ["rand", "random", "rng", "chance"],
        correctAnswerIndex: 1,
      },
      {
        id: "pq8-q3",
        text: "How to get current date?",
        options: [
          "datetime.now()",
          "date.today()",
          "time.now()",
          "All of above (depend on import)",
        ],
        correctAnswerIndex: 3,
      },
      {
        id: "pq8-q4",
        text: "Function to parse JSON string?",
        options: ["json.parse()", "json.load()", "json.loads()", "json.read()"],
        correctAnswerIndex: 2,
      },
      {
        id: "pq8-q5",
        text: "Value of math.pi?",
        options: ["3.14...", "3.14159", "22/7", "3.1415926535..."],
        correctAnswerIndex: 3,
      },
    ],
  },

  // Practice Problems
  {
    id: "pp-1",
    title: "Celsius to Fahrenheit",
    description:
      "Write a program that converts a temperature from Celsius to Fahrenheit.",
    type: "problem",
    difficulty: "Easy",
    content: `
### Task
Create a variable \`celsius\` with value \`25\`.
Convert it to Fahrenheit using the formula: \`F = (C * 9/5) + 32\`.
Print the result.
        `,
    startingCode: `celsius = 25\n# Your conversion logic here`,
    objective: "Calculate and print 77.0.",
  },
  {
    id: "pp-2",
    title: "Find the Max",
    description:
      "Find the largest number in a list without using the max() function.",
    type: "problem",
    difficulty: "Medium",
    content: `
### Task
Given a list of numbers: \`nums = [10, 5, 20, 8, 15]\`.
Write a loop to find the largest number.
Print the largest number.
        `,
    startingCode: `nums = [10, 5, 20, 8, 15]\n# Find max manually`,
    objective: "Loop through list and print 20.",
  },
  {
    id: "pp-3",
    title: "Reverse a String",
    description: "Reverse a given string using slicing.",
    type: "problem",
    difficulty: "Easy",
    content: `
### Task
Given \`word = "Python"\`.
Use slicing to print it backwards ("nohtyP").
        `,
    startingCode: `word = "Python"\n# Print reverse`,
    objective: 'Print "nohtyP".',
  },
  {
    id: "pp-4",
    title: "Count Vowels",
    description: "Count how many vowels are in a sentence.",
    type: "problem",
    difficulty: "Medium",
    content: `
### Task
Given \`text = "The quick brown fox"\`.
Count the number of vowels (a, e, i, o, u) in the string.
Print the final count.
        `,
    startingCode: `text = "The quick brown fox"\nvowels = "aeiou"\n# Your loop here`,
    objective: "Count vowels and print the integer result (5).",
  },
  {
    id: "pp-5",
    title: "FizzBuzz",
    description: "The classic interview question.",
    type: "problem",
    difficulty: "Hard",
    content: `
### Task
Loop from 1 to 20.
*   If the number is divisible by 3, print "Fizz".
*   If divisible by 5, print "Buzz".
*   If divisible by both, print "FizzBuzz".
*   Otherwise, print the number.
        `,
    startingCode: `# Loop 1 to 20`,
    objective:
      "Print correct sequence: 1, 2, Fizz, 4, Buzz, Fizz, ..., 14, FizzBuzz, ...",
  },
  {
    id: "pp-6",
    title: "Palindrome Checker",
    description: "Check if a word reads the same forwards and backwards.",
    type: "problem",
    difficulty: "Medium",
    content: `
### Task
Given \`word = "racecar"\`.
Check if the word is equal to its reverse.
If it is, print "Palindrome". Else print "Not Palindrome".
        `,
    startingCode: `word = "racecar"\n# Check if palindrome`,
    objective: 'Print "Palindrome" for racecar.',
  },
  {
    id: "pp-7",
    title: "Factorial Calculator",
    description: "Calculate the factorial of a number (e.g., 5! = 5*4*3*2*1).",
    type: "problem",
    difficulty: "Medium",
    content: `
### Task
Given \`n = 5\`.
Use a loop to calculate the factorial (product of all numbers from 1 to n).
Print the result.
        `,
    startingCode: `n = 5\n# Calculate factorial`,
    objective: "Print 120.",
  },
  {
    id: "pp-8",
    title: "Sum of Evens",
    description: "Sum all even numbers in a range.",
    type: "problem",
    difficulty: "Easy",
    content: `
### Task
Sum all even numbers from 1 to 20 (inclusive).
Print the total.
        `,
    startingCode: `# Loop and sum evens`,
    objective: "Print 110.",
  },
  {
    id: "pp-9",
    title: "Prime Checker",
    description: "Check if a number is prime.",
    type: "problem",
    difficulty: "Medium",
    content: `
### Task
Given \`n = 29\`.
Check if it is prime (divisible only by 1 and itself).
Print "Prime" or "Not Prime".
        `,
    startingCode: `n = 29\n# Check for factors`,
    objective: "Print Prime.",
  },
  {
    id: "pp-10",
    title: "Fibonacci Sequence",
    description: "Print the first 10 numbers of the Fibonacci sequence.",
    type: "problem",
    difficulty: "Medium",
    content: `
### Task
Start with 0, 1.
Each next number is the sum of the two before.
Print the first 10 numbers (0, 1, 1, 2, 3, 5, 8, 13, 21, 34).
        `,
    startingCode: `# Print first 10 Fibonacci`,
    objective: "Print the correct sequence.",
  },
  {
    id: "pp-11",
    title: "Dictionary Search",
    description: "Look up values in a dictionary safely.",
    type: "problem",
    difficulty: "Easy",
    content: `
### Task
Given \`data = {"name": "Alice", "age": 30}\`.
Try to get "city". If missing, print "Unknown".
Do not crash.
        `,
    startingCode: `data = {"name": "Alice", "age": 30}\n# Safe lookup`,
    objective: "Print Unknown.",
  },
  {
    id: "pp-12",
    title: "Anagram Checker",
    description: "Check if two strings are anagrams.",
    type: "problem",
    difficulty: "Hard",
    content: `
### Task
Given \`s1 = "listen"\` and \`s2 = "silent"\`.
Check if they contain the same letters.
Print "Anagram" or "Not".
        `,
    startingCode: `s1 = "listen"\ns2 = "silent"\n# Check anagram`,
    objective: "Print Anagram.",
  },

  // Practice Projects
  {
    id: "pj-1",
    title: "Number Guessing Game",
    description:
      "Build a game where the computer picks a number and you have to guess it.",
    type: "project",
    difficulty: "Medium",
    content: `
### Project Brief
1. Import \`random\`.
2. Generate a secret number between 1 and 10.
3. Use a \`while\` loop to ask the user for a guess.
4. If they guess correctly, print "You won!" and break.
5. If they guess wrong, tell them "Try again".
        `,
    startingCode: `import random\n# Your game logic`,
    objective: "Implement a guessing game loop that breaks on correct guess.",
  },
  {
    id: "pj-2",
    title: "Simple Calculator",
    description:
      "Create a calculator that can add, subtract, multiply, and divide.",
    type: "project",
    difficulty: "Hard",
    content: `
### Project Brief
1. Define functions for add, sub, mul, div.
2. Ask the user for two numbers.
3. Ask the user for an operation (+, -, *, /).
4. Call the correct function and print the result.
        `,
    startingCode: `# Define functions first`,
    objective: "Create calculator functions and handle user input flow.",
  },
  {
    id: "pj-3",
    title: "Text Adventure",
    description: "Create a story where user choices change the outcome.",
    type: "project",
    difficulty: "Hard",
    content: `
### Project Brief
Create a text adventure.
1. Print "You are at a crossroads. Left or Right?".
2. Get user input.
3. If Left: Print "You found a treasure!".
4. If Right: Print "You fell in a hole.".
5. Add more layers (nested ifs) to make it interesting.
        `,
    startingCode: `print("Welcome to the Adventure!")\n# Your story logic`,
    objective:
      "Create a branching logic story with at least 2 levels of choice.",
  },
  {
    id: "pj-4",
    title: "To-Do List CLI",
    description: "Build a command-line To-Do list manager.",
    type: "project",
    difficulty: "Hard",
    content: `
### Project Brief
1. Create an empty list \`todos = []\`.
2. Start an infinite \`while True\` loop.
3. Ask user for command: "add", "view", or "quit".
4. If "add": Ask for task name and append to list.
5. If "view": Print all tasks.
6. If "quit": Break the loop.
        `,
    startingCode: `todos = []\n# Build your app loop`,
    objective: "Implement add, view, and quit commands using a loop and list.",
  },
  {
    id: "pj-5",
    title: "Rock Paper Scissors",
    description: "Classic game against the computer.",
    type: "project",
    difficulty: "Medium",
    content: `
### Project Brief
1. List choices: R, P, S.
2. Computer picks random.
3. User inputs choice.
4. Compare and print Winner/Loser/Tie.
        `,
    startingCode: `import random\n# Game logic`,
    objective: "Implement logic for all 3 win/loss conditions.",
  },
  {
    id: "pj-6",
    title: "Password Generator",
    description: "Generate strong random passwords.",
    type: "project",
    difficulty: "Medium",
    content: `
### Project Brief
1. String of all chars (letters, numbers).
2. Ask user for length.
3. Randomly pick chars and join them.
4. Print password.
        `,
    startingCode: `import random\nchars = "abcdef123456"\n# Generate`,
    objective: "Create a string of random characters of user length.",
  },
  {
    id: "pj-7",
    title: "Contact Book",
    description: "Store names and numbers.",
    type: "project",
    difficulty: "Hard",
    content: `
### Project Brief
1. Use a Dictionary \`{}\`.
2. Loop commands: Add, Search, Delete, Quit.
3. Add: \`contacts[name] = number\`.
4. Search: Print number or "Not found".
        `,
    startingCode: `contacts = {}\n# App loop`,
    objective: "CRUD operations on a dictionary.",
  },
  {
    id: "pj-8",
    title: "Hangman (Simple)",
    description: "Guess the word.",
    type: "project",
    difficulty: "Hard",
    content: `
### Project Brief
1. Secret word "PYTHON".
2. Loop 6 tries.
3. Ask letter.
4. If in word, print "Yes", else "No" and lose life.
5. (Optional) Show "P_TH_N".
        `,
    startingCode: `word = "PYTHON"\n# Game loop`,
    objective: "Letter checking loop with life counter.",
  },
  {
    id: "pj-9",
    title: "Tic Tac Toe",
    description: "2-player board game.",
    type: "project",
    difficulty: "Hard",
    content: `
### Project Brief
1. Board list \`[' ',' ',' '...]\`.
2. Print board function.
3. Loop turns X and O.
4. Input index 0-8.
5. Check win condition (rows/cols).
        `,
    startingCode: `board = [' ']*9\n# Board logic`,
    objective: "Board display and input handling.",
  },
];
