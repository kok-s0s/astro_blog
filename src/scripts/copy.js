const copyIcon = `
  <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" class="octicon">
    <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
    <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
  </svg>
`

const checkIcon = `
  <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" class="octicon">
    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
  </svg>
`

const languageNames = {
  bash: 'Shell',
  shell: 'Shell',
  sh: 'Shell',
  zsh: 'Shell',
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  cpp: 'C++',
  cxx: 'C++',
  c: 'C',
  cmake: 'CMake',
  py: 'Python',
  python: 'Python',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  md: 'Markdown',
  markdown: 'Markdown',
  html: 'HTML',
  css: 'CSS',
  astro: 'Astro',
}

function addCopyButtonToPreElements() {
  document.querySelectorAll('pre').forEach((pre) => {
    if (pre.dataset.copyReady) return
    pre.dataset.copyReady = 'true'

    const code = pre.querySelector('code')
    const language = getLanguageLabel(code)
    const wrapper = document.createElement('div')
    wrapper.className = 'code-block'

    const header = document.createElement('div')
    header.className = 'code-block-header'

    const label = document.createElement('span')
    label.className = 'code-block-lang'
    label.textContent = language

    const copyButton = document.createElement('button')
    copyButton.className = 'code-copy-button'
    copyButton.type = 'button'
    copyButton.setAttribute('aria-label', '复制代码')
    copyButton.innerHTML = `${copyIcon}<span>Copy</span>`

    pre.insertAdjacentElement('beforebegin', wrapper)
    wrapper.appendChild(header)
    wrapper.appendChild(pre)
    header.appendChild(label)
    header.appendChild(copyButton)

    copyButton.addEventListener('click', async () => {
      await copyToClipboard(pre.textContent ?? '')
      copyButton.classList.add('copied')
      copyButton.innerHTML = `${checkIcon}<span>Copied</span>`

      setTimeout(() => {
        copyButton.classList.remove('copied')
        copyButton.innerHTML = `${copyIcon}<span>Copy</span>`
      }, 1200)
    })
  })
}

function getLanguageLabel(code) {
  if (!code) return 'Code'

  const languageClass = Array.from(code.classList).find((className) => className.startsWith('language-'))
  const raw = languageClass?.replace('language-', '') || ''
  return languageNames[raw.toLowerCase()] || raw.toUpperCase() || 'Code'
}

async function copyToClipboard(content) {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(content)
      return
    } catch (error) {
      console.error('Copying to clipboard failed:', error)
    }
  }

  const textArea = document.createElement('textarea')
  textArea.value = content
  textArea.style.position = 'fixed'
  textArea.style.opacity = '0'
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

document.addEventListener('astro:page-load', addCopyButtonToPreElements)
addCopyButtonToPreElements()
