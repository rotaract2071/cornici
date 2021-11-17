import { Ratio } from './constants.d'
import Frame from './Frame'

export default class Overlayer {
  #inputCanvas: HTMLCanvasElement
  #outputCanvas?: HTMLCanvasElement
  #frame: Frame

  constructor (
    canvas: HTMLCanvasElement,
    frame: Frame
  ) {
    this.#inputCanvas = canvas
    this.#frame = frame
  }

  public async overlay () {
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

    this.drawImage()
    await this.drawFrame()
    await this.drawLogo()
  }

  private drawImage () {
    const ctx = this.#outputCanvas.getContext('2d')
    ctx.drawImage(this.#inputCanvas, 0, 0, this.#outputCanvas.width, this.#outputCanvas.height)
  }

  private async drawFrame () {
    const ctx = this.#outputCanvas.getContext('2d')
    const svgText = await fetch(
      `/assets/frames/frame_${this.#frame.ratio}.svg`
    ).then(data => data.text())
    const frame = (() => {
      const tmp = document.createElement('div')
      tmp.innerHTML = svgText
      return tmp.firstElementChild
    })()
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

  private async drawLogo () {
    const ctx = this.#outputCanvas.getContext('2d')

    for (const logoUrl of ['/assets/logos/distretto.avif', `/assets/logos/${this.#frame.logo}`]) {
      const logo: Blob = await fetch(logoUrl).then(data => data.blob())
      const logoBitmap: ImageBitmap = await createImageBitmap(logo)
      const [dx, dy] = logoUrl.indexOf('distretto') !== -1 ? [0, 0] : [this.#outputCanvas.width - 125, this.#outputCanvas.height - 125]
      ctx.drawImage(logoBitmap, dx, dy, 125, 125)
    }
  }

  get imageAsDataURL (): URL {
    if (!this.#outputCanvas) { throw new Error('Devi prima sovrapporre una cornice!') }
    return new URL(this.#outputCanvas.toDataURL('image/jpeg'))
  }
}
