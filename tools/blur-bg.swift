import Foundation
import Vision
import CoreImage
import CoreImage.CIFilterBuiltins
import ImageIO

let args = CommandLine.arguments
guard args.count >= 4 else {
    FileHandle.standardError.write("usage: blurbg <in> <out> <radius>\n".data(using:.utf8)!)
    exit(2)
}
let inURL  = URL(fileURLWithPath: args[1])
let outURL = URL(fileURLWithPath: args[2])
let radius = Double(args[3]) ?? 18.0

guard let base = CIImage(contentsOf: inURL) else { print("FAIL load"); exit(1) }

let handler = VNImageRequestHandler(url: inURL, options: [:])
let req = VNGenerateForegroundInstanceMaskRequest()
do { try handler.perform([req]) } catch { print("FAIL vision \(error)"); exit(1) }

guard let obs = req.results?.first as? VNInstanceMaskObservation, !obs.allInstances.isEmpty else {
    print("NOSUBJECT"); exit(3)
}

guard let maskBuf = try? obs.generateScaledMaskForImage(forInstances: obs.allInstances, from: handler) else {
    print("FAIL mask"); exit(1)
}

var mask = CIImage(cvPixelBuffer: maskBuf)
let sx = base.extent.width  / mask.extent.width
let sy = base.extent.height / mask.extent.height
mask = mask.transformed(by: CGAffineTransform(scaleX: sx, y: sy))
             .transformed(by: CGAffineTransform(translationX: base.extent.minX - mask.extent.minX*sx,
                                                y: base.extent.minY - mask.extent.minY*sy))

// soften mask edge slightly so the subject doesn't look cut out
let softMask = mask.applyingFilter("CIGaussianBlur", parameters: [kCIInputRadiusKey: 2.0])
                   .cropped(to: base.extent)

let blurred = base.clampedToExtent()
                  .applyingFilter("CIGaussianBlur", parameters: [kCIInputRadiusKey: radius])
                  .cropped(to: base.extent)

let blend = CIFilter.blendWithMask()
blend.inputImage      = base
blend.backgroundImage = blurred
blend.maskImage       = softMask
guard let out = blend.outputImage else { print("FAIL blend"); exit(1) }

let ctx = CIContext()
let cs  = CGColorSpace(name: CGColorSpace.sRGB)!
do {
    try ctx.writeJPEGRepresentation(of: out, to: outURL, colorSpace: cs,
        options: [kCGImageDestinationLossyCompressionQuality as CIImageRepresentationOption: 0.9])
    // report what fraction of the frame was kept sharp
    print("OK instances=\(obs.allInstances.count)")
} catch { print("FAIL write \(error)"); exit(1) }
