"""按角色字符清单生成拍片用的三份 WOFF2 子集。依赖 fonttools[woff]。

用法：python font-subset.py 字符集.json 输出目录
字符集.json 形如 {"title": "申请只用约核…", "body": "合成作业…", "number": "0123456789,.%"}
字体路径按需修改。保留 name 表中的版权与授权信息。
"""
import json
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

FONTS = {
    "title": ("ChillJinshuSongMedium.otf", None),
    "body": ("LXGWNeoXiHei.ttf", None),
    "number": ("SourceSerif4[opsz,wght].ttf", {"wght": 500, "opsz": 48}),
}
SOURCE = Path("fonts")  # 原字库所在目录


def build(role: str, characters: str, out: Path) -> None:
    file, axes = FONTS[role]
    font = TTFont(SOURCE / file, recalcTimestamp=False)
    if axes:
        instantiateVariableFont(font, axes, inplace=True)
    options = subset.Options()
    options.name_IDs = ["*"]
    options.name_languages = ["*"]
    options.layout_features = ["*"]
    options.flavor = "woff2"
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text=characters + " ")
    subsetter.subset(font)
    missing = [c for c in set(characters) if not c.isspace() and ord(c) not in font.getBestCmap()]
    if missing:
        raise SystemExit(f"{role} 缺字：{''.join(sorted(missing))}")
    font.flavor = "woff2"
    font.save(out / f"{role}.woff2")


if __name__ == "__main__":
    chars = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    target = Path(sys.argv[2])
    target.mkdir(parents=True, exist_ok=True)
    for role, text in chars.items():
        build(role, text, target)
    print("ok")
