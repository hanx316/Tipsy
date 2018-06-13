class Tipsy {
  constructor(element, options) {
    this.$element = element
    this.options = options
    this.enabled = true
    this.fixTitle()
  }

  show() {
    let title = this.getTitle()
    if (!title || !this.enabled) return
    let $tip = this.tip()
    let $existed = document.querySelector('.tipsy')
    let $body = document.querySelector('body')
    let $inner = $tip.querySelector('.tipsy-inner')
    let $arrow = $tip.querySelector('.tipsy-arrow')
    let originalCss = 'top: 0; left: 0; visibility: hidden; display: block;'
    this.options.html ? $inner.innerHTML = title : $inner.textContent = title
    $tip.className = 'tipsy' // reset classname in case of dynamic gravity
    $existed && $existed.remove(1)
    $tip.style.cssText = originalCss
    $body.insertBefore($tip, $body.firstChild)

    let pos = this.getPosition(this.$element)
    let actualWidth = $tip.offsetWidth
    let actualHeight = $tip.offsetHeight
    let gravity = this.maybeCall(this.options.gravity, this.$element)

    let realPos
    switch (gravity.charAt(0)) {
      case 'n':
        realPos = {
          top: pos.top + pos.height + this.options.offset,
          left: pos.left + pos.width / 2 - actualWidth / 2
        }
        break
      case 's':
        realPos = {
          top: pos.top - actualHeight - this.options.offset,
          left: pos.left + pos.width / 2 - actualWidth / 2
        }
        break
      case 'e':
        realPos = {
          top: pos.top + pos.height / 2 - actualHeight / 2,
          left: pos.left - actualWidth - this.options.offset
        }
        break
      case 'w':
        realPos = {
          top: pos.top + pos.height / 2 - actualHeight / 2,
          left: pos.left + pos.width + this.options.offset
        }
        break
    }

    if (gravity.length == 2) {
      if (gravity.charAt(1) == 'w') {
        realPos.left = pos.left + pos.width / 2 - 15;
      } else {
        realPos.left = pos.left + pos.width / 2 - actualWidth + 15;
      }
    }

    $tip.style.cssText = originalCss.replace('top: 0; left: 0;', `top: ${realPos.top}px; left: ${realPos.left}px;`)
    $tip.classList.add(`tipsy-${gravity}`)
    $arrow.className = `tipsy-arrow tipsy-arrow-${gravity.charAt(0)}`

    if (this.options.className) {
      $tip.classList.add(this.maybeCall(this.options.className, this.$element))
    }
    if (this.options.fade) {
      let opacity = this.options.opacity
      $tip.style.visibility = 'visible'
      $tip.style.opacity = 0
      clearTimeout($tip.timer)
      $tip.timer = setTimeout(() => { animate(1) }, 30)
      function animate(i) {
        if (i < opacity * 10) {
          $tip.style.opacity = i / 10
          i++
          $tip.timer = setTimeout(() => { animate(i) }, 30)
        }
      }
    } else {
      $tip.style.visibility = 'visible'
      $tip.style.opacity = this.options.opacity
    }
  }

  hide() {
    let $tip = this.tip()
    if (this.options.fade) {
      let opatity = $tip.style.opacity
      clearTimeout($tip.timer)
      $tip.timer = setTimeout(() => { animate(opatity * 10) }, 30)
      function animate(i) {
        if (i > 0) {
          i--
          $tip.style.opacity = i / 10
          $tip.timer = setTimeout(() => { animate(i) }, 30)
        } else if (i === 0) {
          $tip.remove()
        }
      }
    } else {
      $tip.remove()
    }
  }

  tip() {
    if (!this.$tip) {
      let div = document.createElement('div')
      div.className = 'tipsy'
      div.innerHTML = '<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>'
      this.$tip = div
      this.$tip['tipsy-pointee'] = this.$element
    }
    return this.$tip
  }

  fixTitle() {
    let $e = this.$element
    if ($e.getAttribute('title') || typeof ($e.getAttribute('original-title')) !== 'string') {
      $e.setAttribute('original-title', $e.getAttribute('title') || '')
      $e.removeAttribute('title')
    }
  }

  getTitle() {
    let title
    let $e = this.$element
    let o = this.options
    this.fixTitle()
    if (typeof o.title === 'string') {
      title = $e.getAttribute(o.title === 'title' ? 'original-title' : o.title)
    } else if (typeof o.title === 'function') {
      title = o.title.call($e)
    }
    title = ('' + title).replace(/(^\s*|\s*$)/, '')
    return title || o.fallback
  }

  getPosition(e) {
    let doc = document.documentElement
    let box = e.getBoundingClientRect()
    return {
      top: box.top + doc.scrollTop,
      left: box.left + doc.scrollLeft,
      width: e.offsetWidth,
      height: e.offsetHeight
    }
  }

  // validate() {
  //   if (!this.$element[0].parentNode) {
  //     this.hide()
  //     this.$element = null
  //     this.options = null
  //   }
  // }

  maybeCall(thing, ctx) { return (typeof thing == 'function') ? (thing.call(ctx)) : thing }
  enable() { this.enabled = true }
  disable() { this.enabled = false }
  toggleEnabled() { this.enabled = !this.enabled }
}

export default function(selector, options) {
  let defaultOps = {
    className: null,
    delayIn: 0,
    delayOut: 0,
    fade: false,
    fallback: '',
    gravity: 'n',
    html: false,
    offset: 0,
    opacity: 0.8,
    title: 'title',
    trigger: 'hover'
  }
  let nodes = Array.from(document.querySelectorAll(selector))
  let eventIn = ''
  let eventOut = ''
  options = Object.assign({}, defaultOps, options)
  nodes.forEach(node => {
    getTipsy(node)
    if (!eventIn || !eventOut) {
      eventIn  = options.trigger == 'hover' ? 'mouseenter' : 'focus'
      eventOut = options.trigger == 'hover' ? 'mouseleave' : 'blur'
    }
    if (options.trigger != 'manual') {
      node.addEventListener(eventIn, enter)
      node.addEventListener(eventOut, leave)
    }
  })

  function getTipsy(node) {
    if (!node.tipsy) {
      node.tipsy = new Tipsy(node, options)
    }
    return node.tipsy
  }

  function enter() {
    let tipsy = getTipsy(this)
    tipsy.hoverState = 'in'
    if (options.delayIn == 0) {
      tipsy.show()
    } else {
      tipsy.fixTitle()
      setTimeout(() => {
        if (tipsy.hoverState === 'in') tipsy.show()
      }, options.delayIn)
    }
  }

  function leave() {
    let tipsy = getTipsy(this)
    tipsy.hoverState = 'out'
    if (options.delayOut == 0) {
      tipsy.hide()
    } else {
      setTimeout(() => {
        if (tipsy.hoverState === 'out') tipsy.hide()
      }, options.delayOut)
    }
  }

  return nodes
}
