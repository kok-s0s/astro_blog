;[...document.getElementsByTagName('pre')].forEach((item) => {
  item.style.position = 'relative'
  let copyButton = document.createElement('button')
  copyButton.style.cssText =
    'position: relative; right: 1rem; z-index: 555 !important; float: right; border: none; border-radius: 8px; padding: 6px 8px; margin-bottom: -1rem; font-size: 1.1rem; font-weight: bold; letter-spacing: 1px; cursor: pointer; background-color: #002b36; color: #808080'
  if (window.screen.width < 636) {
    copyButton.style.cssText = 'display: none;'
    item.style.marginTop = '0.5rem'
  } else {
    item.style.marginTop = '0'
  }

  copyButton.innerHTML = 'Copy'
  copyButton.onclick = function () {
    let copyData = item.firstChild.innerText
    copyToClipboard(copyData)
    copyButton.innerHTML = 'Done'
    setTimeout(function () {
      copyButton.innerHTML = 'Copy'
    }, 1000)
  }
  item.insertAdjacentElement('beforebegin', copyButton)
})

function copyToClipboard(content) {
  if (window.clipboardData) {
    window.clipboardData.setData('text', content)
  } else {
    ;(function (content) {
      document.oncopy = function (e) {
        e.clipboardData.setData('text', content)
        e.preventDefault()
        document.oncopy = null
      }
    })(content)
    document.execCommand('Copy')
  }
}
