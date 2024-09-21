export interface ControllerReport {
    reportID : number,
    name ?: string
}

export interface ControllerReportsByTarget {
    BT : ControllerReport[],
    USB : ControllerReport[]
}