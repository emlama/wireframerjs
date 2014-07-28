# Straight forward HTML/CSS Prototypes

WireframerJS is a framework that aims to make html/css wireframes easy, flexible, and documentable. It's loosely based on 8SBlocks, PaternLab by Brad Frost, Meteor.js, and Jekyll.

## Why use WireframerJS?

When I would prototype with Jekyll, I really appreciated the ability to define layouts, fill pages with data, and have multiple components. 8SBlocks sort of does this but requires a lot of configuration and a lot of hard to remember markup. Wireframer combines the best of both worlds.

## Quick start
Open your terminal and navigate to where you would like your new project to be. Type this in:

```bash
$ wireframer create myapp
$ cd myapp
$ wireframer
=> Wireframer server running on: http://localhost:3000/
```

## Building your prototype

First off, you can put `.html, .js, and .css/scss/less` files wherever you want in your project. Folders, subfolders and out in the open–wireframer doesn't care. Moreover, wireframer uses Handlebars.js so you can use everything included in that framework.

There are three types of HTML that you can write:

### Layouts
These are special files that allow you to reuse similar layouts throughout your prototype. You tell your pages which layout to use and then the Page content will be inserted where you have a `{{> yield}}` statement in your layout file.

### Pages
These are the actual pages that people will see throughout your site. You can build them with or without a layout and components but doing so will reduce the amount of copying you have to do.

```html
<page layout="default" name="pageName">
  {{page content}}
  {{> componentToInclude}}
</page>
```

### Templates
Think of these as components (Blocks), masters (Axure), or includes (Jekyll). Write them once and include them anywhere.

Additionally, you can specify variations for templates. You do that like this:

```html
<template name="nav">
  <variation name="default">
    <nav>
      <h1>Prototype</h1>
      <ul>
        <li><a href="">Home</a></li>
        <li><a href="">About</a></li>
        <li><a href="">Contact</a></li>
        <li><a href="">Foobar</a></li>
        <li><a href="">Settings</a></li>
      </ul>
    </nav>
  </variation>
  <variation name="alternate">
    <nav>
      <h1>Prototype Idea A</h1>
      <ul>
        <li><a href="">Home</a></li>
        <li><a href="">About</a></li>
        <li><a href="">Contact</a></li>
        <li><a href="">Foobar</a></li>
        <li><a href="">Settings</a></li>
      </ul>
    </nav>
  </variation>
</template>
```

### CSS/LESS/SASS
Right now, all files except HTML files are copied over. Moreover, everything you put inside of a `<head>` tag is concatenated and added to the top of the page. That means you can add whatever CSS files you want and just include them.

### Linking Pages
You can link to your pages by just using their name like this `/pagename`.

### Annotations
Where would wireframes be without documentation? You have a couple of options:

You can apply an annotation to any piece of code on the page using `data-note="my note`. Clicking the comments icon in the toolbar will display those on the page.

Additionally, when viewing the project in exploded view each page and component can have long winded notes (as we IA's do). You include those with your HTML like this:

```html
<page layout="default" name="pageName">
  {{page content}}
  {{> componentToInclude}}
  <notes>
    <h1>Notes Heading</h1>
    
    <p>Type up your html css and leave it hear</p>
    <ul>
      <li>Abc</li>
      <li>Def</li>
      <li>Ghi</li>
    </ul>
  </notes>
</page>
```

You can also use them with template variations:

```html
<template name="nav">
  <variation name="default">
    <nav>
      ...
    </nav>
    <notes>
      Notes go here
    </notes>
  </variation>
  <variation name="alternate">
    <nav>
      ...
    </nav>
    <notes>
      Notes go here
    </notes>
  </variation>
  <notes>
    Notes go here
  </notes>
</template>
```

Notes within each variation will be appended to the notes outside of the variation when viewing said variation.

## Helpers, Events, and Data
You can declare helpers, events, and data for layouts, pages, and templates like you would in Meteor.js. You can apply these by using the following structure:

```javascript
[Layout, Page, Template].nameOfItem.variation.[helpers, data, events]({
  // do stuff
});
```

```javascript
Layout.default.helpers({
  foo: function () {
    return Session.get('fop');
  }
});

Page.pageName.data({
  foobar: "abc",
  barfoo: [1, 2, 3],
  barfooy: 'path/to/json/file.json'
});

// Or
Page.pageName.data = 'path/to/json/file.json';

Template.templateName.events({
  // Fires when any element is clicked
  'click': function (event) { ... },

  // Fires when any element with the 'accept' class is clicked
  'click .accept': function (event) { ... },

  // Fires when 'accept' is clicked, or a key is pressed
  'keydown, click .accept': function (event) { ... }
});
```

## Session Data
One of the big items missing from prototypes is maintaining state throughout a demonstration. For instance, perhaps you want to log in and have the login area maintain how it looks. This can be created using advanced server side coding but then we wouldn't be prototyping would we?

Wireframer provides very basic session data that keeps it's state in localstorage. You can use it like this:

```javascript
Session.set('foo', 'bar'); // true
Session.get('foo'); // bar
```

By default the application flushes data on page load so you can have a blank slate. You can override this in `config.json` or by appended a query parameter `?flushLocalStorage=false`.

# Exploded View

You will be able to browser through all of your pages and components. In the future, you will be able to include extra documentation areas.