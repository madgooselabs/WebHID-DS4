<template>
  <div>
    <div v-for="(controller, i) in controllers" :key="i">
      <h2>
        <div>Controller #{{i}}{{controller.device.productName ? ' &mdash; '+controller.device.productName : ''}} {{controller.state.interface.toUpperCase()}}</div>
        <div>Type: {{controller.getNameOfControllerType(controller.state.controllerType)}}</div>
        <div>Battery: {{controller.state.battery}}%</div>
        <span v-show="controller.state.charging"><font-awesome-icon icon="fa-solid fa-plug" /></span>
        <span v-show="controller.state.audio == 'headphones'"><font-awesome-icon icon="fa-solid fa-headphones" /></span>
        <span v-show="controller.state.audio == 'headset'"><font-awesome-icon icon="fa-solid fa-headset" /></span>
        <span v-show="controller.state.audio == 'microphone'"><font-awesome-icon icon="fa-solid fa-microphone" /></span>
        <span v-show="controller.state.audio == 'volume-high'"><font-awesome-icon icon="fa-solid fa-volume-high" /></span>
        <span v-show="controller.state.extension"><font-awesome-icon icon="fa-solid fa-link" /></span>
      </h2>
      <div class="params">
        <h4>Lightbar Color</h4>
        <label>R: </label><input type="range" min="0" max="255" v-model="controller.lightbar.r"> ({{controller.lightbar.r}})<br>
        <label>G: </label><input type="range" min="0" max="255" v-model="controller.lightbar.g"> ({{controller.lightbar.g}})<br>
        <label>B: </label><input type="range" min="0" max="255" v-model="controller.lightbar.b"> ({{controller.lightbar.b}})<br>
        <label>Blink On: </label><input type="range" min="0" max="255" v-model="controller.lightbar.blinkOn"> ({{controller.lightbar.blinkOn}})<br>
        <label>Blink Off: </label><input type="range" min="0" max="255" v-model="controller.lightbar.blinkOff"> ({{controller.lightbar.blinkOff}})
        <h4>Rumble</h4>
        <label>Weak: </label><input type="range" min="0" max="255" v-model="controller.rumble.light">  ({{controller.rumble.light}})<br>
        <label>Strong: </label><input type="range" min="0" max="255" v-model="controller.rumble.heavy">  ({{controller.rumble.heavy}})
      </div>
      <div class="buttons">
        <h3>Buttons</h3>
        <div class="btn" v-for="(button, btnKey) in controller.state.buttons" :key="btnKey" :style="{ opacity: button ? 1 : 0.5 }">
          <b class="name">{{btnKey}}</b><br>
          {{button ? '1.00' : '0.00'}}
        </div>
      </div>
      <div class="analogs">
        <h3>Analogs</h3>
        <div class="analog" v-for="(analog, anaKey) in controller.state.axes" :key="anaKey" :style="{ opacity: 0.5 + Math.min(0.5, Math.abs(analog) * .5) }">
          <b class="name">{{anaKey}}</b><br>
          {{analog.toFixed(2)}}
        </div>
      </div>
      <div class="touchpad">
        <h3>Touchpad</h3>
        <div v-if="!controller.state.touchpad.touches.length">
          No touches detected.
        </div>
        <div v-else v-for="touch in controller.state.touchpad.touches" :key="touch.touchId">
          <b>Touch #{{touch.touchId}}:</b> {{touch.x}}, {{touch.y}}
        </div>
      </div>
      <div class="reports">
        <h3>Reports</h3>
        <div>
            <label>Get Report:</label>
            <select class="report-select" v-model="controller.selectedReport">
                <option disabled value="">Select a report</option>
                <option v-for="report in controller.state.reports" :value="report">
                    {{ `0x${report.reportID.toString(16).padStart(2, '0')}${report.name ? ` - ${report.name}` : ''}` }}
                </option>
            </select>
        </div>
        <div>
            <textarea class="report-text" readonly v-model="controller.lastTriggeredReport"></textarea>
        </div>
        <div>
            <button @click="controller.getFeatureReport()">Get Report</button>
        </div>
      </div>
    </div>
    <br><br>
    <button v-if="hidSupported" @click="addController">Connect Controller</button>
    <div v-else>
      Your browser doesn't seem to support WebHID yet.<br>
      If you are using Chrome, make sure to have at least version 78, and enable the
      <a href="chrome://flags/#enable-experimental-web-platform-features">experimental web platform features</a> flag.
    </div>
  </div>
</template>
<style>
/* Default Light Mode Styles */
* {
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
}

body {
    font-weight: 300;
    margin: auto;
    padding: 16px;
    max-width: 960px;
}

h1, h2, h3, h4, h5 {
    font-weight: 100;
}

a {
    color: #689f38;
    text-decoration: none;
}

code {
    padding: 4px;
    border-radius: 2px;
}

code, pre {
    background: #e0e0e0;
}

pre {
    width: 100%;
    padding: 8px;
    border-radius: 5px;
    border: 1px solid #bdbdbd;
    overflow-x: auto;
}

blockquote {
    border-left: 2px solid #bdbdbd;
    padding-left: 4px;
    margin-left: 0;
}

img {
    max-height: 70vh;
    max-width: 100%;
}

.analogs .analog, .buttons .btn {
    display: inline-block;
    background: #aaa;
    margin: 4px;
    padding: 8px;
    transition: opacity 0.3s ease;
}

.analogs .analog {
    min-width: 64px;
}

.name {
    text-transform: capitalize;
}

.report-select {
    background: #e0e0e0;
    font-family: monospace;
}

.report-text {
    width: 100%;
    height: 200px;
    font-family: monospace;
}

/* Dark Mode Styles */
@media (prefers-color-scheme: dark) {
    body {
        background-color: #121212;
        color: #e0e0e0;
    }

    a {
        color: #9ccc65;
    }

    code, pre {
        background: #333;
        color: #e0e0e0;
    }

    pre {
        border: 1px solid #666;
    }

    blockquote {
        border-left: 2px solid #666;
    }

    .analogs .analog, .buttons .btn {
        background: #444;
    }

    .report-text, .report-select {
        background: #444;
        color: #e0e0e0;
    }
}
</style>
<script>
import { DeviceManager } from '../src'

export default {
    data () {
        return {
            controllers: []
        }
    },
    methods: {
        async addController () {
            if (!navigator.hid || !navigator.hid.requestDevice) {
                throw new Error('WebHID not supported by browser or not available.')
            }

            const deviceManager = new DeviceManager()
            deviceManager.onControllerAdded = (controller) => {
                if (controller.device) this.controllers.push(controller)
            }
            await deviceManager.init()
        }
    },
    computed: {
        hidSupported () {
            return !!(window.navigator.hid && window.navigator.hid.requestDevice)
        }
    }
}
</script>
