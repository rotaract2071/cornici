import { Ratio, Zone } from './constants'
import Cropper from './Cropper'
import Frame from './Frame'
import Overlayer from './Overlayer'

const form: HTMLFormElement = <HTMLFormElement>document.getElementById('upload-form')
const imageInput: HTMLInputElement = <HTMLInputElement>document.getElementById('image-input')
const zoneInput: HTMLInputElement = <HTMLInputElement>document.getElementById('zone')
const ratioInput: HTMLInputElement = <HTMLInputElement>document.getElementById('ratio')
const image: HTMLImageElement = <HTMLImageElement>document.getElementById('image')
const applyButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById('apply')

imageInput.onchange = async () => {
  const ratio: Ratio = <Ratio>ratioInput.value
  const file: File = imageInput.files[0]
  await Cropper.initialize(file, image, ratio)
  applyButton.removeAttribute('disabled')
}

ratioInput.onchange = () => {
  const ratio: Ratio = <Ratio>ratioInput.value
  Cropper.setAspectRatio(ratio)
}

form.onsubmit = async (e: Event) => {
  e.preventDefault()
  const ratio: Ratio = <Ratio>ratioInput.value
  const zone: Zone = <Zone>zoneInput.value
  const croppedCanvas: HTMLCanvasElement = Cropper.croppedCanvas
  const frame: Frame = new Frame(ratio, zone)
  const overlayer: Overlayer = new Overlayer(croppedCanvas, frame)
  await overlayer.overlay()

  const a: HTMLAnchorElement = document.createElement('a')
  a.download = 'cornice.jpg'
  a.href = overlayer.imageAsDataURL
  a.click()
}
