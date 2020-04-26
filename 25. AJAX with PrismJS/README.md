---
title: 'Make PrismJS editable'
tags: ['javascript', 'ajax', 'prismjs']
license: 'public-domain'
published: false
cover_image: 'images/cover.jpg'
---

In this article, we will go over how you can make PrismJS code blocks editable and force PrismJS to re-render so the code
blocks will be syntax highlighted again.

## index.html

So our HTML will look something like this.

```html
<head>
  <link
    rel="stylesheet"
    type="text/css"
    href="stylesheets/prism.css"
    rel="stylesheet"
  />
</head>
...

<pre
  onPaste="setTimeout(function() {onPaste();}, 0)"
  id="editable"
  contenteditable
>
  <code id="yaml" class="language-yaml"></code>
</pre>
<script src="javascript/prism.js"></script>
```

## Appendix

- [Source Code](https://gitlab.com/hmajid2301/articles/-/blob/master/23.%20React%20Hooks%2C%20Context%20%26%20Local%20Storage/source_code)