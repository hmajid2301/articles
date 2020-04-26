---
title: 'Make PrismJS editable'
tags: ['javascript', 'ajax', 'prismjs']
license: 'public-domain'
published: false
cover_image: 'images/cover.jpg'
---

In this article, we will go over how you can make PrismJS code blocks editable and force PrismJS to re-render so the code
blocks will be syntax highlighted again.

## Introduction

[PrismJS](https://prismjs.com/) can be used to add syntax highlighting to code blocks on our website. For a persona
project of mine, [composersiation](composerisation.haseebmajid.dev/) #ShamelessPlug :plug:, I needed to allow the user
to paste in their own (docker-compose) yaml files. So let's take a look how we can let a user to first edit a code block
and then re-run PrismJS to add syntax highlighting.

## index.html

So our HTML will look something like this. 

> Note: When I refer to "code block" I am referring to entire thing including the `pre` and the `code` tags.

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
In this file we import the `prism.css` stylesheet, there are many themes you can choose
from in this example we will use the default theme. We will also import `prism.js`, these are the two files required to use PrismJS.

```html
<pre
  onPaste="setTimeout(function() {onPaste();}, 0)"
  id="editable"
  contenteditable
>
  <code id="yaml" class="language-yaml"></code>
</pre>
```

Next we create the code block on web page. Not the class on the `code` tag is `language-yaml`. To use PrismJS we
need to give the `code` a tag a class of `language-x` where x is the language we want syntax highlighting for.
You can find a full list of [supported languages here](https://prismjs.com/#supported-languages).

To allow users to paste and edit the code block we add `contenteditable` to the `pre` tag. The reason we add it to the `pre`
tag and not the `code` tag is, when PrismJS has run it will edit the `code` block to include `span`'s and other html elements,
to do the syntax highlighting it makes it a lot harder for the user to copy and paste when you edit the `code` tag as a pose to
`pre` tag. The `pre` tag also has `onPaste="setTimeout(function() {onPaste();}, 0)"` this means that after the user has pasted
into the `pre` tag this function will be called. In this case we call a function called `onPaste()`. However we use a `setTimeout`,
so that the browser has enough time to update the `pre` tag, else the `pre`/`code` tags will still contain the previous text before
the paste.

## JavaScript

Now the user can paste directly into the code block. How do we force a re-render ? Let's take a look at `onPaste` function which
is called everytime the user paste's into our code block.

```js
function onPaste() {
  const editable = document.getElementById("editable");
  const dockerCompose = editable.innerText;
  editable.innerHTML = '<code id="yaml" class="language-yaml"></code>';
  const yaml = document.getElementById("yaml");
  yaml.innerHTML = Prism.highlight(
    dockerCompose,
    Prism.languages.yaml,
    "yaml"
  );
}
```

So first we get the `editable` element (our `pre` tag). Next we get the innerText of said element. This should be the new content
the user wants to paste into the `pre` tag. Sometimes when you copy/paste into the code block the old `code` tag get's deleted
so just in case we add the `code` tag back in. As this is where PrismJS will render our "new" yaml "code" in. This is done like so
`editable.innerHTML = '<code id="yaml" class="language-yaml"></code>';`, this code replaces all the "children" of the `pre` tag
with this new code block. Next we get the `code` tag with id `yaml`.

```js
yaml.innerHTML = Prism.highlight(
    dockerCompose,
    Prism.languages.yaml,
    "yaml"
  );
```

Finally the main part of our code which actually highlights our code. We pass the newly pasted yaml it's stored in `dockerCompose`
variable. Next we tell Prism what langauge to use `Prism.languages.yaml` (this is the language grammar0 and finally we pass the
language name in this case yaml. Then we set this as the `innerHTML` of the `code` tag. 

That's it! Now when the user paste's in new yaml code, it'll be automatically syntax highlighted by PrismJS. This process
can of course, also be used for AJAX content as well. If you make an API request and the API responds with code that needs
to be syntax highlighted.

> Note: The code in this project isn't particularly clean, it's mostly all in one file. This is just to make the example a bit easier to follow in reality you would likely split this into multiple files.

## Appendix

- [Example Project](https://composerisation.haseebmajid.dev/#yaml)
