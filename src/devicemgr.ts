import { DualShock4 } from './ds4'
import { DualShock5 } from './ds5'

export class DeviceManager {
    onControllerAdded = (controller:any) => {}

    knownDeviceList = [
        {
            deviceObject : DualShock4,
            devices : [
                // TODO: Add more compatible controllers?
                // Official Sony Controllers
                { vendorId: 0x054C, productId: 0x0BA0 },
                { vendorId: 0x054C, productId: 0x05C4 },
                { vendorId: 0x054C, productId: 0x09CC },
                { vendorId: 0x054C, productId: 0x05C5 },
                // Razer Raiju
                { vendorId: 0x1532, productId: 0x1000 },
                { vendorId: 0x1532, productId: 0x1007 },
                { vendorId: 0x1532, productId: 0x1004 },
                { vendorId: 0x1532, productId: 0x1009 },
                // Nacon Revol
                { vendorId: 0x146B, productId: 0x0D01 },
                { vendorId: 0x146B, productId: 0x0D02 },
                { vendorId: 0x146B, productId: 0x0D08 },
                // Other third party controllers
                { vendorId: 0x0F0D, productId: 0x00EE },
                { vendorId: 0x7545, productId: 0x0104 },
                { vendorId: 0x2E95, productId: 0x7725 },
                { vendorId: 0x11C0, productId: 0x4001 },
                { vendorId: 0x0C12, productId: 0x57AB },
                { vendorId: 0x0C12, productId: 0x0E16 },
                { vendorId: 0x0F0D, productId: 0x0084 },
                // GP2040-CE known IDs
                { vendorId: 0x1532, productId: 0x0401 },
                { vendorId: 0x33df, productId: 0x0011 },
                { vendorId: 0x0738, productId: 0x8180 },
                // Best guess third party controllers
                { usagePage: 0xFF00, usage: 1 },
                { usagePage: 1, usage: 5 },
            ]
        },
        {
            deviceObject : DualShock5, 
            devices : [
                // DualSense
                { vendorId: 0x054C, productId: 0x0CE6 },
            ]
        },
    ]

    constructor () {
        if (!navigator.hid || !navigator.hid.requestDevice) {
            throw new Error('WebHID not supported by browser or not available.')
        }
    }

    async init() {
        let knownDevices = this.knownDeviceList!.flatMap(d => Object.values(d.devices).flat())

        const devices = await navigator.hid.requestDevice({ filters: knownDevices })

        if (devices.length > 0) {
            //console.dir(devices);
            let device = devices[0];
            let deviceClass = this.knownDeviceList.map(d => Object.values(d.devices).flat().find(v => v.vendorId == device.vendorId && v.productId == device.productId) ? d.deviceObject : undefined ).find(c => c)
            
            if (deviceClass) {
                let controller = new deviceClass()
                controller.init(device)
                console.dir(controller)
                this.onControllerAdded(controller)
            }
        }
    }
}