#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var util = require('./util');

var gitRoot = util.findGitRoot().toString().trim();

var sourcePath, destPath;

sourcePath = path.join(__dirname, 'pre-commit');
destPath = path.join(gitRoot, '.git', 'hooks', 'pre-commit');

console.log('Creating .git/hooks/pre-commit...');
fs.writeFileSync(destPath, fs.readFileSync(sourcePath, 'utf8'));
fs.chmodSync(destPath, '755');

