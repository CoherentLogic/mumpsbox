#!/usr/bin/env node

const program = require('commander');
const pkg = require('../package.json');

program
    .version(pkg.version)
    .command('install [package]', 'install a package')
    .command('install-engine [engine]', 'install a MUMPS implementation')
    .command('remove <package>', 'remove a package')
    .command('remove-engine <engine>', 'remove a MUMPS implementation')
    .command('list', 'list available packages')
    .command('list-engines', 'list available MUMPS implementation')
    .command('use <engine>', 'set the current MUMPS implementation')
    .command('init', 'initialize a mumpsbox package')
    .parse(process.argv);

