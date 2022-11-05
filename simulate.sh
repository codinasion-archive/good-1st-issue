#############################################################
## This file is just to simulate the process of the script ##
#############################################################

# issues.labeled
# node_modules/.bin/probot receive -e issues -p test/fixtures/issues.labeled.json ./lib/index.js

# issues.unlabeled
node_modules/.bin/probot receive -e issues -p test/fixtures/issues.unlabeled.json ./lib/index.js
