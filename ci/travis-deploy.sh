#!/bin/bash

yarn run publish --platform=win32 --arch=ia32 --tag="$TRAVIS_TAG"
yarn run publish --platform=win32 --arch=x64 --tag="$TRAVIS_TAG"
yarn run publish --platform=linux --arch=ia32 --tag="$TRAVIS_TAG"
yarn run publish --platform=linux --arch=x64 --tag="$TRAVIS_TAG"