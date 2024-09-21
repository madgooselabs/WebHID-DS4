import { ControllerReport, ControllerReportsByTarget } from "./report"

export const DualShock4Reports : ControllerReportsByTarget = {
    BT: [],
    USB: [
        { reportID: 0x01, name: 'Get Controller State' },
        { reportID: 0x02, name: 'Get Calibration' },
        { reportID: 0x03, name: 'Get Controller Abilities' },
        { reportID: 0x12, name: 'Get Controller and Host MAC' },
        { reportID: 0x81, name: 'Get Controller MAC' },
        { reportID: 0xA3, name: 'Get Controller Version/Date' },
    ]
}