"""从编码后的 mp4 每秒抽一帧，拼成逐秒总览（每张最多 20 帧，标注时间和镜号）。依赖 ffmpeg 和 Pillow。

用法：python overview.py 成片.mp4 标题 cuts.json [每秒帧数=30] [字体.ttf]
cuts.json 是每镜起始帧数组，最后一项为总帧数，例如 [0,126,251,...,2309]
"""
import json
import math
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

movie, heading, cuts_file = Path(sys.argv[1]), sys.argv[2], Path(sys.argv[3])
fps = int(sys.argv[4]) if len(sys.argv) > 4 else 30
font_file = sys.argv[5] if len(sys.argv) > 5 else None
cuts = json.loads(cuts_file.read_text())
body = ImageFont.truetype(font_file, 24) if font_file else ImageFont.load_default()
title = ImageFont.truetype(font_file, 38) if font_file else ImageFont.load_default()
clock = lambda s: f"{s // 60:02d}:{s % 60:02d}"

with tempfile.TemporaryDirectory() as temp:
    tmp = Path(temp)
    subprocess.run(["ffmpeg", "-v", "error", "-i", str(movie), "-an", "-vf",
                    f"select='not(mod(n,{fps}))',scale=384:216:flags=lanczos",
                    "-fps_mode", "vfr", "-start_number", "0", str(tmp / "%03d.png")], check=True)
    frames = sorted(tmp.glob("*.png"))
    for start in range(0, len(frames), 20):
        part = frames[start:start + 20]
        rows = math.ceil(len(part) / 4)
        sheet = Image.new("RGB", (1644, 102 + rows * 264 + 20), "#F0EEE6")
        pen = ImageDraw.Draw(sheet)
        end = start + len(part) - 1
        pen.text((33, 18), heading, font=title, fill="#141413")
        pen.text((1608, 35), f"{clock(start)} — {clock(end)}", anchor="rt", font=body, fill="#5E5D59")
        for i, path in enumerate(part):
            sec = start + i
            shot = next(n for n, c in enumerate(cuts) if c > sec * fps)
            x, y = 33 + (i % 4) * 398, 92 + (i // 4) * 264
            with Image.open(path) as tile:
                sheet.paste(tile, (x, y))
            pen.text((x + 1, y + 220), f"{clock(sec)}   ·   镜 {shot:02}", font=body, fill="#5E5D59")
        sheet.save(movie.with_name(f"逐秒总览-{start:02d}-{end:02d}.png"), optimize=True)
print("ok")
