import { defaultState, DualShock5Interface, DualShock5ControllerType } from './ds5state'
import LightbarDevice from './lightbar'
import RumbleDevice from './rumble'
import { normalizeThumbstick, normalizeTrigger } from './util/normalize'
import { Buffer } from 'buffer'
import { crc32 } from 'crc'
import { ControllerReport } from './report'
import { DualShock5Reports } from './ds5reports'
import { buf2hex, buf2str } from './util/buffer'

export class DualShock5 {
    /** Internal WebHID device */
    device ?: HIDDevice

    /** Raw contents of the last HID Report sent by the controller. */
    lastReport ?: ArrayBuffer
    /** Raw contents of the last HID Report sent to the controller. */
    lastSentReport ?: ArrayBuffer

    /** Current controller state */
    state = defaultState

    /** Allows lightbar control */
    lightbar = new LightbarDevice(this)
    /** Allows rumble control */
    rumble = new RumbleDevice(this)

    selectedReport ?: ControllerReport
    lastTriggeredReport ?: string

    constructor () {
        if (!navigator.hid || !navigator.hid.requestDevice) {
            throw new Error('WebHID not supported by browser or not available.')
        }
    }

    getNameOfControllerType(controllerType : Number) : any {
        return (DualShock5ControllerType[controllerType] ? DualShock5ControllerType[controllerType] : `Unknown Type: 0x${controllerType.toString(16).padStart(2, '0')}`);
    }

    async getFeatureReport() {
        if (!this.selectedReport) return

        try {
            let dataReport = new Uint8Array((await this.device!.receiveFeatureReport(this.selectedReport.reportID)).buffer)
            this.lastTriggeredReport = `Report ID: ${buf2hex(dataReport.slice(0,1))}\n\nData: ${buf2hex(dataReport.slice(1))}\n\nString: ${buf2str(dataReport.slice(1))}`
        } catch (err:any) {
            this.lastTriggeredReport = err.toString()
        }
    }

    async init (dev ?: HIDDevice) {
        this.device = dev

        if (this.device) {
            await this.device.open()

            this.state.reports = this.device!.collections!.map(c => c.featureReports!.map(m => Number(m.reportId))).flat().map(r => ({reportID: r, name: DualShock5Reports.USB.find(f => f.reportID == r)?.name})).filter(r => r.name)
            if (this.state.reports.find(r => r.reportID == 0x03)) {
                this.device.oninputreport = (e : HIDInputReportEvent) => this.processControllerReport(e)
                
                // get device details
                let dataReport = new Uint8Array((await this.device!.receiveFeatureReport(0x03)).buffer)
                this.state.controllerType = dataReport[5]
            } else {
                this.state.controllerType = DualShock5ControllerType.Gamepad
            }
        } else {
            this.device = undefined
        }
    }

    /**
     * Parses a report sent from the controller and updates the state.
     * 
     * This function is called internally by the library each time a report is received.
     * 
     * @param report - HID Report sent by the controller.
     */
    private processControllerReport (report : HIDInputReportEvent) {
        const { data } = report
        this.lastReport = data.buffer

        // Interface is unknown
        if (this.state.interface === DualShock5Interface.Disconnected) {
            if (data.byteLength === 63) {
                this.state.interface = DualShock5Interface.USB
            } else {
                this.state.interface = DualShock5Interface.Bluetooth
                this.device!.receiveFeatureReport(0x02)
                return
            }
            // Player 1 Color
            this.lightbar.setColorRGB(0, 0, 64).catch(e => console.error(e))
        }

        this.state.timestamp = report.timeStamp

        // USB Reports
        if (this.state.interface === DualShock5Interface.USB && report.reportId === 0x01) {
            this.updateState(data)
        }
        // Bluetooth Reports
        if (this.state.interface === DualShock5Interface.Bluetooth && report.reportId === 0x11) {
            this.updateState(new DataView(data.buffer, 2))
            this.device!.receiveFeatureReport(0x02)
        }
    }

    /**
     * Updates the controller state using normalized data from the last report.
     * 
     * This function is called internally by the library each time a report is received.
     * 
     * @param data - Normalized data from the HID report.
     */
    private updateState (data : DataView) {
        // Update thumbsticks
        this.state.axes.leftStickX = normalizeThumbstick(data.getUint8(0))
        this.state.axes.leftStickY = normalizeThumbstick(data.getUint8(1))
        this.state.axes.rightStickX = normalizeThumbstick(data.getUint8(2))
        this.state.axes.rightStickY = normalizeThumbstick(data.getUint8(3))

        // Update main buttons
        const buttons1 = data.getUint8(7)
        this.state.buttons.triangle = !!(buttons1 & 0x80)
        this.state.buttons.circle = !!(buttons1 & 0x40)
        this.state.buttons.cross = !!(buttons1 & 0x20)
        this.state.buttons.square = !!(buttons1 & 0x10)
        // Update D-Pad
        const dPad = buttons1 & 0x0F
        this.state.buttons.dPadUp = dPad === 7 || dPad === 0 || dPad === 1
        this.state.buttons.dPadRight = dPad === 1 || dPad === 2 || dPad === 3
        this.state.buttons.dPadDown = dPad === 3 || dPad === 4 || dPad === 5
        this.state.buttons.dPadLeft = dPad === 5 || dPad === 6 || dPad === 7
        // Update additional buttons
        const buttons2 = data.getUint8(8)
        this.state.buttons.l1 = !!(buttons2 & 0x01)
        this.state.buttons.r1 = !!(buttons2 & 0x02)
        this.state.buttons.l2 = !!(buttons2 & 0x04)
        this.state.buttons.r2 = !!(buttons2 & 0x08)
        this.state.buttons.create = !!(buttons2 & 0x10)
        this.state.buttons.options = !!(buttons2 & 0x20)
        this.state.buttons.l3 = !!(buttons2 & 0x40)
        this.state.buttons.r3 = !!(buttons2 & 0x80)
        const buttons3 = data.getUint8(9)
        this.state.buttons.playStation = !!(buttons3 & 0x01)
        this.state.buttons.touchPadClick = !!(buttons3 & 0x02)
        this.state.buttons.mute = !!(buttons3 & 0x04)
        this.state.buttons.leftFunction = !!(buttons3 & 0x10)
        this.state.buttons.rightFunction = !!(buttons3 & 0x20)
        this.state.buttons.leftPaddle = !!(buttons3 & 0x40)
        this.state.buttons.rightPaddle = !!(buttons3 & 0x80)

        // Update Triggers
        this.state.axes.l2 = normalizeTrigger(data.getUint8(4))
        this.state.axes.r2 = normalizeTrigger(data.getUint8(5))

        // Update battery level
        this.state.charging = !!(data.getUint8(52) & 0x10)
        if (this.state.charging) {
            this.state.battery = Math.min(Math.floor((data.getUint8(52) & 0x0F) * 100 / 11))
        } else {
            this.state.battery = Math.min(100, Math.floor((data.getUint8(52) & 0x0F) * 100 / 8))
        }

        this.state.headphones = !!(data.getUint8(53) & 0x01)
        this.state.microphone = !!(data.getUint8(53) & 0x02)

        if (this.state.headphones && this.state.microphone) {
            this.state.audio = 'headset'
        } else if (this.state.headphones && !this.state.microphone) {
            this.state.audio = 'headphones'
        } else if (!this.state.headphones && this.state.microphone) {
            this.state.audio = 'microphone'
        } else {
            this.state.audio = 'volume-high'
        }

        // Update motion input
        this.state.axes.gyroX = data.getUint16(15)
        this.state.axes.gyroY = data.getUint16(17)
        this.state.axes.gyroZ = data.getUint16(19)
        this.state.axes.accelX = data.getInt16(21)
        this.state.axes.accelY = data.getInt16(23)
        this.state.axes.accelZ = data.getInt16(25)

        // Update touchpad
        this.state.touchpad.touches = []
        if (!(data.getUint8(34) & 0x80)) {
            this.state.touchpad.touches.push({
            touchId: data.getUint8(34) & 0x7F,
            x: (data.getUint8(36) & 0x0F) << 8 | data.getUint8(35),
            y: data.getUint8(37) << 4 | (data.getUint8(36) & 0xF0) >> 4
            })
        }
        if (!(data.getUint8(38) & 0x80)) {
            this.state.touchpad.touches.push({
            touchId: data.getUint8(38) & 0x7F,
            x: (data.getUint8(40) & 0x0F) << 8 | data.getUint8(39),
            y: data.getUint8(41) << 4 | (data.getUint8(40) & 0xF0) >> 4
            })
        }
    }

    /**
     * Sends the local rumble and lightbar state to the controller.
     * 
     * This function is called automatically in most cases.
     * 
     * **Currently broken over Bluetooth, doesn't do anything**
     */
    async sendLocalState () {
        if (!this.device) throw new Error('Controller not initialized. You must call .init() first!')

        if (this.state.interface === DualShock5Interface.USB) {
            const report = new Uint8Array(48)

            // Report ID
            report[0] = 0x02

            // Enable Rumble (0x01)
            report[1] = 0x01 | 0x02 | 0x04 | 0x08 | 0x10 | 0x20 | 0x40 | 0x80

            // Enable Mute Light (0x01), Mute Audio (0x02), Lightbar (0x04)
            report[2] = 0x01 | 0x02 | 0x04 | 0x10 | 0x40

            // Light rumble motor
            report[3] = this.rumble.light
            // Heavy rumble motor
            report[4] = this.rumble.heavy

            // Mute Light - 0=off, 1=on, 2=breathe, etc
            report[9] = 1

            // LED brightness
            report[39] = 0x03
            report[42] = 0x00
            report[43] = 0x02
            // Player LED
            report[44] = 0x04
            // Lightbar Red
            report[45] = this.lightbar.r
            // Lightbar Green
            report[46] = this.lightbar.g
            // Lightbar Blue
            report[47] = this.lightbar.b
            //// Lightbar Blink On
            //report[9] = this.lightbar.blinkOn
            //// Lightbar Blink Off
            //report[10] = this.lightbar.blinkOff

            this.lastSentReport = report.buffer

            return this.device.sendReport(report[0], report.slice(1))
        } else {
            const report = new Uint16Array(79)
            const crcBytes = new Uint8Array(4)
            const crcDv = new DataView(crcBytes.buffer)

            // Header
            report[0] = 0x31
            // Report ID
            report[1] = 0x02

            // Enable Rumble
            report[2] = 0x01 | 0x02 | 0x04 | 0x08 | 0x10 | 0x20 | 0x40 | 0x80
            // Enable lights
            report[3] = 0x01 | 0x02 | 0x04 | 0x10 | 0x40

            // Light rumble motor
            report[4] = this.rumble.light
            // Heavy rumble motor
            report[5] = this.rumble.heavy

            // Mute Light - 0=off, 1=on, 2=breathe, etc
            report[10] = 1

            // LED brightness
            report[40] = 0x03
            report[43] = 0x00
            report[44] = 0x02
            // Player LED
            report[45] = 0x04
            // Lightbar Red
            report[46] = this.lightbar.r
            // Lightbar Green
            report[47] = this.lightbar.g
            // Lightbar Blue
            report[48] = this.lightbar.b

            crcDv.setUint32(0, crc32(Buffer.from(report.slice(0, 75))))
            report[74] = crcBytes[3]
            report[75] = crcBytes[2]
            report[76] = crcBytes[1]
            report[77] = crcBytes[0]
            
            this.lastSentReport = report.buffer

            return this.device.sendReport(report[1], report.slice(2))
        }
    }
}