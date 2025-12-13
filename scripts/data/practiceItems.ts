import type { Module, PracticeItem } from '../../types';

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
        id: "m12-lp5",
        text: "Which function prints text to the screen?",
        options: ["echo()", "print()", "log()", "write()"],
        correctAnswerIndex: 1,
      },
      {
        id: "m12-lp6",
        text: "How do you create a comment?",
        options: ["//", "<!-- -->", "#", "/* */"],
        correctAnswerIndex: 2,
      },
      {
        id: "m12-lp7",
        text: "Which is a valid variable name?",
        options: ["1user", "user-name", "user_name", "User Name"],
        correctAnswerIndex: 2,
      },
      {
        id: "m12-lp8",
        text: "What is the output of: print(type(5))",
        options: ['<class "str">', '<class "int">', '<class "float">', "int"],
        correctAnswerIndex: 1,
      },
      {
        id: "m12-lp9",
        text: "What is the result of 10 // 3?",
        options: ["3.33", "3", "3.0", "4"],
        correctAnswerIndex: 1,
      },
      {
        id: "m12-lp10",
        text: "Which operator is used for exponents (powers)?",
        options: ["^", "pow", "**", "//"],
        correctAnswerIndex: 2,
      },
      {
        id: "m12-lp11",
        text: "What is the value of: bool(0)",
        options: ["True", "False", "None", "Error"],
        correctAnswerIndex: 1,
      },
      {
        id: "m12-lp12",
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
        id: "m12-lp13",
        text: 'What is the result of: print("A" * 3)',
        options: ["A3", "AAA", "Error", "3A"],
        correctAnswerIndex: 1,
      },
      {
        id: "m12-lp14",
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
        id: "m12-lp15",
        text: "What keyword checks a second condition?",
        options: ["else if", "elseif", "elif", "check"],
        correctAnswerIndex: 2,
      },
      {
        id: "m12-lp16",
        text: "How many times does range(5) loop?",
        options: ["4", "5", "6", "Depends on start"],
        correctAnswerIndex: 1,
      },
      {
        id: "m12-lp17",
        text: "Which loop runs while a condition is true?",
        options: ["for", "foreach", "while", "loop"],
        correctAnswerIndex: 2,
      },
      {
        id: "m12-lp18",
        text: "How do you stop a loop immediately?",
        options: ["stop", "return", "exit", "break"],
        correctAnswerIndex: 3,
      },
      {
        id: "m12-lp19",
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
        id: "m12-lp20",
        text: 'Which operator means "Not Equal"?',
        options: ["<>", "!=", "!==", "not="],
        correctAnswerIndex: 1,
      },
      {
        id: "m12-lp21",
        text: "What is the result of: True and False",
        options: ["True", "False", "None", "Error"],
        correctAnswerIndex: 1,
      },
      {
        id: "m12-lp22",
        text: "Which statement runs if all if/elif checks fail?",
        options: ["then", "finally", "default", "else"],
        correctAnswerIndex: 3,
      },
      {
        id: "m12-lp23",
        text: "What does range(2, 5) generate?",
        options: ["2, 3, 4, 5", "2, 3, 4", "3, 4", "2, 4, 5"],
        correctAnswerIndex: 1,
      },
      {
        id: "m12-lp24",
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
        id: "m12-lp25",
        text: "Which keyword defines a function?",
        options: ["func", "def", "function", "define"],
        correctAnswerIndex: 1,
      },
      {
        id: "m12-lp26",
        text: "How do you send data back from a function?",
        options: ["send", "output", "return", "give"],
        correctAnswerIndex: 2,
      },
      {
        id: "m12-lp27",
        text: "What is the index of the first item in a list?",
        options: ["1", "0", "-1", "None"],
        correctAnswerIndex: 1,
      },
      {
        id: "m12-lp28",
        text: "How do you add an item to the end of a list?",
        options: ["push()", "add()", "insert()", "append()"],
        correctAnswerIndex: 3,
      },
      {
        id: "m12-lp29",
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
        id: "m12-lp30",
        text: "How do you access the last item in a list?",
        options: ["list[last]", "list[len]", "list[-1]", "list[0]"],
        correctAnswerIndex: 2,
      },
      {
        id: "m12-lp31",
        text: 'What symbol ends the "def" line?',
        options: [";", ".", ":", "}"],
        correctAnswerIndex: 2,
      },
      {
        id: "m12-lp32",
        text: "Can lists contain other lists?",
        options: ["No", "Yes", "Only integers", "Only strings"],
        correctAnswerIndex: 1,
      },
      {
        id: "m12-lp33",
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
        id: "q-34",
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
        id: "m12-lp35",
        text: 'What error occurs here: print("Hello"',
        options: ["SyntaxError", "TypeError", "NameError", "ValueError"],
        correctAnswerIndex: 0,
      },
      {
        id: "m12-lp36",
        text: 'What error occurs here: 5 + "5"',
        options: ["ValueError", "TypeError", "SyntaxError", "MathError"],
        correctAnswerIndex: 1,
      },
      {
        id: "m12-lp37",
        text: "What error: print(unknown_var)",
        options: ["SyntaxError", "NameError", "KeyError", "IndexError"],
        correctAnswerIndex: 1,
      },
      {
        id: "m12-lp38",
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
        id: "m12-lp39",
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
        id: "m12-lp40",
        text: "my_list = [1,2]; print(my_list[5])",
        options: ["None", "0", "IndexError", "5"],
        correctAnswerIndex: 2,
      },
      {
        id: "m12-lp41",
        text: 'd = {"a":1}; print(d["b"])',
        options: ["None", "KeyError", "1", "False"],
        correctAnswerIndex: 1,
      },
      {
        id: "m12-lp42",
        text: 'int("hello")',
        options: ["0", "NaN", "ValueError", "TypeError"],
        correctAnswerIndex: 2,
      },
      {
        id: "m12-lp43",
        text: "Which fixes: if x = 5:",
        options: ["x == 5", "x := 5", "x equal 5", "x is 5"],
        correctAnswerIndex: 0,
      },
      {
        id: "m12-lp44",
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
        id: "m12-lp45",
        text: "Keyword to define a class?",
        options: ["def", "class", "struct", "object"],
        correctAnswerIndex: 1,
      },
      {
        id: "m12-lp46",
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
        id: "m12-lp47",
        text: "Keyword to refer to the current instance?",
        options: ["this", "me", "self", "it"],
        correctAnswerIndex: 2,
      },
      {
        id: "m12-lp48",
        text: "How to create an object of class Dog?",
        options: ["new Dog()", "Dog()", "create Dog()", "Dog.new()"],
        correctAnswerIndex: 1,
      },
      {
        id: "m12-lp49",
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
        id: "m12-lp50",
        text: "Function to open a file?",
        options: ["read()", "file()", "open()", "load()"],
        correctAnswerIndex: 2,
      },
      {
        id: "m12-lp51",
        text: 'Mode "w" stands for?',
        options: ["Watch", "Write", "Wrap", "Web"],
        correctAnswerIndex: 1,
      },
      {
        id: "m12-lp52",
        text: "Method to read a single line?",
        options: ["read()", "readlines()", "readline()", "scan()"],
        correctAnswerIndex: 2,
      },
      {
        id: "m12-lp53",
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
        id: "m12-lp54",
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
        id: "m12-lp55",
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
        id: "m12-lp56",
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
        id: "m12-lp57",
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
        id: "m12-lp58",
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
        id: "m12-lp59",
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
        id: "m12-lp60",
        text: "Module for math functions?",
        options: ["calc", "math", "numbers", "algebra"],
        correctAnswerIndex: 1,
      },
      {
        id: "m12-lp61",
        text: "Module for random numbers?",
        options: ["rand", "random", "rng", "chance"],
        correctAnswerIndex: 1,
      },
      {
        id: "m12-lp62",
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
        id: "m12-lp63",
        text: "Function to parse JSON string?",
        options: ["json.parse()", "json.load()", "json.loads()", "json.read()"],
        correctAnswerIndex: 2,
      },
      {
        id: "m12-lp64",
        text: "Value of math.pi?",
        options: ["3.14...", "3.14159", "22/7", "3.1415926535..."],
        correctAnswerIndex: 3,
      },
    ],
  },

  // Practice Problems
  {
    id: "pb-1",
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
    id: "pb-2",
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
    id: "pb-3",
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
    id: "pb-4",
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
    id: "pb-5",
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
    id: "pb-6",
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
    id: "pb-7",
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
    id: "pb-8",
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
    id: "pb-9",
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
    id: "pb-10",
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
    id: "pb-11",
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
    id: "pb-12",
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
