import { Ratio, Zone } from './constants'
import Cropper from './Cropper'
import Frame from './Frame'
import Overlayer from './Overlayer'
import Downloader from './Downloader'

const form: HTMLFormElement = <HTMLFormElement>document.getElementById('upload-form')
const imageInput: HTMLInputElement = <HTMLInputElement>document.getElementById('image-input')
const zoneInput: HTMLInputElement = <HTMLInputElement>document.getElementById('zone')
const ratioInput: HTMLInputElement = <HTMLInputElement>document.getElementById('ratio')
const image: HTMLImageElement = <HTMLImageElement>document.getElementById('image')
const applyButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById('apply')

const errorMessage = "Si è verificato un errore! Aggiorna il tuo browser o riprova da PC (ti consigliamo di usare l'ultima versione di Google Chrome)."

imageInput.onchange = async () => {
  if (imageInput.files.length === 0) return
  const fileName = document.querySelector('.file-name')
  fileName.textContent = imageInput.files[0].name
  const ratio: Ratio = <Ratio>ratioInput.value
  const file: File = imageInput.files[0]
  try {
    await Cropper.initialize(file, image, ratio)
    applyButton.removeAttribute('disabled')
  } catch (error) {
    alert(errorMessage)
  }
}

ratioInput.onchange = () => {
  const ratio: Ratio = <Ratio>ratioInput.value
  Cropper.setAspectRatio(ratio)
}

form.onsubmit = async (e: Event) => {
  e.preventDefault()
  applyButton.classList.add('is-loading')
  const ratio: Ratio = <Ratio>ratioInput.value
  const zone: Zone = <Zone>zoneInput.value
  const croppedCanvas: HTMLCanvasElement = Cropper.croppedCanvas
  const frame: Frame = new Frame(ratio, zone)
  const overlayer: Overlayer = new Overlayer(croppedCanvas, frame)
  try {
    await overlayer.overlay()

    const dataUrl = overlayer.imageAsDataURL
    const file: File = imageInput.files[0]
    Downloader.download(dataUrl, file)
    applyButton.classList.remove('is-loading')
  } catch (error) {
    alert(errorMessage)
  }
}
