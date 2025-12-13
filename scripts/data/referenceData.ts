
import { ReferenceTopic } from '../../types';

export const REFERENCE_DATA: ReferenceTopic[] = [
  // --- BASICS ---
  {
    id: 'basics-syntax',
    title: 'Syntax & Indentation',
    category: 'Basics',
    content: `
# Python Syntax and Indentation

Python syntax can be executed by writing directly in the Command Line or by creating a python file on the server, using the \`.py\` file extension, and running it in the Command Line.

### Execute Python Syntax

To print a simple string to the console, we use the \`print()\` function.

\`\`\`python
>>> print("Hello, World!")
Hello, World!
\`\`\`

### Python Indentation

Indentation refers to the spaces at the beginning of a code line.

Where in other programming languages the indentation in code is for readability only, the indentation in Python is **very important**. Python uses indentation to indicate a block of code.

**Correct Indentation:**
You must use the same number of spaces in the same block of code.

\`\`\`python
if 5 > 2:
    print("Five is greater than two!")
\`\`\`

**Syntax Error:**
Python will give you an error if you skip the indentation:

\`\`\`python
if 5 > 2:
print("Five is greater than two!") # Syntax Error: expected an indented block
\`\`\`

### Variables
In Python, variables are created when you assign a value to them:

\`\`\`python
x = 5
y = "Hello, World!"
\`\`\`

### Comments
Python has commenting capability for the purpose of in-code documentation. Comments start with a \`#\`, and Python will render the rest of the line as a comment:

\`\`\`python
# This is a comment.
print("Hello, World!")
\`\`\`
`
  },
  {
    id: 'basics-variables',
    title: 'Variables',
    category: 'Basics',
    content: `
# Python Variables

Variables are containers for storing data values.

### Creating Variables
Python has no command for declaring a variable. A variable is created the moment you first assign a value to it.

\`\`\`python
x = 5
y = "John"
print(x)
print(y)
\`\`\`

Variables do not need to be declared with any particular type, and can even change type after they have been set.

\`\`\`python
x = 4       # x is of type int
x = "Sally" # x is now of type str
print(x)
\`\`\`

### Casting
If you want to specify the data type of a variable, this can be done with casting.

\`\`\`python
x = str(3)    # x will be '3'
y = int(3)    # y will be 3
z = float(3)  # z will be 3.0
\`\`\`

### Get the Type
You can get the data type of a variable with the \`type()\` function.

\`\`\`python
x = 5
y = "John"
print(type(x))
print(type(y))
\`\`\`

### Single or Double Quotes?
String variables can be declared either by using single or double quotes:

\`\`\`python
x = "John"
# is the same as
x = 'John'
\`\`\`

### Case-Sensitive
Variable names are case-sensitive.

\`\`\`python
a = 4
A = "Sally"
# A will not overwrite a
\`\`\`
`
  },
  {
    id: 'basics-datatypes',
    title: 'Data Types',
    category: 'Basics',
    content: `
# Built-in Data Types

In programming, data type is an important concept. Variables can store data of different types, and different types can do different things.

Python has the following data types built-in by default, in these categories:

### Text Type: \`str\`
String literals in python are surrounded by either single quotation marks, or double quotation marks.

\`\`\`python
x = "Hello World"
# display x:
print(x)
# display the data type of x:
print(type(x)) 
\`\`\`

### Numeric Types: \`int\`, \`float\`, \`complex\`

**Integer (\`int\`):**
Int, or integer, is a whole number, positive or negative, without decimals, of unlimited length.

\`\`\`python
x = 20
print(type(x))
\`\`\`

**Float (\`float\`):**
Float, or "floating point number" is a number, positive or negative, containing one or more decimals.

\`\`\`python
x = 20.5
print(type(x))
\`\`\`

### Sequence Types: \`list\`, \`tuple\`, \`range\`

**List:**
Lists are used to store multiple items in a single variable.

\`\`\`python
x = ["apple", "banana", "cherry"]
\`\`\`

**Tuple:**
A tuple is a collection which is ordered and **unchangeable**.

\`\`\`python
x = ("apple", "banana", "cherry")
\`\`\`

**Range:**
The range type represents an immutable sequence of numbers and is commonly used for looping a specific number of times in for loops.

\`\`\`python
x = range(6)
\`\`\`

### Mapping Type: \`dict\`
Dictionaries are used to store data values in key:value pairs.

\`\`\`python
x = {"name" : "John", "age" : 36}
\`\`\`

### Boolean Type: \`bool\`
Booleans represent one of two values: \`True\` or \`False\`.

\`\`\`python
x = True
\`\`\`
`
  },
  {
    id: 'basics-operators',
    title: 'Operators',
    category: 'Basics',
    content: `
# Python Operators

Operators are used to perform operations on variables and values.

### Arithmetic Operators
Arithmetic operators are used with numeric values to perform common mathematical operations:

| Operator | Name | Example | Result |
| :--- | :--- | :--- | :--- |
| \`+\` | Addition | \`x + y\` | Sum of x and y |
| \`-\` | Subtraction | \`x - y\` | Difference of x and y |
| \`*\` | Multiplication | \`x * y\` | Product of x and y |
| \`/\` | Division | \`x / y\` | Quotient of x and y |
| \`%\` | Modulus | \`x % y\` | Remainder of x / y |
| \`**\` | Exponentiation | \`x ** y\` | x to the power of y |
| \`//\` | Floor Division | \`x // y\` | Division rounded down |

### Assignment Operators
Assignment operators are used to assign values to variables:

\`\`\`python
x = 5
x += 3  # Same as x = x + 3
x -= 3  # Same as x = x - 3
\`\`\`

### Comparison Operators
Comparison operators are used to compare two values:

\`\`\`python
x = 5
y = 3
print(x == y) # returns False because 5 is not equal to 3
print(x != y) # returns True because 5 is not equal to 3
print(x > y)  # returns True because 5 is greater than 3
\`\`\`

### Logical Operators
Logical operators are used to combine conditional statements:

*   \`and\` : Returns True if both statements are true
*   \`or\` : Returns True if one of the statements is true
*   \`not\` : Reverse the result, returns False if the result is true

\`\`\`python
x = 5
print(x > 3 and x < 10) # returns True because 5 is greater than 3 AND 5 is less than 10
\`\`\`
`
  },

  // --- CONTROL FLOW ---
  {
    id: 'control-if',
    title: 'If...Else',
    category: 'Control Flow',
    content: `
# Python Conditions and If statements

Python supports the usual logical conditions from mathematics:
*   Equals: \`a == b\`
*   Not Equals: \`a != b\`
*   Less than: \`a < b\`
*   Less than or equal to: \`a <= b\`
*   Greater than: \`a > b\`
*   Greater than or equal to: \`a >= b\`

These conditions can be used in several ways, most commonly in "if statements" and loops.

### The if Statement
An "if statement" is written by using the if keyword.

\`\`\`python
a = 33
b = 200
if b > a:
  print("b is greater than a")
\`\`\`

**Important:** If you only have one statement to execute, you can put it on the same line as the if statement.

\`\`\`python
if a > b: print("a is greater than b")
\`\`\`

### Elif
The \`elif\` keyword is Python's way of saying "if the previous conditions were not true, then try this condition".

\`\`\`python
a = 33
b = 33
if b > a:
  print("b is greater than a")
elif a == b:
  print("a and b are equal")
\`\`\`

### Else
The \`else\` keyword catches anything which isn't caught by the preceding conditions.

\`\`\`python
a = 200
b = 33
if b > a:
  print("b is greater than a")
elif a == b:
  print("a and b are equal")
else:
  print("a is greater than b")
\`\`\`

### Nested If
You can have \`if\` statements inside \`if\` statements, this is called nested if statements.

\`\`\`python
x = 41

if x > 10:
  print("Above 10,")
  if x > 20:
    print("and also above 20!")
  else:
    print("but not above 20.")
\`\`\`
`
  },
  {
    id: 'control-loops',
    title: 'Loops (For/While)',
    category: 'Control Flow',
    content: `
# Python Loops

Python has two primitive loop commands:
*   \`while\` loops
*   \`for\` loops

### The While Loop
With the \`while\` loop we can execute a set of statements as long as a condition is true.

\`\`\`python
i = 1
while i < 6:
  print(i)
  i += 1
\`\`\`

**Note:** remember to increment i, or else the loop will continue forever.

### The For Loop
A \`for\` loop is used for iterating over a sequence (that is either a list, a tuple, a dictionary, a set, or a string).

\`\`\`python
fruits = ["apple", "banana", "cherry"]
for x in fruits:
  print(x)
\`\`\`

### Looping Through a String
Even strings are iterable objects, they contain a sequence of characters:

\`\`\`python
for x in "banana":
  print(x)
\`\`\`

### The range() Function
To loop through a set of code a specified number of times, we can use the \`range()\` function.

The \`range()\` function returns a sequence of numbers, starting from 0 by default, and increments by 1 (by default), and ends at a specified number.

\`\`\`python
for x in range(6):
  print(x)
\`\`\`

Note that \`range(6)\` is not the values of 0 to 6, but the values 0 to 5.

### Nested Loops
A nested loop is a loop inside a loop. The "inner loop" will be executed one time for each iteration of the "outer loop".

\`\`\`python
adj = ["red", "big", "tasty"]
fruits = ["apple", "banana", "cherry"]

for x in adj:
  for y in fruits:
    print(x, y)
\`\`\`
`
  },

  // --- FUNCTIONS ---
  {
    id: 'func-basics',
    title: 'Functions',
    category: 'Functions',
    content: `
# Python Functions

A function is a block of code which only runs when it is called.
You can pass data, known as parameters, into a function.
A function can return data as a result.

### Creating a Function
In Python a function is defined using the \`def\` keyword:

\`\`\`python
def my_function():
  print("Hello from a function")
\`\`\`

### Calling a Function
To call a function, use the function name followed by parenthesis:

\`\`\`python
def my_function():
  print("Hello from a function")

my_function()
\`\`\`

### Arguments
Information can be passed into functions as arguments.
Arguments are specified after the function name, inside the parentheses. You can add as many arguments as you want, just separate them with a comma.

\`\`\`python
def my_function(fname):
  print(fname + " Refsnes")

my_function("Emil")
my_function("Tobias")
my_function("Linus")
\`\`\`

### Number of Arguments
By default, a function must be called with the correct number of arguments. Meaning that if your function expects 2 arguments, you have to call the function with 2 arguments, not more, and not less.

\`\`\`python
def my_function(fname, lname):
  print(fname + " " + lname)

my_function("Emil", "Refsnes")
\`\`\`

### Return Values
To let a function return a value, use the \`return\` statement:

\`\`\`python
def my_function(x):
  return 5 * x

print(my_function(3))
print(my_function(5))
print(my_function(9))
\`\`\`
`
  },
  {
    id: 'func-lambda',
    title: 'Lambda Functions',
    category: 'Functions',
    content: `
# Python Lambda

A lambda function is a small anonymous function.
A lambda function can take any number of arguments, but can only have one expression.

### Syntax
The syntax is very simple:
\`lambda arguments : expression\`

The expression is executed and the result is returned:

\`\`\`python
x = lambda a : a + 10
print(x(5))
\`\`\`

Lambda functions can take any number of arguments:

\`\`\`python
x = lambda a, b : a * b
print(x(5, 6))
\`\`\`

### Why Use Lambda Functions?
The power of lambda is better shown when you use them as an anonymous function inside another function.

Say you have a function definition that takes one argument, and that argument will be multiplied with an unknown number:

\`\`\`python
def myfunc(n):
  return lambda a : a * n
\`\`\`

Use that function definition to make a function that always doubles the number you send in:

\`\`\`python
mydoubler = myfunc(2)

print(mydoubler(11))
\`\`\`
`
  },

  // --- DATA STRUCTURES ---
  {
    id: 'ds-lists',
    title: 'Lists',
    category: 'Data Structures',
    content: `
# Python Lists

Lists are used to store multiple items in a single variable.
Lists are one of 4 built-in data types in Python used to store collections of data, the other 3 are Tuple, Set, and Dictionary, all with different qualities and usage.

Lists are created using square brackets:

\`\`\`python
thislist = ["apple", "banana", "cherry"]
print(thislist)
\`\`\`

### List Items
List items are ordered, changeable, and allow duplicate values.
List items are indexed, the first item has index \`[0]\`, the second item has index \`[1]\` etc.

### Access Items
You can access the list items by referring to the index number:

\`\`\`python
thislist = ["apple", "banana", "cherry"]
print(thislist[1])
\`\`\`

### Negative Indexing
Negative indexing means start from the end. \`-1\` refers to the last item, \`-2\` refers to the second last item etc.

\`\`\`python
thislist = ["apple", "banana", "cherry"]
print(thislist[-1])
\`\`\`

### Change Item Value
To change the value of a specific item, refer to the index number:

\`\`\`python
thislist = ["apple", "banana", "cherry"]
thislist[1] = "blackcurrant"
print(thislist)
\`\`\`

### Loop Through a List
You can loop through the list items by using a \`for\` loop:

\`\`\`python
thislist = ["apple", "banana", "cherry"]
for x in thislist:
  print(x)
\`\`\`
`
  },
  {
    id: 'ds-dicts',
    title: 'Dictionaries',
    category: 'Data Structures',
    content: `
# Python Dictionaries

Dictionaries are used to store data values in key:value pairs.
A dictionary is a collection which is ordered*, changeable and does not allow duplicates.

Dictionaries are written with curly brackets, and have keys and values:

\`\`\`python
thisdict = {
  "brand": "Ford",
  "model": "Mustang",
  "year": 1964
}
print(thisdict)
\`\`\`

### Dictionary Items
Dictionary items are presented in key:value pairs, and can be referred to by using the key name.

\`\`\`python
thisdict = {
  "brand": "Ford",
  "model": "Mustang",
  "year": 1964
}
print(thisdict["brand"])
\`\`\`

### Accessing Items
You can access the items of a dictionary by referring to its key name, inside square brackets:

\`\`\`python
x = thisdict["model"]
\`\`\`

There is also a method called \`get()\` that will give you the same result:

\`\`\`python
x = thisdict.get("model")
\`\`\`

### Loop Through a Dictionary
You can loop through a dictionary by using a \`for\` loop.
When looping through a dictionary, the return value are the *keys* of the dictionary, but there are methods to return the *values* as well.

\`\`\`python
# Print all keys
for x in thisdict:
  print(x)

# Print all values
for x in thisdict:
  print(thisdict[x])
\`\`\`
`
  },
  {
    id: 'ds-sets',
    title: 'Sets',
    category: 'Data Structures',
    content: `
# Python Sets

A set is a collection which is unordered, unchangeable*, and unindexed.
*Note: Set items are unchangeable, but you can remove items and add new items.*

Sets are written with curly brackets.

\`\`\`python
thisset = {"apple", "banana", "cherry"}
print(thisset)
\`\`\`

**Note:** Sets are unordered, so you cannot be sure in which order the items will appear.

### Access Items
You cannot access items in a set by referring to an index or a key.
But you can loop through the set items using a \`for\` loop, or ask if a specified value is present in a set, by using the \`in\` keyword.

\`\`\`python
thisset = {"apple", "banana", "cherry"}

for x in thisset:
  print(x)
\`\`\`

### Add Items
To add one item to a set use the \`add()\` method.

\`\`\`python
thisset = {"apple", "banana", "cherry"}
thisset.add("orange")
print(thisset)
\`\`\`

### Remove Items
To remove an item in a set, use the \`remove()\`, or the \`discard()\` method.

\`\`\`python
thisset = {"apple", "banana", "cherry"}
thisset.remove("banana")
print(thisset)
\`\`\`
`
  },
  {
    id: 'ds-tuples',
    title: 'Tuples',
    category: 'Data Structures',
    content: `
# Python Tuples

A tuple is a collection which is ordered and **unchangeable**.
Tuples are written with round brackets.

\`\`\`python
thistuple = ("apple", "banana", "cherry")
print(thistuple)
\`\`\`

### Tuple Items
Tuple items are ordered, unchangeable, and allow duplicate values.
Tuple items are indexed, the first item has index \`[0]\`, the second item has index \`[1]\` etc.

### Ordered
When we say that tuples are ordered, it means that the items have a defined order, and that order will not change.

### Unchangeable
Tuples are unchangeable, meaning that we cannot change, add or remove items after the tuple has been created.

\`\`\`python
x = ("apple", "banana", "cherry")
# x[1] = "kiwi" <-- This will raise an error
\`\`\`

### Create Tuple With One Item
To create a tuple with only one item, you have to add a comma after the item, otherwise Python will not recognize it as a tuple.

\`\`\`python
thistuple = ("apple",)
print(type(thistuple)) # <class 'tuple'>

# NOT a tuple
thistuple = ("apple")
print(type(thistuple)) # <class 'str'>
\`\`\`
`
  },

  // --- FILE HANDLING ---
  {
    id: 'file-io',
    title: 'File Handling',
    category: 'File Handling',
    content: `
# Python File Open

File handling is an important part of any web application.
Python has several functions for creating, reading, updating, and deleting files.

### The open() Function
The key function for working with files in Python is the \`open()\` function.
The \`open()\` function takes two parameters; *filename*, and *mode*.

There are four different methods (modes) for opening a file:

*   \`"r"\` - **Read** - Default value. Opens a file for reading, error if the file does not exist
*   \`"a"\` - **Append** - Opens a file for appending, creates the file if it does not exist
*   \`"w"\` - **Write** - Opens a file for writing, creates the file if it does not exist
*   \`"x"\` - **Create** - Creates the specified file, returns an error if the file exists

### Syntax
To open a file for reading it is enough to specify the name of the file:

\`\`\`python
f = open("demofile.txt")
\`\`\`

The code above is the same as:

\`\`\`python
f = open("demofile.txt", "rt")
\`\`\`

Because \`"r"\` for read, and \`"t"\` for text are the default values, you do not need to specify them.

### Read Lines
You can return one line by using the \`readline()\` method:

\`\`\`python
f = open("demofile.txt", "r")
print(f.readline())
\`\`\`

### Close Files
It is a good practice to always close the file when you are done with it.

\`\`\`python
f = open("demofile.txt", "r")
print(f.readline())
f.close()
\`\`\`
`
  },

  // --- ADVANCED ---
  {
    id: 'adv-classes',
    title: 'Classes/Objects',
    category: 'OOP',
    content: `
# Python Classes and Objects

Python is an object oriented programming language.
Almost everything in Python is an object, with its own properties and methods.
A Class is like an object constructor, or a "blueprint" for creating objects.

### Create a Class
To create a class, use the keyword \`class\`:

\`\`\`python
class MyClass:
  x = 5
\`\`\`

### Create Object
Now we can use the class named MyClass to create objects:

\`\`\`python
p1 = MyClass()
print(p1.x)
\`\`\`

### The __init__() Function
The examples above are classes and objects in their simplest form, and are not really useful in real life applications.

To understand the meaning of classes we have to understand the built-in \`__init__()\` function.
All classes have a function called \`__init__()\`, which is always executed when the class is being initiated.

Use the \`__init__()\` function to assign values to object properties, or other operations that are necessary to do when the object is being created:

\`\`\`python
class Person:
  def __init__(self, name, age):
    self.name = name
    self.age = age

p1 = Person("John", 36)

print(p1.name)
print(p1.age)
\`\`\`

**Note:** The \`__init__()\` function is called automatically every time the class is being used to create a new object.
`
  },
  {
    id: 'adv-inheritance',
    title: 'Inheritance',
    category: 'OOP',
    content: `
# Python Inheritance

Inheritance allows us to define a class that inherits all the methods and properties from another class.

*   **Parent class** is the class being inherited from, also called base class.
*   **Child class** is the class that inherits from another class, also called derived class.

### Create a Parent Class
Any class can be a parent class, so the syntax is the same as creating any other class:

\`\`\`python
class Person:
  def __init__(self, fname, lname):
    self.firstname = fname
    self.lastname = lname

  def printname(self):
    print(self.firstname, self.lastname)

# Use the Person class to create an object, and then execute the printname method:
x = Person("John", "Doe")
x.printname()
\`\`\`

### Create a Child Class
To create a class that inherits the functionality from another class, send the parent class as a parameter when creating the child class:

\`\`\`python
class Student(Person):
  pass
\`\`\`

Now the Student class has the same properties and methods as the Person class.

\`\`\`python
x = Student("Mike", "Olsen")
x.printname()
\`\`\`
`
  },
  {
    id: 'adv-modules',
    title: 'Modules',
    category: 'Modules',
    content: `
# Python Modules

Consider a module to be the same as a code library.
A file containing a set of functions you want to include in your application.

### Create a Module
To create a module just save the code you want in a file with the file extension \`.py\`:

\`\`\`python
# Save this code in a file named mymodule.py
def greeting(name):
  print("Hello, " + name)
\`\`\`

### Use a Module
Now we can use the module we just created, by using the \`import\` statement:

\`\`\`python
import mymodule

mymodule.greeting("Jonathan")
\`\`\`

### Variables in Module
The module can contain functions, as already described, but also variables of all types (arrays, dictionaries, objects etc):

\`\`\`python
# Save this code in the file mymodule.py
person1 = {
  "name": "John",
  "age": 36,
  "country": "Norway"
}
\`\`\`

Import the module and access the person1 dictionary:

\`\`\`python
import mymodule

a = mymodule.person1["age"]
print(a)
\`\`\`
`
  },
  {
    id: 'adv-errors',
    title: 'Try...Except',
    category: 'Error Handling',
    content: `
# Python Try Except

The \`try\` block lets you test a block of code for errors.
The \`except\` block lets you handle the error.
The \`else\` block lets you execute code when there is no error.
The \`finally\` block lets you execute code, regardless of the result of the try- and except blocks.

### Exception Handling
When an error occurs, or exception as we call it, Python will normally stop and generate an error message.

These exceptions can be handled using the \`try\` statement:

\`\`\`python
try:
  print(x)
except:
  print("An exception occurred")
\`\`\`

### Many Exceptions
You can define as many exception blocks as you want, e.g. if you want to execute a special block of code for a special kind of error:

\`\`\`python
try:
  print(x)
except NameError:
  print("Variable x is not defined")
except:
  print("Something else went wrong")
\`\`\`

### Else
You can use the \`else\` keyword to define a block of code to be executed if no errors were raised:

\`\`\`python
try:
  print("Hello")
except:
  print("Something went wrong")
else:
  print("Nothing went wrong")
\`\`\`
`
  }
];
