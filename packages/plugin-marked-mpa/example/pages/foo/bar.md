---
layout: default
title: Bazinga!
author: Jane Smith
useWith:
  foo: _foo.md
  qux: _bar/qux.md
---

# <%= page.title %>

This is the main content of your Markdown file autored by **<%= page.author %>**.

```json
<%~ JSON.stringify(useWith, null, 2) %>
```
