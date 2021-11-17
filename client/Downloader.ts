export default abstract class Downloader {
  static download (url: URL, file: File) {
    const a: HTMLAnchorElement = <HTMLAnchorElement>document.createElement('a')
    a.href = url.href
    a.download = file.name.split('.').slice(0, -1).join('.') + '_cornice.jpg'
    a.click()
  }
}
