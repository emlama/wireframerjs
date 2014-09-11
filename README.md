# The Most Advanced HTML/CSS Prototyping Tool Ever

WireframerJS is a framework that aims to make html/css wireframes flexible, easy and documentable. It's loosely based on Jekyll, 8SBlocks, PaternLab by Brad Frost and Meteor.js.

## Why use WireframerJS?

My first HTML/CSS prototyping tool was Jekyll. I really appreciated it's ability to define layouts, pages and includes while being able to dynamically build pages (liquid + haml = happy). Then came along EightShape Blocks which introduced a lot of great ideas–a meta dashboard of pages, documentation and component variations. Unfortunately, the markup is difficult to use, can be buggy and the maintainers are not very talkative.

Wireframer combines the best of both worlds.

## Quick start

First, install the application by cloning this to your local machine. Then navigate to `wireframerjs/bin` and run `npm install`.

Next, navigate to where you would like your new project to be and type this in:

```bash
$ wireframer create myapp
$ cd myapp
$ wireframer
=> Wireframer server running on: http://localhost:3000/
```

## Building your prototype

To get started, you can put `.html, .js, and .css/scss/less` files wherever you want in your project (very much like Meteor). Folders, subfolders and out in the open–wireframer doesn't care.

Wireframer uses Handlebars.js, feel free to handlebar it up.

There are three types of HTML that you can write:

### Layouts
These are reusable page templates just like in Jekyll, and every other templating framework. Be sure to specify which layout a page should use when creating your pages. Use a `{{> yield}}` statement in your layout file to insert said page. Layouts should contain only the content you would place between `<body>` tags.

### Pages
These will be the pages that people see throughout your prototype. You don't have to use layouts or includes with them but doing so will cut down on code duplication.

Each page is made available at `localhost:3000/pageName`.

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

_I will probably rename these as includes at some point to reduce confusion._

### CSS/LESS/SASS
Right now, all files except HTML files are copied over into the `_site` directory. That means you can add whatever CSS files you want and just include them in a `<head>` tag. And about that, everything you put inside of a `<head>` tag is concatenated and added to the top of the page (also, just like Meteor).

### Linking Pages
You can link to your pages by just using their name like this `/pageName`.

### Annotations
Where would wireframes be without documentation? You have a couple of options:

You can apply an annotation to any html tag on the page using `data-note="my note`. Clicking the comments icon in the toolbar will display those on the page.

Additionally, when viewing the project in exploded view each page and component can have long winded notes (as we information architects are oft to do). You include those with your HTML like this:

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

_Plans are in the work to make Mardown a possiblity in notes_

## Helpers, Events, and Data

Layouts, pages and templates all are kept organized in a their respective global objects. You can access each you by their name and variation. Additionally, each item can have helpers, data and events bound to them. This mimics the Meteor's implementation for now.

You can apply these by using the following structure:

```javascript
Layout/Page/Tempalte.nameOfItem.variation.helpers/data/events]({
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

You will be able to browse through all of your pages and components. In the future, you will be able to include extra documentation areas.
