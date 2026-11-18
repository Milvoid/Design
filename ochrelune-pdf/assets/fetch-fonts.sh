#!/bin/sh
# 下载 Ochrelune PDF 用到的三款字体到 ./fonts（字体不随本仓库分发，按各自许可证使用）。
#   寒蝉锦书宋 Pro Medium   SIL OFL 1.1     https://github.com/Warren2060/ChillJinshuSong
#   霞鹜新晰黑 Regular      IPA Font 1.0    https://github.com/lxgw/LxgwNeoXiHei
#   Source Serif 4（可变）  SIL OFL 1.1     https://github.com/adobe-fonts/source-serif
# 已有字体时可直接复制，例如 Mac Studio 的 ~/Personal/Work/overview-1118/fonts/。
set -e
dir="${1:-fonts}"
mkdir -p "$dir"
get() { [ -s "$dir/$1" ] || curl -fL --retry 2 -o "$dir/$1" "$2"; }
get ChillJinshuSongMedium.otf "https://github.com/Warren2060/ChillJinshuSong/raw/main/%E5%AF%92%E8%9D%89%E9%94%A6%E4%B9%A6%E5%AE%8BPro_v1.7/ChillJinshuSongMedium.otf"
get LXGWNeoXiHei.ttf "https://github.com/lxgw/LxgwNeoXiHei/releases/download/v1.309/LXGWNeoXiHei.ttf"
get SourceSerif4.ttf "https://github.com/google/fonts/raw/main/ofl/sourceserif4/SourceSerif4%5Bopsz%2Cwght%5D.ttf"
ls -la "$dir"
