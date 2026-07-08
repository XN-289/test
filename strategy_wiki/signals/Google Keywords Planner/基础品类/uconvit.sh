# 需要安装 icu-devtools
find . -name "*.csv" -exec sh -c 'uconv -f utf-16 -t utf-8 "$1" > "$1.tmp" && sed -i "1s/^/\xef\xbb\xbf/" "$1.tmp" && mv "$1.tmp" "$1"' _ {} \;