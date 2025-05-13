let ultrasonicSensorEcho = DigitalPin.P2; // 超声波传感器的Echo引脚
let ultrasonicSensorTrig = DigitalPin.P0; // 超声波传感器的Trig引脚
let lightSensorPin = AnalogPin.P2; // 光线传感器连接的引脚
let temperatureSensorPin = AnalogPin.P0; // 温度传感器连接的引脚

// 初始化通信模块
radio.setGroup(1); // 设置无线电通信组
radio.setTransmitPower(7); // 设置传输功率

// 初始化 AEB 系统（模拟）
let isAEBActive = false;

// 用户交互界面
input.onButtonPressed(Button.A, () => {
    isAEBActive = !isAEBActive;
    if (isAEBActive) {
        basic.showIcon(IconNames.Yes);
    } else {
        basic.showIcon(IconNames.No);
    }
data

// 车辆间通信：发送数据
function shareVehicleData(distance: number, temperature: number, lightLevel: number) {
    let data = {
        distance: distance.toString(), // 转换为字符串
        temperature: temperature.toString(), // 转换为字符串
        lightLevel: lightLevel.toString(), // 转换为字符串
        timestamp: control.millis().toString() // 转换为字符串
    };
    radio.sendValue("data", JSON.stringify(data)); //
}

// 车辆间通信：接收数据
radio.onReceivedValue(function (name, value) {
    if (name == "data") {
      let receivedData = JSON.parse(value); // 解析接收到的数据
        basic.showString("Rx: " + receivedData.distance);
    }
});

// 主循环：检测行人和环境
basic.forever(() => {
    // 读取传感器数据
    let distance = pins.analogReadPin(AnalogPin.P1); // 模拟读取超声波传感器数据
    let lightLevel = pins.analogReadPin(lightSensorPin); // 读取光线传感器数据
    let temperature = pins.analogReadPin(temperatureSensorPin); // 读取温度传感器数据

    // 检测行人或障碍物
    if (distance < 10 && isAEBActive) {
        // 触发紧急制动
        basic.showIcon(IconNames.Sad);
        triggerEmergencyBrake();
    } else if (distance < 20) {
        // 显示警告
        basic.showIcon(IconNames.Square);
        triggerWarning();
    } else {
        // 安全状态
        basic.showIcon(IconNames.Happy);
    }

    // 根据环境调整系统行为
    if (temperature < 10) {
        basic.showString("Cold");
    } else if (temperature > 30) {
        basic.showString("Hot");
    }

    if (lightLevel < 50) {
        basic.showString("Dark");
    } else {
        basic.showString("Bright");
    }

    // 将数据发送到其他车辆
    shareVehicleData(distance, temperature, lightLevel);

    basic.pause(5); // 每5ms检测一次
});

// 紧急制动函数
function triggerEmergencyBrake() {
    pins.digitalWritePin(DigitalPin.P0, 1); // 模拟制动信号
    basic.pause(2000); // 制动持续时间
    pins.digitalWritePin(DigitalPin.P0, 0);
}

// 警告函数
function triggerWarning() {
    music.playTone(262, music.beat(BeatFraction.Whole)); // 发出警告声音
}