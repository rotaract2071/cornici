import { Ratio } from './constants.d'
import Frame from './Frame'

export default class Overlayer {
  #inputCanvas: HTMLCanvasElement
  #outputCanvas?: HTMLCanvasElement
  #frame: Frame
  #cache: Cache

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
    this.#cache = await window.caches.open('images')

    this.#drawImage()
    await this.#drawFrame()
    await this.#drawLogo()
  }

  #drawImage () {
    const ctx = this.#outputCanvas.getContext('2d')
    ctx.drawImage(this.#inputCanvas, 0, 0, this.#outputCanvas.width, this.#outputCanvas.height)
  }

  async #drawFrame () {
    const ctx = this.#outputCanvas.getContext('2d')
    const frameURL = new URL(`${this.#frame.ratio}.svg`, `${window.location.origin}/frames/`)
    const frameResponse = await this.#getFromCache(frameURL)
    const svgText = await frameResponse.text()
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

  async #drawLogo () {
    const ctx = this.#outputCanvas.getContext('2d')

    for (const logoName of ['distretto.avif', `${this.#frame.logo}`]) {
      const logoURL = new URL(logoName, `${window.location.origin}/logos/`)
      const logo: Blob = await this.#getFromCache(logoURL).then(data => data.blob())
      const logoBitmap: ImageBitmap = await createImageBitmap(logo)
      const [dx, dy] = logoName.indexOf('distretto') !== -1 ? [0, 0] : [this.#outputCanvas.width - 125, this.#outputCanvas.height - 125]
      ctx.drawImage(logoBitmap, dx, dy, 125, 125)
    }
  }

  async #getFromCache(path: URL): Promise<Response> {
    let response = await this.#cache.match(path.href)
    if (!response) {
      await this.#cache.add(path.href)
      response = await this.#cache.match(path.href)
    }
    return response
  }

  get imageAsDataURL (): URL {
    if (!this.#outputCanvas) { throw new Error('Devi prima sovrapporre una cornice!') }
    return new URL(this.#outputCanvas.toDataURL('image/jpeg'))
  }
}
