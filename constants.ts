
import type { Module, PracticeItem } from './types';

export const LESSON_PLAN: Module[] = [
        {
                id: 'module-1',
                title: 'Module 1: Python Basics',
                lessons: [
                        {
                                id: 'm1-l1',
                                title: 'Hello World!',
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
                                expectedOutput: 'Hello World!',
                                commonMistakes: `
*   **Missing Quotes:** \`print(Hello World)\` causes an error because Python looks for variables named Hello and World.
*   **Capitalization:** \`Print\` is not the same as \`print\`. Python is case-sensitive.
*   **Missing Parentheses:** Python 3 requires parentheses. \`print "Hello"\` will fail.
        `
                        },
                        {
                                id: 'm1-l2',
                                title: 'Comments',
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
                                objective: 'The user must print "Coding is fun" and include a comment on the line above it.',
                                expectedOutput: 'Coding is fun',
                                commonMistakes: `
*   **Nesting:** You cannot put code *inside* a comment and expect it to run.
*   **Wrong Slash:** Comments use \`#\`, not \`//\` (that's JavaScript/C++).
        `
                        },
                        {
                                id: 'm1-l3',
                                title: 'Variables',
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
                                objective: 'The user must define `hero` as "Link", `hearts` as 3 (integer), and print the `hero` variable.',
                                expectedOutput: 'Link',
                                commonMistakes: `
*   **Backwards Assignment:** \`"Link" = hero\` is invalid. The variable name must be on the LEFT.
*   **Using Spaces:** \`my hero = "Link"\` is a syntax error. Use \`my_hero\`.
*   **Printing Strings instead of Vars:** \`print("hero")\` prints the word "hero", not the value "Link".
        `
                        },
                        {
                                id: 'm1-l4',
                                title: 'Final Quiz: Basics',
                                type: 'quiz',
                                content: `
You've learned output, comments, and variables. Let's verify your knowledge before moving to dynamic logic.
        `,
                                goal: 'Score 100% on the quiz to unlock the next module.',
                                startingCode: '',
                                objective: 'Pass the quiz with 100% accuracy.',
                                quizQuestions: [
                                        {
                                                id: 'q1',
                                                text: 'What happens if you run: print(Hello)',
                                                options: ['It prints Hello', 'It crashes (NameError)', 'It prints "Hello"', 'Nothing happens'],
                                                correctAnswerIndex: 1
                                        },
                                        {
                                                id: 'q2',
                                                text: 'Which variable name is valid in Python?',
                                                options: ['2nd_player', 'my variable', 'user_score', 'def'],
                                                correctAnswerIndex: 2
                                        },
                                        {
                                                id: 'q3',
                                                text: 'What does the # symbol do?',
                                                options: ['Starts a variable', 'Ends the program', 'Imports a library', 'Starts a comment'],
                                                correctAnswerIndex: 3
                                        }
                                ]
                        },
                ],
        },
        {
                id: 'module-2',
                title: 'Module 2: Variable Logic',
                lessons: [
                        {
                                id: 'm2-l1',
                                title: 'Reassigning Values',
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
                                goal: '1. Set `speed` to 0. \n2. Print `speed`. \n3. Update `speed` to 60. \n4. Print `speed` again.',
                                startingCode: `speed = 0\n# Your code here`,
                                objective: 'User must print 0, reassign speed to 60, and print 60.',
                                expectedOutput: '0\n60',
                                commonMistakes: `
*   **Expecting Auto-Update:** Changing a variable does not update previous print statements that already ran.
*   **Creating New Vars:** Writing \`speed2 = 60\` instead of updating the existing \`speed\` variable.
        `
                        },
                        {
                                id: 'm2-l2',
                                title: 'Self-Referencing Math',
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
                                goal: 'Start with `xp = 100`. Add 50 to `xp` using self-referencing logic (`xp = ...`). Then subtract 10. Print the final `xp`.',
                                startingCode: `xp = 100\n# Update xp twice, then print`,
                                objective: 'User must update xp to 150, then to 140, and print 140.',
                                expectedOutput: '140',
                                commonMistakes: `
*   **Math Error:** Writing \`xp - 10\` without assigning it (\`xp = xp - 10\`) does nothing to the variable.
*   **Syntax:** \`100 + 50 = xp\` is invalid. Variable name always on the left.
        `
                        },
                        {
                                id: 'm2-l3',
                                title: 'Multiple Variable Logic',
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
                                objective: 'User must define the variables correctly and print "Golden Sword".',
                                expectedOutput: 'Golden Sword',
                                commonMistakes: `
*   **Missing Space:** \`"Golden" + "Sword"\` results in \`"GoldenSword"\`. You need to add a space string \`" "\` in the middle.
*   **Variable Typos:** Ensure variable names match exactly what you defined.
        `
                        },
                        {
                                id: 'm2-final',
                                title: 'Final Project: Value Swapper',
                                content: `
This is a classic programming interview question.
You have two variables, \`a\` and \`b\`. You need to swap their values so that \`a\` holds \`b\`'s value and \`b\` holds \`a\`'s value.

**Challenge:** You cannot just reassign them manually like \`a=10\`. You must use logic that works for any values.
        `,
                                goal: '1. Create `a = 5` and `b = 10`. \n2. Create a temp variable to hold `a`. \n3. Set `a` to `b`. \n4. Set `b` to temp. \n5. Print `a` then `b`.',
                                startingCode: `a = 5\nb = 10\n# Swap logic here\nprint(a)\nprint(b)`,
                                objective: 'Output must be 10 then 5.',
                                expectedOutput: '10\n5',
                                commonMistakes: `
*   **Overwriting too soon:** If you do \`a = b\`, you lose the value of 5 forever. You must save it in a temporary variable first.
        `
                        },
                ],
        },
        {
                id: 'module-3',
                title: 'Module 3: Data Types',
                lessons: [
                        {
                                id: 'm3-l1',
                                title: 'Integers vs Strings',
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
                                expectedOutput: '200\n100100',
                                commonMistakes: `
*   **Confusing Quotes:** \`num = "100"\` makes it a string. \`num = 100\` makes it an integer.
*   **Type Error:** Trying \`print(10 + "10")\` causes an error. You can't add numbers to text directly.
        `
                        },
                        {
                                id: 'm3-l2',
                                title: 'Floats (Decimals)',
                                content: `
When you need precision, use **Floats**. These are numbers with decimal points.
Even if the decimal is zero (\`5.0\`), Python treats it as a float.

**Pro Tip:** Dividing two integers *always* results in a float in Python.
\`10 / 2\` becomes \`5.0\`.
        `,
                                goal: 'Create `price = 9.99`. Calculate `tax = price * 0.1`. Create `total = price + tax`. Print the `total`.',
                                startingCode: `# Your code here`,
                                objective: 'User must perform float math. 9.99 + 0.999 = 10.989.',
                                expectedOutput: '10.989',
                                commonMistakes: `
*   **Using Commas:** \`9,99\` is not a number in Python. Use a dot \`9.99\`.
*   **Variable naming:** Ensure you use the exact variable names for the calculation.
        `
                        },
                        {
                                id: 'm3-l3',
                                title: 'String Concatenation',
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
                                objective: 'User must concatenate variables with strict formatting, including the comma and space.',
                                expectedOutput: 'Hi, User! :)',
                                commonMistakes: `
*   **Forgetting Separators:** You often need to manually add \`" "\` or \`", "\` between variables.
*   **Adding Numbers:** If you try to add a number to these strings, it will fail.
        `
                        },
                        {
                                id: 'm3-l4',
                                title: 'Type Conversion (Casting)',
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
                                objective: 'User must cast string->int, add, then int->string, then print "550".',
                                expectedOutput: '550',
                                commonMistakes: `
*   **Forgetting Reassignment:** \`int(s_points)\` doesn't change the variable itself, it just returns a number. You must save it: \`points = int(s_points)\`.
*   **Invalid Conversion:** \`int("hello")\` will crash because "hello" isn't a number.
        `
                        },
                        {
                                id: 'm3-l5',
                                title: 'Input',
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
                                objective: 'User must call input() twice, save results, and print formatted string.',
                                commonMistakes: `
*   **Syntax Error:** \`input = "Question"\` destroys the input function. Use parentheses: \`input("Question")\`.
*   **Formatting:** Pay close attention to the commas and colons in the final print statement.
        `
                        },
                        {
                                id: 'm3-final',
                                title: 'Final Quiz: Data Types',
                                type: 'quiz',
                                content: `
Verify your understanding of strings, integers, floats, and type conversion.
        `,
                                goal: 'Score 100% to unlock the next module.',
                                startingCode: '',
                                objective: 'Pass the quiz.',
                                quizQuestions: [
                                        {
                                                id: 'm3q1',
                                                text: 'What is the type of: "10.5"',
                                                options: ['int', 'float', 'str', 'bool'],
                                                correctAnswerIndex: 2
                                        },
                                        {
                                                id: 'm3q2',
                                                text: 'Which function converts a string to a number?',
                                                options: ['str()', 'num()', 'int()', 'convert()'],
                                                correctAnswerIndex: 2
                                        },
                                        {
                                                id: 'm3q3',
                                                text: 'What is the result of: "A" + "B"',
                                                options: ['Error', 'AB', 'A B', 'NaN'],
                                                correctAnswerIndex: 1
                                        }
                                ]
                        },
                ],
        },
        {
                id: 'module-4',
                title: 'Module 4: Control Flow',
                lessons: [
                        {
                                id: 'm4-l1',
                                title: 'If/Else Logic',
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
                                objective: 'User must write correct if/else logic and run it against two different values (15 and 80).',
                                expectedOutput: 'Low\nGood',
                                commonMistakes: `
*   **Missing Colon:** You must put a \`:\` after the condition and after \`else\`.
*   **Bad Indentation:** The print statements MUST be indented. \`else\` must be aligned with \`if\`.
*   **Comparison:** Use \`<\` for less than.
        `
                        },
                        {
                                id: 'm4-l2',
                                title: 'Multiple Conditions (Elif)',
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
                                objective: 'User must implement the elif chain correctly. For 25, it should print "Nice".',
                                expectedOutput: 'Nice',
                                commonMistakes: `
*   **Order Matters:** If you checked \`temp > 10\` first, it would be True for 25, and "Cool" would print. Order from specific/highest to lowest.
*   **Syntax:** \`else if\` is invalid in Python. Use \`elif\`.
        `
                        },
                        {
                                id: 'm4-l3',
                                title: 'The For Loop',
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
                                goal: 'Calculate the sum of numbers from 1 to 10 using a loop. Create a variable `total = 0` before the loop, add `i` to it inside the loop, and print `total` at the end.',
                                startingCode: `total = 0\n# Loop 1 to 10 and add to total\n# Print total`,
                                objective: 'User must accumulate sum (55) using a loop. High complexity increase.',
                                expectedOutput: '55',
                                commonMistakes: `
*   **Range Stop:** \`range(1, 10)\` stops at 9. Use \`range(1, 11)\` to include 10.
*   **Indentation:** The print statement for the result must be *outside* (unindented) the loop, or it will print every step.
        `
                        },
                        {
                                id: 'm4-l4',
                                title: 'The While Loop',
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
                                objective: 'User must print 10, 8, 6, 4, 2, Done.',
                                expectedOutput: '10\n8\n6\n4\n2\nDone',
                                commonMistakes: `
*   **Infinite Loop:** Forgetting \`n = n - 2\` will make the loop run forever because 10 is always > 0.
*   **Logic:** \`n - 2\` alone does nothing. You must assign it: \`n = n - 2\`.
        `
                        },
                        {
                                id: 'm4-final',
                                title: 'Final Project: Grade Checker',
                                content: `
Let's combine user input (from previous lessons) with logic.
You need to determine a letter grade based on a score.
        `,
                                goal: 'Create a variable `score = 85`. If score >= 90 print "A". Elif >= 80 print "B". Else print "C".',
                                startingCode: `score = 85\n# Grade logic here`,
                                objective: 'Print "B".',
                                expectedOutput: 'B',
                                type: 'coding'
                        }
                ],
        },
        {
                id: 'module-5',
                title: 'Module 5: Randomness',
                lessons: [
                        {
                                id: 'm5-l1',
                                title: 'Importing Modules',
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
                                objective: 'User must import random, generate int, and use if/else.',
                                commonMistakes: `
*   **Missing Import:** You must write \`import random\`.
*   **Function Name:** It is \`randint\`, not \`randomInt\`.
        `
                        },
                        {
                                id: 'm5-l2',
                                title: 'Random Chance Logic',
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
                                objective: 'User must implement percentage chance logic correctly with multiple tiers.',
                                commonMistakes: `
*   **Logic Gaps:** Ensure your ranges cover all numbers 1-100.
*   **Comparison:** \`<\` 20 covers 1-19.
        `
                        },
                        {
                                id: 'm5-l3',
                                title: 'Shuffling Lists',
                                content: `
Want to mix up a playlist or a deck of cards? Use \`random.shuffle()\`.
**Note:** This modifies the list *in place*. It doesn't return a new list.

\`\`\`python
deck = ["A", "K", "Q", "J"]
random.shuffle(deck) # Changes 'deck' directly
print(deck)
\`\`\`
        `,
                                goal: 'Create a list of 5 distinct numbers. Shuffle them. Print the list. Then shuffle again. Print again.',
                                startingCode: `import random\nnums = [1, 2, 3, 4, 5]\n# Shuffle, print, shuffle, print`,
                                objective: 'User must apply shuffle twice and print twice to observe changes.',
                                commonMistakes: `
*   **Assignment Error:** \`new_list = random.shuffle(nums)\` is wrong. \`new_list\` will be \`None\`. Just call the function.
        `
                        },
                        {
                                id: 'm5-l4',
                                title: 'Random Choice',
                                content: `
If you just want to pick *one* winner from a list, use \`random.choice()\`.

\`\`\`python
menu = ["Pizza", "Burger", "Salad"]
dinner = random.choice(menu)
\`\`\`
        `,
                                goal: 'Create a list of 3 moves: "Rock", "Paper", "Scissors". Pick a random move for the computer and print "Computer chose: [move]".',
                                startingCode: `import random\nmoves = ["Rock", "Paper", "Scissors"]\n# Logic`,
                                objective: 'User must use random.choice and string concatenation.',
                                commonMistakes: `
*   **Choice vs Randint:** You don't need numbers here. \`choice\` picks the item directly.
        `
                        },
                        {
                                id: 'm5-final',
                                title: 'Final Quiz: Randomness',
                                type: 'quiz',
                                content: 'Test your luck and knowledge.',
                                goal: 'Pass to unlock the next module.',
                                startingCode: '',
                                objective: 'Pass quiz.',
                                quizQuestions: [
                                        { id: 'm5q1', text: 'Which function picks one item from a list?', options: ['random.pick()', 'random.choice()', 'random.one()', 'random.select()'], correctAnswerIndex: 1 },
                                        { id: 'm5q2', text: 'Does random.shuffle(list) return a new list?', options: ['Yes', 'No, it modifies in place', 'Sometimes', 'It returns a boolean'], correctAnswerIndex: 1 },
                                        { id: 'm5q3', text: 'What range does random.randint(1, 5) cover?', options: ['1 to 4', '0 to 5', '1 to 5 (inclusive)', '1 to 6'], correctAnswerIndex: 2 }
                                ]
                        }
                ],
        },
        {
                id: 'module-6',
                title: 'Module 6: Functions',
                lessons: [
                        {
                                id: 'm6-l1',
                                title: 'Defining Functions',
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
                                objective: 'User must define the function correctly and invoke it multiple times.',
                                expectedOutput: 'Hello\nHello\nHello',
                                commonMistakes: `
*   **Not Calling It:** Defining a function doesn't run it. You must write \`greet()\` unindented at the bottom.
*   **Indentation:** The code inside the function must be indented.
        `
                        },
                        {
                                id: 'm6-l2',
                                title: 'Parameters',
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
                                goal: 'Define a function `add_score(current, points)` that prints the result of `current + points`. Call it with (100, 50) and (0, 10).',
                                startingCode: `# Define function with 2 parameters`,
                                objective: 'User must handle two parameters, perform math, and print.',
                                expectedOutput: '150\n10',
                                commonMistakes: `
*   **Argument Count:** You must pass exactly 2 values if you defined 2 parameters.
*   **Variable Scope:** Don't try to use variables from outside the function if you didn't pass them in.
        `
                        },
                        {
                                id: 'm6-l3',
                                title: 'The Return Statement',
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
                                goal: 'Write a function `to_seconds(minutes)` that returns `minutes * 60`. Call it with 5, save the result to a variable, and print the result.',
                                startingCode: `# Define and use return`,
                                objective: 'User must return the calculation, capture it in a variable, and print it. Result: 300.',
                                expectedOutput: '300',
                                commonMistakes: `
*   **Print vs Return:** If you print inside the function, the variable \`val\` will be \`None\`. You MUST use \`return\`.
*   **Unreachable Code:** Code written after the \`return\` line will never run.
        `
                        },
                        {
                                id: 'm6-l4',
                                title: 'Scope',
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
                                objective: 'User must demonstrate shadowing variables. Output should be "Local" then "Global".',
                                expectedOutput: 'Local\nGlobal',
                                commonMistakes: `
*   **Confusion:** Changing the local \`msg\` does NOT change the global \`msg\`.
        `
                        },
                        {
                                id: 'm6-final',
                                title: 'Final Project: Temperature Converter',
                                content: `
Create a utility function to convert Celsius to Fahrenheit.
Formula: (C * 9/5) + 32
        `,
                                goal: 'Define `convert(c)` that returns the F value. Call it with `convert(0)` and print the result (should be 32.0).',
                                startingCode: `# Define function`,
                                objective: 'Implement function with return and call it.',
                                expectedOutput: '32.0',
                                type: 'coding'
                        }
                ],
        },
        {
                id: 'module-7',
                title: 'Module 7: Logic & Operators',
                lessons: [
                        {
                                id: 'm7-l1',
                                title: 'The Modulo Operator',
                                content: `
You know \`+\`, \`-\`, \`*\`, \`/\`. Meet **Modulo** \`%\`.
It gives you the **remainder** of a division.
*   \`10 % 3\` is 1 (because 3 goes into 10 three times, with 1 left over).
*   \`4 % 2\` is 0 (perfect division).

This is commonly used to check for even/odd numbers (any number % 2 == 0 is even).
        `,
                                goal: 'Use a loop to check numbers 1 through 10. If a number is even (`num % 2 == 0`), print it.',
                                startingCode: `# Loop 1-10, if even print`,
                                objective: 'User must combine loop, modulo, and if statement.',
                                expectedOutput: '2\n4\n6\n8\n10',
                                commonMistakes: `
*   **Wrong Operator:** \`/\` divides. \`%\` gets remainder.
*   **Equality Check:** Remember to use \`==\` to check if the remainder IS zero.
        `
                        },
                        {
                                id: 'm7-l2',
                                title: 'Comparison Operators',
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
                                objective: 'User must use equality operator == inside a function.',
                                expectedOutput: 'True\nFalse',
                                commonMistakes: `
*   **Assignment vs Comparison:** \`if x = 5\` sets x to 5 (and crashes in if). \`if x == 5\` checks if x is 5.
        `
                        },
                        {
                                id: 'm7-l3',
                                title: 'Logical Operators',
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
                                goal: 'Loop from 1 to 30. If a number is greater than 10 AND less than 20, print it.',
                                startingCode: `# Loop and complex check`,
                                objective: 'User must correctly combine conditions with `and` to filter range 11-19.',
                                expectedOutput: '11\n12\n13\n14\n15\n16\n17\n18\n19',
                                commonMistakes: `
*   **English Syntax:** \`if x > 10 and < 20\` is invalid. You must repeat the variable: \`if x > 10 and x < 20\`.
        `
                        },
                        {
                                id: 'm7-l4',
                                title: 'Assignment Operators',
                                content: `
Programmers are efficient. Instead of \`x = x + 1\`, we write \`x += 1\`.
Works for other math too: \`-=\`, \`*=\`, \`/=\`.

\`\`\`python
health = 100
health -= 10 # health is 90
health *= 2  # health is 180
\`\`\`
        `,
                                goal: 'Start with `score = 0`. In a loop of range 5, add 10 to score each time using `+=`. Print final score.',
                                startingCode: `score = 0\n# Loop and accumulate`,
                                objective: 'User must use shorthand assignment operator in a loop. Result 50.',
                                expectedOutput: '50',
                                commonMistakes: `
*   **Typo:** \`=+\` is not an operator (it just sets positive value). Use \`+=\`.
        `
                        },
                        {
                                id: 'm7-final',
                                title: 'Final Quiz: Logic Gates',
                                type: 'quiz',
                                content: 'Verify your boolean logic skills.',
                                goal: 'Pass the quiz.',
                                startingCode: '',
                                objective: 'Pass quiz.',
                                quizQuestions: [
                                        { id: 'm7q1', text: 'What is 10 % 3?', options: ['3', '1', '0', '3.33'], correctAnswerIndex: 1 },
                                        { id: 'm7q2', text: 'True or False is...', options: ['True', 'False', 'None', 'Error'], correctAnswerIndex: 0 },
                                        { id: 'm7q3', text: 'Which means "Not Equal"?', options: ['<>', '!=', 'not =', '!=='], correctAnswerIndex: 1 }
                                ]
                        }
                ],
        },
        {
                id: 'module-8',
                title: 'Module 8: Advanced Math',
                lessons: [
                        {
                                id: 'm8-l1',
                                title: 'Area Calculation',
                                content: `
Let's put math to use. Area of a rectangle is \`width * length\`.
        `,
                                goal: 'Define a function `get_area(w, l)`. Return the area. Call it with arguments 10 and 5 and print the result.',
                                startingCode: `# Define function`,
                                objective: 'User must define function with parameters and return math result.',
                                expectedOutput: '50',
                                commonMistakes: `
*   **Forgetting Return:** The function must return the value to be printed.
        `
                        },
                        {
                                id: 'm8-l2',
                                title: 'Division & Integers',
                                content: `
Regular division \`/\` returns a float.
Floor division \`//\` returns an integer (rounds down).

\`\`\`python
print(10 / 3)  # 3.3333...
print(10 // 3) # 3
\`\`\`
        `,
                                goal: 'You have 100 seconds. Calculate how many full minutes that is using `//`. Print the result.',
                                startingCode: `seconds = 100\n# Calculate minutes`,
                                objective: 'User must use // operator to get 1.',
                                expectedOutput: '1',
                                commonMistakes: `
*   **Using /:** \`100 / 60\` gives \`1.66\`, which is not "full minutes".
        `
                        },
                        {
                                id: 'm8-l3',
                                title: 'Exponents (Powers)',
                                content: `
For $x^y$, use \`**\`.

\`\`\`python
print(4 ** 2) # 16
print(4 ** 0.5) # Square root (2.0)
\`\`\`
        `,
                                goal: 'Calculate the volume of a cube with side length 4 ($4^3$). Print it.',
                                startingCode: `side = 4\n# Calculate volume`,
                                objective: 'User must use ** operator. Result 64.',
                                expectedOutput: '64',
                                commonMistakes: `
*   **Wrong Operator:** \`^\` is XOR in Python, not power. You MUST use \`**\`.
        `
                        },
                        {
                                id: 'm8-l4',
                                title: 'Math Library',
                                content: `
For complex things like Pi, square roots, or trig, import \`math\`.

\`\`\`python
import math
print(math.pi)
print(math.sqrt(16))
\`\`\`
        `,
                                goal: 'Calculate the area of a circle with radius 5 ($A = \\pi r^2$). Use \`math.pi\`. Print the result.',
                                startingCode: `import math\nr = 5\n# Calculate area`,
                                objective: 'User must combine math.pi and exponent operator.',
                                expectedOutput: '78.53981633974483',
                                commonMistakes: `
*   **Typo:** \`Math.pi\` (capital M) will fail. It is lowercase \`math\`.
        `
                        },
                        {
                                id: 'm8-l5',
                                title: 'Final Project: Hypotenuse',
                                content: `
Pythagorean theorem: $a^2 + b^2 = c^2$.
So, $c = \\sqrt{a^2 + b^2}$.
        `,
                                goal: 'Given `a=3` and `b=4`, calculate `c` using `math.sqrt` and exponents. Print `c`.',
                                startingCode: `import math\na = 3\nb = 4\n# Calculate c`,
                                objective: 'User must implement the theorem logic. Result should be 5.0.',
                                expectedOutput: '5.0',
                                commonMistakes: `
*   **Order of Ops:** Ensure you add a^2 and b^2 *inside* the sqrt parenthesis.
        `
                        },
                ],
        },
        {
                id: 'module-9',
                title: 'Module 9: Lists Deep Dive',
                lessons: [
                        {
                                id: 'm9-l1',
                                title: 'List Indexing',
                                content: `
Lists are ordered. We access items by position (index).
**Remember:** Computers start counting at 0.

\`\`\`python
       #  0    1    2
nums = [10, 20, 30]
print(nums[0]) # 10
\`\`\`
        `,
                                goal: 'Create a list `colors` with 4 colors. Print the first color and the third color.',
                                startingCode: `# Create list and print`,
                                objective: 'User must access index 0 and index 2.',
                                commonMistakes: `
*   **Off by One:** The third item is at index 2, not 3. Index 3 is the fourth item.
        `
                        },
                        {
                                id: 'm9-l2',
                                title: 'Negative Indexing',
                                content: `
Python has a cool trick. Index \`-1\` means "the last item". \`-2\` is "second to last".
This is useful when you don't know how long the list is.

\`\`\`python
arr = [1, 2, ... 99]
print(arr[-1]) # 99
\`\`\`
        `,
                                goal: 'Given a list `data = [10, 20, 30, 40]`. Print the last item using a negative index, and the second-to-last item.',
                                startingCode: `data = [10, 20, 30, 40]\n# Print items`,
                                objective: 'User must use index -1 and -2.',
                                expectedOutput: '40\n30',
                                commonMistakes: `
*   **-0:** Index \`-0\` is the same as \`0\` (the first item).
        `
                        },
                        {
                                id: 'm9-l3',
                                title: 'Adding & Removing',
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
        `
                        },
                        {
                                id: 'm9-l4',
                                title: 'Slicing',
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
                                goal: 'Given `nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]`. Print a slice containing `[4, 5, 6]`.',
                                startingCode: `nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]\n# Print slice`,
                                objective: 'User must slice correctly using [4:7].',
                                expectedOutput: '[4, 5, 6]',
                                commonMistakes: `
*   **Stop Index:** To get index 6, you must stop at 7.
        `
                        },
                        {
                                id: 'm9-final',
                                title: 'Final Quiz: Lists',
                                type: 'quiz',
                                content: 'Prove your mastery of Python lists.',
                                goal: 'Pass quiz.',
                                startingCode: '',
                                objective: 'Pass quiz.',
                                quizQuestions: [
                                        { id: 'm9q1', text: 'Index of the first item?', options: ['1', '0', '-1', 'start'], correctAnswerIndex: 1 },
                                        { id: 'm9q2', text: 'my_list = [10, 20]; print(my_list[-1])', options: ['10', '20', 'Error', 'None'], correctAnswerIndex: 1 },
                                        { id: 'm9q3', text: 'Which method adds to the end?', options: ['push', 'add', 'append', 'insert'], correctAnswerIndex: 2 }
                                ]
                        }
                ],
        },
        {
                id: 'module-10',
                title: 'Module 10: Advanced Loops',
                lessons: [
                        {
                                id: 'm10-l1',
                                title: 'Nested Loops',
                                content: `
You can put a loop inside a loop. This is often used for 2D grids or coordinates.
For every *one* step of the outer loop, the inner loop runs *completely*.

\`\`\`python
for x in range(3):
    for y in range(2):
        print(x, y)
\`\`\`
        `,
                                goal: 'Use nested loops to verify the multiplication table. Loop `i` from 1 to 3. Loop `j` from 1 to 3. Print `i * j`.',
                                startingCode: `# Nested loops`,
                                objective: 'User must implement multiplication table logic printing 1, 2, 3, 2, 4, 6, 3, 6, 9.',
                                expectedOutput: '1\n2\n3\n2\n4\n6\n3\n6\n9',
                                commonMistakes: `
*   **Variable Names:** Don't use \`i\` for both loops! Use \`i\` and \`j\` (or meaningful names).
*   **Indentation:** The print must be inside the INNER loop (double indented).
        `
                        },
                        {
                                id: 'm10-l2',
                                title: 'Skipping (Continue)',
                                content: `
The \`continue\` statement tells the loop: "Done with this item, skip to the next one immediately."
It doesn't stop the loop, just the current iteration.
        `,
                                goal: 'Loop from 1 to 10. If the number is even, `continue`. Otherwise, print the number. (This prints only odd numbers).',
                                startingCode: `# Loop with continue`,
                                objective: 'User must use modulo and continue to filter output.',
                                expectedOutput: '1\n3\n5\n7\n9',
                                commonMistakes: `
*   **Order:** The print must be *after* the continue check. If you print before checking, continue does nothing helpful.
        `
                        },
                        {
                                id: 'm10-l3',
                                title: 'Breaking Out',
                                content: `
The \`break\` statement stops the loop immediately. It effectively "cancels" the rest of the looping.
Useful for searching: "I found what I needed, stop looking."
        `,
                                goal: 'Loop from 1 to 100. If the number is 50, print "Found 50!" and `break`. Ensure the loop stops there.',
                                startingCode: `# Loop with break`,
                                objective: 'User must stop execution at 50.',
                                expectedOutput: 'Found 50!',
                                commonMistakes: `
*   **Indentation:** Break must be inside the \`if\`.
        `
                        },
                        {
                                id: 'm10-l4',
                                title: 'Looping Lists',
                                content: `
The most common loop in Python is "for each" item in a list.

\`\`\`python
for name in ["Sam", "Dean"]:
    print("Hello " + name)
\`\`\`
        `,
                                goal: 'Given `prices = [10, 20, 5]`. Create `total = 0`. Loop through prices, adding each to total. Print `total` at the end.',
                                startingCode: `prices = [10, 20, 5]\n# Calculate sum manually`,
                                objective: 'User must accumulate sum via loop. Result 35.',
                                expectedOutput: '35',
                                commonMistakes: `
*   **Resetting Total:** Do not set \`total = 0\` *inside* the loop, or it will reset every time.
        `
                        },
                        {
                                id: 'm10-final',
                                title: 'Final Project: Countdown',
                                content: 'Use a while loop to count backwards.',
                                goal: 'Create `n = 10`. While n > 0, print n, decrease n. Print "Blastoff!" at the end.',
                                startingCode: `n = 10\n# Countdown logic`,
                                objective: 'Output 10 down to 1 then Blastoff.',
                                expectedOutput: '10\n9\n8\n7\n6\n5\n4\n3\n2\n1\nBlastoff!',
                                type: 'coding'
                        }
                ],
        },
        {
                id: 'module-11',
                title: 'Module 11: List Manipulation',
                lessons: [
                        {
                                id: 'm11-l1',
                                title: 'Modifying by Index',
                                content: `
You can change an item in a list just like a variable, if you know its index.

\`\`\`python
box = ["Empty", "Book"]
box[0] = "Cat"
# box is now ["Cat", "Book"]
\`\`\`
        `,
                                goal: 'Given `grades = [50, 80, 100]`. Change the first grade to 60. Change the last grade to 95. Print the list.',
                                startingCode: `grades = [50, 80, 100]\n# Update and print`,
                                objective: 'User must modify list index 0 and 2 (or -1).',
                                expectedOutput: '[60, 80, 95]',
                                commonMistakes: `
*   **Index Error:** \`grades[3] = 90\` will crash because index 3 doesn't exist.
        `
                        },
                        {
                                id: 'm11-l2',
                                title: 'Length of List',
                                content: `
How many items are in my list? Use \`len()\`.

\`\`\`python
users = ["A", "B", "C"]
count = len(users) # 3
\`\`\`
        `,
                                goal: 'Write a function `is_long(lst)` that returns True if the list has more than 5 items, else False. Test it with a short and long list.',
                                startingCode: `# Define function`,
                                objective: 'User must use len() inside a function logic.',
                                expectedOutput: 'False\nTrue',
                                commonMistakes: `
*   **Zero Indexing:** Length is the count (1-based). Index is position (0-based). Don't confuse them.
        `
                        },
                        {
                                id: 'm11-l3',
                                title: 'Sum and Max',
                                content: `
Python has helper functions for number lists.
*   \`sum(list)\`: Adds them all up.
*   \`max(list)\`: Finds the biggest.
*   \`min(list)\`: Finds the smallest.
        `,
                                goal: 'Given `scores = [4, 8, 15, 16, 23, 42]`. Calculate the average score (sum divided by length). Print it.',
                                startingCode: `scores = [4, 8, 15, 16, 23, 42]\n# Calculate average`,
                                objective: 'User must combine sum() and len() to find average.',
                                expectedOutput: '18.0',
                                commonMistakes: `
*   **Math:** Average is sum / count.
        `
                        },
                        {
                                id: 'm11-l4',
                                title: 'Sorting',
                                content: `
To organize data, use \`list.sort()\`.
**Note:** This changes the original list.

\`\`\`python
nums = [3, 1, 2]
nums.sort()
print(nums) # [1, 2, 3]
\`\`\`
        `,
                                goal: 'Define a function `get_largest(lst)` that sorts the list and returns the last item (the largest). Test it.',
                                startingCode: `# Define function`,
                                objective: 'User must sort and return index -1.',
                                commonMistakes: `
*   **Return None:** \`return lst.sort()\` is WRONG. \`sort\` returns None. You must sort first, then return the item.
        `
                        },
                        {
                                id: 'm11-final',
                                title: 'Final Quiz: List Methods',
                                type: 'quiz',
                                content: 'Test your knowledge of list functions.',
                                goal: 'Pass the quiz.',
                                startingCode: '',
                                objective: 'Pass quiz.',
                                quizQuestions: [
                                        { id: 'm11q1', text: 'What does sum([1, 2, 3]) return?', options: ['6', '5', '123', 'Error'], correctAnswerIndex: 0 },
                                        { id: 'm11q2', text: 'What does list.sort() return?', options: ['The sorted list', 'None', 'True', 'A new list'], correctAnswerIndex: 1 },
                                        { id: 'm11q3', text: 'Which gets the smallest number?', options: ['least()', 'small()', 'min()', 'low()'], correctAnswerIndex: 2 }
                                ]
                        }
                ],
        },
        {
                id: 'module-12',
                title: 'Module 12: Capstone Project',
                lessons: [
                        {
                                id: 'm12-l1',
                                title: 'The Shopping Manager',
                                content: `
We are going to build a Shopping Cart program.
Step 1: Setup.
We need a list to hold items and a budget variable.
        `,
                                goal: 'Initialize an empty list `cart` and a float variable `budget` set to 50.00. Print "Starting Cart...".',
                                startingCode: `# Setup variables`,
                                objective: 'User must create empty list and float budget.',
                                expectedOutput: 'Starting Cart...',
                                commonMistakes: `
*   **Empty List:** Use \`[]\`.
        `
                        },
                        {
                                id: 'm12-l2',
                                title: 'Adding Inventory',
                                content: `
The user wants to buy things. Let's define a function to help.
        `,
                                goal: 'Define `add_item(item)`. It should append the item to the global `cart`. Call it to add "Apple" and "Banana".',
                                startingCode: `cart = []\n# Define function and use it`,
                                objective: 'User must use append inside a function.',
                                commonMistakes: `
*   **Global:** Since lists are mutable, you don't strictly need the \`global\` keyword to append, but remember you are modifying the outside list.
        `
                        },
                        {
                                id: 'm12-l3',
                                title: 'Logic Check',
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
                                objective: 'User must use `in` operator.',
                                expectedOutput: 'Healthy choice',
                                commonMistakes: `
*   **Case Sensitivity:** "apple" is not "Apple".
        `
                        },
                        {
                                id: 'm12-l4',
                                title: 'Checkout (Looping)',
                                content: `
Let's print a receipt. Iterate through the list and print each item nicely.
        `,
                                goal: 'Loop through the `cart`. For each item, print "Item: [Item Name]".',
                                startingCode: `cart = ["Apple", "Banana"]\n# Loop here`,
                                objective: 'User must loop and format output string.',
                                expectedOutput: 'Item: Apple\nItem: Banana',
                                commonMistakes: `
*   **Variable Name:** \`for item in cart:\`. Use \`item\` inside the print, not \`cart\`.
        `
                        },
                        {
                                id: 'm12-l5',
                                title: 'Final Project: Calculator',
                                content: `
The shopping trip is over. Let's calculate the total cost.
Assume every item costs $2.50.
        `,
                                goal: '1. Calculate \`total = len(cart) * 2.5\`. \n2. If \`total > budget\`, print "Over budget!". Else, print "Remaining: " and the remaining money.',
                                startingCode: `budget = 5.0\ncart = ["Apple", "Banana", "Cookie"]\n# Calculate logic`,
                                objective: 'User must combine len, math, and if/else logic. 3 items * 2.5 = 7.5. Budget 5. Should print Over budget.',
                                expectedOutput: 'Over budget!',
                                commonMistakes: `
*   **Logic:** Ensure you subtract total from budget for the remaining amount.
        `,
                                type: 'coding'
                        },
                ],
        },
];

export const PRACTICE_ITEMS: PracticeItem[] = [
        // Practice Quizzes
        {
                id: 'pq-1',
                title: 'Python Basics Quiz',
                description: 'Test your knowledge on variables, print statements, data types, and comments.',
                type: 'quiz',
                difficulty: 'Easy',
                quizQuestions: [
                        { id: 'pq1-q1', text: 'Which function prints text to the screen?', options: ['echo()', 'print()', 'log()', 'write()'], correctAnswerIndex: 1 },
                        { id: 'pq1-q2', text: 'How do you create a comment?', options: ['//', '<!-- -->', '#', '/* */'], correctAnswerIndex: 2 },
                        { id: 'pq1-q3', text: 'Which is a valid variable name?', options: ['1user', 'user-name', 'user_name', 'User Name'], correctAnswerIndex: 2 },
                        { id: 'pq1-q4', text: 'What is the output of: print(type(5))', options: ['<class "str">', '<class "int">', '<class "float">', 'int'], correctAnswerIndex: 1 },
                        { id: 'pq1-q5', text: 'What is the result of 10 // 3?', options: ['3.33', '3', '3.0', '4'], correctAnswerIndex: 1 },
                        { id: 'pq1-q6', text: 'Which operator is used for exponents (powers)?', options: ['^', 'pow', '**', '//'], correctAnswerIndex: 2 },
                        { id: 'pq1-q7', text: 'What is the value of: bool(0)', options: ['True', 'False', 'None', 'Error'], correctAnswerIndex: 1 },
                        { id: 'pq1-q8', text: 'How do you make a string?', options: ['Just type text', 'Use brackets []', 'Use quotes "" or \'\'', 'Use parentheses ()'], correctAnswerIndex: 2 },
                        { id: 'pq1-q9', text: 'What is the result of: print("A" * 3)', options: ['A3', 'AAA', 'Error', '3A'], correctAnswerIndex: 1 },
                        { id: 'pq1-q10', text: 'Which is NOT a valid way to make a number?', options: ['x = 5', 'x = 5.0', 'x = 5,0', 'x = int("5")'], correctAnswerIndex: 2 }
                ]
        },
        {
                id: 'pq-2',
                title: 'Control Flow Quiz',
                description: 'Challenge yourself on if/else statements, logic, and loops.',
                type: 'quiz',
                difficulty: 'Medium',
                quizQuestions: [
                        { id: 'pq2-q1', text: 'What keyword checks a second condition?', options: ['else if', 'elseif', 'elif', 'check'], correctAnswerIndex: 2 },
                        { id: 'pq2-q2', text: 'How many times does range(5) loop?', options: ['4', '5', '6', 'Depends on start'], correctAnswerIndex: 1 },
                        { id: 'pq2-q3', text: 'Which loop runs while a condition is true?', options: ['for', 'foreach', 'while', 'loop'], correctAnswerIndex: 2 },
                        { id: 'pq2-q4', text: 'How do you stop a loop immediately?', options: ['stop', 'return', 'exit', 'break'], correctAnswerIndex: 3 },
                        { id: 'pq2-q5', text: 'What does the "continue" keyword do?', options: ['Stops the program', 'Skips to the next iteration', 'Restarts the loop', 'Exits the loop'], correctAnswerIndex: 1 },
                        { id: 'pq2-q6', text: 'Which operator means "Not Equal"?', options: ['<>', '!=', '!==', 'not='], correctAnswerIndex: 1 },
                        { id: 'pq2-q7', text: 'What is the result of: True and False', options: ['True', 'False', 'None', 'Error'], correctAnswerIndex: 1 },
                        { id: 'pq2-q8', text: 'Which statement runs if all if/elif checks fail?', options: ['then', 'finally', 'default', 'else'], correctAnswerIndex: 3 },
                        { id: 'pq2-q9', text: 'What does range(2, 5) generate?', options: ['2, 3, 4, 5', '2, 3, 4', '3, 4', '2, 4, 5'], correctAnswerIndex: 1 },
                        { id: 'pq2-q10', text: 'What evaluates to True?', options: ['5 < 2', 'not True', '5 == "5"', '10 > 5 or 1 > 5'], correctAnswerIndex: 3 }
                ]
        },
        {
                id: 'pq-3',
                title: 'Functions & Lists Quiz',
                description: 'Verify your understanding of reusable code and data structures.',
                type: 'quiz',
                difficulty: 'Medium',
                quizQuestions: [
                        { id: 'pq3-q1', text: 'Which keyword defines a function?', options: ['func', 'def', 'function', 'define'], correctAnswerIndex: 1 },
                        { id: 'pq3-q2', text: 'How do you send data back from a function?', options: ['send', 'output', 'return', 'give'], correctAnswerIndex: 2 },
                        { id: 'pq3-q3', text: 'What is the index of the first item in a list?', options: ['1', '0', '-1', 'None'], correctAnswerIndex: 1 },
                        { id: 'pq3-q4', text: 'How do you add an item to the end of a list?', options: ['push()', 'add()', 'insert()', 'append()'], correctAnswerIndex: 3 },
                        { id: 'pq3-q5', text: 'What does len(my_list) return?', options: ['The last item', 'The size (count) of items', 'The memory size', 'The first item'], correctAnswerIndex: 1 },
                        { id: 'pq3-q6', text: 'How do you access the last item in a list?', options: ['list[last]', 'list[len]', 'list[-1]', 'list[0]'], correctAnswerIndex: 2 },
                        { id: 'pq3-q7', text: 'What symbol ends the "def" line?', options: [';', '.', ':', '}'], correctAnswerIndex: 2 },
                        { id: 'pq3-q8', text: 'Can lists contain other lists?', options: ['No', 'Yes', 'Only integers', 'Only strings'], correctAnswerIndex: 1 },
                        { id: 'pq3-q9', text: 'What does list.pop(0) do?', options: ['Removes first item', 'Removes last item', 'Removes item "0"', 'Nothing'], correctAnswerIndex: 0 },
                        { id: 'pq3-q10', text: 'Which keyword exits a function with a value?', options: ['break', 'exit', 'return', 'output'], correctAnswerIndex: 2 }
                ]
        },
        {
                id: 'pq-4',
                title: 'Debugging & Errors',
                description: 'Learn to spot common Python errors and fix them.',
                type: 'quiz',
                difficulty: 'Medium',
                quizQuestions: [
                        { id: 'pq4-q1', text: 'What error occurs here: print("Hello"', options: ['SyntaxError', 'TypeError', 'NameError', 'ValueError'], correctAnswerIndex: 0 },
                        { id: 'pq4-q2', text: 'What error occurs here: 5 + "5"', options: ['ValueError', 'TypeError', 'SyntaxError', 'MathError'], correctAnswerIndex: 1 },
                        { id: 'pq4-q3', text: 'What error: print(unknown_var)', options: ['SyntaxError', 'NameError', 'KeyError', 'IndexError'], correctAnswerIndex: 1 },
                        { id: 'pq4-q4', text: 'Which is an IndentationError?', options: ['x = 5', 'def func():\nprint(x)', 'if True:\n    pass', 'print(x)'], correctAnswerIndex: 1 },
                        { id: 'pq4-q5', text: 'What happens if you divide by zero?', options: ['Returns 0', 'Returns Infinity', 'ZeroDivisionError', 'Crash'], correctAnswerIndex: 2 },
                        { id: 'pq4-q6', text: 'my_list = [1,2]; print(my_list[5])', options: ['None', '0', 'IndexError', '5'], correctAnswerIndex: 2 },
                        { id: 'pq4-q7', text: 'd = {"a":1}; print(d["b"])', options: ['None', 'KeyError', '1', 'False'], correctAnswerIndex: 1 },
                        { id: 'pq4-q8', text: 'int("hello")', options: ['0', 'NaN', 'ValueError', 'TypeError'], correctAnswerIndex: 2 },
                        { id: 'pq4-q9', text: 'Which fixes: if x = 5:', options: ['x == 5', 'x := 5', 'x equal 5', 'x is 5'], correctAnswerIndex: 0 },
                        { id: 'pq4-q10', text: 'What creates an infinite loop?', options: ['while False:', 'for i in range(10):', 'while True:', 'if True:'], correctAnswerIndex: 2 },
                ]
        },
        {
                id: 'pq-5',
                title: 'OOP Concepts',
                description: 'Test your understanding of Classes and Objects.',
                type: 'quiz',
                difficulty: 'Medium',
                quizQuestions: [
                        { id: 'pq5-q1', text: 'Keyword to define a class?', options: ['def', 'class', 'struct', 'object'], correctAnswerIndex: 1 },
                        { id: 'pq5-q2', text: 'What is __init__?', options: ['A constructor', 'A destructor', 'A regular method', 'A variable'], correctAnswerIndex: 0 },
                        { id: 'pq5-q3', text: 'Keyword to refer to the current instance?', options: ['this', 'me', 'self', 'it'], correctAnswerIndex: 2 },
                        { id: 'pq5-q4', text: 'How to create an object of class Dog?', options: ['new Dog()', 'Dog()', 'create Dog()', 'Dog.new()'], correctAnswerIndex: 1 },
                        { id: 'pq5-q5', text: 'What is inheritance?', options: ['Copying code', 'A class deriving from another', 'Importing modules', 'Looping'], correctAnswerIndex: 1 }
                ]
        },
        {
                id: 'pq-6',
                title: 'File Handling Quiz',
                description: 'Basics of reading and writing files.',
                type: 'quiz',
                difficulty: 'Medium',
                quizQuestions: [
                        { id: 'pq6-q1', text: 'Function to open a file?', options: ['read()', 'file()', 'open()', 'load()'], correctAnswerIndex: 2 },
                        { id: 'pq6-q2', text: 'Mode "w" stands for?', options: ['Watch', 'Write', 'Wrap', 'Web'], correctAnswerIndex: 1 },
                        { id: 'pq6-q3', text: 'Method to read a single line?', options: ['read()', 'readlines()', 'readline()', 'scan()'], correctAnswerIndex: 2 },
                        { id: 'pq6-q4', text: 'Why close a file?', options: ['To save memory/changes', 'To delete it', 'No need', 'To format it'], correctAnswerIndex: 0 },
                        { id: 'pq6-q5', text: 'Mode "a" stands for?', options: ['Add', 'Append', 'Apply', 'After'], correctAnswerIndex: 1 }
                ]
        },
        {
                id: 'pq-7',
                title: 'Advanced Concepts',
                description: 'Lambdas, generators, and more.',
                type: 'quiz',
                difficulty: 'Hard',
                quizQuestions: [
                        { id: 'pq7-q1', text: 'What is a lambda?', options: ['A named function', 'An anonymous function', 'A list', 'A module'], correctAnswerIndex: 1 },
                        { id: 'pq7-q2', text: 'Syntax for lambda adding x and y?', options: ['lambda x,y: x+y', 'def(x,y) => x+y', 'function(x,y) {x+y}', 'x,y -> x+y'], correctAnswerIndex: 0 },
                        { id: 'pq7-q3', text: 'What does list comprehension do?', options: ['Creates lists concisely', 'Deletes lists', 'Sorts lists', 'Prints lists'], correctAnswerIndex: 0 },
                        { id: 'pq7-q4', text: 'Example of list comprehension?', options: ['[x for x in range(5)]', 'for x in range(5): list.add(x)', 'list(range(5))', 'x = 0..5'], correctAnswerIndex: 0 },
                        { id: 'pq7-q5', text: 'What keyword yields a value from a generator?', options: ['return', 'yield', 'send', 'emit'], correctAnswerIndex: 1 }
                ]
        },
        {
                id: 'pq-8',
                title: 'Standard Libraries',
                description: 'Math, Random, Date, and JSON.',
                type: 'quiz',
                difficulty: 'Easy',
                quizQuestions: [
                        { id: 'pq8-q1', text: 'Module for math functions?', options: ['calc', 'math', 'numbers', 'algebra'], correctAnswerIndex: 1 },
                        { id: 'pq8-q2', text: 'Module for random numbers?', options: ['rand', 'random', 'rng', 'chance'], correctAnswerIndex: 1 },
                        { id: 'pq8-q3', text: 'How to get current date?', options: ['datetime.now()', 'date.today()', 'time.now()', 'All of above (depend on import)'], correctAnswerIndex: 3 },
                        { id: 'pq8-q4', text: 'Function to parse JSON string?', options: ['json.parse()', 'json.load()', 'json.loads()', 'json.read()'], correctAnswerIndex: 2 },
                        { id: 'pq8-q5', text: 'Value of math.pi?', options: ['3.14...', '3.14159', '22/7', '3.1415926535...'], correctAnswerIndex: 3 }
                ]
        },

        // Practice Problems
        {
                id: 'pp-1',
                title: 'Celsius to Fahrenheit',
                description: 'Write a program that converts a temperature from Celsius to Fahrenheit.',
                type: 'problem',
                difficulty: 'Easy',
                content: `
### Task
Create a variable \`celsius\` with value \`25\`.
Convert it to Fahrenheit using the formula: \`F = (C * 9/5) + 32\`.
Print the result.
        `,
                startingCode: `celsius = 25\n# Your conversion logic here`,
                objective: 'Calculate and print 77.0.'
        },
        {
                id: 'pp-2',
                title: 'Find the Max',
                description: 'Find the largest number in a list without using the max() function.',
                type: 'problem',
                difficulty: 'Medium',
                content: `
### Task
Given a list of numbers: \`nums = [10, 5, 20, 8, 15]\`.
Write a loop to find the largest number.
Print the largest number.
        `,
                startingCode: `nums = [10, 5, 20, 8, 15]\n# Find max manually`,
                objective: 'Loop through list and print 20.'
        },
        {
                id: 'pp-3',
                title: 'Reverse a String',
                description: 'Reverse a given string using slicing.',
                type: 'problem',
                difficulty: 'Easy',
                content: `
### Task
Given \`word = "Python"\`.
Use slicing to print it backwards ("nohtyP").
        `,
                startingCode: `word = "Python"\n# Print reverse`,
                objective: 'Print "nohtyP".'
        },
        {
                id: 'pp-4',
                title: 'Count Vowels',
                description: 'Count how many vowels are in a sentence.',
                type: 'problem',
                difficulty: 'Medium',
                content: `
### Task
Given \`text = "The quick brown fox"\`.
Count the number of vowels (a, e, i, o, u) in the string.
Print the final count.
        `,
                startingCode: `text = "The quick brown fox"\nvowels = "aeiou"\n# Your loop here`,
                objective: 'Count vowels and print the integer result (5).'
        },
        {
                id: 'pp-5',
                title: 'FizzBuzz',
                description: 'The classic interview question.',
                type: 'problem',
                difficulty: 'Hard',
                content: `
### Task
Loop from 1 to 20.
*   If the number is divisible by 3, print "Fizz".
*   If divisible by 5, print "Buzz".
*   If divisible by both, print "FizzBuzz".
*   Otherwise, print the number.
        `,
                startingCode: `# Loop 1 to 20`,
                objective: 'Print correct sequence: 1, 2, Fizz, 4, Buzz, Fizz, ..., 14, FizzBuzz, ...'
        },
        {
                id: 'pp-6',
                title: 'Palindrome Checker',
                description: 'Check if a word reads the same forwards and backwards.',
                type: 'problem',
                difficulty: 'Medium',
                content: `
### Task
Given \`word = "racecar"\`.
Check if the word is equal to its reverse.
If it is, print "Palindrome". Else print "Not Palindrome".
        `,
                startingCode: `word = "racecar"\n# Check if palindrome`,
                objective: 'Print "Palindrome" for racecar.'
        },
        {
                id: 'pp-7',
                title: 'Factorial Calculator',
                description: 'Calculate the factorial of a number (e.g., 5! = 5*4*3*2*1).',
                type: 'problem',
                difficulty: 'Medium',
                content: `
### Task
Given \`n = 5\`.
Use a loop to calculate the factorial (product of all numbers from 1 to n).
Print the result.
        `,
                startingCode: `n = 5\n# Calculate factorial`,
                objective: 'Print 120.'
        },
        {
                id: 'pp-8',
                title: 'Sum of Evens',
                description: 'Sum all even numbers in a range.',
                type: 'problem',
                difficulty: 'Easy',
                content: `
### Task
Sum all even numbers from 1 to 20 (inclusive).
Print the total.
        `,
                startingCode: `# Loop and sum evens`,
                objective: 'Print 110.'
        },
        {
                id: 'pp-9',
                title: 'Prime Checker',
                description: 'Check if a number is prime.',
                type: 'problem',
                difficulty: 'Medium',
                content: `
### Task
Given \`n = 29\`.
Check if it is prime (divisible only by 1 and itself).
Print "Prime" or "Not Prime".
        `,
                startingCode: `n = 29\n# Check for factors`,
                objective: 'Print Prime.'
        },
        {
                id: 'pp-10',
                title: 'Fibonacci Sequence',
                description: 'Print the first 10 numbers of the Fibonacci sequence.',
                type: 'problem',
                difficulty: 'Medium',
                content: `
### Task
Start with 0, 1.
Each next number is the sum of the two before.
Print the first 10 numbers (0, 1, 1, 2, 3, 5, 8, 13, 21, 34).
        `,
                startingCode: `# Print first 10 Fibonacci`,
                objective: 'Print the correct sequence.'
        },
        {
                id: 'pp-11',
                title: 'Dictionary Search',
                description: 'Look up values in a dictionary safely.',
                type: 'problem',
                difficulty: 'Easy',
                content: `
### Task
Given \`data = {"name": "Alice", "age": 30}\`.
Try to get "city". If missing, print "Unknown".
Do not crash.
        `,
                startingCode: `data = {"name": "Alice", "age": 30}\n# Safe lookup`,
                objective: 'Print Unknown.'
        },
        {
                id: 'pp-12',
                title: 'Anagram Checker',
                description: 'Check if two strings are anagrams.',
                type: 'problem',
                difficulty: 'Hard',
                content: `
### Task
Given \`s1 = "listen"\` and \`s2 = "silent"\`.
Check if they contain the same letters.
Print "Anagram" or "Not".
        `,
                startingCode: `s1 = "listen"\ns2 = "silent"\n# Check anagram`,
                objective: 'Print Anagram.'
        },

        // Practice Projects
        {
                id: 'pj-1',
                title: 'Number Guessing Game',
                description: 'Build a game where the computer picks a number and you have to guess it.',
                type: 'project',
                difficulty: 'Medium',
                content: `
### Project Brief
1. Import \`random\`.
2. Generate a secret number between 1 and 10.
3. Use a \`while\` loop to ask the user for a guess.
4. If they guess correctly, print "You won!" and break.
5. If they guess wrong, tell them "Try again".
        `,
                startingCode: `import random\n# Your game logic`,
                objective: 'Implement a guessing game loop that breaks on correct guess.'
        },
        {
                id: 'pj-2',
                title: 'Simple Calculator',
                description: 'Create a calculator that can add, subtract, multiply, and divide.',
                type: 'project',
                difficulty: 'Hard',
                content: `
### Project Brief
1. Define functions for add, sub, mul, div.
2. Ask the user for two numbers.
3. Ask the user for an operation (+, -, *, /).
4. Call the correct function and print the result.
        `,
                startingCode: `# Define functions first`,
                objective: 'Create calculator functions and handle user input flow.'
        },
        {
                id: 'pj-3',
                title: 'Text Adventure',
                description: 'Create a story where user choices change the outcome.',
                type: 'project',
                difficulty: 'Hard',
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
                objective: 'Create a branching logic story with at least 2 levels of choice.'
        },
        {
                id: 'pj-4',
                title: 'To-Do List CLI',
                description: 'Build a command-line To-Do list manager.',
                type: 'project',
                difficulty: 'Hard',
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
                objective: 'Implement add, view, and quit commands using a loop and list.'
        },
        {
                id: 'pj-5',
                title: 'Rock Paper Scissors',
                description: 'Classic game against the computer.',
                type: 'project',
                difficulty: 'Medium',
                content: `
### Project Brief
1. List choices: R, P, S.
2. Computer picks random.
3. User inputs choice.
4. Compare and print Winner/Loser/Tie.
        `,
                startingCode: `import random\n# Game logic`,
                objective: 'Implement logic for all 3 win/loss conditions.'
        },
        {
                id: 'pj-6',
                title: 'Password Generator',
                description: 'Generate strong random passwords.',
                type: 'project',
                difficulty: 'Medium',
                content: `
### Project Brief
1. String of all chars (letters, numbers).
2. Ask user for length.
3. Randomly pick chars and join them.
4. Print password.
        `,
                startingCode: `import random\nchars = "abcdef123456"\n# Generate`,
                objective: 'Create a string of random characters of user length.'
        },
        {
                id: 'pj-7',
                title: 'Contact Book',
                description: 'Store names and numbers.',
                type: 'project',
                difficulty: 'Hard',
                content: `
### Project Brief
1. Use a Dictionary \`{}\`.
2. Loop commands: Add, Search, Delete, Quit.
3. Add: \`contacts[name] = number\`.
4. Search: Print number or "Not found".
        `,
                startingCode: `contacts = {}\n# App loop`,
                objective: 'CRUD operations on a dictionary.'
        },
        {
                id: 'pj-8',
                title: 'Hangman (Simple)',
                description: 'Guess the word.',
                type: 'project',
                difficulty: 'Hard',
                content: `
### Project Brief
1. Secret word "PYTHON".
2. Loop 6 tries.
3. Ask letter.
4. If in word, print "Yes", else "No" and lose life.
5. (Optional) Show "P_TH_N".
        `,
                startingCode: `word = "PYTHON"\n# Game loop`,
                objective: 'Letter checking loop with life counter.'
        },
        {
                id: 'pj-9',
                title: 'Tic Tac Toe',
                description: '2-player board game.',
                type: 'project',
                difficulty: 'Hard',
                content: `
### Project Brief
1. Board list \`[' ',' ',' '...]\`.
2. Print board function.
3. Loop turns X and O.
4. Input index 0-8.
5. Check win condition (rows/cols).
        `,
                startingCode: `board = [' ']*9\n# Board logic`,
                objective: 'Board display and input handling.'
        }
];
