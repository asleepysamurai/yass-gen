### What is Yass-Gen?
YASS-Gen - Yet Another Static Site Generator. Yass-Gen is a zero config static site generator which allows you to build static sites using Handlebars enabled templates, and Markdown files extended with YAML FrontMatter.

##### Install

To get started install Yass-Gen.

```bash
yarn global add yass-gen
```
```bash
npm install -g yass-gen
```

This will install Yass-Gen as a global node module, and make the yass-gen command available.

##### Generating a Static Site

Yass-Gen expects two arguments.

- `-i`|`--in` - Input directory. This directory should have two subdirectories:
    - `data` - This directory will contain the data files for your site. All the data files should have the extension `.yass`. Apart from `.yass` data files it can have other files as well.
    - `template` - This directory will contain the handlebars templates for all of your pages.
- `-o`|`--out` - Output directory. Yass-Gen will write minified output static files to this directory. This directory can be served publicly.

To compile your static site run:
```bash
yass-gen -in <inDirPath> -out <outDirPath>
```

##### Templating Explained
Generally the structure of the template directory should mirror the structure of the data directory. For each data file (`.yass`) in the data directory, Yass-Gen will attempt to use one of the following files as the template (Ex: data file is `./data/blog/2018/5/12.yass`):
- `./template/blog/2018/5/12.hbs`
- `./template/blog/2018/5/_template_.hbs`, if above file is not available
- `./template/blog/2018/_template_.hbs`, if above files are not available
- `./template/blog/_template_.hbs`, if above files are not available
- `./template/_template_.hbs`, if above files are not available
- If none of the above files are available Yass-Gen will throw an error.

Once Yass-Gen identifies the template to use, it will parse the data file as a YAML FrontMatter file, extract the meta attributes from the FrontMatter, and compile the Handlebars template using that as data.

In addition Yass-Gen also adds a few custom data fields that can be used in your template:
- `$pageContent` - This will be the main body of the content from the data file, without any FrontMatter. This can be Markdown content also.
- `$dirList` - This will be an array of all the files in the same directory as the data file, with their FrontMatter, $date and $file data.
- `$file` - This contains information about the data file:
    - `path` - The path to the file, relative to the root of the data dir
    - `ext` - The extension of the file
    - `name` - The file name
- `$date` - This contains the following fields:
    - `updatedAt` - The timestamp of the last modified time of that file
    - `compiledAt` - The timestamp of the time the file was compiled at

##### Setting up Custom Data Fields
In addition to the fields mentioned above, you can also setup fields to be passed along in the context to your Handlebars template, by using YAML FrontMatter. Ex:

```
---
title: Articles
$dontList: true
---
This page will not appear in $dirList
```

In the above example, the following properties will be passed along when the template is compiled:
```json
{
    "title": "Articles",
    "$dontList": true,
    "$pageContent": "This page will not appear in $dirList"
}
```

##### Important
Please Note, `$dontList` is a special variable and it's value must be boolean. When set as true, that file will not be included in `$dirList`.

##### Using Custom Handlebars Helpers and Partials
In order to make templating easy, you may want to use your own custom Handlebars helpers and partials. To do this, you must have a file `_configure.js` at the root of your template directory. This file should be a CJS module exporting a single function.

Prior to compiling your static site, Yass-Gen will call this function with a single parameter. This parameter will be the Handlebars instance that Yass-Gen will use to compile your template.

To register a custom helper you can call [`Handlebars.registerHelper`](https://handlebarsjs.com/block_helpers.html) and to register a partial you can call [`Handlebars.registerPartial`](https://handlebarsjs.com/partials.html).

The setup function maybe an async function, in which case it should return a Promise.

##### Yass-Gen Compilation
While Yass-Gen compiles your site, it walks through every subdirectory in data directory, and for each `.yass` file, it identifies the corresponding template to use, and compiles that template. This file is then made available as a HTML file in the same path on the output directory.

If Yass-Gen encounters any files with an extension other than `.yass` it will simply copy over those files to the same path in the output directory.

In addition, Yass-Gen will also copy over any file in the template directory whose name doesn't being with an `_` or which doesn't have a `.hbs` extension, to the corresponding path in the output directory.

For an example site demonstrating pretty much all the features supported by Yass-Gen, [check this repo](https://github.com/asleepysamurai/ass-com).
