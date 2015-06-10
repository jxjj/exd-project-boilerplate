# Experimental Interaction Project Boilerplate

## Setup

1. `git clone git@github.com:johnsojr/exd-project-boilerplate.git <yourprojectname>` to clone this boilerplate into a new folder.

2. `cd <yourprojectname>`

3. `npm install && bower install` to install npm and bower dependencies such as browserify, gulp, etc.

Your project is now ready for code

## Important gulp commands

`gulp serve`
Starts a server for your project on `localhost:9000`. Compiles Sass, JS and live reloads changes on save.

`gulp tdd`
Starts karma for test driven development

`gulp`
Compiles the project so that its ready for deploy.

`gulp deploy`
Uploads your project to your server (using rsync). You must configure your `.deploy.json` file and public ssh key first.

