function addCopyButtonToPreElements() {
  const preElements = document.getElementsByTagName('pre')

  for (let item of preElements) {
    const copyButton = document.createElement('button')
    copyButton.style.cssText =
      'position: absolute; right: 1rem; top: 1rem; z-index: 555 !important; border-color: rgba(205,217,229,0.1); padding: 0; border-radius: 6px; cursor: pointer; background-color: #2e3440;'

    if (window.screen.width < 636) {
      copyButton.style.display = 'none'
    }

    copyButton.innerHTML = `<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-copy js-clipboard-copy-icon m-2">
                              <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
                              <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
                            </svg>`

    item.insertAdjacentElement('afterend', copyButton)

    copyButton.addEventListener('click', () => {
      const copyData = item.textContent
      copyToClipboard(copyData)

      copyButton.innerHTML = `<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-check js-clipboard-check-icon color-fg-success m-2 d-none">
                                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
                              </svg>`

      setTimeout(() => {
        copyButton.innerHTML = `<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-copy js-clipboard-copy-icon m-2">
                                  <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
                                  <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
                                </svg>`
      }, 1000)
    })

    const copyComponent = document.createElement('div')
    copyComponent.style.cssText = 'position: relative;'
    item.insertAdjacentElement('beforebegin', copyComponent)

    copyComponent.appendChild(item)
    copyComponent.appendChild(copyButton)
  }
}

function copyToClipboard(content) {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(content)
      .then(() => {})
      .catch((error) => {
        console.error('Copying to clipboard failed:', error)
      })
  } else {
    const textArea = document.createElement('textarea')
    textArea.value = content
    textArea.style.position = 'fixed'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand('copy')
    } catch (error) {
      console.error('Copying to clipboard failed:', error)
    }

    document.body.removeChild(textArea)
  }
}

addCopyButtonToPreElements()
