import { hslToRgb } from './util/colorConversion'

/**
 * Stores and manages the lightbar state.
 */
export default class LightbarDevice {
  /** @ignore */
  constructor (private controller : any) {
  }
  
  /** @ignore */
  private _r = 0
  /** @ignore */
  private _g = 0
  /** @ignore */
  private _b = 0
  /** @ignore */
  private _blinkOn = 1
  /** @ignore */
  private _blinkOff = 0

  /**
   * Send Lightbar data to the controller.
   * @ignore
   */
  updateLightbar () {
    if (!this.controller.device) {
      throw new Error('Controller not initialized. You must call .init() first!')
    }
    return this.controller.sendLocalState()
  }

  /** Red Color Intensity (0-255) */
  get r () {
    return this._r
  }

  set r (value : number) {
    this._r = Math.min(255, Math.max(0, value))
    this.updateLightbar()
  }

  /** Green Color Intensity (0-255) */
  get g () {
    return this._g
  }

  set g (value : number) {
    this._g = Math.min(255, Math.max(0, value))
    this.updateLightbar()
  }

  /** Blue Color Intensity (0-255) */
  get b () {
    return this._b
  }

  set b (value : number) {
    this._b = Math.min(255, Math.max(0, value))
    this.updateLightbar()
  }

  /** Blink Speed On (0-255) */
  get blinkOn () {
    return this._blinkOn
  }

  set blinkOn (value : number) {
    this._blinkOn = Math.min(255, Math.max(0, value))
    this.updateLightbar()
  }

  /** Blink Speed Off (0-255) */
  get blinkOff () {
    return this._blinkOff
  }

  set blinkOff (value : number) {
    this._blinkOff = Math.min(255, Math.max(0, value))
    this.updateLightbar()
  }

  /**
   * Sets the lightbar color (RGB)
   * @param r - Red color intensity (0-255)
   * @param g - Green color intensity (0-255)
   * @param b - Blue color intensity (0-255)
   */
  async setColorRGB (r : number, g : number, b : number) {
    this._r = Math.min(255, Math.max(0, r))
    this._g = Math.min(255, Math.max(0, g))
    this._b = Math.min(255, Math.max(0, b))
    return this.updateLightbar()
  }

  /**
   * Sets the lightbar color (HSL)
   * @param h - Hue
   * @param s - Saturation
   * @param l - Lightness
   */
  async setColorHSL (h : number, s : number, l : number) {
    const color = hslToRgb(h, s, l)
    return this.setColorRGB(color.r, color.g, color.b)
  }
}