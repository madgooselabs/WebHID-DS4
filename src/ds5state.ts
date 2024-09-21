import { ControllerReport } from './report'

/**
 * Controller State
 * 
 * Stores information about the current controller state, and its components.
 */
export interface DualShock5State {
    /** Interface used for communication (USB/Bluetooth) */
    interface : DualShock5Interface

    /** Battery Level (0-100) */
    battery : number
    /** Is the battery being charged? */
    charging : boolean

    controllerType : number

    headphones : boolean
    microphone : boolean

    /** Audio state */
    audio : string

    /** Report List */
    reports : ControllerReport[]

    /** Analog positions */
    axes : DualShock5AnalogState
    /** Buttons pressed */
    buttons : DualShock5ButtonState
    /** Touchpad */
    touchpad : DualShock5Touchpad

    /** Timestamp of the last report */
    timestamp : number
}

/**
 * Button State
 * 
 * Stores information about the buttons that are currently being held.
 */
export interface DualShock5ButtonState {
    /** Triangle Button */
    triangle : boolean
    /** Circle Button */
    circle : boolean
    /** Cross Button */
    cross : boolean
    /** Square Button */
    square : boolean

    /** D-Pad Up */
    dPadUp : boolean
    /** D-Pad Right */
    dPadRight : boolean
    /** D-Pad Down */
    dPadDown : boolean
    /** D-Pad Left */
    dPadLeft : boolean

    /** L1 Button */
    l1 : boolean
    /** L2 Trigger (non-analog value) */
    l2 : boolean
    /** L3 Button */
    l3 : boolean

    /** R1 Button */
    r1 : boolean
    /** R2 Trigger (non-analog value) */
    r2 : boolean
    /** R3 Button */
    r3 : boolean

    /** Options Button */
    options : boolean
    /** Share Button */
    create : boolean
    /** PS Button */
    playStation : boolean

    /** Touchpad Button */
    touchPadClick : boolean

    /** Mute Button */
    mute : boolean

    /** DualSense Left Function Button */
    leftFunction : boolean

    /** DualSense Right Function Button */
    rightFunction : boolean

    /** DualSense Left Paddle Button */
    leftPaddle : boolean

    /** DualSense Right Paddle Button */
    rightPaddle : boolean
}

/**
 * Analog State
 * 
 * Stores information for analog axes.
 * 
 * - Values for thumbsticks are stored using the range **-1.0** (left, top) to **1.0** (right, bottom).
 *
 * - Values for triggers use the range **0.0** (released) to **1.0** (pressed)
 *
 * - Values for accelerometer and gyroscope use the raw input from the sensors.
 */
export interface DualShock5AnalogState {
    /** Left Stick Horizontal position. */
    leftStickX : number
    /** Left Stick Vertical position. */
    leftStickY : number

    /** Right Stick Horizontal position. */
    rightStickX : number
    /** Right Stick Vertical position. */
    rightStickY : number

    /** Left trigger analog value */
    l2 : number
    /** Right trigger analog value */
    r2 : number

    /** Accelerometer X */
    accelX : number
    /** Accelerometer Y */
    accelY : number
    /** Accelerometer Z */
    accelZ : number

    /** Angular velocity X */
    gyroX : number
    /** Angular velocity Y */
    gyroY : number
    /** Angular velocity Z */
    gyroZ : number
}

/** Touchpad State */
export interface DualShock5Touchpad {
    /** Current touches */
    touches : DualShock5TouchpadTouch[]
}

/**
 * Touchpad Touch Information
 * 
 * The touchpad's resolution is 1920x943.
 */
export interface DualShock5TouchpadTouch {
    /** Touch ID. Changes with every new touch. */
    touchId : number
    /** X Position. */
    x : number
    /** Y Position. */
    y : number
}

/**
 * Current Interface
 */
export enum DualShock5Interface {
    Disconnected = 'none',
    /** The controller is connected over USB */
    USB = 'usb',
    /** The controller is connected over BT */
    Bluetooth = 'bt'
}

/**
 * Controller Type
 */
export enum DualShock5ControllerType {
    Gamepad = 0,
    Guitar = 1,
    Drums = 2,
    Wheel = 6,
    Fightstick = 7,
    HOTAS = 8
}

/**
 * Default / Initial State
 * @ignore
 */
export const defaultState : DualShock5State = {
    interface: DualShock5Interface.Disconnected,
    battery: 0,
    charging: false,
    controllerType: 0,
    headphones: false,
    microphone: false,

    audio: '',

    reports: [],

    axes: {
        leftStickX: 0,
        leftStickY: 0,
        rightStickX: 0,
        rightStickY: 0,

        l2: 0,
        r2: 0,

        accelX: 0,
        accelY: 0,
        accelZ: 0,

        gyroX: 0,
        gyroY: 0,
        gyroZ: 0
    },

    buttons: {
        triangle: false,
        circle: false,
        cross: false,
        square: false,

        dPadUp: false,
        dPadRight: false,
        dPadDown: false,
        dPadLeft: false,

        l1: false,
        l2: false,
        l3: false,

        r1: false,
        r2: false,
        r3: false,

        options: false,
        create: false,
        playStation: false,
        touchPadClick: false,

        mute: false,
        leftFunction: false,
        rightFunction: false,
        leftPaddle: false,
        rightPaddle: false,
    },

    touchpad: {
        touches: []
    },

    timestamp: -1
}
