# Commandr
> Command scheduler

### Features
- command add/del/list
- command stats/logs
- hook onerror/onsuccess
- nice UI/UX > on http://127.0.0.1:1111

### Usage
```bash
npm install -g command-r
command-r start
open http://127.0.0.1:1111
```

### DEV
```bash
# Run app - DEV
npm run serve
ENV=dev node api.js
# Build app - PROD (pre-commit)
npm run build
cd dist && cat index.html | sed "s/\/js/js/g" | sed "s/\/css/css/g" | inliner --nosvg --skip-absolute-urls -mni > inline.html && mv inline.html index.html && rm -rf css js && cd -
# Run app - PROD
node api.js
```

### Inspiration
- https://github.com/ajvb/kala
- https://github.com/mesos/chronos
- https://github.com/Netflix/Fenzo
