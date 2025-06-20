// ==UserScript==
// @name         Codecademy Quiz Answer Display (with Resync Button)
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Displays correct answers for all question types by perfectly matching visible question text. Includes a manual resync button.
// @author       Roo (Final Refinement)
// @match        https://www.codecademy.com/paths/*/tracks/*/modules/*/quizzes/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // --- Create and Style the Answer Display Box ---
    const answerBox = document.createElement('div');
    answerBox.id = 'roo-answer-box';

    // Create the main components of the box
    const title = document.createElement('h3');
    title.textContent = 'Correct Answer(s)';

    const answerContent = document.createElement('div');
    answerContent.id = 'roo-answer-content';

    const resyncButton = document.createElement('button');
    resyncButton.id = 'roo-resync-button';
    resyncButton.textContent = 'Resync Answers';

    // Append them in order
    answerBox.appendChild(title);
    answerBox.appendChild(answerContent);
    answerBox.appendChild(resyncButton);
    document.body.appendChild(answerBox);


    GM_addStyle(`
        #roo-answer-box {
            position: fixed;
            top: 100px;
            right: 20px;
            width: 350px;
            max-height: 80vh;
            overflow-y: auto;
            background-color: #1e2a3a;
            border: 2px solid #ffc107;
            border-radius: 8px;
            padding: 15px;
            z-index: 10000;
            color: #f8f9fa;
            font-family: sans-serif;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
        }
        #roo-answer-box h3 {
            margin-top: 0;
            color: #ffc107;
            border-bottom: 1px solid #6c757d;
            padding-bottom: 10px;
        }
        #roo-answer-content {
            flex-grow: 1; /* Allows content to take up available space */
        }
        #roo-answer-content div, #roo-answer-content li {
            margin-bottom: 10px;
            line-height: 1.4;
        }
        #roo-answer-box .correct {
            color: #28a745;
            font-weight: bold;
        }
        #roo-answer-box ol {
            padding-left: 20px;
            margin: 0;
        }
        #roo-answer-box li {
            color: #28a745;
        }
        #roo-answer-box code {
            background-color: #2c3e50;
            padding: 3px 6px;
            border-radius: 4px;
            font-family: monospace;
            color: #e0e0e0;
            word-break: break-all;
        }
        #roo-answer-box .hint {
            font-size: 0.8em;
            color: #9e9e9e;
            margin-top: 4px;
            font-style: italic;
        }
        #roo-answer-box .error {
            color: #dc3545;
            font-weight: bold;
        }
        #roo-resync-button {
            width: 100%;
            padding: 8px;
            margin-top: 15px;
            background-color: #2c3e50;
            border: 1px solid #ffc107;
            color: #ffc107;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.2s, color 0.2s;
        }
        #roo-resync-button:hover {
            background-color: #ffc107;
            color: #1e2a3a;
        }
    `);

    // --- Script Logic ---

    let allAssessments = [];
    let quizObserver = null;
    let lastMatchedPrompt = "";

    // Add click listener for the resync button
    resyncButton.addEventListener('click', () => {
        console.log("Manual resync triggered.");
        // Reset the state and force a re-check and re-render
        lastMatchedPrompt = "";
        syncAndDisplayAnswers();
    });

    /**
     * Normalizes text by removing markdown, trimming, and collapsing whitespace.
     * @param {string} text The text to normalize.
     * @returns {string} The normalized text.
     */
    function normalizeText(text) {
        if (!text) return "";
        return text.replace(/[`*_]/g, '').trim().replace(/\s+/g, ' ');
    }
    
    /**
     * Finds the currently displayed question text from the DOM.
     * @returns {string|null} The visible question text or null if not found.
     */
    function getVisibleQuestionText() {
        const questionElement = document.querySelector('.styles_assessmentBody__NNz4u div[data-testid="markdown"]');
        return questionElement ? questionElement.textContent : null;
    }

    /**
     * The main function that finds the current question and updates the answer box.
     */
    function syncAndDisplayAnswers() {
        const visibleQuestionText = getVisibleQuestionText();
        if (!visibleQuestionText) return;

        const normalizedVisibleText = normalizeText(visibleQuestionText);

        if (normalizedVisibleText === lastMatchedPrompt) return;

        const assessment = allAssessments.find(a => normalizeText(a.prompt) === normalizedVisibleText);
        let answersHtml = ``;

        if (assessment) {
            lastMatchedPrompt = normalizedVisibleText;

            switch (assessment.__typename) {
                case 'MultipleChoice':
                    const correctIndices = Array.isArray(assessment.correct_answer) ? assessment.correct_answer : [assessment.correct_answer];
                    assessment.answers.forEach((answer, index) => {
                        if (correctIndices.includes(index)) {
                            answersHtml += `<div class="correct">✓ ${normalizeText(answer.text)}</div>`;
                        }
                    });
                    break;
                case 'FillInCode':
                    answersHtml += `<ol>`;
                    assessment.answers.forEach(answer => {
                        answersHtml += `<li><code>${answer.text}</code>`;
                        if (answer.hint) answersHtml += `<div class="hint">${answer.hint}</div>`;
                        answersHtml += `</li>`;
                    });
                    answersHtml += `</ol>`;
                    break;
                default:
                    answersHtml += `<div class="error">Unsupported question type: ${assessment.__typename || 'Unknown'}.</div>`;
            }
        } else {
            answersHtml += `<div>Matching answers...</div>`;
        }
        answerContent.innerHTML = answersHtml;
    }

    /**
     * Initializes the script by parsing data once and setting up the observer.
     */
    function initialize() {
        try {
            const nextDataElement = document.getElementById('__NEXT_DATA__');
            if (!nextDataElement) throw new Error("__NEXT_DATA__ script tag not found.");
            
            const nextData = JSON.parse(nextDataElement.textContent);
            allAssessments = nextData?.props?.pageProps?.currentContentItem?.assessments;

            if (!allAssessments || allAssessments.length === 0) {
                throw new Error("Assessments data is missing or empty.");
            }
        } catch (error) {
            console.error('Codecademy Answer Script Error:', error);
            answerContent.innerHTML = `<div class="error">Error: Could not load quiz data.</div>`;
            return;
        }

        const targetNode = document.querySelector('.styles_assessmentBody__NNz4u');
        if (!targetNode) {
            answerContent.innerHTML = `<div class="error">Error: Could not find the quiz container to sync with.</div>`;
            return;
        }

        if (quizObserver) quizObserver.disconnect();
        quizObserver = new MutationObserver(syncAndDisplayAnswers);
        quizObserver.observe(targetNode, {
            childList: true,
            subtree: true
        });

        syncAndDisplayAnswers();
    }

    // Wait for the quiz container to be available before initializing.
    const readyCheckInterval = setInterval(() => {
        if (document.querySelector('.styles_assessmentBody__NNz4u div[data-testid="markdown"]')) {
            clearInterval(readyCheckInterval);
            initialize();
        }
    }, 250);

})();
