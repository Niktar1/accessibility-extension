
// Change the initial declaration to check for existing object
if (!window.ruleFixes) {
    window.ruleFixes = {

        'accesskeys': fixAccessKeys,
        'area-alt': fixAreaAlt,
        'aria-allowed-attr': fixAriaAllowedAttr,
        'aria-allowed-role': fixAriaAllowedRole,
        'aria-braille-equivalent': fixAriaBrailleEquivalent,
        'aria-command-name': fixAriaCommandName,
        'aria-conditional-attr': fixAriaConditionalAttr,
        'aria-deprecated-role': fixAriaDeprecatedRole,
        'aria-dialog-name': fixAriaDialogName,
        'aria-hidden-body': fixAriaHiddenBody,
        //10
        'aria-input-field-name': fixAriaInputFieldName,
        'aria-meter-name': fixAriaMeterName,
        'aria-progressbar-name': fixAriaProgressbarName,
        'aria-required-attr': fixAriaRequiredAttr,
        'aria-required-children': fixAriaRequiredChildren,
        'aria-required-parent': fixAriaRequiredParent,
        'aria-roledescription': fixAriaRoledescription,
        'aria-roles': fixAriaRoles,
        'aria-text': fixAriaText,
        // 20
        'aria-toggle-field-name': fixAriaToggleFieldName,
        'aria-tooltip-name': fixAriaTooltipName,
        'aria-treeitem-name': fixAriaTreeitemName,
        'aria-valid-attr-value': fixAriaValidAttrValue,
        'aria-valid-attr': fixAriaValidAttr,
        'audio-caption': fixAudioCaption,
        'autocomplete-valid': fixAutocompleteValid,
        'avoid-inline-spacing': fixAvoidInlineSpacing,
        'blink': fixBlink,
        'button-name': fixButtonName,
        //30
        'bypass': fixBypass,
        'color-contrast-enhanced': fixColorContrastEnhanced,
        'color-contrast': fixColorContrast,
        'css-orientation-lock': fixCssOrientationLock,
        'definition-list': fixDefinitionList,
        'dlitem': fixDlitem,
        'document-title': fixDocumentTitle,
        'duplicate-id-active': fixDuplicateIdActive,
        'duplicate-id-aria': fixDuplicateIdAria,
        'duplicate-id': fixDuplicateId,
        // 40
        'empty-heading': fixEmptyHeading,
        'empty-table-header': fixEmptyTableHeader,
        'focus-order-semantics': fixFocusOrderSemantics,
        'form-field-multiple-labels': fixFormFieldMultipleLabels,
        'frame-focusable-content': fixFrameFocusableContent,
        'frame-tested': fixFrameTested,
        'frame-title-unique': fixFrameTitleUnique,
        'frame-title': fixFrameTitle,
        'heading-order': fixHeadingOrder,
        'hidden-content': fixHiddenContent,
        //50
        'html-has-lang': fixHtmlHasLang,
        'html-lang-valid': fixHtmlLangValid,
        'html-xml-lang-mismatch': fixHtmlXmlLangMismatch,
        'identical-links-same-purpose': fixIdenticalLinksPurpose,
        'image-alt': fixImageAlt,
        'image-redundant-alt': fixImageRedundantAlt,
        'input-button-name': fixInputButtonName,
        'input-image-alt': fixInputImageAlt,
        'label-content-name-mismatch': fixLabelContentMismatch,
        'label-title-only': fixLabelTitleOnly,
        //60
        'label': fixLabel,
        'landmark-banner-is-top-level': fixLandmarkBanner,
        'landmark-complementary-is-top-level': fixLandmarkComplementary,
        'landmark-contentinfo-is-top-level': fixLandmarkContentinfo,
        'landmark-main-is-top-level': fixLandmarkMain,
        'landmark-no-duplicate-banner': fixLandmarkDuplicateBanner,
        'landmark-no-duplicate-contentinfo': fixLandmarkDuplicateContentinfo,
        'landmark-one-main': fixLandmarkOneMain,
        'landmark-unique': fixLandmarkUnique,
        //69
        'link-name': fixLinkName,
        'page-has-heading-one': fixPageHasHeadingOne,
        'region': fixRegion,
    };
}


if (typeof window.__a11yViolations === 'undefined') {
    window.__a11yViolations = [];
}

if (typeof window.isProcessing === 'undefined') {
    window.isProcessing = false;
}

window.addEventListener('message', (event) => {
    if (!event.data || !event.data.type) return; // Fix undefined messages

    console.log('Received message:', event.data.type);

    if (event.data.type === 'STORE_VIOLATIONS') {
        console.log('Storing violations:', event.data.violations.length);
        window.__a11yViolations = event.data.violations; // Add window. prefix
    }

    if (event.data.type === 'APPLY_FIXES') {
        if (__a11yViolations.length === 0) {
            console.warn('No violations to fix!');
            return;
        }

        console.log('Processing violations:', __a11yViolations.length);
        applyFixes(__a11yViolations); // Pass violations explicitly
    }
});

function applyFixes(violations) {
    try {
        console.log('Processing violations:', violations);
        const successfulFixes = [];
        const failedFixes = [];

        violations.forEach(violation => {
            const fixer = ruleFixes[violation.id];
            if (!fixer) {
                console.warn('No fixer for:', violation.id);
                return;
            }

            try {
                fixer(violation.nodes);
                successfulFixes.push({
                    id: violation.id,
                    count: violation.nodes.length
                });
            } catch (error) {
                failedFixes.push({
                    id: violation.id,
                    error: error.message
                });
            }
        });

        window.postMessage({
            type: 'FIXES_COMPLETE',
            successful: successfulFixes,
            failed: failedFixes
        }, '*');

        console.log('Applied fixes:', successfulFixes.length);

    } catch (error) {
        window.postMessage({
            type: 'FIXES_ERROR',
            error: error.message
        }, '*');
    }
}

// Add this to store violations after check
function storeViolations(violations) {
    __a11yViolations = violations;
}

// Rule Fix Implementations 1-10
function fixAccessKeys(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        const currentKey = elem.getAttribute('accesskey');
        if (currentKey) {
            elem.setAttribute('accesskey', `${currentKey}-${Date.now()}`);
        }
    });
}

function fixAreaAlt(nodes) {
    nodes.forEach(node => {
        const area = node.element;
        if (!area.getAttribute('alt')) {
            area.setAttribute('alt', 'Interactive map area - needs description');
            area.dataset.autoFixedAlt = true;
        }
    });
}

function fixAriaAllowedAttr(nodes) {
    const validAttributes = getValidAriaAttributes();
    nodes.forEach(node => {
        const elem = node.element;
        Array.from(elem.attributes).forEach(attr => {
            if (attr.name.startsWith('aria-') && !validAttributes.includes(attr.name)) {
                elem.removeAttribute(attr.name);
            }
        });
    });
}

function fixAriaAllowedRole(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        const allowedRoles = getAllowedRoles(elem.tagName);
        const currentRole = elem.getAttribute('role');
        if (currentRole && !allowedRoles.includes(currentRole.toLowerCase())) {
            elem.removeAttribute('role');
        }
    });
}

function fixAriaBrailleEquivalent(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        if (elem.hasAttribute('aria-braillelabel') && !elem.hasAttribute('aria-label')) {
            elem.setAttribute('aria-label', elem.getAttribute('aria-braillelabel'));
        }
        if (elem.hasAttribute('aria-brailleroledescription') && !elem.hasAttribute('aria-roledescription')) {
            elem.setAttribute('aria-roledescription', elem.getAttribute('aria-brailleroledescription'));
        }
    });
}

function fixAriaCommandName(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        const roles = ['button', 'link', 'menuitem'];
        if (roles.includes(elem.getAttribute('role')) && !elem.getAttribute('aria-label')) {
            elem.setAttribute('aria-label', 'Interactive control - needs proper label');
        }
    });
}

function fixAriaConditionalAttr(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        const role = elem.getAttribute('role');
        const allowedAttrs = getRoleAllowedAttributes(role);

        Array.from(elem.attributes).forEach(attr => {
            if (attr.name.startsWith('aria-') && !allowedAttrs.includes(attr.name)) {
                elem.removeAttribute(attr.name);
            }
        });
    });
}

function fixAriaDeprecatedRole(nodes) {
    const deprecatedRoles = ['alert', 'log', 'marquee', 'status', 'timer'];
    nodes.forEach(node => {
        const elem = node.element;
        const currentRole = elem.getAttribute('role');
        if (deprecatedRoles.includes(currentRole)) {
            elem.removeAttribute('role');
        }
    });
}

function fixAriaDialogName(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        const roles = ['dialog', 'alertdialog'];
        if (roles.includes(elem.getAttribute('role')) && !elem.getAttribute('aria-label')) {
            elem.setAttribute('aria-label', 'Dialog - needs proper description');
        }
    });
}

function fixAriaHiddenBody(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        if (elem.tagName.toLowerCase() === 'body' && elem.getAttribute('aria-hidden') === 'true') {
            elem.removeAttribute('aria-hidden');
        }
    });
}

// Rule Fix Implementations 11-20
function fixAriaInputFieldName(nodes) {
    const inputRoles = ['textbox', 'combobox', 'searchbox', 'spinbutton'];
    nodes.forEach(node => {
        const elem = node.element;
        if (inputRoles.includes(elem.getAttribute('role')) &&
            !elem.getAttribute('aria-label') &&
            !elem.getAttribute('aria-labelledby')) {
            elem.setAttribute('aria-label', 'Input field - requires proper label');
        }
    });
}

function fixAriaMeterName(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        if (elem.getAttribute('role') === 'meter' &&
            !elem.getAttribute('aria-label') &&
            !elem.getAttribute('aria-labelledby')) {
            elem.setAttribute('aria-label', 'Meter - requires description');
        }
    });
}

function fixAriaProgressbarName(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        if (elem.getAttribute('role') === 'progressbar' &&
            !elem.getAttribute('aria-label') &&
            !elem.getAttribute('aria-labelledby')) {
            elem.setAttribute('aria-label', 'Progress indicator');
        }
    });
}

function fixAriaRequiredAttr(nodes) {
    const requiredAttributes = {
        'checkbox': ['aria-checked'],
        'radio': ['aria-checked'],
        'slider': ['aria-valuenow'],
        'spinbutton': ['aria-valuenow'],
        'combobox': ['aria-expanded'],
        'menu': ['aria-activedescendant']
    };

    nodes.forEach(node => {
        const elem = node.element;
        const role = elem.getAttribute('role');
        const required = requiredAttributes[role] || [];

        required.forEach(attr => {
            if (!elem.hasAttribute(attr)) {
                switch (attr) {
                    case 'aria-checked':
                        elem.setAttribute(attr, 'false');
                        break;
                    case 'aria-valuenow':
                        elem.setAttribute(attr, '0');
                        break;
                    case 'aria-expanded':
                        elem.setAttribute(attr, 'false');
                        break;
                    default:
                        elem.setAttribute(attr, '');
                }
            }
        });
    });
}

function fixAriaRequiredChildren(nodes) {
    const childMap = {
        'menu': ['menuitem', 'menuitemradio', 'menuitemcheckbox'],
        'listbox': ['option'],
        'grid': ['row'],
        'tree': ['treeitem']
    };

    nodes.forEach(node => {
        const elem = node.element;
        const role = elem.getAttribute('role');
        const requiredChildren = childMap[role] || [];

        requiredChildren.forEach(childRole => {
            if (!elem.querySelector(`[role="${childRole}"]`)) {
                const wrapper = document.createElement('div');
                wrapper.setAttribute('role', childRole);
                wrapper.textContent = 'Placeholder item';
                elem.appendChild(wrapper);
            }
        });
    });
}

function fixAriaRequiredParent(nodes) {
    const parentMap = {
        'menuitem': ['menu', 'group'],
        'option': ['listbox'],
        'row': ['grid', 'treegrid'],
        'treeitem': ['tree']
    };

    nodes.forEach(node => {
        const elem = node.element;
        const role = elem.getAttribute('role');
        const requiredParents = parentMap[role] || [];

        if (!requiredParents.some(rp => elem.closest(`[role="${rp}"]`))) {
            const wrapper = document.createElement('div');
            wrapper.setAttribute('role', requiredParents[0]);
            elem.parentNode.insertBefore(wrapper, elem);
            wrapper.appendChild(elem);
        }
    });
}

function fixAriaRoledescription(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        if (elem.hasAttribute('aria-roledescription') && !elem.getAttribute('role')) {
            elem.removeAttribute('aria-roledescription');
        }
    });
}

function fixAriaRoles(nodes) {
    const validRoles = [
        'alert', 'button', 'checkbox', 'dialog', 'gridcell', 'link',
        'menu', 'menubar', 'menuitem', 'option', 'progressbar', 'radio',
        'scrollbar', 'slider', 'spinbutton', 'status', 'tab', 'tabpanel',
        'textbox', 'tooltip', 'tree', 'treeitem'
    ];

    nodes.forEach(node => {
        const elem = node.element;
        const role = elem.getAttribute('role');
        if (role && !validRoles.includes(role.toLowerCase())) {
            elem.removeAttribute('role');
        }
    });
}

function fixAriaText(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        if (elem.getAttribute('role') === 'text') {
            const focusables = elem.querySelectorAll('button, [href], input, select, textarea, [tabindex]');
            focusables.forEach(focusable => {
                focusable.removeAttribute('tabindex');
                focusable.setAttribute('aria-hidden', 'true');
            });
        }
    });
}

//20

// Rule Fix Implementations 21-30
function fixAriaToggleFieldName(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        if (['checkbox', 'switch'].includes(elem.getAttribute('role'))) {
            if (!elem.getAttribute('aria-label') && !elem.getAttribute('aria-labelledby')) {
                const label = elem.getAttribute('name') || 'Toggle control';
                elem.setAttribute('aria-label', label);
            }
        }
    });
}

function fixAriaTooltipName(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        if (elem.getAttribute('role') === 'tooltip' &&
            !elem.getAttribute('aria-label') &&
            !elem.textContent.trim()) {
            elem.textContent = 'Tooltip content - needs proper description';
        }
    });
}

function fixAriaTreeitemName(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        if (elem.getAttribute('role') === 'treeitem' &&
            !elem.getAttribute('aria-label') &&
            !elem.textContent.trim()) {
            elem.textContent = 'Tree item - needs label';
        }
    });
}

function fixAriaValidAttrValue(nodes) {
    const validValues = {
        'aria-invalid': ['true', 'false', 'grammar', 'spelling'],
        'aria-current': ['page', 'step', 'location', 'date', 'time', 'true', 'false']
    };

    nodes.forEach(node => {
        const elem = node.element;
        Array.from(elem.attributes).forEach(attr => {
            if (validValues[attr.name] && !validValues[attr.name].includes(attr.value)) {
                elem.setAttribute(attr.name, 'false'); // Safe default
            }
        });
    });
}

function fixAriaValidAttr(nodes) {
    const validAttrs = getValidAriaAttributes();
    nodes.forEach(node => {
        const elem = node.element;
        Array.from(elem.attributes).forEach(attr => {
            if (attr.name.startsWith('aria-') && !validAttrs.includes(attr.name)) {
                elem.removeAttribute(attr.name);
            }
        });
    });
}

function fixAudioCaption(nodes) {
    nodes.forEach(node => {
        const audio = node.element;
        if (audio.tagName === 'AUDIO' && !audio.querySelector('track[kind="captions"]')) {
            const track = document.createElement('track');
            track.kind = 'captions';
            track.label = 'English';
            track.srclang = 'en';
            track.src = 'data:text/vtt;base64,' + btoa('WEBVTT');
            audio.appendChild(track);
        }
    });
}

function fixAutocompleteValid(nodes) {
    const validValues = [
        'name', 'email', 'username', 'new-password', 'current-password',
        'one-time-code', 'tel', 'url', 'cc-name', 'cc-number'
    ];

    nodes.forEach(node => {
        const elem = node.element;
        if (elem.hasAttribute('autocomplete')) {
            const current = elem.getAttribute('autocomplete');
            if (!validValues.includes(current.split(' ')[0])) {
                elem.setAttribute('autocomplete', 'off');
            }
        }
    });
}

function fixAvoidInlineSpacing(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        const style = elem.getAttribute('style') || '';
        const spacingProps = ['letter-spacing', 'word-spacing', 'line-height'];

        spacingProps.forEach(prop => {
            if (style.includes(prop)) {
                const className = `auto-fixed-${prop.replace('-', '')}`;
                const value = style.match(new RegExp(`${prop}:\\s*([^;]+)`))[1];
                elem.style[prop] = '';
                elem.classList.add(className);
                // Inject style sheet if not already present
                if (!document.querySelector(`.${className}`)) {
                    const styleTag = document.createElement('style');
                    styleTag.textContent = `.${className} { ${prop}: ${value} !important; }`;
                    document.head.appendChild(styleTag);
                }
            }
        });
    });
}

function fixBlink(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        if (elem.tagName === 'BLINK') {
            const span = document.createElement('span');
            span.innerHTML = elem.innerHTML;
            span.style.animation = 'blink 1s step-end infinite';
            elem.parentNode.replaceChild(span, elem);

            // Add animation if not present
            if (!document.querySelector('style#blink-animation')) {
                const style = document.createElement('style');
                style.id = 'blink-animation';
                style.textContent = `@keyframes blink { 50% { opacity: 0; } }`;
                document.head.appendChild(style);
            }
        }
    });
}

function fixButtonName(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        if ((elem.tagName === 'BUTTON' || elem.getAttribute('role') === 'button') &&
            !elem.textContent.trim() &&
            !elem.getAttribute('aria-label')) {
            elem.setAttribute('aria-label', 'Button - needs accessible name');
        }
    });
}

//30

// Rule Fix Implementations 31-40
function fixBypass(nodes) {
    if (!document.getElementById('skip-navigation')) {
        const skipLink = document.createElement('a');
        skipLink.id = 'skip-navigation';
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.cssText = `
        position: absolute;
        left: -9999px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
        document.body.insertBefore(skipLink, document.body.firstChild);

        const mainContent = document.getElementById('main-content') || document.createElement('div');
        mainContent.id = 'main-content';
        mainContent.tabIndex = -1;
        document.body.appendChild(mainContent);
    }
}

function fixColorContrastEnhanced(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        elem.style.outline = '2px dashed #ff9800';
        elem.title = 'Low color contrast (enhanced check) - manual adjustment required';
    });
}

function fixColorContrast(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        const computedStyle = getComputedStyle(elem);
        const bgColor = computedStyle.backgroundColor;
        const textColor = computedStyle.color;

        elem.dataset.originalColors = JSON.stringify({
            bg: bgColor,
            text: textColor
        });

        // Apply temporary high contrast
        elem.style.backgroundColor = '#ffffff';
        elem.style.color = '#000000';
        elem.dataset.contrastFixed = 'true';
    });
}

function fixCssOrientationLock(nodes) {
    const orientationMedia = Array.from(document.styleSheets).flatMap(sheet => {
        try {
            return Array.from(sheet.cssRules).filter(rule =>
                rule.media && rule.media.mediaText.includes('orientation')
            );
        } catch {
            return [];
        }
    });

    orientationMedia.forEach(rule => {
        rule.media.deleteMedium('(orientation: portrait)');
        rule.media.deleteMedium('(orientation: landscape)');
    });
}

function fixDefinitionList(nodes) {
    document.querySelectorAll('dl').forEach(dl => {
        Array.from(dl.children).forEach(child => {
            if (!['DT', 'DD'].includes(child.tagName)) {
                const wrapper = document.createElement('div');
                wrapper.setAttribute('role', 'presentation');
                dl.replaceChild(wrapper, child);
                wrapper.appendChild(child);
            }
        });
    });
}

function fixDlitem(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        if (!elem.closest('dl')) {
            const dl = document.createElement('dl');
            elem.parentNode.insertBefore(dl, elem);
            dl.appendChild(elem);
        }
    });
}

function fixDocumentTitle(nodes) {
    if (!document.title) {
        const titleFromH1 = document.querySelector('h1')?.textContent;
        const titleFromContent = document.querySelector('main h1, article h1')?.textContent;
        document.title = titleFromH1 || titleFromContent || 'Untitled Document';
    }
}

function fixDuplicateIdActive(nodes) {
    const activeElements = ['a', 'button', 'input', 'select', 'textarea'];
    nodes.forEach(node => {
        const elem = node.element;
        if (activeElements.includes(elem.tagName.toLowerCase())) {
            elem.id = `${elem.id}-${Date.now()}`;
        }
    });
}

function fixDuplicateIdAria(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        const ariaRefs = ['aria-labelledby', 'aria-describedby'];
        ariaRefs.forEach(attr => {
            if (elem.hasAttribute(attr)) {
                const values = elem.getAttribute(attr).split(/\s+/);
                elem.setAttribute(attr, values.map(v => `${v}-fixed`).join(' '));
            }
        });
    });
}

function fixDuplicateId(nodes) {
    const idMap = new Map();
    nodes.forEach(node => {
        const elem = node.element;
        if (idMap.has(elem.id)) {
            elem.id = `${elem.id}-duplicate-${idMap.get(elem.id)}`;
        }
        idMap.set(elem.id, (idMap.get(elem.id) || 0) + 1);
    });
}

//40

// Rule Fix Implementations 41-50
function fixEmptyHeading(nodes) {
    nodes.forEach(node => {
        const heading = node.element;
        if (!heading.textContent.trim() && !heading.hasAttribute('aria-hidden')) {
            const level = heading.tagName.match(/H(\d)/i)?.[1] || '1';
            heading.textContent = `Heading ${level} placeholder`;
            heading.dataset.autoFixedHeading = true;
        }
    });
}

function fixEmptyTableHeader(nodes) {
    nodes.forEach(node => {
        const th = node.element;
        if (!th.textContent.trim() && th.closest('table')) {
            const columnIndex = Array.from(th.parentNode.children).indexOf(th) + 1;
            th.textContent = `Column ${columnIndex}`;
            th.dataset.autoFixedHeader = true;
        }
    });
}

function fixFocusOrderSemantics(nodes) {
    const validRoles = ['button', 'link', 'textbox', 'checkbox', 'radio', 'combobox'];
    nodes.forEach(node => {
        const elem = node.element;
        if (elem.tabIndex >= 0 && !validRoles.includes(elem.getAttribute('role'))) {
            elem.tabIndex = -1;
            elem.dataset.originalTabindex = elem.tabIndex;
        }
    });
}

function fixFormFieldMultipleLabels(nodes) {
    nodes.forEach(node => {
        const field = node.element;
        const labels = Array.from(document.querySelectorAll(`label[for="${field.id}"]`));
        if (labels.length > 1) {
            labels.slice(1).forEach(label => {
                label.parentNode.replaceChild(document.createTextNode(label.textContent), label);
            });
        }
    });
}

function fixFrameFocusableContent(nodes) {
    nodes.forEach(node => {
        const frame = node.element;
        if (frame.tabIndex === -1 &&
            frame.contentDocument?.querySelector('[tabindex]:not([tabindex="-1"]), a, button, input')) {
            frame.removeAttribute('tabindex');
            frame.dataset.autoFixedFrameFocus = true;
        }
    });
}

function fixFrameTested(nodes) {
    nodes.forEach(node => {
        const frame = node.element;
        if (frame.contentDocument && !frame.contentDocument.querySelector('[data-axe-injected]')) {
            const script = frame.contentDocument.createElement('script');
            script.src = chrome.runtime.getURL('axe.min.js');
            script.dataset.axeInjected = true;
            frame.contentDocument.head.appendChild(script);
        }
    });
}

function fixFrameTitleUnique(nodes) {
    const titles = new Set();
    nodes.forEach(node => {
        const frame = node.element;
        let title = frame.title || frame.getAttribute('aria-label');
        if (titles.has(title)) {
            title = `${title}-${performance.now()}`;
            frame.title = title;
            frame.dataset.autoFixedTitle = true;
        }
        titles.add(title);
    });
}

function fixFrameTitle(nodes) {
    nodes.forEach(node => {
        const frame = node.element;
        if (!frame.title && !frame.getAttribute('aria-label')) {
            frame.title = `Content frame - ${document.title}`;
            frame.dataset.autoFixedFrameTitle = true;
        }
    });
}

function fixHeadingOrder(nodes) {
    let lastLevel = 0;
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
        const currentLevel = parseInt(heading.tagName[1]);
        if (currentLevel > lastLevel + 1) {
            const newLevel = lastLevel + 1;
            const newHeading = document.createElement(`h${newLevel}`);
            newHeading.innerHTML = heading.innerHTML;
            heading.parentNode.replaceChild(newHeading, heading);
            lastLevel = newLevel;
        } else {
            lastLevel = currentLevel;
        }
    });
}

function fixHiddenContent(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        if (elem.offsetParent === null) {
            elem.dataset.originalAriaHidden = elem.getAttribute('aria-hidden');
            elem.setAttribute('aria-hidden', 'true');
        }
    });
}

//50

// Rule Fix Implementations 51-60
function fixHtmlHasLang(nodes) {
    const html = document.documentElement;
    if (!html.hasAttribute('lang')) {
        const lang = navigator.language || 'en';
        html.setAttribute('lang', lang.split('-')[0]);
        html.dataset.autoFixedLang = true;
    }
}

function fixHtmlLangValid(nodes) {
    const html = document.documentElement;
    const validPattern = /^[a-z]{2,3}(-[A-Z]{2})?$/;
    if (!validPattern.test(html.getAttribute('lang'))) {
        html.setAttribute('lang', 'en');
        html.dataset.autoFixedLangValid = true;
    }
}

function fixHtmlXmlLangMismatch(nodes) {
    const html = document.documentElement;
    const lang = html.getAttribute('lang');
    const xmlLang = html.getAttribute('xml:lang');

    if (lang && xmlLang && lang !== xmlLang) {
        html.setAttribute('xml:lang', lang);
        html.dataset.autoFixedXmlLang = true;
    }
}

function fixIdenticalLinksPurpose(nodes) {
    const linkMap = new Map();
    document.querySelectorAll('a[href]').forEach(link => {
        const key = link.textContent.trim().toLowerCase();
        if (linkMap.has(key)) {
            const ariaLabel = linkMap.get(key).getAttribute('aria-label');
            if (ariaLabel) {
                link.setAttribute('aria-label', ariaLabel);
                link.dataset.autoLinkedPurpose = true;
            }
        } else {
            linkMap.set(key, link);
        }
    });
}

function fixImageAlt(nodes) {
    nodes.forEach(node => {
        const img = node.element;
        if (!img.alt && !img.hasAttribute('aria-hidden')) {
            const descriptiveText = img.src.split('/').pop().split('.')[0];
            img.alt = `Image: ${descriptiveText.replace(/[-_]/g, ' ')}`;
            img.dataset.autoAlt = true;
        }
    });
}

function fixImageRedundantAlt(nodes) {
    const redundantTerms = ['image', 'picture', 'photo', 'graphic'];
    nodes.forEach(node => {
        const img = node.element;
        const alt = img.alt.toLowerCase();
        if (redundantTerms.some(term => alt.startsWith(term))) {
            img.alt = img.alt.replace(new RegExp(`^(${redundantTerms.join('|')})[.:]?\\s*`, 'i'), '');
            img.dataset.autoFixedRedundantAlt = true;
        }
    });
}

function fixInputButtonName(nodes) {
    nodes.forEach(node => {
        const input = node.element;
        if (input.type === 'button' && !input.value && !input.getAttribute('aria-label')) {
            input.value = 'Submit';
            input.dataset.autoFixedInputButton = true;
        }
    });
}

function fixInputImageAlt(nodes) {
    nodes.forEach(node => {
        const input = node.element;
        if (input.type === 'image' && !input.alt) {
            input.alt = 'Form submit button';
            input.dataset.autoFixedInputImage = true;
        }
    });
}

function fixLabelContentMismatch(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        const label = document.querySelector(`label[for="${elem.id}"]`);
        if (label && elem.getAttribute('aria-label') !== label.textContent) {
            elem.setAttribute('aria-label', label.textContent.trim());
            elem.dataset.autoFixedLabelMatch = true;
        }
    });
}

function fixLabelTitleOnly(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        const title = elem.getAttribute('title');
        if (title && !elem.labels?.length) {
            const label = document.createElement('label');
            label.textContent = title;
            label.htmlFor = elem.id;
            elem.insertAdjacentElement('beforebegin', label);
            elem.removeAttribute('title');
            elem.dataset.autoFixedLabelTitle = true;
        }
    });
}

//60

// Rule Fix Implementations 61-69
function fixLabel(nodes) {
    nodes.forEach(node => {
        const input = node.element;
        if (!input.id) {
            input.id = `input-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        }

        if (!document.querySelector(`label[for="${input.id}"]`)) {
            const label = document.createElement('label');
            label.htmlFor = input.id;
            label.textContent = input.placeholder || input.name || 'Input field';
            input.insertAdjacentElement('beforebegin', label);
            input.dataset.autoLabeled = true;
        }
    });
}

function fixLandmarkBanner(nodes) {
    const mainLandmarks = document.querySelectorAll('[role="main"], main');
    nodes.forEach(node => {
        const banner = node.element;
        if (Array.from(mainLandmarks).some(main => main.contains(banner))) {
            document.body.insertBefore(banner, document.body.firstChild);
            banner.dataset.autoMovedBanner = true;
        }
    });
}

function fixLandmarkComplementary(nodes) {
    nodes.forEach(node => {
        const comp = node.element;
        if (comp.closest('[role="region"], [role="main"]')) {
            document.body.appendChild(comp);
            comp.dataset.autoMovedComplementary = true;
        }
    });
}

function fixLandmarkContentinfo(nodes) {
    nodes.forEach(node => {
        const footer = node.element;
        if (footer.closest('[role="main"]')) {
            document.body.appendChild(footer);
            footer.dataset.autoMovedContentinfo = true;
        }
    });
}

function fixLandmarkMain(nodes) {
    nodes.forEach(node => {
        const main = node.element;
        if (main.closest('[role="region"], [role="banner"]')) {
            document.body.appendChild(main);
            main.dataset.autoMovedMain = true;
        }
    });
}

function fixLandmarkDuplicateBanner(nodes) {
    const banners = document.querySelectorAll('[role="banner"]');
    if (banners.length > 1) {
        Array.from(banners).slice(1).forEach(banner => {
            banner.setAttribute('role', 'region');
            banner.dataset.originalRole = 'banner';
        });
    }
}

function fixLandmarkDuplicateContentinfo(nodes) {
    const footers = document.querySelectorAll('[role="contentinfo"]');
    if (footers.length > 1) {
        Array.from(footers).slice(1).forEach(footer => {
            footer.setAttribute('role', 'region');
            footer.dataset.originalRole = 'contentinfo';
        });
    }
}

function fixLandmarkOneMain(nodes) {
    const mains = document.querySelectorAll('[role="main"], main');
    if (mains.length === 0) {
        const main = document.createElement('main');
        main.innerHTML = document.body.innerHTML;
        document.body.innerHTML = '';
        document.body.appendChild(main);
        main.dataset.autoCreatedMain = true;
    }
}

function fixLandmarkUnique(nodes) {
    const landmarkCounts = new Map();
    document.querySelectorAll('[role]').forEach(landmark => {
        const role = landmark.getAttribute('role');
        const name = landmark.getAttribute('aria-label') || landmark.textContent;
        const key = `${role}-${name}`;

        if (landmarkCounts.has(key)) {
            const newName = `${name}-${landmarkCounts.get(key) + 1}`;
            landmark.setAttribute('aria-label', newName);
            landmark.dataset.autoRenamedLandmark = true;
        }
        landmarkCounts.set(key, (landmarkCounts.get(key) || 0) + 1);
    });
}

//68

// For link-name (rule 69)
function fixLinkName(nodes) {
    nodes.forEach(node => {
        const link = node.element;
        if (link.tagName === 'A' && !link.textContent.trim() && !link.getAttribute('aria-label')) {
            const href = link.getAttribute('href') || '';
            link.setAttribute('aria-label', `Link to ${href.split('/').pop().replace(/-/g, ' ')}`);
            link.dataset.autoFixedLinkName = true;
        }
    });
}

// For page-has-heading-one (rule 70)
function fixPageHasHeadingOne() {
    if (!document.querySelector('h1')) {
        const h1 = document.createElement('h1');
        h1.textContent = document.title || 'Main page heading';
        document.body.prepend(h1);
        h1.dataset.autoCreatedHeading = true;
    }
}

// For region (rule 71)
function fixRegion(nodes) {
    nodes.forEach(node => {
        const elem = node.element;
        if (elem.getAttribute('role') === 'region' && !elem.getAttribute('aria-label')) {
            const label = elem.querySelector('h2, h3')?.textContent || 'Content region';
            elem.setAttribute('aria-label', label);
            elem.dataset.autoFixedRegion = true;
        }
    });
}

// Add to ruleFixes object
Object.assign(window.ruleFixes, {
    'link-name': fixLinkName,
    'page-has-heading-one': fixPageHasHeadingOne,
    'region': fixRegion
});



// Helper Functions
function getValidAriaAttributes() {
    // Simplified list of valid ARIA 1.2 attributes
    return [
        'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden',
        'aria-disabled', 'aria-checked', 'aria-expanded', 'aria-haspopup',
        'aria-level', 'aria-modal', 'aria-multiline', 'aria-multiselectable',
        'aria-orientation', 'aria-placeholder', 'aria-readonly', 'aria-required',
        'aria-selected', 'aria-sort', 'aria-valuemax', 'aria-valuemin',
        'aria-valuenow', 'aria-valuetext', 'aria-busy', 'aria-live',
        'aria-relevant', 'aria-atomic', 'aria-dropeffect', 'aria-grabbed',
        'aria-activedescendant', 'aria-colcount', 'aria-colindex',
        'aria-colspan', 'aria-controls', 'aria-errormessage', 'aria-flowto',
        'aria-owns', 'aria-posinset', 'aria-rowcount', 'aria-rowindex',
        'aria-rowspan', 'aria-setsize', 'aria-details', 'aria-keyshortcuts'
    ];
}

function getAllowedRoles(tagName) {
    const roleMap = {
        'BUTTON': ['button', 'checkbox', 'menuitem', 'radio', 'switch'],
        'A': ['link', 'button', 'menuitem'],
        'INPUT': ['textbox', 'checkbox', 'radio', 'spinbutton', 'searchbox'],
        'UL': ['list', 'menu', 'tree'],
        'OL': ['list'],
        'LI': ['listitem', 'menuitem', 'treeitem'],
        'DIV': ['alert', 'dialog', 'status', 'timer', 'tooltip']
    };
    return roleMap[tagName.toUpperCase()] || [];
}

function getRoleAllowedAttributes(role) {
    const attributeMap = {
        'button': ['aria-disabled', 'aria-expanded', 'aria-haspopup'],
        'link': ['aria-disabled', 'aria-expanded'],
        'dialog': ['aria-modal', 'aria-labelledby', 'aria-describedby'],
        'alert': ['aria-live', 'aria-atomic'],
        'menu': ['aria-activedescendant', 'aria-orientation']
    };
    return attributeMap[role] || [];
}

// Message Listener
window.addEventListener('message', (event) => {
    if (event.data.type === 'APPLY_AXE_FIXES') {
        applyFixes(event.data.violations);
    }
});
