#!/bin/env zsh

git add -A
git commit -m "auto"
latest_tag=$(git describe --tags --abbrev=0)
new_version=$(python3 -c "import re; major, minor, patch = re.match('v(\d+)\.(\d+)\.(\d+)', '${latest_tag}').groups(); patch = int(patch) + 1; print(f'v{major}.{minor}.{patch}')")
git tag ${new_version}
git push origin ${new_version}
git push gitee ${new_version}
git push origin
git push gitee
