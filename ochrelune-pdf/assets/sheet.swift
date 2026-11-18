import AppKit
let fs = (try! FileManager.default.contentsOfDirectory(atPath: "png")).filter{$0.hasPrefix("p")}.sorted()
let ims = fs.map{ NSImage(contentsOfFile: "png/\($0)")! }
let w = ims[0].size.width, h = ims[0].size.height, cols = 4, rows = (ims.count+cols-1)/cols
let W = CGFloat(cols)*w + CGFloat(cols+1)*10, H = CGFloat(rows)*h + CGFloat(rows+1)*10
let out = NSImage(size: NSSize(width: W, height: H)); out.lockFocus()
NSColor.lightGray.setFill(); NSRect(x:0,y:0,width:W,height:H).fill()
for (i,im) in ims.enumerated() { let c = i%cols, r = i/cols
  im.draw(in: NSRect(x: 10+CGFloat(c)*(w+10), y: H-CGFloat(r+1)*(h+10), width: w, height: h)) }
out.unlockFocus()
let rep = NSBitmapImageRep(data: out.tiffRepresentation!)!
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: "sheet.png"))
