 kill -usr1 $(lsof -i -P -n | grep nodejs | awk '{print $2}') &&  echo "$PORT connected"
