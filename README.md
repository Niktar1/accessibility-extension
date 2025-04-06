# 🧪 Accessibility Checker Chrome Extension (Powered by axe-core)

A lightweight and easy-to-use Chrome Extension that allows you to run accessibility audits on any webpage using [axe-core](https://github.com/dequelabs/axe-core), the industry-standard accessibility testing library.

## 🚀 Features

- One-click accessibility checks
- Clear reporting of accessibility issues
- Uses [axe-core](https://github.com/dequelabs/axe-core) for reliable results
- Works on any webpage
- Highlights elements with issues (optional)
- Completely open-source and customizable

---

## 🛠️ Installation (For Users)

### Method 1: Install from Chrome Web Store (Coming soon)

> _Link will be here once published._

### Method 2: Load Unpacked Extension (For Development or Manual Use)

1. Clone this repository:
    ```bash
    git clone https://github.com/Niktar1/accessibility-checker-extension.git
    ```

2. Open Chrome and go to `chrome://extensions/`

3. Enable **Developer mode** (toggle in the top right)

4. Click **"Load unpacked"** and select the root folder of this project

5. You should now see the extension icon in your Chrome toolbar!

---
🛠️ Usage
✅ Run Accessibility Check
Click the extension icon

Click "Run Check"

View a list of issues, their severity, and recommended fixes

🛠️ Apply Fixes
Click "Apply Fixes" to resolve issues automatically (where possible)

Refreshed results will show what’s fixed and what remains

🧠 Manual Adjustments
Use the violation details to manually improve elements

Click help links to view related WCAG guidelines
the results to improve your website's accessibility

---

## 🧩 Extension Structure

/accessibility-extension
├── icons/              # Icons stored here
├── content.js          # Main accessibility checking logic
├── fix-handler.js      # Core remediation engine
├── manifest.json       # Extension configuration
├── popup.html          # User interface markup
├── popup.js            # Popup interaction logic
├── relay.js            # Cross-world communication
└── axe-core.min.js     # Accessibility engine (add after clone)
├── README.md # You’re here! 

---
🌐 How It Works
Step	Description
🧬 Content Injection	axe-core is injected into the current tab
🧠 Violation Analysis	Issues are identified against WCAG standards
⚡ Auto Remediation	fix-handler.js modifies DOM for common issues
👁️ User Feedback	Results are displayed in a clean, actionable UI

## 🧱 Built With

- [axe-core](https://github.com/dequelabs/axe-core)
- JavaScript
- HTML/CSS
- Chrome Extensions API

---

⚠️Known Limitations
Not all issues can be fixed automatically

Complex ARIA implementations may need human review

Frames and cross-domain content may require page reloads

Styling issues (contrast, layout) need visual confirmation


✅ Accessibility Testing with axe-core
The extension uses axe-core by injecting it into the current webpage and calling:
axe.run(document, options, callback);
For more details on how axe-core works, check the axe-core API documentation.

📧 Contact & Support
Found a bug? Open an Issue

Want to collaborate? PRs are welcome!

Made with ❤️ to make the web accessible for all.
Happy developing! 🌍✨
