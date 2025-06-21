# Codecademy Quiz Helper

A Tampermonkey user script that intelligently displays the correct answers for Codecademy quizzes in a clean, floating popup.



## Features

-   **Automatic Answer Display**: Shows the correct answer(s) as soon as a question loads.
-   **Multi-Type Support**: Works flawlessly with different question formats, including:
    -   Multiple Choice (Single Answer)
    -   Select All That Apply (Multiple Answers)
    -   Fill-in-the-Code (Shows correct code snippets in the right order)
-   **Perfect Syncing**: Intelligently matches the currently visible question on the screen to its corresponding answer data, eliminating sync issues.
-   **Manual Resync**: Includes a "Resync Answers" button to manually refresh the answer display, just in case.
-   **Clean UI**: A simple, unobtrusive popup that doesn't get in the way of the quiz content.

## Installation

To use this script, you first need a user script manager browser extension. Then, you can install the script.

**Step 1: Install a User Script Manager**

Choose the extension for your browser:

-   [**Tampermonkey**](https://www.tampermonkey.net/) (Recommended for Chrome, Firefox, Edge, Safari)
-   [**Violentmonkey**](https://violentmonkey.github.io/) (Compatible with most browsers)

**Step 2: Install the Codecademy Quiz Helper Script**

1.  Go to your Tampermonkey (or other manager's) **Dashboard**.
2.  Click the **`+`** tab to create a new script.
3.  Delete the default template code that appears in the editor.
4.  Copy the entire code from the `codecademy-quiz-helper.js` file in this repository.
5.  Paste the code into the empty editor in your dashboard.
6.  Go to **File** -> **Save** (or press `Ctrl` + `S`).

The script is now installed and will activate automatically on Codecademy quiz pages.

## Usage

1.  Navigate to any quiz on `codecademy.com`.
2.  The "Correct Answer(s)" box will automatically appear in the top-right corner of the page.
3.  As you proceed to the next question, the box will update instantly with the new answers.
4.  If the answer ever seems out of sync or fails to load, simply click the **Resync Answers** button at the bottom of the box.

## How It Works

This script avoids unreliable methods like screen scraping. Instead, it leverages the JSON data island (`__NEXT_DATA__`) that Codecademy embeds in the page's HTML.

1.  **Parse Data**: On page load, the script parses this JSON to get a complete list of all questions and their correct answers for the current quiz.
2.  **Observe Changes**: It uses a `MutationObserver` to watch the specific part of the page where the question content is rendered.
3.  **Match and Display**: When the question content changes, the script reads the new visible question text, finds the exact match within its stored data, and displays the corresponding correct answer(s) in the popup. This ensures a 1:1 match and perfect sync.

## Disclaimer

This tool is intended for educational purposes, such as verifying your answers or understanding why a particular answer is correct. Using it to cheat on assessments may violate Codecademy's terms of service. Please use it responsibly.

## License

This project is licensed under the MIT License.
