# electron-18n-editor

A tiny little i18n (resource bundle) editor written in JS and powered by Electron

![Screenshot](screenshot.png?raw=true)

## What is it?

It is a resource bundle editor similar to the integrated ones in IntelliJ IDEA and Eclipse.

It provides features like:

- Viewing your properties in a nice tree view
- Editing all the languages at once
- Find incomplete properties
- Add and delete properties (duh...)

There might be more features in the future, however, as this is more like a fun hobby project, you probably should not expect too much.

## Why would I need this?

If your IDE or editor of choice does not support something like this ;)

## WTF HOW DO I USE THIS?

Fire up your favorite command line or bash shell and enter the following commands (you have to have NodeJS and LESS installed):

```bash
npm install
lessc style/style.less style/style.css
npm start
```

There might be some fancy electron installer build thingy happening in the future.

## Can I clone / edit / modify / republish this?

As long as you follow the directions of the Apache-2.0 license, go ahead!
