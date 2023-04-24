# Focus-First
A seemingly simple browser extension to help you prioritize important tasks before allowing yourself to indulge in distractions.

FocusFirst helps you stay focused when you work on your computer by restricting access to distracting websites until you submit a copy of your finished homework. It accepts an image or a pdf then runs it through an OCR then GPT to determine if adequate effort/progress has been put forth.

Functionalities (when activated):
 - Block a predefined list of distracting websites (YouTube, Twitter, Instagram…)
 - Block a customizable list of distracting websites of your choice
 - Quick Add/Remove action on each website (with checkboxes)

Setup:
 - `git clone` or download the 'focus-first' folder
 - Open your browser's extension setting, turn on developer mode, then load unpacked, and select the 'focus-first' folder

Configuration:
 - Lines 58-60 can be uncommented to allow for simple release/restriction of websites without uploading files
 - The same lines can be commented out to re-enable the AI implementation features