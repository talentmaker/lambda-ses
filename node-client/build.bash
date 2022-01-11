#!/bin/bash

__dirname="$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)"
bin="${__dirname}/node_modules/.bin"

PS4='\033[0;32m > \033[0m'
set -o xtrace -e

rm -rf dist
mkdir dist

cp -rv src tsconfig.json dist

cd dist || exit 1

"$bin/tsc" -p ./tsconfig.json --outDir . --incremental false --tsBuildInfoFile null
"$bin/tsc" -p ./tsconfig.json --outDir ./cjs --module commonjs --incremental false --tsBuildInfoFile null

rm -rf tsconfig.json

cd .. || exit 1

# for f in dist/cjs/*.js; do
#     mv -- "$f" "${f%.js}.cjs"
# done

cp -v LICENSE package.json README.md dist
echo '{"private": false, "type": "commonjs"}' > dist/cjs/package.json
