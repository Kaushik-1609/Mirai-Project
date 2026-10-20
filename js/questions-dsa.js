/**
 * MSOT LEARN — Question Bank: DSA in C++ (35 Questions, 7 Days x 5 Questions)
 * Questions 1-4 per day: Single-correct MCQ (10 XP)
 * Question 5 per day: Multiple-correct MCQ (20 XP)
 */

window.QUESTIONS_DSA = {
    subject: 'dsa',
    title: 'DSA in C++',
    icon: '⚡',
    days: {
        1: {
            title: 'Day 1 — C++ Basics & Operators',
            questions: [
                {
                    id: 'dsa_d1_q1',
                    num: 1,
                    type: 'single',
                    prompt: 'What is the output?',
                    code: 'int a = 5;\ncout << a++;',
                    options: ['5', '6', '4', 'Error'],
                    correct: ['A'],
                    explanation: 'The post-increment operator (a++) evaluates to the current value (5) before incrementing to 6.'
                },
                {
                    id: 'dsa_d1_q2',
                    num: 2,
                    type: 'single',
                    prompt: 'Which data type stores a whole number?',
                    options: ['float', 'int', 'char', 'bool'],
                    correct: ['B'],
                    explanation: 'The int data type stores signed whole numbers (integers) without fractions or decimals.'
                },
                {
                    id: 'dsa_d1_q3',
                    num: 3,
                    type: 'single',
                    prompt: 'What is the output?',
                    code: 'cout << 10 / 3;',
                    options: ['3.33', '3', '4', '1'],
                    correct: ['B'],
                    explanation: 'Both operands are integers, so integer division truncates the fractional portion, leaving 3.'
                },
                {
                    id: 'dsa_d1_q4',
                    num: 4,
                    type: 'single',
                    prompt: 'Which operator checks equality?',
                    options: ['=', '!=', '==', '>='],
                    correct: ['C'],
                    explanation: 'The == operator checks whether two expressions are equal. A single = is the assignment operator.'
                },
                {
                    id: 'dsa_d1_q5',
                    num: 5,
                    type: 'multiple',
                    prompt: 'Which are valid C++ data types? (Select all correct answers)',
                    options: ['int', 'float', 'char', 'number'],
                    correct: ['A', 'B', 'C'],
                    explanation: 'int, float, and char are primitive types in C++. "number" is used in JavaScript/TypeScript, not C++.'
                }
            ]
        },
        2: {
            title: 'Day 2 — If-Else & Conditions',
            questions: [
                {
                    id: 'dsa_d2_q1',
                    num: 1,
                    type: 'single',
                    prompt: 'What is the output?',
                    code: 'int x = 7;\nif (x > 5) cout << "A";\nelse cout << "B";',
                    options: ['A', 'B', 'AB', 'Error'],
                    correct: ['A'],
                    explanation: 'Since 7 > 5 evaluates to true, the if-branch executes and outputs "A".'
                },
                {
                    id: 'dsa_d2_q2',
                    num: 2,
                    type: 'single',
                    prompt: 'Which operator means logical AND?',
                    options: ['||', '&&', '!', '=='],
                    correct: ['B'],
                    explanation: '&& represents logical AND in C++. || is logical OR and ! is logical NOT.'
                },
                {
                    id: 'dsa_d2_q3',
                    num: 3,
                    type: 'single',
                    prompt: 'What is the output?',
                    code: 'int x = 8;\ncout << (x % 2);',
                    options: ['0', '1', '2', '4'],
                    correct: ['A'],
                    explanation: '8 % 2 has a remainder of 0 because 8 is an even number divisible by 2.'
                },
                {
                    id: 'dsa_d2_q4',
                    num: 4,
                    type: 'single',
                    prompt: 'Which condition checks whether x lies between 1 and 10, inclusive?',
                    options: ['x >= 1 || x <= 10', 'x > 1 && x < 10', 'x >= 1 && x <= 10', 'x == 1 && x == 10'],
                    correct: ['C'],
                    explanation: 'x >= 1 && x <= 10 correctly combines lower and upper inclusive bounds with logical AND.'
                },
                {
                    id: 'dsa_d2_q5',
                    num: 5,
                    type: 'multiple',
                    prompt: 'Which are valid conditional constructs in C++? (Select all correct answers)',
                    options: ['if', 'if-else', 'switch', 'check-otherwise'],
                    correct: ['A', 'B', 'C'],
                    explanation: 'if, if-else, and switch are built-in C++ selection statements. "check-otherwise" is not valid syntax.'
                }
            ]
        },
        3: {
            title: 'Day 3 — Loops',
            questions: [
                {
                    id: 'dsa_d3_q1',
                    num: 1,
                    type: 'single',
                    prompt: 'How many times does this loop run?',
                    code: 'for(int i = 1; i <= 5; i++)\n    cout << i;',
                    options: ['4', '5', '6', 'Infinite times'],
                    correct: ['B'],
                    explanation: 'The loop variable i takes the values 1, 2, 3, 4, 5, running exactly 5 times.'
                },
                {
                    id: 'dsa_d3_q2',
                    num: 2,
                    type: 'single',
                    prompt: 'What is the output?',
                    code: 'int i = 3;\nwhile(i > 0) {\n    cout << i;\n    i--;\n}',
                    options: ['123', '321', '012', '333'],
                    correct: ['B'],
                    explanation: 'i is printed and decremented while > 0: 3, then 2, then 1, resulting in "321".'
                },
                {
                    id: 'dsa_d3_q3',
                    num: 3,
                    type: 'single',
                    prompt: 'Which loop executes its body at least once, provided it completes normally?',
                    options: ['for', 'while', 'do-while', 'None'],
                    correct: ['C'],
                    explanation: 'do-while evaluates its loop condition at the end of each iteration, guaranteeing at least one pass.'
                },
                {
                    id: 'dsa_d3_q4',
                    num: 4,
                    type: 'single',
                    prompt: 'What is the output?',
                    code: 'for(int i = 1; i <= 5; i += 2)\n    cout << i;',
                    options: ['12345', '135', '24', '15'],
                    correct: ['B'],
                    explanation: 'i increments by 2: 1, 3, 5. So it prints "135".'
                },
                {
                    id: 'dsa_d3_q5',
                    num: 5,
                    type: 'multiple',
                    prompt: 'Which statements about loops are true? (Select all correct answers)',
                    options: ['break exits the nearest enclosing loop.', 'continue skips to the next iteration.', 'A loop can be nested inside another loop.', 'Every loop must run exactly 10 times.'],
                    correct: ['A', 'B', 'C'],
                    explanation: 'break terminates the enclosing loop, continue skips to next iteration, and loops can be nested.'
                }
            ]
        },
        4: {
            title: 'Day 4 — Number Logic',
            questions: [
                {
                    id: 'dsa_d4_q1',
                    num: 1,
                    type: 'single',
                    prompt: 'What is the reverse of 123?',
                    options: ['123', '321', '231', '312'],
                    correct: ['B'],
                    explanation: 'Extracting and reversing digits: 3 * 100 + 2 * 10 + 1 = 321.'
                },
                {
                    id: 'dsa_d4_q2',
                    num: 2,
                    type: 'single',
                    prompt: 'What does n % 10 give for n = 47?',
                    options: ['4', '7', '47', '0'],
                    correct: ['B'],
                    explanation: 'Modulo 10 extracts the rightmost (units) digit of a positive base-10 number, which is 7.'
                },
                {
                    id: 'dsa_d4_q3',
                    num: 3,
                    type: 'single',
                    prompt: 'Which condition identifies an even number?',
                    options: ['n % 2 == 1', 'n / 2 == 0', 'n % 2 == 0', 'n * 2 == 0'],
                    correct: ['C'],
                    explanation: 'An integer is even if and only if division by 2 leaves no remainder (n % 2 == 0).'
                },
                {
                    id: 'dsa_d4_q4',
                    num: 4,
                    type: 'single',
                    prompt: 'What is the sum of digits of 245?',
                    options: ['9', '10', '11', '12'],
                    correct: ['C'],
                    explanation: '2 + 4 + 5 = 11.'
                },
                {
                    id: 'dsa_d4_q5',
                    num: 5,
                    type: 'multiple',
                    prompt: 'Which numbers are divisible by 3? (Select all correct answers)',
                    options: ['12', '14', '21', '25'],
                    correct: ['A', 'C'],
                    explanation: '12 (1+2=3) and 21 (2+1=3) are divisible by 3. 14 and 25 are not.'
                }
            ]
        },
        5: {
            title: 'Day 5 — Patterns & Nested Loops',
            questions: [
                {
                    id: 'dsa_d5_q1',
                    num: 1,
                    type: 'single',
                    prompt: 'How many stars are printed?',
                    code: 'for(int i = 1; i <= 3; i++)\n    for(int j = 1; j <= 2; j++)\n        cout << "*";',
                    options: ['3', '5', '6', '9'],
                    correct: ['C'],
                    explanation: 'Outer loop runs 3 times, inner loop runs 2 times per outer step: 3 * 2 = 6 stars.'
                },
                {
                    id: 'dsa_d5_q2',
                    num: 2,
                    type: 'single',
                    prompt: 'How many rows does this pattern have?',
                    code: 'for(int i = 1; i <= 4; i++) {\n    for(int j = 1; j <= i; j++)\n        cout << "*";\n    cout << endl;\n}',
                    options: ['3', '4', '5', '10'],
                    correct: ['B'],
                    explanation: 'The outer loop controls rows and executes for i = 1, 2, 3, 4 (4 rows).'
                },
                {
                    id: 'dsa_d5_q3',
                    num: 3,
                    type: 'single',
                    prompt: 'What is printed in the first row?',
                    code: 'for(int i = 3; i >= 1; i--) {\n    for(int j = 1; j <= i; j++)\n        cout << "*";\n    cout << endl;\n}',
                    options: ['*', '**', '***', '****'],
                    correct: ['C'],
                    explanation: 'In the first iteration, i = 3, so the inner loop prints 3 stars (***).'
                },
                {
                    id: 'dsa_d5_q4',
                    num: 4,
                    type: 'single',
                    prompt: 'What is the total number of stars?',
                    code: 'for(int i = 1; i <= 4; i++)\n    for(int j = 1; j <= i; j++)\n        cout << "*";',
                    options: ['4', '8', '10', '16'],
                    correct: ['C'],
                    explanation: 'Sum of arithmetic progression: 1 + 2 + 3 + 4 = 10 stars.'
                },
                {
                    id: 'dsa_d5_q5',
                    num: 5,
                    type: 'multiple',
                    prompt: 'Which techniques can create patterns in C++? (Select all correct answers)',
                    options: ['Nested loops', 'Spaces printed inside loops', 'Changing loop limits', 'Using only break without any output statements'],
                    correct: ['A', 'B', 'C'],
                    explanation: 'Patterns rely on nested loops, leading/trailing space formatting, and dynamic loop conditions.'
                }
            ]
        },
        6: {
            title: 'Day 6 — Functions & Basic Recursion',
            questions: [
                {
                    id: 'dsa_d6_q1',
                    num: 1,
                    type: 'single',
                    prompt: 'What is the purpose of a function?',
                    options: ['To store only images', 'To group reusable code', 'To stop every loop', 'To declare HTML tags'],
                    correct: ['B'],
                    explanation: 'Functions encapsulate reusable code blocks to improve modularity and maintainability.'
                },
                {
                    id: 'dsa_d6_q2',
                    num: 2,
                    type: 'single',
                    prompt: 'What is the output?',
                    code: 'int add(int a, int b) {\n    return a + b;\n}\ncout << add(2, 3);',
                    options: ['2', '3', '5', 'Error'],
                    correct: ['C'],
                    explanation: 'add(2, 3) executes 2 + 3 and returns 5, which cout displays.'
                },
                {
                    id: 'dsa_d6_q3',
                    num: 3,
                    type: 'single',
                    prompt: 'Which keyword returns a value from a non-void function?',
                    options: ['break', 'return', 'continue', 'cout'],
                    correct: ['B'],
                    explanation: 'The return statement yields a value from a function back to the calling site.'
                },
                {
                    id: 'dsa_d6_q4',
                    num: 4,
                    type: 'single',
                    prompt: 'What is the base case in recursion used for?',
                    options: ['To make recursion infinite', 'To stop further recursive calls', 'To declare a variable', 'To print every number twice'],
                    correct: ['B'],
                    explanation: 'The base case provides a terminating condition to stop recursive calls and prevent stack overflow.'
                },
                {
                    id: 'dsa_d6_q5',
                    num: 5,
                    type: 'multiple',
                    prompt: 'Which are valid properties of functions or recursion? (Select all correct answers)',
                    options: ['A function can accept parameters.', 'A non-void function can return a value.', 'A recursive function can call itself.', 'Every function must call itself.'],
                    correct: ['A', 'B', 'C'],
                    explanation: 'Functions accept parameters, return values, and can call themselves recursively. Non-recursive functions are common.'
                }
            ]
        },
        7: {
            title: 'Day 7 — Mixed Tricky Questions',
            questions: [
                {
                    id: 'dsa_d7_q1',
                    num: 1,
                    type: 'single',
                    prompt: 'What is the output?',
                    code: 'int s = 0;\nfor(int i = 1; i <= 4; i++)\n    s += i;\ncout << s;',
                    options: ['4', '6', '10', '15'],
                    correct: ['C'],
                    explanation: 'Accumulator s computes 0 + 1 + 2 + 3 + 4 = 10.'
                },
                {
                    id: 'dsa_d7_q2',
                    num: 2,
                    type: 'single',
                    prompt: 'What is the output?',
                    code: 'for(int i = 1; i <= 3; i++)\n    cout << i * i << " ";',
                    options: ['1 2 3', '1 4 9', '2 4 6', '1 8 27'],
                    correct: ['B'],
                    explanation: 'Outputs the squares of i for 1, 2, 3: "1 4 9 ".'
                },
                {
                    id: 'dsa_d7_q3',
                    num: 3,
                    type: 'single',
                    prompt: 'How many times does the loop execute?',
                    code: 'for(int i = 10; i >= 2; i -= 2)\n    cout << i;',
                    options: ['4', '5', '6', '10'],
                    correct: ['B'],
                    explanation: 'The loop executes for i = 10, 8, 6, 4, 2, which is 5 times.'
                },
                {
                    id: 'dsa_d7_q4',
                    num: 4,
                    type: 'single',
                    prompt: 'What is the output?',
                    code: 'int x = 5;\nif(x > 3)\n    if(x < 4)\n        cout << "A";\n    else\n        cout << "B";',
                    options: ['A', 'B', 'AB', 'Nothing'],
                    correct: ['B'],
                    explanation: 'x is 5. Since 5 > 3 is true, the outer if runs. Since 5 < 4 is false, the inner else runs and prints "B".'
                },
                {
                    id: 'dsa_d7_q5',
                    num: 5,
                    type: 'multiple',
                    prompt: 'Which statements about C++ are true? (Select all correct answers)',
                    options: ['i++ increases i by 1.', '% calculates the remainder for integer operands.', '&& represents logical AND.', '= and == have the same purpose.'],
                    correct: ['A', 'B', 'C'],
                    explanation: 'i++ increments by 1, % computes remainder, and && is logical AND. = is assignment whereas == checks equality.'
                }
            ]
        }
    }
};
