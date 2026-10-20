/**
 * MSOT LEARN — Question Bank: HTML Web Development (35 Questions, 7 Days x 5 Questions)
 * Questions 1-4 per day: Single-correct MCQ (10 XP)
 * Question 5 per day: Multiple-correct MCQ (20 XP)
 */

window.QUESTIONS_HTML = {
    subject: 'html',
    title: 'HTML & Web Fundamentals',
    icon: '🌐',
    days: {
        1: {
            title: 'Day 1 — HTML Fundamentals',
            questions: [
                {
                    id: 'html_d1_q1',
                    num: 1,
                    type: 'single',
                    prompt: 'What does HTML stand for?',
                    options: ['Hyper Text Markup Language', 'High Text Machine Language', 'Hyper Tool Markup Language', 'Home Text Making Language'],
                    correct: ['A'],
                    explanation: 'HTML stands for HyperText Markup Language, the standard authoring language for web pages.'
                },
                {
                    id: 'html_d1_q2',
                    num: 2,
                    type: 'single',
                    prompt: 'Which tag creates the largest standard HTML heading?',
                    options: ['<h6>', '<head>', '<h1>', '<heading>'],
                    correct: ['C'],
                    explanation: '<h1> represents the highest level section heading in standard HTML typography.'
                },
                {
                    id: 'html_d1_q3',
                    num: 3,
                    type: 'single',
                    prompt: 'Which tag creates a paragraph?',
                    options: ['<para>', '<p>', '<text>', '<pg>'],
                    correct: ['B'],
                    explanation: '<p> defines a block of paragraph text in HTML.'
                },
                {
                    id: 'html_d1_q4',
                    num: 4,
                    type: 'single',
                    prompt: 'Which declaration specifies HTML5?',
                    options: ['<html5>', '<!DOCTYPE html>', '<doctype>', '<!HTML>'],
                    correct: ['B'],
                    explanation: '<!DOCTYPE html> is the concise, case-insensitive doctype declaration for HTML5.'
                },
                {
                    id: 'html_d1_q5',
                    num: 5,
                    type: 'multiple',
                    prompt: 'Which are valid HTML elements? (Select all correct answers)',
                    options: ['<div>', '<p>', '<section>', '<paragraph-box>'],
                    correct: ['A', 'B', 'C'],
                    explanation: '<div>, <p>, and <section> are standard HTML elements. <paragraph-box> is not a valid HTML tag.'
                }
            ]
        },
        2: {
            title: 'Day 2 — Text Formatting & Links',
            questions: [
                {
                    id: 'html_d2_q1',
                    num: 1,
                    type: 'single',
                    prompt: 'Which tag gives strong importance to text?',
                    options: ['<strong>', '<big>', '<marking>', '<important>'],
                    correct: ['A'],
                    explanation: '<strong> indicates that its contents have strong importance, typically rendered bold by browsers.'
                },
                {
                    id: 'html_d2_q2',
                    num: 2,
                    type: 'single',
                    prompt: 'Which attribute specifies the destination of a link?',
                    options: ['src', 'href', 'alt', 'target-only'],
                    correct: ['B'],
                    explanation: 'href (Hypertext REFerence) specifies the target URL destination on an anchor tag <a>.'
                },
                {
                    id: 'html_d2_q3',
                    num: 3,
                    type: 'single',
                    prompt: 'Which tag creates a line break?',
                    options: ['<lb>', '<break>', '<br>', '<newline>'],
                    correct: ['C'],
                    explanation: '<br> produces a line break in text (carriage-return).'
                },
                {
                    id: 'html_d2_q4',
                    num: 4,
                    type: 'single',
                    prompt: 'What does target="_blank" commonly do on a link?',
                    options: ['Deletes the current page', 'Opens the link in a new tab or browsing context', 'Downloads every link', 'Makes the link bold'],
                    correct: ['B'],
                    explanation: 'target="_blank" directs the user agent to open the linked document in a new browser tab or window.'
                },
                {
                    id: 'html_d2_q5',
                    num: 5,
                    type: 'multiple',
                    prompt: 'Which are valid HTML text-formatting elements? (Select all correct answers)',
                    options: ['<em>', '<strong>', '<mark>', '<bold-text>'],
                    correct: ['A', 'B', 'C'],
                    explanation: '<em> (emphasis), <strong> (importance), and <mark> (highlighted text) are valid elements.'
                }
            ]
        },
        3: {
            title: 'Day 3 — Images & Lists',
            questions: [
                {
                    id: 'html_d3_q1',
                    num: 1,
                    type: 'single',
                    prompt: 'Which tag inserts an image?',
                    options: ['<picture-file>', '<img>', '<image>', '<src>'],
                    correct: ['B'],
                    explanation: '<img> is the void element used to embed an image into an HTML document.'
                },
                {
                    id: 'html_d3_q2',
                    num: 2,
                    type: 'single',
                    prompt: 'What is the purpose of the alt attribute?',
                    options: ['To specify image height only', 'To provide alternative text for an image', 'To change text color', 'To create a link'],
                    correct: ['B'],
                    explanation: 'alt specifies an alternate text description for accessibility and screen readers when an image cannot be rendered.'
                },
                {
                    id: 'html_d3_q3',
                    num: 3,
                    type: 'single',
                    prompt: 'Which tag creates an ordered list?',
                    options: ['<ul>', '<li>', '<ol>', '<list>'],
                    correct: ['C'],
                    explanation: '<ol> defines an ordered (numbered) list.'
                },
                {
                    id: 'html_d3_q4',
                    num: 4,
                    type: 'single',
                    prompt: 'Which tag defines a list item?',
                    options: ['<item>', '<li>', '<ol>', '<dl>'],
                    correct: ['B'],
                    explanation: '<li> defines a list item inside an ordered (<ol>) or unordered (<ul>) list.'
                },
                {
                    id: 'html_d3_q5',
                    num: 5,
                    type: 'multiple',
                    prompt: 'Which statements about images and lists are true? (Select all correct answers)',
                    options: ['<img> is a void element.', '<ul> creates an unordered list.', '<li> defines a list item.', '<img> must always have a closing </img> tag.'],
                    correct: ['A', 'B', 'C'],
                    explanation: '<img> is a self-closing void element without a closing tag. <ul> creates bulleted lists and <li> marks items.'
                }
            ]
        },
        4: {
            title: 'Day 4 — Tables',
            questions: [
                {
                    id: 'html_d4_q1',
                    num: 1,
                    type: 'single',
                    prompt: 'Which tag defines a table row?',
                    options: ['<td>', '<tr>', '<th>', '<row>'],
                    correct: ['B'],
                    explanation: '<tr> stands for Table Row and defines a row of cells in a table.'
                },
                {
                    id: 'html_d4_q2',
                    num: 2,
                    type: 'single',
                    prompt: 'Which attribute merges cells vertically?',
                    options: ['colspan', 'rowspan', 'merge', 'verticalspan'],
                    correct: ['B'],
                    explanation: 'rowspan defines the number of vertical rows a table cell should span.'
                },
                {
                    id: 'html_d4_q3',
                    num: 3,
                    type: 'single',
                    prompt: 'Which tag defines a table header cell?',
                    options: ['<thead-cell>', '<th>', '<head>', '<header>'],
                    correct: ['B'],
                    explanation: '<th> defines a header cell in an HTML table, rendered bold and centered by default.'
                },
                {
                    id: 'html_d4_q4',
                    num: 4,
                    type: 'single',
                    prompt: 'What does colspan="2" do to a table cell?',
                    options: ['Makes it span two rows', 'Makes it span two columns', 'Creates two tables', 'Hides two columns'],
                    correct: ['B'],
                    explanation: 'colspan="2" causes a table cell to span horizontally across 2 adjacent columns.'
                },
                {
                    id: 'html_d4_q5',
                    num: 5,
                    type: 'multiple',
                    prompt: 'Which tags are used to structure HTML tables? (Select all correct answers)',
                    options: ['<table>', '<tr>', '<td>', '<trow>'],
                    correct: ['A', 'B', 'C'],
                    explanation: '<table>, <tr> (row), and <td> (data cell) are official table elements. <trow> is invalid.'
                }
            ]
        },
        5: {
            title: 'Day 5 — Forms & Inputs',
            questions: [
                {
                    id: 'html_d5_q1',
                    num: 1,
                    type: 'single',
                    prompt: 'Which tag creates an HTML form?',
                    options: ['<input>', '<form>', '<fieldset-form>', '<submit>'],
                    correct: ['B'],
                    explanation: '<form> represents a document section containing interactive controls for submitting information.'
                },
                {
                    id: 'html_d5_q2',
                    num: 2,
                    type: 'single',
                    prompt: 'Which input type hides entered characters by default?',
                    options: ['text', 'email', 'password', 'hidden-text'],
                    correct: ['C'],
                    explanation: 'type="password" masks entered characters with dots or asterisks for privacy.'
                },
                {
                    id: 'html_d5_q3',
                    num: 3,
                    type: 'single',
                    prompt: 'Which attribute makes a field mandatory during normal browser form validation?',
                    options: ['needed', 'required', 'mandatory="yes"', 'must'],
                    correct: ['B'],
                    explanation: 'The required boolean attribute prevents form submission if the input field is left empty.'
                },
                {
                    id: 'html_d5_q4',
                    num: 4,
                    type: 'single',
                    prompt: 'Which input type is designed for email addresses?',
                    options: ['mailbox', 'text-email', 'email', 'address'],
                    correct: ['C'],
                    explanation: 'type="email" provides automatic client-side email format validation.'
                },
                {
                    id: 'html_d5_q5',
                    num: 5,
                    type: 'multiple',
                    prompt: 'Which are valid HTML form controls? (Select all correct answers)',
                    options: ['<input>', '<textarea>', '<select>', '<forminput>'],
                    correct: ['A', 'B', 'C'],
                    explanation: '<input>, <textarea>, and <select> are standard form controls. <forminput> is not valid.'
                }
            ]
        },
        6: {
            title: 'Day 6 — Semantic HTML & Multimedia',
            questions: [
                {
                    id: 'html_d6_q1',
                    num: 1,
                    type: 'single',
                    prompt: 'Which semantic element represents navigation links?',
                    options: ['<navigate>', '<nav>', '<navigation-bar>', '<links>'],
                    correct: ['B'],
                    explanation: '<nav> represents a section of a page whose purpose is to provide navigation links.'
                },
                {
                    id: 'html_d6_q2',
                    num: 2,
                    type: 'single',
                    prompt: 'Which tag represents the main content of a page?',
                    options: ['<main>', '<body-main>', '<content>', '<primary>'],
                    correct: ['A'],
                    explanation: '<main> represents the dominant, central content of the <body> of a document.'
                },
                {
                    id: 'html_d6_q3',
                    num: 3,
                    type: 'single',
                    prompt: 'Which tag embeds video content?',
                    options: ['<movie>', '<media-video>', '<video>', '<mp4>'],
                    correct: ['C'],
                    explanation: '<video> embeds a media player supporting video playback in the document.'
                },
                {
                    id: 'html_d6_q4',
                    num: 4,
                    type: 'single',
                    prompt: 'Which tag specifies the document\'s character encoding?',
                    options: ['<meta charset="UTF-8">', '<encoding>UTF-8</encoding>', '<charset>', '<language charset="UTF-8">'],
                    correct: ['A'],
                    explanation: '<meta charset="UTF-8"> declares the character encoding so browsers interpret text correctly.'
                },
                {
                    id: 'html_d6_q5',
                    num: 5,
                    type: 'multiple',
                    prompt: 'Which are semantic HTML elements? (Select all correct answers)',
                    options: ['<article>', '<footer>', '<aside>', '<font>'],
                    correct: ['A', 'B', 'C'],
                    explanation: '<article>, <footer>, and <aside> provide semantic meaning. <font> is obsolete and non-semantic.'
                }
            ]
        },
        7: {
            title: 'Day 7 — Mixed Tricky HTML',
            questions: [
                {
                    id: 'html_d7_q1',
                    num: 1,
                    type: 'single',
                    prompt: 'Which attribute provides an element with a unique identifier within a document?',
                    options: ['class', 'id', 'style', 'name-only'],
                    correct: ['B'],
                    explanation: 'The id attribute must be unique across the entire document.'
                },
                {
                    id: 'html_d7_q2',
                    num: 2,
                    type: 'single',
                    prompt: 'Which tag defines the title shown in the browser tab?',
                    options: ['<h1>', '<header>', '<title>', '<caption>'],
                    correct: ['C'],
                    explanation: '<title> inside <head> defines the title of the document shown in the browser window title bar/tab.'
                },
                {
                    id: 'html_d7_q3',
                    num: 3,
                    type: 'single',
                    prompt: 'Which attribute is commonly used to associate a label with an input\'s ID?',
                    options: ['for', 'href', 'src', 'alt'],
                    correct: ['A'],
                    explanation: '<label for="inputId"> associates the label with the corresponding form control ID.'
                },
                {
                    id: 'html_d7_q4',
                    num: 4,
                    type: 'single',
                    prompt: 'What is the default method for an HTML form if its method attribute is omitted?',
                    options: ['POST', 'PUT', 'GET', 'DELETE'],
                    correct: ['C'],
                    explanation: 'If method is not specified, HTML forms default to GET.'
                },
                {
                    id: 'html_d7_q5',
                    num: 5,
                    type: 'multiple',
                    prompt: 'Which statements about HTML are true? (Select all correct answers)',
                    options: ['HTML elements can have attributes.', 'The id attribute should be unique within a document.', 'A <label> can be associated with a form control.', 'Every HTML element must have both opening and closing tags.'],
                    correct: ['A', 'B', 'C'],
                    explanation: 'Elements can take attributes, IDs must be unique, and labels bind to controls. Void elements (like <img>, <br>) lack closing tags.'
                }
            ]
        }
    }
};
