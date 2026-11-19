// 打印版取色检查：swift printcheck.swift main.pdf
// 逐页渲染，统计“浅色但不是纯白”的像素占比（米色纸面、燕麦色卡片、图里的浅底都会落在这一档）。
// 文字和细线的抗锯齿边缘一般只占 1–3%；整页底色或大块浅底会远超 10%，判为不通过。
import PDFKit
import AppKit

let args = CommandLine.arguments
guard args.count >= 2, let doc = PDFDocument(url: URL(fileURLWithPath: args[1])) else {
  print("用法: swift printcheck.swift main.pdf"); exit(2)
}
let scale: CGFloat = 0.7  // 约 50 dpi，足够判断底色
var failed = false
for i in 0..<doc.pageCount {
  let page = doc.page(at: i)!
  let box = page.bounds(for: .mediaBox)
  let w = Int(box.width * scale), h = Int(box.height * scale)
  let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: w, pixelsHigh: h, bitsPerSample: 8,
                             samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                             colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  let ctx = NSGraphicsContext(bitmapImageRep: rep)!
  let cg = ctx.cgContext
  cg.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
  cg.fill(CGRect(x: 0, y: 0, width: w, height: h))
  cg.scaleBy(x: scale, y: scale)
  page.draw(with: .mediaBox, to: cg)
  var tinted = 0, corner = ""
  let data = rep.bitmapData!, bpr = rep.bytesPerRow
  for y in 0..<h {
    for x in 0..<w {
      let p = data + y * bpr + x * 4
      let r = Int(p[0]), g = Int(p[1]), b = Int(p[2])
      if !(r == 255 && g == 255 && b == 255) && min(r, g, b) >= 225 { tinted += 1 }
      if x == 4 && y == 4 { corner = String(format: "%02X%02X%02X", r, g, b) }
    }
  }
  let pct = Double(tinted) / Double(w * h) * 100
  let ok = pct <= 10 && corner == "FFFFFF"
  if !ok { failed = true }
  print(String(format: "第 %2d 页  角落取色 #%@  浅色非白占比 %.1f%%  %@", i + 1, corner, pct, ok ? "通过" : "不通过"))
}
exit(failed ? 1 : 0)
