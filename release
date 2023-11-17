#!/bin/env zsh

current_version=$(jq -r '.version' plugin.json)
IFS='.' read -r major minor patch <<< "$current_version"
((patch++))
new_version="$major.$minor.$patch"
sed -i "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" plugin.json

./tag
