/**
 * Mirai School of Technology - Complete Curriculum Games & Question Bank
 * Covers all 17 topics and 170 questions from "Game Ideas for Learning":
 * - Part 1: DSA in C++ (7 Topics, 70 Questions)
 * - Part 2: Web Development HTML (10 Topics, 100 Questions)
 */

const MIRAI_GAMES = [
    // ==========================================
    // PART 1: DSA IN C++ (7 TOPICS)
    // ==========================================
    {
        id: 'game_cpp_1',
        track: 'cpp',
        trackName: 'DSA in C++',
        topicNum: 1,
        title: 'Code Detective',
        topic: 'Program Basics and Input/Output',
        badge: { id: 'chief_inspector', name: 'Chief Inspector', icon: '🔍', desc: 'Solved 10 code crime scenes in program basics!' },
        story: 'You are a detective in Neo-Tokyo. Every broken C++ program is a cyber crime scene and you must find the clue.',
        rules: 'Inspect the crime scene. Pick the bug or output. Correct = clue found. Wrong = lose 1 magnifying glass.',
        mechanic: 'detective',
        questions: [
            {
                num: 1,
                type: 'Spot the Bug',
                prompt: 'cout << "Hello" is written but gives an error. What is missing at the end?',
                code: 'cout << "Hello"',
                options: ['A closing curly bracket }', 'A semicolon ; at the end of the line', 'A colon :', 'A hashtag #'],
                correctIndex: 1,
                hint: 'In C++, every statement ends with a specific punctuation mark.',
                explanation: 'In C++, every statement must terminate with a semicolon ;'
            },
            {
                num: 2,
                type: 'Fill the Blank',
                prompt: 'To use cout and cin, what header do we write inside #include <____> at the top?',
                code: '#include <____>',
                options: ['iostream', 'conio.h', 'stdio.h', 'math.h'],
                correctIndex: 0,
                hint: 'Input/Output Stream header file.',
                explanation: '#include <iostream> provides input/output stream objects like cin and cout.'
            },
            {
                num: 3,
                type: 'Predict Output',
                prompt: 'What is printed to the terminal?',
                code: 'cout << "A" << "B";',
                options: ['A B', 'AB', 'A\\nB', 'Error'],
                correctIndex: 1,
                hint: 'There are no spaces or endl between the two strings.',
                explanation: 'Since no space or newline is inserted, "A" and "B" concatenate directly as AB.'
            },
            {
                num: 4,
                type: 'Predict Output',
                prompt: 'What is printed by this line?',
                code: 'cout << "A" << endl << "B";',
                options: ['AB on one line', 'A on the first line and B on the next line', 'A endl B', 'Error: endl invalid'],
                correctIndex: 1,
                hint: 'endl flushes the stream and moves the cursor to a fresh line.',
                explanation: 'endl inserts a newline character, placing A on line 1 and B on line 2.'
            },
            {
                num: 5,
                type: 'Match the Pair',
                prompt: 'Match cin and cout with their primary jobs:',
                code: 'cin >> x; cout << x;',
                options: ['cin = take input, cout = show output', 'cin = show output, cout = take input', 'Both take input', 'Both show output'],
                correctIndex: 0,
                hint: 'c-in brings data into the program; c-out sends data out.',
                explanation: 'cin is standard console input stream; cout is standard console output stream.'
            },
            {
                num: 6,
                type: 'True or False',
                prompt: 'A C++ program always starts executing from the main() function.',
                code: 'int main() { ... }',
                options: ['True', 'False', 'Only if main is at top', 'Only in debug mode'],
                correctIndex: 0,
                hint: 'main is the entry point defined by the language standard.',
                explanation: 'True. The OS loader begins program execution directly at main().'
            },
            {
                num: 7,
                type: 'Spot the Bug',
                prompt: 'The program uses cout but has no "using namespace std;". How can we fix it?',
                code: 'cout << "Mirai";',
                options: ['Add using namespace std; OR write std::cout', 'Change cout to print()', 'Include <stdlib.h>', 'Capitalize Cout'],
                correctIndex: 0,
                hint: 'cout lives inside the std namespace.',
                explanation: 'cout is part of the standard namespace std. Prefix with std:: or import the namespace.'
            },
            {
                num: 8,
                type: 'Predict Output',
                prompt: 'The user inputs 5. What does this code print?',
                code: 'int a; cin >> a; cout << a;',
                options: ['a', '5', '0', 'Trash value'],
                correctIndex: 1,
                hint: 'cin stored 5 in variable a, then cout displays a.',
                explanation: 'cin reads 5 into a, and cout << a prints 5.'
            },
            {
                num: 9,
                type: 'Fill the Blank',
                prompt: 'A single-line comment in C++ starts with ____ .',
                code: '____ This is a comment',
                options: ['//', '/*', '#', '--'],
                correctIndex: 0,
                hint: 'Double forward slashes.',
                explanation: '// initiates a single line comment ignored by the C++ compiler.'
            },
            {
                num: 10,
                type: 'Odd One Out',
                prompt: 'Which one is NOT a comment in C++?',
                code: '//, /* */, #include',
                options: ['#include (it adds a header/library file)', '// (single line comment)', '/* */ (multi-line comment)', 'All are comments'],
                correctIndex: 0,
                hint: 'One of these is a preprocessor directive.',
                explanation: '#include is a preprocessor directive to incorporate header files, not a comment.'
            }
        ]
    },
    {
        id: 'game_cpp_2',
        track: 'cpp',
        trackName: 'DSA in C++',
        topicNum: 2,
        title: 'Box Sorting Warehouse',
        topic: 'Variables and Data Types',
        badge: { id: 'sorting_specialist', name: 'Sorting Specialist', icon: '📦', desc: 'Mastered memory slots & data type classification!' },
        story: 'You work in the automated cyber warehouse of Mirai Tech. Every memory value must be sorted into its correct type box before the clock ticks down.',
        rules: 'Analyze each literal or variable. Drag or sort into int, float, char, bool, or string. Combos award bonus points!',
        mechanic: 'box_sort',
        questions: [
            {
                num: 1,
                type: 'Sort It',
                prompt: 'Which data type box is correct for the literal value 25?',
                code: 'auto val = 25;',
                options: ['int', 'float', 'char', 'string'],
                correctIndex: 0,
                hint: 'It is a whole number with no decimal point.',
                explanation: '25 is an integer literal, stored in int.'
            },
            {
                num: 2,
                type: 'Sort It',
                prompt: 'Which box for the value 3.14?',
                code: 'auto val = 3.14;',
                options: ['float or double', 'int', 'char', 'bool'],
                correctIndex: 0,
                hint: 'It has fractional digits.',
                explanation: '3.14 has a decimal point, representing a floating-point number (double or float).'
            },
            {
                num: 3,
                type: 'Sort It',
                prompt: 'Which box for the single character \'A\' ?',
                code: 'auto val = \'A\';',
                options: ['char', 'string', 'int', 'bool'],
                correctIndex: 0,
                hint: 'Enclosed in single quotes.',
                explanation: 'A single character surrounded by single quotes \'A\' is of type char.'
            },
            {
                num: 4,
                type: 'Sort It',
                prompt: 'Which box for the value true ?',
                code: 'auto val = true;',
                options: ['bool', 'string', 'int', 'char'],
                correctIndex: 0,
                hint: 'True or false are truth values.',
                explanation: 'true is a boolean literal, stored in bool.'
            },
            {
                num: 5,
                type: 'Sort It',
                prompt: 'Which box for the text "Hello" ?',
                code: 'auto val = "Hello";',
                options: ['string', 'char', 'int', 'float'],
                correctIndex: 0,
                hint: 'Enclosed in double quotation marks.',
                explanation: '"Hello" is a sequence of characters enclosed in double quotes, forming a string.'
            },
            {
                num: 6,
                type: 'Predict Output',
                prompt: 'What is printed by cout << x ?',
                code: 'int x = 7.9; cout << x;',
                options: ['7 (decimal part truncated)', '8 (rounded up)', '7.9', 'Compilation Error'],
                correctIndex: 0,
                hint: 'C++ integer assignment truncates fractions, it does not round.',
                explanation: 'Assigning 7.9 to an int truncates the decimal component, storing 7.'
            },
            {
                num: 7,
                type: 'Spot the Bug',
                prompt: 'Why is int 1num = 5; an invalid variable declaration?',
                code: 'int 1num = 5;',
                options: ['A variable name cannot start with a digit', 'num is a reserved keyword', 'Needs capital N', 'Cannot assign 5'],
                correctIndex: 0,
                hint: 'Identifiers must begin with a letter or underscore.',
                explanation: 'In C++, identifiers cannot begin with numerical digits.'
            },
            {
                num: 8,
                type: 'True or False',
                prompt: 'int and Int mean the exact same type in C++.',
                code: 'int a; Int b;',
                options: ['False (C++ is strictly case-sensitive)', 'True', 'Only on 64-bit systems', 'Only in header files'],
                correctIndex: 0,
                hint: 'C++ is case-sensitive.',
                explanation: 'False. C++ is case-sensitive; int is a reserved keyword, whereas Int is an undeclared symbol.'
            },
            {
                num: 9,
                type: 'Predict Output',
                prompt: 'What ASCII value is printed when casting char \'A\' to int?',
                code: 'char c = \'A\'; cout << (int)c;',
                options: ['65', '97', '1', 'A'],
                correctIndex: 0,
                hint: 'Uppercase A is at ASCII index 65.',
                explanation: 'The ASCII numerical encoding of uppercase \'A\' is 65.'
            },
            {
                num: 10,
                type: 'Odd One Out',
                prompt: 'Which of the following is NOT a valid C++ identifier?',
                code: 'age, _score, 2nd, total',
                options: ['2nd (starts with a digit)', 'age', '_score', 'total'],
                correctIndex: 0,
                hint: 'Starts with a number.',
                explanation: '2nd starts with the digit 2, which violates variable naming rules.'
            }
        ]
    },
    {
        id: 'game_cpp_3',
        track: 'cpp',
        trackName: 'DSA in C++',
        topicNum: 3,
        title: 'Calculator Boss Battle',
        topic: 'Operators',
        badge: { id: 'operator_master', name: 'Operator Master', icon: '⚔️', desc: 'Defeated the Cyber Demon Boss using exact operator logic!' },
        story: 'A rogue Cyber Mecha Boss with 100 HP threatens Mirai School! Every correct operator evaluation launches an elemental plasma slash. Answer fast for critical hits!',
        rules: 'Solve the operator expressions. Correct = -10 HP (or -15 HP critical within 10s). Wrong = boss strikes back (-1 heart)!',
        mechanic: 'boss_battle',
        questions: [
            {
                num: 1,
                type: 'Predict Output',
                prompt: 'Calculate the modulo expression:',
                code: 'cout << 10 % 3;',
                options: ['1 (remainder of 10 / 3)', '3', '0', '3.33'],
                correctIndex: 0,
                hint: '% returns the remainder of integer division.',
                explanation: '10 divided by 3 is 3 with remainder 1. 10 % 3 = 1.'
            },
            {
                num: 2,
                type: 'Predict Output',
                prompt: 'Both operands are int. What is printed?',
                code: 'cout << 10 / 4;',
                options: ['2 (fractional part is discarded)', '2.5', '3', 'Error'],
                correctIndex: 0,
                hint: 'Integer divided by integer gives integer.',
                explanation: 'Integer division truncates decimal values: 10 / 4 = 2.'
            },
            {
                num: 3,
                type: 'Predict Output',
                prompt: 'One operand is a floating point literal 4.0. What is printed?',
                code: 'cout << 10 / 4.0;',
                options: ['2.5', '2', '2.0', '14'],
                correctIndex: 0,
                hint: 'When one operand is float/double, the calculation promotes to floating point.',
                explanation: '10 / 4.0 undergoes float promotion, yielding 2.5.'
            },
            {
                num: 4,
                type: 'Match the Pair',
                prompt: 'Match %, /, == with their exact operations:',
                code: '% , / , ==',
                options: ['% = remainder, / = divide, == = check equality', '% = divide, / = remainder, == = assign', '% = percent, / = floor, == = identical', 'None of these'],
                correctIndex: 0,
                hint: '% is modulo, / is division, == is comparison.',
                explanation: '% is modulo (remainder), / is division, == checks equality.'
            },
            {
                num: 5,
                type: 'Riddle',
                prompt: '"I provide my old value first to the expression, and only then do I increment." Who am I?',
                code: 'a++ OR ++a',
                options: ['a++ (post-increment)', '++a (pre-increment)', '+= 1', 'None'],
                correctIndex: 0,
                hint: 'Post means after evaluation.',
                explanation: 'a++ is post-increment: uses current value first, then increments.'
            },
            {
                num: 6,
                type: 'Predict Output',
                prompt: 'What value is printed here?',
                code: 'int a = 5; cout << ++a;',
                options: ['6', '5', '7', 'Error'],
                correctIndex: 0,
                hint: '++a increments BEFORE printing.',
                explanation: '++a is pre-increment: a becomes 6 immediately and 6 is printed.'
            },
            {
                num: 7,
                type: 'True or False',
                prompt: '= and == perform the exact same job in C++.',
                code: 'a = b vs a == b',
                options: ['False (= assigns value, == compares equality)', 'True', 'Only inside if statements', 'True in C++20'],
                correctIndex: 0,
                hint: '= assigns, == tests equality.',
                explanation: 'False. = is assignment operator; == is equality comparison operator.'
            },
            {
                num: 8,
                type: 'Predict Output',
                prompt: 'Evaluate the logical AND expression:',
                code: 'cout << ((5 > 3) && (2 > 4));',
                options: ['0 (false, because both sides must be true)', '1 (true)', 'true', '2'],
                correctIndex: 0,
                hint: '&& requires both sides to be true. (2 > 4) is false.',
                explanation: '5>3 is true (1), but 2>4 is false (0). 1 && 0 = 0.'
            },
            {
                num: 9,
                type: 'Fill the Blank',
                prompt: 'What is the final value of variable a?',
                code: 'int a = 2; a += 3;',
                options: ['5', '6', '23', '3'],
                correctIndex: 0,
                hint: 'a += 3 is equivalent to a = a + 3.',
                explanation: 'a += 3 adds 3 to 2, resulting in 5.'
            },
            {
                num: 10,
                type: 'Order the Steps',
                prompt: 'What operator is solved first in 2 + 3 * 4, and what is the final answer?',
                code: '2 + 3 * 4',
                options: ['3 * 4 first, final answer = 14', '2 + 3 first, final answer = 20', 'Left to right, answer = 20', 'Addition first, answer = 14'],
                correctIndex: 0,
                hint: 'Multiplication * has higher precedence than addition +.',
                explanation: '* has higher precedence than +: 3 * 4 = 12, then 2 + 12 = 14.'
            }
        ]
    },
    {
        id: 'game_cpp_4',
        track: 'cpp',
        trackName: 'DSA in C++',
        topicNum: 4,
        title: 'Maze Runner',
        topic: 'if-else and switch',
        badge: { id: 'maze_master', name: 'Maze Master', icon: '🌀', desc: 'Navigated 10 neon maze portals through branching logic!' },
        story: 'A cyber courier is trapped in a branching neon labyrinth. At every gate, the conditional code controls which portal opens.',
        rules: 'Select the output branch that unlocks the door. Correct = advance 1 portal. Wrong = hit electric wall & retreat!',
        mechanic: 'maze_runner',
        questions: [
            {
                num: 1,
                type: 'Predict Output',
                prompt: 'Which gate path opens when x = 10?',
                code: 'int x = 10; if(x > 5) cout << "A"; else cout << "B";',
                options: ['A', 'B', 'AB', 'Nothing'],
                correctIndex: 0,
                hint: 'Is 10 > 5?',
                explanation: '10 > 5 is true, so the if block executes and prints "A".'
            },
            {
                num: 2,
                type: 'Predict Output',
                prompt: 'Same code, but with input x = 3:',
                code: 'int x = 3; if(x > 5) cout << "A"; else cout << "B";',
                options: ['B', 'A', 'AB', 'Error'],
                correctIndex: 0,
                hint: 'Is 3 > 5? If not, fall to else.',
                explanation: '3 > 5 is false, so control transfers to else, printing "B".'
            },
            {
                num: 3,
                type: 'Predict Output',
                prompt: 'What grade output is displayed when m = 75?',
                code: 'int m = 75; if(m >= 90) cout << "A"; else if(m >= 60) cout << "B"; else cout << "C";',
                options: ['B', 'A', 'C', 'ABC'],
                correctIndex: 0,
                hint: '75 is not >= 90, but 75 is >= 60.',
                explanation: '75 < 90, but 75 >= 60 is true, so "B" is printed.'
            },
            {
                num: 4,
                type: 'Spot the Bug',
                prompt: 'Why is if(x = 5) a severe bug in C++?',
                code: 'if (x = 5) { ... }',
                options: ['It should be ==. A single = assigns 5 into x and condition evaluates always true', 'C++ syntax bans parentheses', 'Must be written as 5 == x only', 'No bug, valid check'],
                correctIndex: 0,
                hint: '= assigns instead of comparing.',
                explanation: 'x = 5 assigns 5 to x; 5 is non-zero (true), causing the if condition to always succeed!'
            },
            {
                num: 5,
                type: 'Fill the Blank',
                prompt: 'In switch statements, which keyword prevents fallthrough into subsequent cases?',
                code: 'switch(x) { case 1: ... ____; }',
                options: ['break', 'stop', 'exit', 'continue'],
                correctIndex: 0,
                hint: 'Breaks out of the switch block.',
                explanation: 'The break keyword terminates switch statement execution and skips remaining cases.'
            },
            {
                num: 6,
                type: 'Predict Output',
                prompt: 'Notice there are NO break statements! What is printed?',
                code: 'switch(2) { case 1: cout << "A"; case 2: cout << "B"; case 3: cout << "C"; }',
                options: ['BC (falls through case 2 to case 3)', 'B', 'A', 'ABC'],
                correctIndex: 0,
                hint: 'Without break, execution falls through all remaining cases.',
                explanation: 'Execution enters case 2, printing B, and falls through into case 3, printing C -> BC.'
            },
            {
                num: 7,
                type: 'True or False',
                prompt: 'The else clause always requires a parenthesized condition.',
                code: 'else (x < 0) { ... }',
                options: ['False (else never takes a condition)', 'True', 'Only if attached to switch', 'True in C++17'],
                correctIndex: 0,
                hint: 'Only if or else if take conditions.',
                explanation: 'False. A standalone else handles all remaining fallback cases without any condition.'
            },
            {
                num: 8,
                type: 'Predict Output',
                prompt: 'In C++, 0 evaluates as boolean false. What is printed?',
                code: 'int n = 0; if(n) cout << "Yes"; else cout << "No";',
                options: ['No', 'Yes', '0', 'Error: non-bool in condition'],
                correctIndex: 0,
                hint: '0 is false; any non-zero is true.',
                explanation: '0 evaluates to false in condition checks, executing the else branch ("No").'
            },
            {
                num: 9,
                type: 'Odd One Out',
                prompt: 'Which construct is NOT used for conditional branching decisions?',
                code: 'if, else, switch, while',
                options: ['while (it is a loop, not a branch decision construct)', 'if', 'else', 'switch'],
                correctIndex: 0,
                hint: 'One of these is an iteration loop.',
                explanation: 'while is an iteration loop construct, while if, else, and switch are decision statements.'
            },
            {
                num: 10,
                type: 'Riddle',
                prompt: 'Which condition accurately checks whether integer n is even?',
                code: 'Is n even?',
                options: ['n % 2 == 0', 'n / 2 == 0', 'n % 2 == 1', 'n == 2'],
                correctIndex: 0,
                hint: 'Even numbers divide by 2 with remainder 0.',
                explanation: 'An integer is even if its remainder when divided by 2 is 0: n % 2 == 0.'
            }
        ]
    },
    {
        id: 'game_cpp_5',
        track: 'cpp',
        trackName: 'DSA in C++',
        topicNum: 5,
        title: 'Loop Racing Track',
        topic: 'Loops',
        badge: { id: 'speed_coder', name: 'Speed Coder', icon: '🏎️', desc: 'Clocked 10 laps on the infinite neon loop racetrack!' },
        story: 'A cyber racing car screams down the circuit. Loop logic dictates acceleration, lap times, and nitro boosts.',
        rules: 'Predict loop counts and outputs. Correct = nitro forward. Wrong = engine stalls and slows down!',
        mechanic: 'loop_racer',
        questions: [
            {
                num: 1,
                type: 'Predict Output',
                prompt: 'What numbers are printed by this for loop?',
                code: 'for(int i = 1; i <= 3; i++) cout << i;',
                options: ['123', '0123', '1 2 3', '3'],
                correctIndex: 0,
                hint: 'i runs 1, 2, 3.',
                explanation: 'i starts at 1, prints 1, increments to 2, prints 2, increments to 3, prints 3: "123".'
            },
            {
                num: 2,
                type: 'Predict Output',
                prompt: 'What numbers are printed when starting from index 0?',
                code: 'for(int i = 0; i < 3; i++) cout << i;',
                options: ['012', '123', '0123', '000'],
                correctIndex: 0,
                hint: 'Condition is strict less-than: i < 3.',
                explanation: 'Loop runs for i = 0, 1, 2. At i = 3 condition fails, output is "012".'
            },
            {
                num: 3,
                type: 'Count It',
                prompt: 'How many iterations does this loop execute?',
                code: 'for(int i = 1; i <= 10; i++)',
                options: ['10 times', '9 times', '11 times', 'Infinite'],
                correctIndex: 0,
                hint: '1 through 10 inclusive.',
                explanation: 'i takes values 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, executing exactly 10 times.'
            },
            {
                num: 4,
                type: 'Predict Output',
                prompt: 'What countdown is printed?',
                code: 'int i = 5; while(i > 0) { cout << i; i--; }',
                options: ['54321', '543210', '43210', 'Infinite loop'],
                correctIndex: 0,
                hint: 'Stops when i reaches 0.',
                explanation: 'Prints 5, 4, 3, 2, 1. When i decrements to 0, i > 0 is false.'
            },
            {
                num: 5,
                type: 'Spot the Bug',
                prompt: 'Why does this while loop hang and run forever?',
                code: 'int i = 0; while(i < 5) { cout << i; }',
                options: ['i never increments inside the loop (needs i++)', 'Condition should be i > 5', 'while loop cannot have brackets', 'int i should be float'],
                correctIndex: 0,
                hint: 'The loop counter never changes value.',
                explanation: 'Since i is never updated inside the loop, i remains 0 forever, creating an infinite loop.'
            },
            {
                num: 6,
                type: 'Fill the Blank',
                prompt: 'Which loop is guaranteed to execute at least once, even if the condition is initially false?',
                code: '____ { ... } while(condition);',
                options: ['do-while', 'for', 'while', 'nested loop'],
                correctIndex: 0,
                hint: 'Condition is evaluated at the end (exit-controlled).',
                explanation: 'do-while tests its condition at the bottom, guaranteeing at least one execution.'
            },
            {
                num: 7,
                type: 'Predict Output',
                prompt: 'What sum s is output after the loop completes?',
                code: 'int s = 0; for(int i = 1; i <= 4; i++) s += i; cout << s;',
                options: ['10', '4', '6', '14'],
                correctIndex: 0,
                hint: '1 + 2 + 3 + 4 = ?',
                explanation: 's accumulates 1 + 2 + 3 + 4 = 10.'
            },
            {
                num: 8,
                type: 'Predict Output',
                prompt: 'What is printed with continue at i == 3?',
                code: 'for(int i = 1; i <= 5; i++) { if(i == 3) continue; cout << i; }',
                options: ['1245 (continue skips iteration 3)', '12', '12345', '345'],
                correctIndex: 0,
                hint: 'continue skips the rest of the current iteration.',
                explanation: 'When i == 3, continue jumps straight to the next loop step, skipping print of 3: "1245".'
            },
            {
                num: 9,
                type: 'Predict Output',
                prompt: 'What is printed when break triggers at i == 3?',
                code: 'for(int i = 1; i <= 5; i++) { if(i == 3) break; cout << i; }',
                options: ['12 (break terminates loop immediately)', '123', '1245', '345'],
                correctIndex: 0,
                hint: 'break terminates the entire loop.',
                explanation: 'When i reaches 3, break exits the loop immediately before printing 3, outputting "12".'
            },
            {
                num: 10,
                type: 'Odd One Out',
                prompt: 'Which of the following is NOT an iteration loop construct?',
                code: 'for, while, do-while, if',
                options: ['if (it is a branch condition, not a loop)', 'for', 'while', 'do-while'],
                correctIndex: 0,
                hint: 'Three of these loop, one checks once.',
                explanation: 'if is a conditional statement that runs at most once; the others are loops.'
            }
        ]
    },
    {
        id: 'game_cpp_6',
        track: 'cpp',
        trackName: 'DSA in C++',
        topicNum: 6,
        title: 'Pattern Builder (Lego Style)',
        topic: 'Patterns (Nested Loops)',
        badge: { id: 'pattern_pro', name: 'Pattern Pro', icon: '🧱', desc: 'Assembled 10 holographic voxel patterns with nested loops!' },
        story: 'Assemble holographic voxel structures block-by-block. The nested loop code is your architectural blueprint.',
        rules: 'Match loop algorithms to shapes. Correct = voxel pattern snaps into place. Finish 10 blueprints for the badge!',
        mechanic: 'pattern_builder',
        questions: [
            {
                num: 1,
                type: 'Predict Output',
                prompt: 'What geometric shape is built by this nested loop?',
                code: 'for(i = 1; i <= 3; i++) { for(j = 1; j <= i; j++) cout << "*"; cout << endl; }',
                options: ['A right-angled triangle: * then ** then ***', 'A 3x3 square', 'A single line of 6 stars', 'An inverted triangle'],
                correctIndex: 0,
                hint: 'Row 1 has 1 star, row 2 has 2 stars, row 3 has 3 stars.',
                explanation: 'Outer loop manages rows 1..3, inner loop prints i stars per row, forming a right triangle.'
            },
            {
                num: 2,
                type: 'Fill the Blank',
                prompt: 'In nested loop patterns, the outer loop typically controls ____ and the inner loop controls ____ .',
                code: 'for(row...) { for(col...) { ... } }',
                options: ['rows, columns (stars/numbers per row)', 'columns, rows', 'spaces, numbers only', 'colors, dimensions'],
                correctIndex: 0,
                hint: 'Row progression vs column progression.',
                explanation: 'The outer loop iterates through rows, and the inner loop prints symbols across columns.'
            },
            {
                num: 3,
                type: 'Predict Output',
                prompt: 'Two nested loops both run 3 times, printing "*" inside and endl after inner loop. What shape appears?',
                code: 'for(int i=0; i<3; i++) { for(int j=0; j<3; j++) cout << "*"; cout << endl; }',
                options: ['A 3 x 3 square grid of stars', 'A 3-star line', 'A triangle', 'A diagonal line'],
                correctIndex: 0,
                hint: '3 rows, each containing 3 stars.',
                explanation: 'Outer loop runs 3 times; each time inner loop prints 3 stars followed by endl -> 3x3 square.'
            },
            {
                num: 4,
                type: 'Count It',
                prompt: 'How many total stars are printed in a 4 x 4 square?',
                code: '4 rows * 4 stars/row',
                options: ['16', '8', '12', '20'],
                correctIndex: 0,
                hint: '4 multiplied by 4.',
                explanation: '4 rows multiplied by 4 columns = 16 stars.'
            },
            {
                num: 5,
                type: 'Count It',
                prompt: 'How many total stars are in a right triangle with n = 4 rows?',
                code: '1 + 2 + 3 + 4',
                options: ['10', '16', '12', '8'],
                correctIndex: 0,
                hint: 'Sum of integers from 1 to 4.',
                explanation: 'Row 1 (1) + Row 2 (2) + Row 3 (3) + Row 4 (4) = 10 stars.'
            },
            {
                num: 6,
                type: 'Spot the Bug',
                prompt: 'All stars print on one long horizontal line instead of a grid. What statement was omitted?',
                code: 'cout << endl; missing after inner loop',
                options: ['cout << endl; (newline) after the inner loop', 'cout << " "; before loop', 'i++ was missing', 'using namespace std;'],
                correctIndex: 0,
                hint: 'A newline is required to step down to the next row.',
                explanation: 'Without cout << endl; after each completed inner row loop, characters continue on the same line.'
            },
            {
                num: 7,
                type: 'Riddle',
                prompt: 'Which inner loop condition produces an inverted triangle (4, 3, 2, 1 stars) for n = 4?',
                code: 'for(int j = 1; j <= ____; j++)',
                options: ['n - i + 1', 'i', 'n + i', 'n'],
                correctIndex: 0,
                hint: 'When i=1 count is 4; when i=4 count is 1.',
                explanation: 'For n=4: at i=1 limit is 4-1+1=4; at i=4 limit is 4-4+1=1. j <= n - i + 1 creates an inverted triangle.'
            },
            {
                num: 8,
                type: 'Predict Output',
                prompt: 'Same right triangle with n = 3, but printing j instead of "*": What is output?',
                code: 'for(i=1; i<=3; i++) { for(j=1; j<=i; j++) cout << j; cout << endl; }',
                options: ['1 on line 1, 12 on line 2, 123 on line 3', '1 2 3', '1 22 333', '321'],
                correctIndex: 0,
                hint: 'j loops from 1 to i each row.',
                explanation: 'Line 1: j goes 1; Line 2: j goes 1, 2; Line 3: j goes 1, 2, 3 -> 1 \\n 12 \\n 123.'
            },
            {
                num: 9,
                type: 'Predict Output',
                prompt: 'Row i prints variable i repeated i times for n = 3:',
                code: 'for(i=1; i<=3; i++) { for(j=1; j<=i; j++) cout << i; cout << endl; }',
                options: ['1 on line 1, 22 on line 2, 333 on line 3', '1 12 123', '3 2 1', '123'],
                correctIndex: 0,
                hint: 'Printing i, which is constant across each row.',
                explanation: 'At i=1 prints 1; at i=2 prints 2 twice (22); at i=3 prints 3 three times (333).'
            },
            {
                num: 10,
                type: 'Order the Steps',
                prompt: 'Arrange the sequence for standard nested pattern rendering: (a) print newline, (b) inner loop prints row items, (c) outer loop begins row.',
                code: '(a) newline, (b) inner loop, (c) outer row start',
                options: ['c, then b, then a', 'a, then b, then c', 'b, then c, then a', 'c, then a, then b'],
                correctIndex: 0,
                hint: 'Start row, fill columns, break line.',
                explanation: 'The outer loop starts row (c), inner loop prints items (b), then newline ends row (a).'
            }
        ]
    },
    {
        id: 'game_cpp_7',
        track: 'cpp',
        trackName: 'DSA in C++',
        topicNum: 7,
        title: 'Function Factory',
        topic: 'Functions',
        badge: { id: 'factory_boss', name: 'Factory Boss', icon: '⚙️', desc: 'Engineered 10 automated logic pipelines and mastered parameter scope!' },
        story: 'Manage the high-tech automation factory of Mirai Tech. Each function is an industrial machine: feed input in, predict the product output!',
        rules: 'Predict return values and identify parameter scope. Correct = factory hums with gold coins. Wrong = machine jams!',
        mechanic: 'function_factory',
        questions: [
            {
                num: 1,
                type: 'Fill the Blank',
                prompt: 'A C++ function that produces no return value specifies the return type ____ .',
                code: '____ printGreeting() { cout << "Hello"; }',
                options: ['void', 'null', 'int', 'empty'],
                correctIndex: 0,
                hint: 'Keyword meaning absence of value.',
                explanation: 'void indicates that a function does not return any value.'
            },
            {
                num: 2,
                type: 'Predict Output',
                prompt: 'What value is output by cout << add(2, 3)?',
                code: 'int add(int a, int b) { return a + b; } ... cout << add(2, 3);',
                options: ['5', '23', '0', 'Error'],
                correctIndex: 0,
                hint: '2 + 3 = 5.',
                explanation: 'add(2, 3) computes 2 + 3 = 5 and returns 5 to cout.'
            },
            {
                num: 3,
                type: 'Match the Pair',
                prompt: 'In int f(int x) and caller invocation f(5), which is parameter and which is argument?',
                code: 'int f(int x);  f(5);',
                options: ['x is the parameter, 5 is the argument', '5 is parameter, x is argument', 'Both are parameters', 'Both are variables'],
                correctIndex: 0,
                hint: 'Parameters are variables in the signature; arguments are values passed in.',
                explanation: 'Parameters are the variable names in the function definition (x); arguments are actual values passed (5).'
            },
            {
                num: 4,
                type: 'Spot the Bug',
                prompt: 'Why does square(x) produce a compiler error or garbage result?',
                code: 'int square(int x) { x * x; }',
                options: ['The return keyword is missing (should write return x * x;)', 'x * x cannot be multiplied', 'Should take float', 'Needs semicolon at start'],
                correctIndex: 0,
                hint: 'Functions with non-void return types must return a value.',
                explanation: 'A non-void function must explicitly use the return keyword to return the result.'
            },
            {
                num: 5,
                type: 'True or False',
                prompt: 'A local variable declared inside a helper function can be directly read or modified inside main().',
                code: 'void f() { int secret = 42; }',
                options: ['False (local variables are scoped only to their enclosing function)', 'True', 'Only if main is below', 'True if using static'],
                correctIndex: 0,
                hint: 'Local scope prevents external access.',
                explanation: 'False. Local variables are destroyed when function exits and exist only within their function scope.'
            },
            {
                num: 6,
                type: 'Predict Output',
                prompt: 'What is printed when hi() is called twice from main()?',
                code: 'void hi() { cout << "Hi"; }  // main calls hi(); hi();',
                options: ['HiHi', 'Hi Hi', 'Hi\\nHi', 'Error'],
                correctIndex: 0,
                hint: 'No space or endl is printed between calls.',
                explanation: 'Each call outputs "Hi", producing "HiHi".'
            },
            {
                num: 7,
                type: 'Predict Output',
                prompt: 'Pass by value: What is printed for x in main() after change(x)?',
                code: 'void change(int a) { a = 10; } int x = 5; change(x); cout << x;',
                options: ['5 (pass by value creates a copy, so x remains unaffected)', '10', '15', '0'],
                correctIndex: 0,
                hint: 'Pass-by-value works on a copy.',
                explanation: 'In pass-by-value, a receives a copy of x. Modifying a does not alter original variable x in main.'
            },
            {
                num: 8,
                type: 'Predict Output',
                prompt: 'Pass by reference with &: What is printed now?',
                code: 'void change(int &a) { a = 10; } int x = 5; change(x); cout << x;',
                options: ['10 (pass by reference modifies the original variable directly)', '5', '0', 'Memory address'],
                correctIndex: 0,
                hint: '&a is an alias reference to x.',
                explanation: 'int &a creates an alias referencing x directly, so assigning a = 10 updates x to 10.'
            },
            {
                num: 9,
                type: 'Riddle',
                prompt: '"I announce a function signature to the compiler before its implementation body is written." Who am I?',
                code: 'int add(int a, int b);',
                options: ['Function declaration (prototype)', 'Function definition', 'Function callback', 'Lambda expression'],
                correctIndex: 0,
                hint: 'Ends with a semicolon before main.',
                explanation: 'A function prototype (declaration) informs the compiler of function name, return type, and parameters.'
            },
            {
                num: 10,
                type: 'Predict Output',
                prompt: 'What is returned by max2(4, 9)?',
                code: 'int max2(int a, int b) { if(a > b) return a; return b; }',
                options: ['9', '4', '13', '0'],
                correctIndex: 0,
                hint: 'Is 4 > 9?',
                explanation: '4 > 9 is false, so it falls to return b, which returns 9.'
            }
        ]
    },

    // ==========================================
    // PART 2: WEB DEVELOPMENT - HTML (10 TOPICS)
    // ==========================================
    {
        id: 'game_html_1',
        track: 'html',
        trackName: 'Web Development (HTML)',
        topicNum: 1,
        title: 'Build the House',
        topic: 'HTML Page Structure',
        badge: { id: 'master_builder', name: 'Master Builder', icon: '🏛️', desc: 'Constructed complete valid HTML5 DOM skeletons!' },
        story: 'A web page is like an architectural foundation. Assemble DOCTYPE, html, head, title, and body in flawless structural order.',
        rules: 'Pick the right hierarchy. Correct = structural beams snap into place. Wrong = foundation crumbles!',
        mechanic: 'house_builder',
        questions: [
            {
                num: 1,
                type: 'Fill the Blank',
                prompt: 'What does <!DOCTYPE html> communicate to modern web browsers?',
                code: '<!DOCTYPE html>',
                options: ['That the document is written in HTML5 standard mode', 'That the website uses PHP', 'That CSS is required', 'It links Google fonts'],
                correctIndex: 0,
                hint: 'DOCTYPE declares the HTML specification version.',
                explanation: '<!DOCTYPE html> tells the browser that this page is formatted using HTML5 specifications.'
            },
            {
                num: 2,
                type: 'Order the Steps',
                prompt: 'Arrange from outermost container to inner components: body, head, html.',
                code: 'html, head, body',
                options: ['html contains head and body (head comes first, then body)', 'body contains head and html', 'head contains html and body', 'body, head, then html'],
                correctIndex: 0,
                hint: 'html is root element.',
                explanation: '<html> contains <head> (metadata) followed by <body> (visible content).'
            },
            {
                num: 3,
                type: 'Match the Pair',
                prompt: 'Match head and body with their primary roles:',
                code: '<head> vs <body>',
                options: ['head = metadata & page info, body = visible page content', 'head = main content, body = page info', 'Both hold visible buttons', 'Both are hidden'],
                correctIndex: 0,
                hint: 'Users see what is in body.',
                explanation: '<head> contains metadata, scripts, and links; <body> contains all user-visible elements.'
            },
            {
                num: 4,
                type: 'Odd One Out',
                prompt: 'Which element does NOT belong inside <head>?',
                code: '<title>, <meta>, <h1>, <link>',
                options: ['<h1> (it is visible page content for the body)', '<title>', '<meta>', '<link>'],
                correctIndex: 0,
                hint: 'One of these is a visible content heading.',
                explanation: '<h1> is a visual content heading that belongs inside <body>, not <head>.'
            },
            {
                num: 5,
                type: 'True or False',
                prompt: 'Text placed inside <title> tags appears directly inside the canvas/body of the webpage.',
                code: '<title>Mirai Tech</title>',
                options: ['False (it appears on the browser tab or bookmark bar)', 'True', 'Only if body is empty', 'True on mobile browsers'],
                correctIndex: 0,
                hint: 'Check your browser tab title.',
                explanation: 'False. <title> text renders in the browser tab, window bar, and search engine results.'
            },
            {
                num: 6,
                type: 'Spot the Bug',
                prompt: 'What fundamental architectural error exists in <html><body>...</body><head>...</head></html>?',
                code: '<html><body>...</body><head>...</head></html>',
                options: ['<head> must precede <body>', '<html> cannot have both', '<body> must be capital', 'No error'],
                correctIndex: 0,
                hint: 'The head must come before the body.',
                explanation: 'The <head> section must precede the <body> section in valid HTML structure.'
            },
            {
                num: 7,
                type: 'Fill the Blank',
                prompt: 'In HTML, a closing tag begins with a ____ . (Example: </p>)',
                code: '</p>',
                options: ['Forward Slash /', 'Backslash \\', 'Exclamation mark !', 'Hyphen -'],
                correctIndex: 0,
                hint: 'Forward slash indicates closing.',
                explanation: 'Closing tags in HTML begin with a forward slash / after the angle bracket (e.g., </div>).'
            },
            {
                num: 8,
                type: 'Riddle',
                prompt: '"I am the standard file extension of a web page document." Who am I?',
                code: 'index.____',
                options: ['.html', '.web', '.site', '.code'],
                correctIndex: 0,
                hint: 'HyperText Markup Language extension.',
                explanation: '.html (or .htm) is the standard extension for HyperText Markup Language files.'
            },
            {
                num: 9,
                type: 'True or False',
                prompt: 'HTML is a Turing-complete programming language.',
                code: 'Is HTML a programming language?',
                options: ['False (HTML is a markup language, not a programming language)', 'True', 'True with HTML5', 'True when using tags'],
                correctIndex: 0,
                hint: 'It describes structure, not algorithms.',
                explanation: 'False. HTML (HyperText Markup Language) is a declarative markup language.'
            },
            {
                num: 10,
                type: 'Fill the Blank',
                prompt: 'Tags like <br> and <img> that have no closing companion tag are called ____ tags.',
                code: '<br> <hr> <img>',
                options: ['Empty (or void) tags', 'Broken tags', 'Ghost tags', 'Infinite tags'],
                correctIndex: 0,
                hint: 'Void elements without content.',
                explanation: 'Elements that cannot contain child elements or text are called empty or void tags.'
            }
        ]
    },
    {
        id: 'game_html_2',
        track: 'html',
        trackName: 'Web Development (HTML)',
        topicNum: 2,
        title: 'Font Fashion Show',
        topic: 'Headings, Paragraphs and Text Formatting',
        badge: { id: 'style_star', name: 'Style Star', icon: '✨', desc: 'Styled 10 runway models with semantic typography & tags!' },
        story: 'Step onto the cyber runway of Mirai Fashion! Plain text models appear on stage and need the perfect typographic tags.',
        rules: 'Dress up the text. Correct = model shines under cyber spotlights. Wrong = fashion catastrophe!',
        mechanic: 'fashion_show',
        questions: [
            {
                num: 1,
                type: 'Fill the Blank',
                prompt: 'Which HTML heading tag renders the largest text, and which renders the smallest?',
                code: '<h1> through <h6>',
                options: ['h1 is largest, h6 is smallest', 'h6 is largest, h1 is smallest', 'h0 is largest, h5 is smallest', 'All are equal size'],
                correctIndex: 0,
                hint: 'h1 is top level.',
                explanation: '<h1> has the highest semantic importance and largest default styling; <h6> is the smallest.'
            },
            {
                num: 2,
                type: 'Match the Pair',
                prompt: 'Match text styles (bold, italic, underline) with their standard tags:',
                code: 'bold, italic, underline',
                options: ['bold = <b> / <strong>, italic = <i> / <em>, underline = <u>', 'bold = <p>, italic = <u>, underline = <b>', 'bold = <h1>, italic = <br>, underline = <a>', 'None'],
                correctIndex: 0,
                hint: 'b/strong, i/em, u.',
                explanation: '<b>/<strong> formats bold, <i>/<em> formats italics, and <u> formats underline.'
            },
            {
                num: 3,
                type: 'Fill the Blank',
                prompt: 'Which HTML tag creates a paragraph of body text?',
                code: '____ This is text ____',
                options: ['<p>', '<para>', '<text>', '<pg>'],
                correctIndex: 0,
                hint: 'Single letter p.',
                explanation: '<p> represents a paragraph of text.'
            },
            {
                num: 4,
                type: 'Riddle',
                prompt: '"I force a line break without beginning a new paragraph, and I have no closing tag." Who am I?',
                code: '<____>',
                options: ['<br>', '<hr>', '<p>', '<lb>'],
                correctIndex: 0,
                hint: 'Break tag.',
                explanation: '<br> inserts a single line break and is a void/empty tag.'
            },
            {
                num: 5,
                type: 'Predict Output',
                prompt: 'What visual output is rendered by this markup?',
                code: '<h1>Hi</h1><p>Bye</p>',
                options: ['A big heading "Hi" and below it normal text "Bye"', 'Hi and Bye on same line', 'Only Hi is shown', 'Error'],
                correctIndex: 0,
                hint: 'Both h1 and p are block-level elements.',
                explanation: '<h1> renders large bold "Hi", followed on a new line by paragraph text "Bye".'
            },
            {
                num: 6,
                type: 'Spot the Bug',
                prompt: 'Where is the syntax error in <p>Hello<p>?',
                code: '<p>Hello<p>',
                options: ['The closing tag should be </p> (slash is missing)', 'Should be <para>', 'Hello needs quotes', 'No error'],
                correctIndex: 0,
                hint: 'Closing tags require a slash.',
                explanation: 'The second tag opens a new paragraph instead of closing the first; it should be </p>.'
            },
            {
                num: 7,
                type: 'Odd One Out',
                prompt: 'Which element is NOT designed for text styling?',
                code: '<mark>, <small>, <del>, <hr>',
                options: ['<hr> (it draws a thematic horizontal divider rule)', '<mark>', '<small>', '<del>'],
                correctIndex: 0,
                hint: 'One draws a horizontal dividing line.',
                explanation: '<hr> creates a horizontal divider line across the page rather than styling inline text.'
            },
            {
                num: 8,
                type: 'Match the Pair',
                prompt: 'In H<sub>2</sub>O and x<sup>2</sup>, what do <sub> and <sup> do?',
                code: 'H<sub>2</sub>O and x<sup>2</sup>',
                options: ['sub lowers text below baseline, sup raises text above baseline', 'sub raises, sup lowers', 'Both make text bold', 'Both underline'],
                correctIndex: 0,
                hint: 'Subscript is below; Superscript is above.',
                explanation: '<sub> formats subscript (below baseline); <sup> formats superscript (above baseline).'
            },
            {
                num: 9,
                type: 'True or False',
                prompt: 'It is recommended best practice to place ten separate <h1> tags on a single page.',
                code: 'Multiple <h1> tags',
                options: ['False (best practice is one main <h1> per page for accessibility and SEO)', 'True', 'Only if each has different font', 'True on tablets'],
                correctIndex: 0,
                hint: 'Good SEO prescribes a single primary heading.',
                explanation: 'False. Having one <h1> per page provides clear hierarchy for screen readers and search engines.'
            },
            {
                num: 10,
                type: 'Fill the Blank',
                prompt: 'Which HTML tag highlights text with a yellow marker background?',
                code: '<____>Highlighted Text</____>',
                options: ['<mark>', '<highlight>', '<yellow>', '<bg>'],
                correctIndex: 0,
                hint: 'Mark tag.',
                explanation: '<mark> indicates marked/highlighted text for reference purposes.'
            }
        ]
    },
    {
        id: 'game_html_3',
        track: 'html',
        trackName: 'Web Development (HTML)',
        topicNum: 3,
        title: 'Shopping List Challenge',
        topic: 'Lists',
        badge: { id: 'list_legend', name: 'List Legend', icon: '🛒', desc: 'Filled the cyber shopping cart using ordered, unordered, and definition lists!' },
        story: 'You are on a mission in the Neo-Akihabara Cyber Market! Fill your inventory cart by assembling exact list structures.',
        rules: 'Pick the right list tags and attributes. Correct = items loaded into cart. Wrong = item drops out!',
        mechanic: 'shopping_list',
        questions: [
            {
                num: 1,
                type: 'Fill the Blank',
                prompt: 'Which HTML tag creates a bullet-point (unordered) list?',
                code: '<____> <li>Item</li> </____>',
                options: ['<ul>', '<ol>', '<list>', '<dl>'],
                correctIndex: 0,
                hint: 'Unordered List.',
                explanation: '<ul> defines an unordered (bulleted) list.'
            },
            {
                num: 2,
                type: 'Fill the Blank',
                prompt: 'Which HTML tag creates a numbered (ordered) list?',
                code: '<____> <li>Item</li> </____>',
                options: ['<ol>', '<ul>', '<nl>', '<num>'],
                correctIndex: 0,
                hint: 'Ordered List.',
                explanation: '<ol> defines an ordered (numbered) list.'
            },
            {
                num: 3,
                type: 'Fill the Blank',
                prompt: 'Each individual item inside any <ul> or <ol> list uses the tag ____ .',
                code: '<____>Item Text</____>',
                options: ['<li>', '<item>', '<it>', '<point>'],
                correctIndex: 0,
                hint: 'List Item.',
                explanation: '<li> stands for list item and wraps every entry in ordered or unordered lists.'
            },
            {
                num: 4,
                type: 'Predict Output',
                prompt: 'What is shown by this ordered list?',
                code: '<ol><li>A</li><li>B</li></ol>',
                options: ['1. A and 2. B', '• A and • B', 'A B on one line', 'a. A and b. B'],
                correctIndex: 0,
                hint: '<ol> numbers by default with 1, 2, 3...',
                explanation: '<ol> automatically numbers items sequentially as 1. A followed by 2. B.'
            },
            {
                num: 5,
                type: 'Spot the Bug',
                prompt: 'What must be fixed in <ul><p>Milk</p></ul> ?',
                code: '<ul><p>Milk</p></ul>',
                options: ['Use <li> inside <ul> instead of <p>', 'Change <ul> to <list>', 'Wrap in <div>', 'Remove Milk'],
                correctIndex: 0,
                hint: 'Only <li> elements are valid direct children of <ul>.',
                explanation: 'Direct children of <ul> must be <li> list item elements, not raw <p> tags.'
            },
            {
                num: 6,
                type: 'Fill the Blank',
                prompt: 'Which attribute instructs an <ol> to start numbering from the number 5?',
                code: '<ol ____="5">',
                options: ['start="5"', 'from="5"', 'begin="5"', 'index="5"'],
                correctIndex: 0,
                hint: 'start attribute.',
                explanation: 'The start attribute specifies the initial numbering value for an <ol>.'
            },
            {
                num: 7,
                type: 'Match the Pair',
                prompt: 'Match type="a" and type="I" on an <ol> with their numbering output:',
                code: 'type="a" vs type="I"',
                options: ['type="a" gives lowercase a, b, c; type="I" gives Roman numerals I, II, III', 'type="a" gives numbers, type="I" gives bullets', 'Both give Greek letters', 'None'],
                correctIndex: 0,
                hint: 'a is alphabetic; I is uppercase Roman.',
                explanation: 'type="a" formats lowercase letters; type="I" formats uppercase Roman numerals.'
            },
            {
                num: 8,
                type: 'Riddle',
                prompt: 'In a description list <dl>, which tag represents the term, and which holds its description/meaning?',
                code: '<dl> <dt> ... </dt> <dd> ... </dd> </dl>',
                options: ['<dt> is the definition term, <dd> is the definition description', '<dd> is term, <dt> is description', '<dl> is term, <li> is description', 'None'],
                correctIndex: 0,
                hint: 'dt = definition term, dd = definition data/description.',
                explanation: '<dt> marks the definition term; <dd> contains the detailed description or meaning.'
            },
            {
                num: 9,
                type: 'True or False',
                prompt: 'Can you nest a complete <ul> list inside another <li> item?',
                code: '<ul><li>Item 1<ul><li>Sub 1</li></ul></li></ul>',
                options: ['True (nested lists are fully supported in valid HTML)', 'False', 'Only up to 1 level', 'Only in XML'],
                correctIndex: 0,
                hint: 'Sub-lists inside <li> are common.',
                explanation: 'True. Placing a sub-list directly inside a parent <li> creates a nested multi-level list.'
            },
            {
                num: 10,
                type: 'Sort It',
                prompt: 'For recipe steps to brew tea where sequence matters: should you use <ul> or <ol>?',
                code: 'Steps to make tea',
                options: ['<ol> (ordered list, because sequence order matters)', '<ul> (unordered list)', '<dl> only', '<div> only'],
                correctIndex: 0,
                hint: 'Ordered lists are meant for step-by-step procedures.',
                explanation: 'Step-by-step instructions have a meaningful sequence, requiring an ordered list <ol>.'
            }
        ]
    },
    {
        id: 'game_html_4',
        track: 'html',
        trackName: 'Web Development (HTML)',
        topicNum: 4,
        title: 'Treasure Map Navigation',
        topic: 'Links and Anchors',
        badge: { id: 'navigator', name: 'Navigator', icon: '🧭', desc: 'Navigated 10 islands across cyberspace using hyperlinks!' },
        story: 'Every hyperlink is an ocean route on a treasure map! Sail between cyber islands by crafting exact anchor targets.',
        rules: 'Pick the right link tags, protocols, and attributes. Correct = ship sails safely. Wrong = ship is lost in the digital abyss!',
        mechanic: 'treasure_map',
        questions: [
            {
                num: 1,
                type: 'Fill the Blank',
                prompt: 'Which tag creates a hyperlink and which attribute contains the destination web address?',
                code: '<____ ____="https://...">Link</____>',
                options: ['<a> tag and href attribute', '<link> tag and src attribute', '<url> tag and href attribute', '<nav> tag and target attribute'],
                correctIndex: 0,
                hint: 'Anchor tag with hypertext reference.',
                explanation: 'The <a> (anchor) tag with the href attribute creates hyperlinked connections.'
            },
            {
                num: 2,
                type: 'Predict Output',
                prompt: 'What displays on page, and what happens when clicked?',
                code: '<a href="https://google.com">Go</a>',
                options: ['Blue underlined text "Go"; clicking navigates to google.com', 'The whole URL https://google.com is displayed', 'Nothing displays', 'Opens image of Google'],
                correctIndex: 0,
                hint: 'The enclosed text is what user sees and clicks.',
                explanation: 'Displays the clickable text "Go" which navigates to Google upon clicking.'
            },
            {
                num: 3,
                type: 'Fill the Blank',
                prompt: 'Which attribute opens a hyperlink in a fresh browser tab?',
                code: '<a href="page.html" ____="_blank">',
                options: ['target="_blank"', 'new="tab"', 'window="new"', 'rel="tab"'],
                correctIndex: 0,
                hint: 'target="_blank".',
                explanation: 'target="_blank" tells the browser to open the link in a new window or tab.'
            },
            {
                num: 4,
                type: 'Match the Pair',
                prompt: 'Linking to a page in the same folder vs linking to an external website:',
                code: 'about.html vs https://...',
                options: ['Same folder uses relative path href="about.html"; External uses full URL href="https://..."', 'Both require https://', 'Same folder uses src, external uses href', 'None'],
                correctIndex: 0,
                hint: 'Relative URL vs Absolute URL.',
                explanation: 'Local files use relative paths like href="about.html"; remote sites require absolute URLs.'
            },
            {
                num: 5,
                type: 'Spot the Bug',
                prompt: 'Why does clicking <a>Click</a> produce no action or navigation?',
                code: '<a>Click</a>',
                options: ['The href attribute is missing', 'Click should be in quotes', 'Needs button tag', 'Capital A needed'],
                correctIndex: 0,
                hint: 'Without href, an anchor is not interactive.',
                explanation: 'An <a> tag without an href attribute does not behave as an active hyperlink.'
            },
            {
                num: 6,
                type: 'Riddle',
                prompt: 'How can a hyperlink smoothly jump to a specific section on the exact same page?',
                code: 'Jump to section',
                options: ['Give that element an id="top" and link with href="#top"', 'Use href="same.html"', 'Use target="jump"', 'Use onclick="scroll" only'],
                correctIndex: 0,
                hint: 'Hash symbol # matches element id.',
                explanation: 'Anchor links with a hash (#) target matching id attributes on the same page.'
            },
            {
                num: 7,
                type: 'Fill the Blank',
                prompt: 'An email link begins with which URL protocol scheme?',
                code: '<a href="____:support@mirai.edu">Email Us</a>',
                options: ['mailto:', 'email:', 'send:', 'smtp:'],
                correctIndex: 0,
                hint: 'mailto:',
                explanation: 'href="mailto:address@domain.com" opens the user\'s default email client.'
            },
            {
                num: 8,
                type: 'Fill the Blank',
                prompt: 'A clickable phone number link begins with which URL protocol scheme?',
                code: '<a href="____:+15550199">Call Support</a>',
                options: ['tel:', 'phone:', 'call:', 'dial:'],
                correctIndex: 0,
                hint: 'tel:',
                explanation: 'href="tel:+1555..." initiates a phone call on mobile devices or voice apps.'
            },
            {
                num: 9,
                type: 'Odd One Out',
                prompt: 'Which attribute is NOT valid or used on an <a> anchor tag?',
                code: 'href, target, title, src',
                options: ['src (it is used for media like images and videos, not links)', 'href', 'target', 'title'],
                correctIndex: 0,
                hint: 'Source attribute belongs to img/video/script.',
                explanation: 'src is used on media tags like <img>; <a> tags use href to specify targets.'
            },
            {
                num: 10,
                type: 'Predict Output',
                prompt: 'What occurs when clicking <a href="#">Home</a>?',
                code: '<a href="#">Home</a>',
                options: ['No new page opens; page scrolls to top of current document', 'Opens Twitter', 'Throws a 404 error', 'Reloads from server'],
                correctIndex: 0,
                hint: '# points to top of current page.',
                explanation: 'href="#" points to the top of the current page without navigating to a new URL.'
            }
        ]
    },
    {
        id: 'game_html_5',
        track: 'html',
        trackName: 'Web Development (HTML)',
        topicNum: 5,
        title: 'Photo Gallery Puzzle',
        topic: 'Images and Media',
        badge: { id: 'curator', name: 'Curator', icon: '🖼️', desc: 'Curated 10 cyber art gallery exhibits with responsive media tags!' },
        story: 'You are the chief curator of the Mirai Holographic Art Gallery! Restore broken media embeds and configure image attributes.',
        rules: 'Pick the right media tags and attributes. Correct = painting mounts onto the glowing gallery wall. Wrong = empty frame!',
        mechanic: 'gallery_puzzle',
        questions: [
            {
                num: 1,
                type: 'Fill the Blank',
                prompt: 'Which tag displays an image, and which attribute specifies its file path/URL?',
                code: '<____ ____="art.png">',
                options: ['<img> tag and src attribute', '<picture> tag and href attribute', '<image> tag and file attribute', '<media> tag and url attribute'],
                correctIndex: 0,
                hint: 'img and source (src).',
                explanation: '<img> tag with src (source) attribute loads images.'
            },
            {
                num: 2,
                type: 'Fill the Blank',
                prompt: 'Which attribute provides alternate accessible text if an image fails to load or for screen readers?',
                code: '<img src="cat.png" ____="Cyber Cat">',
                options: ['alt', 'title', 'desc', 'caption'],
                correctIndex: 0,
                hint: 'Alternative text attribute.',
                explanation: 'alt (alternative text) provides accessibility descriptions and fallback text.'
            },
            {
                num: 3,
                type: 'Spot the Bug',
                prompt: 'What is redundant or unnecessary in <img src="cat.jpg"></img> ?',
                code: '<img src="cat.jpg"></img>',
                options: ['The closing </img> tag is not needed because <img> is an empty/void element', 'cat.jpg needs single quotes', 'src should be href', 'No error'],
                correctIndex: 0,
                hint: 'img is a self-closing void tag.',
                explanation: '<img> is an empty tag; having an explicit closing </img> tag is unnecessary and invalid.'
            },
            {
                num: 4,
                type: 'Fill the Blank',
                prompt: 'How do you set an image width to 200 pixels directly via HTML attribute?',
                code: '<img src="art.jpg" ____="200">',
                options: ['width="200"', 'size="200px"', 'px="200"', 'w="200"'],
                correctIndex: 0,
                hint: 'width="200"',
                explanation: 'The width attribute sets the rendering width (defaulting to pixels without typing "px").'
            },
            {
                num: 5,
                type: 'True or False',
                prompt: 'The HTML <img> tag strictly requires a closing </img> tag.',
                code: 'Does <img> need </img>?',
                options: ['False (<img> is a void element and does not have a closing tag)', 'True', 'Only when inside a div', 'True in HTML5'],
                correctIndex: 0,
                hint: 'Void elements do not close.',
                explanation: 'False. <img> is a void element in HTML and never takes a closing tag.'
            },
            {
                num: 6,
                type: 'Match the Pair',
                prompt: 'Match audio and video tags, and identify the attribute required to display user play/pause buttons:',
                code: '<audio controls> vs <video controls>',
                options: ['audio plays sound, video plays video; the controls attribute reveals playback controls', 'audio plays video, video plays sound', 'playback controls are always on automatically', 'None'],
                correctIndex: 0,
                hint: 'The controls boolean attribute.',
                explanation: '<audio> and <video> require the boolean attribute controls to show play/pause and volume.'
            },
            {
                num: 7,
                type: 'Predict Output',
                prompt: 'What is rendered on screen if x.jpg is deleted or missing from the server?',
                code: '<img src="x.jpg" alt="Cat">',
                options: ['A broken image placeholder icon along with the alt text "Cat"', 'The word "Error 404"', 'A blank white box with no text', 'Browser crash'],
                correctIndex: 0,
                hint: 'The alt text appears when image fails.',
                explanation: 'Browsers display a broken image symbol alongside the specified alt description.'
            },
            {
                num: 8,
                type: 'Riddle',
                prompt: 'How do you transform an image into a clickable hyperlink?',
                code: 'Clickable image',
                options: ['Wrap the <img> tag inside an <a> anchor tag', 'Add href directly to the <img> tag', 'Add onclick="link" attribute', 'Use <picture> only'],
                correctIndex: 0,
                hint: 'Nesting: <a href="..."><img ...></a>',
                explanation: 'Enclosing the <img> element inside an <a> anchor element makes the entire picture clickable.'
            },
            {
                num: 9,
                type: 'Odd One Out',
                prompt: 'Which element is NOT a media embedding element in HTML?',
                code: 'img, audio, video, ul',
                options: ['ul (it is an unordered list element)', 'img', 'audio', 'video'],
                correctIndex: 0,
                hint: 'ul creates lists.',
                explanation: 'ul creates lists; img, audio, and video are rich media elements.'
            },
            {
                num: 10,
                type: 'Fill the Blank',
                prompt: 'Which boolean attribute makes a video automatically restart from the beginning when it finishes?',
                code: '<video src="clip.mp4" ____>',
                options: ['loop', 'repeat', 'infinite', 'replay'],
                correctIndex: 0,
                hint: 'loop attribute.',
                explanation: 'The loop attribute causes audio or video playback to restart continuously upon ending.'
            }
        ]
    },
    {
        id: 'game_html_6',
        track: 'html',
        trackName: 'Web Development (HTML)',
        topicNum: 6,
        title: 'Classroom Timetable Builder',
        topic: 'Tables',
        badge: { id: 'table_topper', name: 'Table Topper', icon: '📊', desc: 'Crafted 10 matrix timetable cells with colspan and rowspan mastery!' },
        story: 'You are the class monitor of Mirai School. Rebuild the academy master schedule cell-by-cell using tabular tags.',
        rules: 'Pick the right table, tr, th, td, and span tags. Correct = timetable slot locks in. Wrong = table misaligns!',
        mechanic: 'timetable_builder',
        questions: [
            {
                num: 1,
                type: 'Fill the Blank',
                prompt: 'Name the HTML tags for table container, table row, standard data cell, and table heading cell:',
                code: 'Container, row, cell, heading',
                options: ['<table>, <tr>, <td>, <th>', '<table>, <row>, <cell>, <head>', '<grid>, <tr>, <tc>, <th>', '<table>, <th>, <td>, <tr>'],
                correctIndex: 0,
                hint: 'table, table-row (tr), table-data (td), table-header (th).',
                explanation: '<table> defines table, <tr> defines row, <td> defines cell, and <th> defines header cell.'
            },
            {
                num: 2,
                type: 'Match the Pair',
                prompt: 'Match tr, td, th with their definitions:',
                code: '<tr>, <td>, <th>',
                options: ['tr = table row, td = regular data cell, th = header cell', 'tr = table rule, td = table divider, th = table height', 'All three mean column', 'None'],
                correctIndex: 0,
                hint: 'Row, data, header.',
                explanation: '<tr> is table row, <td> is table data cell, <th> is table header cell.'
            },
            {
                num: 3,
                type: 'Match the Pair',
                prompt: 'What structural sections do thead, tbody, and tfoot organize?',
                code: '<thead>, <tbody>, <tfoot>',
                options: ['thead = header section, tbody = main body data, tfoot = footer/summary section', 'thead = title, tbody = links, tfoot = scripts', 'All three represent borders', 'None'],
                correctIndex: 0,
                hint: 'Header, body, footer.',
                explanation: '<thead> encapsulates column headers, <tbody> holds data rows, and <tfoot> holds summary totals.'
            },
            {
                num: 4,
                type: 'Fill the Blank',
                prompt: 'Which attribute merges two horizontal columns into a single wide cell?',
                code: '<td ____="2">Spanned Cell</td>',
                options: ['colspan="2"', 'rowspan="2"', 'span="2"', 'columns="2"'],
                correctIndex: 0,
                hint: 'Column span.',
                explanation: 'colspan="2" causes a table cell to span across two columns horizontally.'
            },
            {
                num: 5,
                type: 'Fill the Blank',
                prompt: 'Which attribute merges multiple vertical rows into a single tall cell?',
                code: '<td ____="3">Spanned Rows</td>',
                options: ['rowspan="3"', 'colspan="3"', 'rowmerge="3"', 'vspan="3"'],
                correctIndex: 0,
                hint: 'Row span.',
                explanation: 'rowspan="3" causes a table cell to span across three rows vertically.'
            },
            {
                num: 6,
                type: 'Spot the Bug',
                prompt: 'What critical structural element is missing in <table><td>A</td></table> ?',
                code: '<table><td>A</td></table>',
                options: ['A <tr> table row tag wrapping the <td>', 'A <th> tag', 'A title tag', 'No bug'],
                correctIndex: 0,
                hint: 'Cells must always reside inside a row.',
                explanation: 'A <td> cannot be a direct child of <table>; it must be wrapped inside a <tr> row.'
            },
            {
                num: 7,
                type: 'True or False',
                prompt: 'By default in web browsers, text inside a <th> element is rendered bold and center-aligned.',
                code: '<th>Subject</th>',
                options: ['True (browsers default <th> to bold and centered)', 'False', 'Only on mobile', 'Only if thead is used'],
                correctIndex: 0,
                hint: 'Check table header default CSS.',
                explanation: 'True. User agent stylesheets style <th> with font-weight: bold and text-align: center.'
            },
            {
                num: 8,
                type: 'Fill the Blank',
                prompt: 'Which legacy HTML attribute displays a border around table cells without CSS?',
                code: '<table ____="1">',
                options: ['border="1"', 'outline="1"', 'grid="1"', 'frame="1"'],
                correctIndex: 0,
                hint: 'border="1"',
                explanation: 'border="1" displays a simple 1px border (modern sites prefer CSS border properties).'
            },
            {
                num: 9,
                type: 'Count It',
                prompt: 'A grid has 3 rows and 4 columns with no header cells. How many total <td> data cells exist?',
                code: '3 rows * 4 columns',
                options: ['12', '7', '16', '9'],
                correctIndex: 0,
                hint: '3 multiplied by 4.',
                explanation: '3 rows * 4 cells per row = 12 total <td> cells.'
            },
            {
                num: 10,
                type: 'Order the Steps',
                prompt: 'Arrange from outermost nesting container to innermost cell: td, table, tr.',
                code: 'table, tr, td',
                options: ['table, then tr, then td', 'td, then tr, then table', 'tr, then table, then td', 'table, then td, then tr'],
                correctIndex: 0,
                hint: 'table wraps tr which wraps td.',
                explanation: '<table> is the root container, inside which resides <tr>, inside which resides <td>.'
            }
        ]
    },
    {
        id: 'game_html_7',
        track: 'html',
        trackName: 'Web Development (HTML)',
        topicNum: 7,
        title: 'Registration Desk Rush',
        topic: 'Forms and Inputs',
        badge: { id: 'form_master', name: 'Form Master', icon: '📝', desc: 'Processed 10 cyber cadet registration cards with input validation!' },
        story: 'A massive wave of new cadets arrives at Mirai Tech Admissions! Configure the right form inputs and validations before the queue overflows.',
        rules: 'Match requirements with form fields. Correct = cadet receives ID card and passes. Wrong = queue backs up!',
        mechanic: 'desk_rush',
        questions: [
            {
                num: 1,
                type: 'Fill the Blank',
                prompt: 'Which HTML container tag encapsulates and manages all interactive form controls?',
                code: '<____ action="/submit" method="POST">',
                options: ['<form>', '<input>', '<fieldset>', '<dialog>'],
                correctIndex: 0,
                hint: 'Form tag.',
                explanation: '<form> wraps input elements to collect and submit user data.'
            },
            {
                num: 2,
                type: 'Fill the Blank',
                prompt: 'How do you create a standard single-line text entry box?',
                code: '<input type="____">',
                options: ['text', 'string', 'word', 'line'],
                correctIndex: 0,
                hint: 'type="text"',
                explanation: '<input type="text"> creates a standard single-line text input field.'
            },
            {
                num: 3,
                type: 'Match the Pair',
                prompt: 'Match input types (password, email, number, checkbox, radio) with their behaviors:',
                code: 'password, email, number, checkbox, radio',
                options: ['password masks characters, email validates @, number restricts to digits, checkbox allows multiple, radio allows single choice', 'password shows plain text, radio allows multiple', 'All behave identically', 'None'],
                correctIndex: 0,
                hint: 'Masking, validation, multiple checks vs mutually exclusive choice.',
                explanation: 'password masks input; email validates format; number allows digits; checkbox allows multi-select; radio is mutually exclusive.'
            },
            {
                num: 4,
                type: 'Fill the Blank',
                prompt: 'How do you programmatically tie a <label> to an <input>?',
                code: '<label for="uname"> ... <input id="____">',
                options: ['Match label for="name" with input id="name"', 'Use class name', 'Use name attribute only', 'They connect automatically'],
                correctIndex: 0,
                hint: 'label for attribute matches input id attribute.',
                explanation: 'A <label> connects to an <input> when the label\'s for attribute matches the input\'s id.'
            },
            {
                num: 5,
                type: 'Spot the Bug',
                prompt: 'Three radio buttons can all be selected at once instead of acting mutually exclusive. What fix is required?',
                code: '<input type="radio" name="r1"> <input type="radio" name="r2">',
                options: ['Give all radio buttons in the group the exact same name attribute', 'Add id="radio"', 'Change to type="checkbox"', 'Add required attribute'],
                correctIndex: 0,
                hint: 'Shared name groups radio buttons.',
                explanation: 'Radio buttons belong to the same group and become mutually exclusive only when they share identical name attributes.'
            },
            {
                num: 6,
                type: 'Fill the Blank',
                prompt: 'Which attribute displays temporary gray guidance text inside an empty input box?',
                code: '<input type="text" ____="Enter your student ID">',
                options: ['placeholder', 'hint', 'value', 'default'],
                correctIndex: 0,
                hint: 'placeholder attribute.',
                explanation: 'placeholder provides a fleeting hint describing expected input values.'
            },
            {
                num: 7,
                type: 'Fill the Blank',
                prompt: 'Which boolean attribute prevents form submission if a required field is left empty?',
                code: '<input type="email" ____>',
                options: ['required', 'mandatory', 'validate', 'force'],
                correctIndex: 0,
                hint: 'required attribute.',
                explanation: 'The required attribute triggers native browser validation before form submission.'
            },
            {
                num: 8,
                type: 'Riddle',
                prompt: '"I am a dropdown select menu." Which pair of tags construct me?',
                code: 'Dropdown menu',
                options: ['<select> containing <option> tags', '<dropdown> containing <item> tags', '<menu> containing <li> tags', '<list> containing <val> tags'],
                correctIndex: 0,
                hint: 'select and option.',
                explanation: '<select> creates the dropdown list, and nested <option> tags represent selectable entries.'
            },
            {
                num: 9,
                type: 'True or False',
                prompt: 'The <textarea> element is used for multi-line freeform text input.',
                code: '<textarea rows="4"></textarea>',
                options: ['True (textarea supports multiline text input)', 'False', 'Only for passwords', 'Deprecated in HTML5'],
                correctIndex: 0,
                hint: 'Unlike input type="text", textarea wraps lines.',
                explanation: 'True. <textarea> allows users to enter multi-line text such as comments or feedback.'
            },
            {
                num: 10,
                type: 'Odd One Out',
                prompt: 'Which of the following is NOT a valid HTML input type attribute value?',
                code: 'email, date, color, paragraph',
                options: ['paragraph (it is not a valid input type; use textarea for blocks)', 'email', 'date', 'color'],
                correctIndex: 0,
                hint: 'paragraph is not an input type.',
                explanation: 'Valid input types include email, date, color, text, number; paragraph is not an input type.'
            }
        ]
    },
    {
        id: 'game_html_8',
        track: 'html',
        trackName: 'Web Development (HTML)',
        topicNum: 8,
        title: 'City Planner',
        topic: 'Semantic Tags',
        badge: { id: 'mayor', name: 'Mayor', icon: '🏙️', desc: 'Constructed 10 cyber city zones using clean semantic zoning tags!' },
        story: 'You are the Chief Urban Architect of Neo-Tokyo. Every building zone in the metropolis must utilize precise semantic HTML5 tags.',
        rules: 'Place header, nav, main, section, article, aside, and footer in the correct city zones. Correct = metropolis prospers!',
        mechanic: 'city_planner',
        questions: [
            {
                num: 1,
                type: 'Match the Pair',
                prompt: 'Match header, nav, and footer with their respective page architectural jobs:',
                code: '<header>, <nav>, <footer>',
                options: ['header = top intro/banner, nav = menu navigation links, footer = bottom copyright/contact info', 'header = menu links, nav = bottom info, footer = top banner', 'All three represent sidebars', 'None'],
                correctIndex: 0,
                hint: 'Top intro, navigation menu, bottom footer.',
                explanation: '<header> represents introductory content, <nav> houses navigation links, and <footer> holds bottom summary/legal data.'
            },
            {
                num: 2,
                type: 'Fill the Blank',
                prompt: 'Which semantic tag encapsulates the central dominant content of the document?',
                code: '<____> Central Content </____>',
                options: ['<main> (only one visible per page)', '<central>', '<body-main>', '<content>'],
                correctIndex: 0,
                hint: 'main element.',
                explanation: '<main> represents the dominant subject content of the document.'
            },
            {
                num: 3,
                type: 'Match the Pair',
                prompt: 'Differentiate semantic usage of <section> versus <article>:',
                code: '<section> vs <article>',
                options: ['section = thematic grouping of related content, article = self-contained syndicatable entry (e.g. blog post)', 'section is only for sidebar, article is for headers', 'They are strictly identical with no semantic difference', 'None'],
                correctIndex: 0,
                hint: 'An article can stand on its own; a section groups thematic content.',
                explanation: '<article> is for standalone reusable content; <section> groups thematic sections of a page.'
            },
            {
                num: 4,
                type: 'Riddle',
                prompt: '"I contain tangential content related to the page, such as callout sidebars, author bios, or advertisements." Who am I?',
                code: '<____>',
                options: ['<aside>', '<sidebar>', '<extra>', '<subnav>'],
                correctIndex: 0,
                hint: 'Aside element.',
                explanation: '<aside> represents content indirectly related to the main content, like sidebars.'
            },
            {
                num: 5,
                type: 'Odd One Out',
                prompt: 'Which element is purely generic and carries NO inherent semantic meaning?',
                code: 'header, nav, footer, div',
                options: ['div (it is a non-semantic generic container box)', 'header', 'nav', 'footer'],
                correctIndex: 0,
                hint: 'div has no semantic meaning.',
                explanation: '<div> has no semantic meaning and serves purely for styling/layout.'
            },
            {
                num: 6,
                type: 'True or False',
                prompt: 'Semantic HTML tags significantly enhance accessibility for screen readers and SEO indexing for search engine bots.',
                code: 'Semantic tags impact',
                options: ['True (screen readers and search engines use semantics to parse page structure)', 'False', 'Only on mobile phones', 'Only if colored'],
                correctIndex: 0,
                hint: 'Assistive technologies depend on semantic landmarks.',
                explanation: 'True. Semantics define landmark regions that help screen readers and search bots understand content.'
            },
            {
                num: 7,
                type: 'Order the Steps',
                prompt: 'Arrange the canonical standard page landmark hierarchy from top to bottom:',
                code: 'footer, main, header, nav',
                options: ['header, nav, main, footer', 'footer, main, nav, header', 'main, header, nav, footer', 'nav, header, footer, main'],
                correctIndex: 0,
                hint: 'Top to bottom flow: Header -> Navigation -> Main -> Footer.',
                explanation: 'Standard layout flow begins with header and nav at top, main in center, and footer at base.'
            },
            {
                num: 8,
                type: 'Spot the Bug',
                prompt: 'A web document includes three distinct <main> elements without hidden attributes. What is wrong?',
                code: '<main>...</main><main>...</main><main>...</main>',
                options: ['Only one visible <main> element is permitted per HTML document', '<main> cannot hold headings', '<main> must have an id', 'No error'],
                correctIndex: 0,
                hint: 'Only one primary main landmark per page.',
                explanation: 'A document must not have more than one visible <main> element in valid HTML.'
            },
            {
                num: 9,
                type: 'Fill the Blank',
                prompt: 'Which pair of semantic tags properly associates an illustration or diagram with its caption?',
                code: '<____> <img src="..."> <____>Caption</____> </____>',
                options: ['<figure> containing <figcaption>', '<picture> containing <caption>', '<media> containing <desc>', '<image> containing <text>'],
                correctIndex: 0,
                hint: 'figure and figure-caption.',
                explanation: '<figure> groups self-contained content, and <figcaption> provides its semantic caption.'
            },
            {
                num: 10,
                type: 'Riddle',
                prompt: '"I provide landmark navigation links for menus and pagination." Who am I?',
                code: '<____>',
                options: ['<nav>', '<menu-links>', '<links>', '<navigate>'],
                correctIndex: 0,
                hint: 'Navigation element.',
                explanation: '<nav> designates major navigation blocks intended for site or page traversal.'
            }
        ]
    },
    {
        id: 'game_html_9',
        track: 'html',
        trackName: 'Web Development (HTML)',
        topicNum: 9,
        title: 'Block vs Inline Sorting Race',
        topic: 'div, span, Block vs Inline and Attributes',
        badge: { id: 'sorting_champion', name: 'Sorting Champion', icon: '⚡', desc: 'Sorted 10 elements into block vs inline bins at lightning speed!' },
        story: 'Tags are hurtling down a high-speed conveyor belt in the Mirai rendering pipeline! Flick each tag into the Block bin or Inline bin.',
        rules: 'Classify block vs inline elements. Correct = +10 points. Wrong = conveyor accelerates danger!',
        mechanic: 'conveyor_sort',
        questions: [
            {
                num: 1,
                type: 'Sort It',
                prompt: 'Sort into Block or Inline: div, span, p, a.',
                code: 'div, span, p, a',
                options: ['Block: div, p. Inline: span, a', 'Block: span, a. Inline: div, p', 'All are block', 'All are inline'],
                correctIndex: 0,
                hint: 'Block elements take full width; inline elements only take needed width.',
                explanation: 'div and p start on a new line and span full width (block); span and a flow inline.'
            },
            {
                num: 2,
                type: 'Predict Output',
                prompt: 'How do consecutive <span> elements layout in browser rendering?',
                code: '<span>A</span><span>B</span>',
                options: ['A and B appear directly next to each other on the SAME line (AB)', 'A on line 1, B on line 2', 'A replaces B', 'Spaces added automatically'],
                correctIndex: 0,
                hint: 'span is an inline element.',
                explanation: 'Inline elements do not start new lines, displaying adjacent as "AB".'
            },
            {
                num: 3,
                type: 'Predict Output',
                prompt: 'How do consecutive <div> elements layout in browser rendering?',
                code: '<div>A</div><div>B</div>',
                options: ['A on one line, and B begins on the next line', 'A and B on same line (AB)', 'Side-by-side', 'Overlayed'],
                correctIndex: 0,
                hint: 'div is a block-level element.',
                explanation: 'Block elements occupy 100% available width and break onto new lines.'
            },
            {
                num: 4,
                type: 'Fill the Blank',
                prompt: 'Which attribute can be reused across multiple elements across a page, id or class?',
                code: 'Reusing selectors',
                options: ['class (can be reused on multiple elements)', 'id (can only be used once per page)', 'Both are strictly single use', 'Neither'],
                correctIndex: 0,
                hint: 'class is for groups; id is unique.',
                explanation: 'Classes are reusable across many elements; an id must be globally unique per page.'
            },
            {
                num: 5,
                type: 'True or False',
                prompt: 'Two different elements on the exact same HTML page can share the exact same id value.',
                code: '<div id="alpha"></div> <p id="alpha"></p>',
                options: ['False (an id must be strictly unique across the entire document)', 'True', 'Only if different tags', 'True in HTML5'],
                correctIndex: 0,
                hint: 'IDs must be unique.',
                explanation: 'False. The id attribute value must be unique across the entire DOM.'
            },
            {
                num: 6,
                type: 'Spot the Bug',
                prompt: 'What error exists in <div id="card"></div><div id="card"></div> ?',
                code: '<div id="card"></div><div id="card"></div>',
                options: ['Duplicate id="card" used twice; should use class="card" instead', 'Cannot have two divs', 'id must be numbers', 'No error'],
                correctIndex: 0,
                hint: 'Duplicate IDs violate HTML standards.',
                explanation: 'Duplicate id values violate standards and break querySelector/anchors. Use classes instead.'
            },
            {
                num: 7,
                type: 'Match the Pair',
                prompt: 'Match div and span with their core structural purposes:',
                code: '<div> vs <span>',
                options: ['div = generic block container for sections, span = generic inline container for styling text parts', 'div = for text only, span = for whole pages', 'Both are replaced in HTML5', 'None'],
                correctIndex: 0,
                hint: 'div for layout blocks, span for text phrases.',
                explanation: 'div is a block container for layout sections; span is an inline container for text fragments.'
            },
            {
                num: 8,
                type: 'Fill the Blank',
                prompt: 'Which global attribute displays a native browser tooltip when the user hovers over an element?',
                code: '<button ____="Click to confirm enrollment">Submit</button>',
                options: ['title', 'tooltip', 'hover', 'popup'],
                correctIndex: 0,
                hint: 'title attribute.',
                explanation: 'The title attribute provides advisory information presented as a native hover tooltip.'
            },
            {
                num: 9,
                type: 'Riddle',
                prompt: '"I completely hide an element from being rendered on the page without writing CSS." Which HTML attribute am I?',
                code: '<div ____>I am hidden</div>',
                options: ['hidden', 'invisible', 'display="none"', 'mask'],
                correctIndex: 0,
                hint: 'The boolean hidden attribute.',
                explanation: 'The boolean hidden attribute instructs the browser not to render the element.'
            },
            {
                num: 10,
                type: 'Fill the Blank',
                prompt: 'Write the inline style attribute syntax that colors text red:',
                code: '<p ____="color:red">Alert</p>',
                options: ['style="color:red"', 'color="red"', 'css="red"', 'font-color="red"'],
                correctIndex: 0,
                hint: 'style attribute.',
                explanation: 'The style attribute applies inline CSS declarations: style="color:red".'
            }
        ]
    },
    {
        id: 'game_html_10',
        track: 'html',
        trackName: 'Web Development (HTML)',
        topicNum: 10,
        title: 'Secret Codes and Hidden Notes',
        topic: 'Comments, Entities, iframe and Meta Tags',
        badge: { id: 'secret_agent', name: 'Secret Agent', icon: '🕵️', desc: 'Decoded 10 cryptographic HTML entities, iframes, and meta ciphers!' },
        story: 'You are an elite cyber intelligence spy for Mirai Academy! Decode hidden messages, escape entities, and inspect document metadata.',
        rules: 'Crack entity codes and meta configurations. Correct = intelligence intercepted. Wrong = cyber alarm blares!',
        mechanic: 'secret_codes',
        questions: [
            {
                num: 1,
                type: 'Fill the Blank',
                prompt: 'What is the correct syntax to write a comment in HTML?',
                code: '____ Secret note ____',
                options: ['<!-- this is a comment -->', '// this is a comment', '/* this is a comment */', '# this is a comment'],
                correctIndex: 0,
                hint: '<!-- ... -->',
                explanation: 'HTML comments are written between <!-- and -->.'
            },
            {
                num: 2,
                type: 'True or False',
                prompt: 'HTML comments are rendered and visible to end users on the live web page.',
                code: '<!-- Secret Info -->',
                options: ['False (comments are hidden from the rendered page, visible only in source code)', 'True', 'Only on mobile devices', 'True when inside body'],
                correctIndex: 0,
                hint: 'Browsers ignore comments during layout.',
                explanation: 'False. HTML comments do not render on screen, though visible in Inspect Element.'
            },
            {
                num: 3,
                type: 'Match the Pair',
                prompt: 'Match entity codes (&lt; &gt; &amp; &nbsp; &copy;) with their rendered glyphs:',
                code: '&lt; &gt; &amp; &nbsp; &copy;',
                options: ['&lt; = <, &gt; = >, &amp; = &, &nbsp; = space, &copy; = ©', '&lt; = >, &gt; = <, &copy; = copyright text', 'All render as brackets', 'None'],
                correctIndex: 0,
                hint: 'less than, greater than, ampersand, non-breaking space, copyright.',
                explanation: '&lt; is <, &gt; is >, &amp; is &, &nbsp; is a non-breaking space, &copy; is ©.'
            },
            {
                num: 4,
                type: 'Predict Output',
                prompt: 'What is rendered on screen by this entity code?',
                code: '<p>5 &lt; 10</p>',
                options: ['5 < 10', '5 &lt; 10', '5 > 10', 'Error: unclosed tag'],
                correctIndex: 0,
                hint: '&lt; stands for less than (<).',
                explanation: '&lt; safely escapes the less-than symbol, rendering as "5 < 10" without opening a tag.'
            },
            {
                num: 5,
                type: 'Fill the Blank',
                prompt: 'Which HTML tag embeds another separate webpage document inside the current page?',
                code: '<____ src="https://mirai.edu/embed">',
                options: ['<iframe>', '<embed-page>', '<webframe>', '<window>'],
                correctIndex: 0,
                hint: 'Inline frame.',
                explanation: '<iframe> (Inline Frame) embeds another HTML document inside the current window.'
            },
            {
                num: 6,
                type: 'Fill the Blank',
                prompt: 'Why do we declare <meta charset="UTF-8"> inside the document head?',
                code: '<meta charset="UTF-8">',
                options: ['So all international characters, emojis, and symbols encode and display accurately', 'To make the website faster', 'To enable JavaScript', 'To connect to Google'],
                correctIndex: 0,
                hint: 'Character encoding ensures universal text support.',
                explanation: 'UTF-8 character encoding covers almost all languages and special symbols in the world.'
            },
            {
                num: 7,
                type: 'Riddle',
                prompt: '"I ensure the webpage scales responsively and looks sharp across mobile screens." Which meta tag am I?',
                code: '<meta name="____" content="width=device-width, initial-scale=1.0">',
                options: ['viewport', 'mobile', 'screen', 'responsive'],
                correctIndex: 0,
                hint: 'viewport meta tag.',
                explanation: '<meta name="viewport" content="width=device-width, initial-scale=1.0"> enables mobile responsive scaling.'
            },
            {
                num: 8,
                type: 'Spot the Bug',
                prompt: 'A developer placed <meta charset="UTF-8"> inside the <body> tag. What is wrong?',
                code: '<body><meta charset="UTF-8"></body>',
                options: ['Meta tags belong exclusively inside the <head> section', 'Charset cannot be UTF-8', 'Must be inside a paragraph', 'No bug'],
                correctIndex: 0,
                hint: 'Metadata must be defined in the head.',
                explanation: '<meta> tags define document metadata and must reside inside <head> before body content.'
            },
            {
                num: 9,
                type: 'Fill the Blank',
                prompt: 'What does <html lang="en"> declare to browsers and assistive technologies?',
                code: '<html lang="en">',
                options: ['That the primary human language of the page content is English', 'That English fonts must be downloaded', 'That translation is blocked', 'That English units (inches) are used'],
                correctIndex: 0,
                hint: 'Language attribute.',
                explanation: 'lang="en" specifies that English is the natural human language of the page for speech synthesizers.'
            },
            {
                num: 10,
                type: 'Odd One Out',
                prompt: 'Which of the following is NOT an empty/void tag?',
                code: 'hr, br, img, p',
                options: ['<p> (it requires an opening <p> and closing </p> tag)', '<hr>', '<br>', '<img>'],
                correctIndex: 0,
                hint: '<p> contains text and has a closing tag.',
                explanation: '<p> is a container element that wraps text with <p>...</p>; hr, br, and img are void tags.'
            }
        ]
    }
];

window.MIRAI_GAMES = MIRAI_GAMES;
