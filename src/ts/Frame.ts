import { Color, Logo, Ratio, Zone } from './constants.d'

export default class Frame {
    #ratio: Ratio
    #color: Color
    #logo: Logo

    constructor (ratio: Ratio, zone: Zone) {
      this.#ratio = ratio
      this.#color = this.getColor(zone)
      this.#logo = this.getLogo(zone)
    }

    private getColor (zone: Zone): Color {
      switch (zone) {
        case Zone.Doc:
          return Color.Doc
        case Zone.Etruria:
          return Color.Etruria
        case Zone.Galileo:
          return Color.Galileo
        case Zone.Magnifico:
          return Color.Magnifico
        case Zone.Montalbano:
          return Color.Montalbano
        case Zone.Tirreno:
          return Color.Tirreno
        default:
          throw new Error('Zona non valida!')
      }
    }

    private getLogo (zone: Zone): Logo {
      switch (zone) {
        case Zone.Doc:
          return Logo.Doc
        case Zone.Etruria:
          return Logo.Etruria
        case Zone.Galileo:
          return Logo.Galileo
        case Zone.Magnifico:
          return Logo.Magnifico
        case Zone.Montalbano:
          return Logo.Montalbano
        case Zone.Tirreno:
          return Logo.Tirreno
        default:
          throw new Error('Zona non valida!')
      }
    }

    get ratio () { return this.#ratio }
    get color () { return this.#color }
    get logo () { return this.#logo }
}
