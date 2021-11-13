import CropperLib from 'cropperjs'
import { Ratio } from './constants.d'

export default abstract class Cropper {
  static #cropper?: CropperLib = null

  static initialize (file: File, image: HTMLImageElement, ratio: Ratio): Promise<Boolean> {
    return new Promise(resolve => {
      if (this.#cropper) this.#cropper.destroy()
      const fileReader = new FileReader()
      fileReader.onload = e => {
        image.src = <string>e.target.result
        this.#cropper = new CropperLib(image, {
          aspectRatio: ratio === Ratio.Square ? 1 : ratio === Ratio.Landscape ? 3 / 2 : ratio === Ratio.Portrait ? 2 / 3 : null,
          zoomable: false,
          viewMode: 3
        })
        resolve(true)
      }
      fileReader.readAsDataURL(file)
    })
  }

  static setAspectRatio (ratio: Ratio) {
    this.#cropper.setAspectRatio(ratio === Ratio.Square ? 1 : ratio === Ratio.Landscape ? 3 / 2 : ratio === Ratio.Portrait ? 2 / 3 : null)
  }

  static get croppedCanvas (): HTMLCanvasElement {
    return this.#cropper.getCroppedCanvas()
  }
}
