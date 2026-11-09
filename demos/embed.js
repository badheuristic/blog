// Include in a demo page (<script src="../embed.js"></script>) so it can sit inside a
// post: it takes the blog's theme from the page around it, and reports its height so the
// frame grows to fit instead of scrolling inside. Opened on its own, it does nothing.
;(function () {
  if (window.parent === window) return

  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !e.data || e.data.type !== 'blog:theme') return
    document.documentElement.dataset.theme = e.data.theme
  })

  var last = 0
  var report = function () {
    var height = Math.ceil(document.documentElement.scrollHeight)
    if (height === last) return
    last = height
    window.parent.postMessage({ type: 'blog:height', height: height }, location.origin)
  }
  new ResizeObserver(report).observe(document.documentElement)
  window.addEventListener('load', report)
  window.parent.postMessage({ type: 'blog:ready' }, location.origin)
})()
