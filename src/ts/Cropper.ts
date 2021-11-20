import CropperLib from 'cropperjs'
import { Ratio } from './constants.d'

export default abstract class Cropper {
  static #cropper?: CropperLib = null

  static async initialize(file: File, image: HTMLImageElement, ratio: Ratio): Promise<Boolean> {
    return new Promise(resolve => {
      if (this.#cropper) this.#cropper.destroy()
      const fileReader = new FileReader()
      fileReader.onload = e => {
        image.src = <string>e.target.result
        this.#cropper = new CropperLib(image, {
          zoomable: false,
          viewMode: 3
        })
        this.setAspectRatio(ratio)
        resolve(true)
      }
      fileReader.readAsDataURL(file)
    })
  }

  static setAspectRatio(ratio: Ratio) {
    if (this.#cropper !== null)
      this.#cropper.setAspectRatio(this.#getActualRatio(ratio))
  }

  static #getActualRatio(ratio: Ratio): number {
    switch (ratio) {
      case Ratio.Square:
        return 1;
      case Ratio.Landscape:
        return 3 / 2;
        case Ratio.Landscape:
          return 2 / 3;
    }
  }

  static get croppedCanvas(): HTMLCanvasElement {
    return this.#cropper.getCroppedCanvas()
  }
}
