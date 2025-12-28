/**
 * Content Script - Injected into web pages
 * Detects login forms and handles autofill
 */

import browser from 'webextension-polyfill'

console.log('PassKeyPer content script loaded')

// Detect login forms on page
function detectLoginForms() {
    const forms = document.querySelectorAll('form')
    const loginForms: HTMLFormElement[] = []

    forms.forEach((form) => {
        const hasPasswordField = form.querySelector('input[type="password"]')
        const hasUsernameField = form.querySelector('input[type="email"], input[type="text"], input[autocomplete="username"]')

        if (hasPasswordField && hasUsernameField) {
            loginForms.push(form)
        }
    })

    return loginForms
}

// Add PassKeyPer icon to password fields
function addPassKeyPerIcons() {
    const passwordFields = document.querySelectorAll<HTMLInputElement>('input[type="password"]')

    passwordFields.forEach((field) => {
        // Skip if already has icon
        if (field.dataset.passkeyper === 'true') return

        field.dataset.passkeyper = 'true'

        // Create icon
        const icon = document.createElement('div')
        icon.className = 'passkeyper-icon'
        icon.innerHTML = '🔐'
        icon.title = 'Fill with PassKeyPer (Ctrl+Shift+L)'
        icon.style.cssText = `
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      font-size: 16px;
      z-index: 999999;
      user-select: none;
    `

        // Position relative to field
        const wrapper = document.createElement('div')
        wrapper.style.position = 'relative'
        wrapper.style.display = 'inline-block'
        wrapper.style.width = field.offsetWidth + 'px'

        field.parentNode?.insertBefore(wrapper, field)
        wrapper.appendChild(field)
        wrapper.appendChild(icon)

        // Handle click
        icon.addEventListener('click', () => {
            showAutofillMenu(field)
        })
    })
}

// Show autofill menu
function showAutofillMenu(field: HTMLInputElement) {
    console.log('Show autofill menu for', field)

    // TODO: Get credentials from background script
    browser.runtime.sendMessage({
        type: 'GET_CREDENTIALS',
        payload: { url: window.location.href }
    }).then((response) => {
        if (response.credentials && response.credentials.length > 0) {
            // Show menu with credentials
            createAutofillMenu(field, response.credentials)
        } else {
            // No credentials found
            alert('No credentials found for this site')
        }
    })
}

// Create autofill menu
function createAutofillMenu(field: HTMLInputElement, credentials: any[]) {
    // Remove existing menu
    const existing = document.querySelector('.passkeyper-menu')
    if (existing) existing.remove()

    // Create menu
    const menu = document.createElement('div')
    menu.className = 'passkeyper-menu'
    menu.style.cssText = `
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 999999;
    min-width: 200px;
  `

    // Position below field
    const rect = field.getBoundingClientRect()
    menu.style.left = rect.left + 'px'
    menu.style.top = (rect.bottom + 5) + 'px'

    // Add credentials
    credentials.forEach((cred) => {
        const item = document.createElement('div')
        item.style.cssText = `
      padding: 8px 12px;
      cursor: pointer;
      border-bottom: 1px solid #eee;
    `
        item.textContent = cred.username || cred.email

        item.addEventListener('click', () => {
            fillCredentials(field, cred)
            menu.remove()
        })

        item.addEventListener('mouseenter', () => {
            item.style.background = '#f0f0f0'
        })

        item.addEventListener('mouseleave', () => {
            item.style.background = 'white'
        })

        menu.appendChild(item)
    })

    document.body.appendChild(menu)

    // Close on outside click
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target as Node)) {
                menu.remove()
                document.removeEventListener('click', closeMenu)
            }
        })
    }, 0)
}

// Fill credentials
function fillCredentials(passwordField: HTMLInputElement, credentials: any) {
    const form = passwordField.closest('form')
    if (!form) return

    // Find username field
    const usernameField = form.querySelector<HTMLInputElement>(
        'input[type="email"], input[type="text"], input[autocomplete="username"]'
    )

    if (usernameField) {
        usernameField.value = credentials.username || credentials.email
        usernameField.dispatchEvent(new Event('input', { bubbles: true }))
        usernameField.dispatchEvent(new Event('change', { bubbles: true }))
    }

    passwordField.value = credentials.password
    passwordField.dispatchEvent(new Event('input', { bubbles: true }))
    passwordField.dispatchEvent(new Event('change', { bubbles: true }))
}

// Listen for messages from background script
browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'SHOW_AUTOFILL') {
        const passwordField = document.querySelector<HTMLInputElement>('input[type="password"]')
        if (passwordField) {
            showAutofillMenu(passwordField)
        }
    }
})

// Initialize
setTimeout(() => {
    addPassKeyPerIcons()

    const loginForms = detectLoginForms()
    if (loginForms.length > 0) {
        console.log('Found', loginForms.length, 'login forms')

        // Check if we have credentials
        browser.runtime.sendMessage({
            type: 'CHECK_LOGIN_FORM',
            payload: { url: window.location.href }
        })
    }
}, 1000)

// Form submission detection for auto-save
function setupFormAutoSave() {
    const forms = detectLoginForms()

    forms.forEach(form => {
        // Skip if already setup
        if (form.dataset.passkeyperAutosave === 'true') return
        form.dataset.passkeyperAutosave = 'true'

        // Listen for form submission
        form.addEventListener('submit', async (e) => {
            // Extract credentials
            const usernameField = form.querySelector<HTMLInputElement>(
                'input[type="email"], input[type="text"], input[autocomplete="username"]'
            )
            const passwordField = form.querySelector<HTMLInputElement>('input[type="password"]')

            if (usernameField && passwordField && passwordField.value) {
                const credentials = {
                    url: window.location.href,
                    username: usernameField.value,
                    password: passwordField.value,
                    domain: window.location.hostname
                }

                // Show save prompt
                showSavePrompt(credentials)
            }
        })
    })
}

// Show save credentials prompt
function showSavePrompt(credentials: any) {
    // Remove existing prompt
    const existing = document.querySelector('.passkeyper-save-prompt')
    if (existing) existing.remove()

    // Create prompt
    const prompt = document.createElement('div')
    prompt.className = 'passkeyper-save-prompt'
    prompt.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 999999;
        min-width: 300px;
        animation: slideIn 0.3s ease-out;
    `

    prompt.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">
            🔐 Save Password for ${credentials.domain}?
        </div>
        <div style="font-size: 12px; opacity: 0.9; margin-bottom: 12px;">
            Username: ${credentials.username}
        </div>
        <div style="display: flex; gap: 8px;">
            <button id="passkeyper-save-yes" style="
                flex: 1;
                padding: 6px 12px;
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                border-radius: 4px;
                color: white;
                cursor: pointer;
                font-weight: 500;
                font-size: 12px;
            ">Save</button>
            <button id="passkeyper-save-no" style="
                padding: 6px 12px;
                background: transparent;
                border: 1px solid rgba(255,255,255,0.3);
                border-radius: 4px;
                color: white;
                cursor: pointer;
                font-size: 12px;
            ">Not Now</button>
        </div>
    `

    // Add animation
    const style = document.createElement('style')
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `
    document.head.appendChild(style)

    document.body.appendChild(prompt)

    // Handle save
    document.getElementById('passkeyper-save-yes')?.addEventListener('click', () => {
        browser.runtime.sendMessage({
            type: 'SAVE_CREDENTIALS',
            payload: credentials
        }).then(() => {
            // Show success
            prompt.innerHTML = `
                <div style="text-align: center; padding: 8px;">
                    <div style="font-size: 24px; margin-bottom: 4px;">✓</div>
                    <div style="font-size: 12px;">Password Saved!</div>
                </div>
            `
            setTimeout(() => prompt.remove(), 2000)
        })
    })

    // Handle dismiss
    document.getElementById('passkeyper-save-no')?.addEventListener('click', () => {
        prompt.remove()
    })

    // Auto-dismiss after 15 seconds
    setTimeout(() => {
        if (document.body.contains(prompt)) {
            prompt.remove()
        }
    }, 15000)
}

// Setup auto-save on forms
setTimeout(() => {
    setupFormAutoSave()
}, 1500)

// Watch for dynamically added forms
const observer = new MutationObserver(() => {
    addPassKeyPerIcons()
    setupFormAutoSave()
})

observer.observe(document.body, {
    childList: true,
    subtree: true
})

export { }
