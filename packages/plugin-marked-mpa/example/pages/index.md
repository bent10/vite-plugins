---
title: Hello, world!
author: John Doe
---

# <%= page.title %>

This is the main content of your Markdown file autored by **<%= page.author %>**.

This guide is a very brief overview, with examples, of the syntax that [Markdown] supports. It is itself written in Markdown and you can copy the samples over to the left-hand pane for experimentation. It's shown as _text_ and not _rendered HTML_.

[Markdown]: http://daringfireball.net/projects/markdown/

## Simple Text Formatting

First thing is first. You can use _stars_ or _underscores_ for italics. **Double stars** and **double underscores** for bold. **_Three together_** for **_both_**.

Paragraphs are pretty easy too. Just have a blank line between chunks of text.

> This chunk of text is in a block quote. Its multiple lines will all be
> indented a bit from the rest of the text.
>
> > Multiple levels of block quotes also work.

Sometimes you want to include code, such as when you are explaining how `<h1>` HTML tags work, or maybe you are a programmer and you are discussing `someMethod()`.

If you want to include code and have new
lines preserved, indent the line with a tab
or at least four spaces:

    Extra spaces work here too.
    This is also called preformatted text and it is useful for showing examples.
    The text will stay as text, so any *markdown* or <u>HTML</u> you add will
    not show up formatted. This way you can show markdown examples in a
    markdown document.

>     You can also use preformatted text with your blockquotes
>     as long as you add at least five spaces.

## Headings

There are a couple of ways to make headings. Using three or more equals signs on a line under a heading makes it into an "h1" style. Three or more hyphens under a line makes it "h2" (slightly smaller). You can also use multiple pound symbols (`#`) before and after a heading. Pounds after the title are ignored. Here are some examples:

```md
# This is H1

## This is H2

# This is H1

## This is H2

### This is H3 with some extra pounds

#### You get the idea

##### I don't need extra pounds at the end

###### H6 is the max
```

## Links

Let's link to a few sites. First, let's use the bare URL, like <https://github.com>. Great for text, but ugly for HTML.
Next is an inline link to [Google](https://www.google.com). A little nicer.
This is a reference-style link to [Wikipedia][1].
Lastly, here's a pretty link to [Yahoo]. The reference-style and pretty links both automatically use the links defined below, but they could be defined _anywhere_ in the markdown and are removed from the HTML. The names are also case insensitive, so you can use [YaHoO] and have it link properly.

[1]: https://www.wikipedia.org
[Yahoo]: https://www.yahoo.com

Title attributes may be added to links by adding text after a link.
This is the [inline link](https://www.bing.com 'Bing') with a "Bing" title.
You can also go to [W3C][2] and maybe visit a [friend].

[2]: https://w3c.org 'The W3C puts out specs for web-based things'
[Friend]: https://facebook.com 'Facebook!'

Email addresses in plain text are linked: test@example.com.
Email addresses wrapped in angle brackets are linked as well: <test@example.com>.
They are also obfuscated so that email harvesting spam robots hopefully won't get them.

## Lists

- This is a bulleted list
- Great for shopping lists

* You can also use hyphens

- Or plus symbols

The above is an "unordered" list. Now, on for a bit of order.

1. Numbered lists are also easy
2. Just start with a number
3. However, the actual number doesn't matter when converted to HTML.
4. This will still show up as 4.

You might want a few advanced lists:

- This top-level list is wrapped in paragraph tags
- This generates an extra space between each top-level item.

- You do it by adding a blank line

- This nested list also has blank lines between the list items.

- How to create nested lists

  1. Start your regular list
  2. Indent nested lists with two spaces
  3. Further nesting means you should indent with two more spaces

     - This line is indented with four spaces.

- List items can be quite lengthy. You can keep typing and either continue
  them on the next line with no indentation.

- Alternately, if that looks ugly, you can also
  indent the next line a bit for a prettier look.

- You can put large blocks of text in your list by just indenting with two spaces.

  This is formatted the same as code, but you can inspect the HTML
  and find that it's just wrapped in a `<p>` tag and _won't_ be shown
  as preformatted text.

  You can keep adding more and more paragraphs to a single
  list item by adding the traditional blank line and then keep
  on indenting the paragraphs with two spaces.

  You really only need to indent the first line,
  but that looks ugly.

- Lists support blockquotes

  > Just like this example here. By the way, you can
  > nest lists inside blockquotes!
  >
  > - Fantastic!

- Lists support preformatted text

      You just need to indent an additional four spaces.

## Horizontal Rule

If you need a horizontal rule you just need to put at least three hyphens, asterisks, or underscores on a line by themselves. You can also even put spaces between the characters.

---

---

---

Those three all produced horizontal lines. Keep in mind that three hyphens under any text turns that text into a heading, so add a blank like if you use hyphens.

## Images

Images work exactly like links, but they have exclamation points in front. They work with references and titles too.

![Google Logo](https://www.google.com/images/errors/logo_sm.gif) and ![Happy].

[Happy]: https://api-ninjas-data.s3.us-west-2.amazonaws.com/emojis/U%2B1F642.png '"Smiley face"'

## Inline HTML

If markdown is too limiting, you can just insert your own <strike>crazy</strike> HTML. Span-level HTML <u>can _still_ use markdown</u>. Block level elements must be separated from text by a blank line and must not have any spaces before the opening and closing HTML.

<div style='font-family: "Comic Sans MS", "Comic Sans", cursive;'>
It is a pity, but markdown does **not** work in here for most markdown parsers.
[We] handles it pretty well.
</div>

## Frontmatter

Frontmatter is metadata typically found at the beginning of a Markdown file, written in YAML format.

```md
---
title: Hello, world!
author: John Doe
datasource: 'path/to/data.{json,yml,js}'
---

# <%= page.title %>

This is the main content of your Markdown file autored by <%= page.author %>.
```

## Template Engine

- **To output data**, use the `\<%=` opening tag, `# \<%= page.title %>`.

- **To allow raw HTML**, use the `\<%~` opening tag, `\<%~ contentContainingHTML %>`.

- **To evaluate JavaScript**, use the `\<%` opening tag, `\<% let myVar = 3 %>`.

- **To render a partial**, use the `\<%~` opening tag + the `include()` function, `\<%~ include("./path-to-layout") %>`.

- **To render an async partial**, use the `\<%~` opening tag + the `includeAsync()` function, `\<%~ includeAsync("./path-to-layout") %>`.

The partial template will automatically try to resolve partial files from inside the filesystem. Ex. `\<%~ include("/header.html") %>` will look for a file called `header.html` in the `src/partials` directory of your project.

> **Tips:** Use the following syntax in page file to see `data` object:
>
> ```html
> \<%~ JSON.stringify(data, null, 2) %>
> ```

## Unlock more gems with [`extensions`](https://github.com/bent10/marked-extensions)

```js
import { defineConfig } from 'vite'
import mpa from 'vite-plugin-marked-mpa'
import markedAlert from 'marked-alert'

export default defineConfig({
  plugins: [
    mpa({
      extensions: [{ gfm: true }, markedAlert()]
    })
  ]
})
```

Use [more extensions](https://github.com/bent10/marked-extensions) to enable additional markdown features, e.g. footnotes, Github alerts, directive syntax, etc.
