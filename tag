#!/bin/env zsh

# Get the latest version tag
latest_tag=$(git describe --tags --abbrev=0)
# Increment the version
new_version=$(python3 -c "import re; major, minor, patch = re.match('v(\d+)\.(\d+)\.(\d+)', '${latest_tag}').groups(); patch = int(patch) + 1; print(f'v{major}.{minor}.{patch}')")
# Create a new tag
git tag ${new_version}
# Push the new tag to remote
git push gitee ${new_version}
git push origin ${new_version}
