import { Ratio, District, Zone, LogoSize } from './constants.d'
import Frame from './Frame'
import ImageFetcher from "./ImageFetcher";

type Coordinates = [number, number];

export default class Overlayer {
  #inputCanvas: HTMLCanvasElement
  #outputCanvas?: HTMLCanvasElement
  #frame: Frame
  #imageFetcher: ImageFetcher

  constructor(
    canvas: HTMLCanvasElement,
    frame: Frame
  ) {
    this.#inputCanvas = canvas
    this.#frame = frame
  }

  async overlay() {
    const [width, height] = (() => {
      switch (this.#frame.ratio) {
        case Ratio.Square:
          return [1080, 1080]
        case Ratio.Landscape:
          return [1620, 1080]
        case Ratio.Portrait:
          return [1080, 1620]
      }
    })()
    this.#outputCanvas = document.createElement('canvas')
    this.#outputCanvas.width = width
    this.#outputCanvas.height = height

    this.#imageFetcher = await ImageFetcher.getInstance()

    this.#drawImage()
    await this.#drawFrame()
    await this.#drawLogos()
  }

  #drawImage() {
    const ctx = this.#outputCanvas.getContext('2d')
    ctx.drawImage(this.#inputCanvas, 0, 0, this.#outputCanvas.width, this.#outputCanvas.height)
  }

  async #drawFrame() {
    const ctx = this.#outputCanvas.getContext('2d')
    const frame = await this.#imageFetcher.getFrame(this.#frame.ratio)
    const paths = Array.from(frame.querySelectorAll('path'))

    paths.forEach(path => {
      const path2d = new Path2D(path.getAttribute('d'))

      if (path.classList.contains('border')) {
        ctx.fillStyle = this.#frame.color
      } else {
        ctx.fillStyle = path.getAttribute('fill')
      }
      ctx.fill(path2d)

      if (path.getAttribute('stroke') !== null) {
        ctx.strokeStyle = path.getAttribute('stroke')
        ctx.lineWidth = parseInt(path.getAttribute('stroke-width'))
        ctx.stroke(path2d)
      }
    })
  }

  #getCoordinates(logo: typeof District | Zone): Coordinates {
    if (logo === District) {
      return [LogoSize.Margin, LogoSize.Margin]
    }
    return [
      this.#outputCanvas.width - LogoSize.Width - LogoSize.Margin,
      this.#outputCanvas.height - LogoSize.Height - LogoSize.Margin
    ]
  }

  async #drawLogos() {
    const ctx = this.#outputCanvas.getContext('2d')

    for (const logoName of [District, this.#frame.logo]) {
      const logoBitmap = await this.#imageFetcher.getLogo(logoName)
      const [dx, dy] = this.#getCoordinates(logoName as typeof District | Zone)
      ctx.drawImage(logoBitmap, dx, dy, LogoSize.Width, LogoSize.Height)
    }
  }

  get imageAsDataURL(): URL {
    if (!this.#outputCanvas) { throw new Error('Devi prima sovrapporre una cornice!') }
    return new URL(this.#outputCanvas.toDataURL('image/jpeg'))
  }
}
