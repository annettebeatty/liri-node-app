git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch send_sms.js' \
  --prune-empty --tag-name-filter cat -- --all
