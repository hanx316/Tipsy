# Tipsy
Facebook-style tooltips plugin that rewrited from https://github.com/jaz303/tipsy with plain JavaScript

最近迁移一个旧项目到vue写的新项目上，老项目用到了tipsy这个jquery插件。

由于PM需要原样移植，而我又不想为了这一个功能在新项目引入jquery，看了下那个插件的源码比较简单，于是干脆就拿来用原生JS重新改写了，样式还是沿用那个插件的～

#### 使用

```js
import tipsy from './tipsy'

tipsy(selector[String], options[Object])
```