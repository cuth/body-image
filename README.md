Body Image
==========

Zoom into the page to view the image close up rather than pulling the image off the page.

Requires jQuery and a modern browser.

Wrap an image element with a anchor element with an href to a larger version of the same image. Use data-width and data-height attributes on the anchor tag to give the image a maximum size.
```html
<a class="examples" href="img/example2-large.jpg" data-width="612">
    <img src="img/example2-small.jpg" alt="">
</a>
```

This first parameter is a jQuery collection of anchor elements. Use the second parameter to change the default options.
```js
var example1 = new BodyImage('.examples', {
    useArrowKeys: false,
    windowLoad: true
});
```