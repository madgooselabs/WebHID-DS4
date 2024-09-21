import { ControllerReport, ControllerReportsByTarget } from "./report"

export const DualShock5Reports : ControllerReportsByTarget = {
    BT: [],
    USB: [
        { reportID: 0x01, name: 'Get Controller State' },
//        { reportID: 0x02, name: 'Set Controller State' },
        { reportID: 0x03, name: 'Get Controller Abilities' },
        { reportID: 0x05, name: 'Get Calibration' },
        { reportID: 0x08, name: 'Get Bluetooth Control' },
        { reportID: 0x09, name: 'Get Controller and Host MAC' },
//        { reportID: 0x0A, name: 'Set Bluetooth Pairing' },
        { reportID: 0x20, name: 'Get Controller Version/Date (Firmware Info)' },
//        { reportID: 0x21, name: 'Set Audio Control' },
        { reportID: 0x22, name: 'Get Hardware Info' },
//        { reportID: 0x80, name: 'Set Test Command' },
        { reportID: 0x81, name: 'Get Test Result' },
//        { reportID: 0x82, name: 'Set Calibration Command' },
        { reportID: 0x83, name: 'Get Calibration Data' },
//        { reportID: 0x84, name: 'Set Individual Data' },
        { reportID: 0x85, name: 'Get Individual Data Result' },
//        { reportID: 0xA0, name: 'Set DFU Enable' },
        { reportID: 0xE0, name: 'Get System Profile' },
//        { reportID: 0xF0, name: 'Flash Command' },
//        { reportID: 0xF1, name: 'Get Flash Cmd Status' },
//        { reportID: 0xF2, name: '[Unknown]' },
//        { reportID: 0xF4, name: 'User Update Command' },
//        { reportID: 0xF5, name: 'User Get Update Status' },
    ]
}