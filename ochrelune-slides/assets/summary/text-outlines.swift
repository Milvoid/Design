import AppKit
import CoreText
import Foundation

struct Run: Decodable {
    let value: String
    let size: Double
    let style: String
    let tracking: Double
}
struct Label: Decodable {
    let runs: [Run]
    let anchor: String
}
let labels = try JSONDecoder().decode([Label].self, from: FileHandle.standardInput.readDataToEndOfFile())
func fmt(_ value: CGFloat) -> String { String(format: "%.2f", Double(value)) }
func pair(_ p: CGPoint) -> String { fmt(p.x) + " " + fmt(-p.y) }
func outline(_ label: Label) -> String {
    let attributed = NSMutableAttributedString()
    for r in label.runs {
        let font: NSFont
        if r.style.hasPrefix("sf") {
            font = NSFont.systemFont(ofSize: r.size, weight: r.style == "sfMedium" ? .medium : .regular)
        } else {
            font = NSFont(name: r.style, size: r.size)!
        }
        attributed.append(NSAttributedString(string: r.value, attributes: [.font: font, .kern: r.tracking]))
    }
    let line = CTLineCreateWithAttributedString(attributed)
    let width = CGFloat(CTLineGetTypographicBounds(line, nil, nil, nil))
    let offset = label.anchor == "middle" ? -width / 2 : label.anchor == "end" ? -width : 0
    var result = ""
    for ctRun in CTLineGetGlyphRuns(line) as! [CTRun] {
        let attrs = CTRunGetAttributes(ctRun) as NSDictionary
        let font = attrs[kCTFontAttributeName] as! CTFont
        let count = CTRunGetGlyphCount(ctRun)
        var glyphs = [CGGlyph](repeating: 0, count: count)
        var points = [CGPoint](repeating: .zero, count: count)
        CTRunGetGlyphs(ctRun, CFRange(location: 0, length: 0), &glyphs)
        CTRunGetPositions(ctRun, CFRange(location: 0, length: 0), &points)
        for i in 0..<count {
            guard let path = CTFontCreatePathForGlyph(font, glyphs[i], nil) else { continue }
            var data = ""
            path.applyWithBlock { e in
                let e = e.pointee
                switch e.type {
                case .moveToPoint: data += "M" + pair(e.points[0])
                case .addLineToPoint: data += "L" + pair(e.points[0])
                case .addQuadCurveToPoint: data += "Q" + pair(e.points[0]) + " " + pair(e.points[1])
                case .addCurveToPoint: data += "C" + pair(e.points[0]) + " " + pair(e.points[1]) + " " + pair(e.points[2])
                case .closeSubpath: data += "Z"
                @unknown default: break
                }
            }
            result += "<path transform=\"translate(\(fmt(points[i].x + offset)),\(fmt(-points[i].y)))\" d=\"\(data)\"/>"
        }
    }
    return result
}
FileHandle.standardOutput.write(try JSONEncoder().encode(labels.map(outline)))
