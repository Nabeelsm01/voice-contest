class AudioRecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // ลดพารามิเตอร์ให้เหลือแค่ที่จำเป็น
    this.bufferSize = 4096;  // เพิ่มจาก 2048 เป็น 4096
    this.prevSample = 0;
    this.alpha = 0.2; // ลดลงเพื่อให้ filter นุ่มนวลขึ้น
    this.smoothingBuffer = [];  // ใช้ Moving Average
  }
  
    // Moving Average Smoothing - ลดความถี่ที่ไม่สมูท
    smoothSample(sample) {
      this.smoothingBuffer.push(sample);
      if (this.smoothingBuffer.length > 10) {  // เก็บค่าล่าสุด 5 ค่า
        this.smoothingBuffer.shift();
      }
      return this.smoothingBuffer.reduce((a, b) => a + b, 0) / this.smoothingBuffer.length;
    }

  // ใช้เพียง low-pass filter แบบเรียบง่าย
  lowPassFilter(sample) {
    const filteredSample = this.alpha * sample + (1 - this.alpha) * this.prevSample;
    this.prevSample = filteredSample;
    return filteredSample;
  }
  
  // ป้องกันเสียงแตกด้วย limiter แบบเรียบง่าย
  limiter(sample, threshold = 0.90) { // เพิ่ม threshold ให้สูงขึ้น
    return Math.abs(sample) > threshold ? Math.sign(sample) * threshold : sample;
  }
  
  process(inputs, outputs) {
    const input = inputs[0];
  
    // ✅ เช็คว่ามีข้อมูลเข้ามาจริงก่อน
    if (!input || input.length === 0 || !input[0]) {
      return true; // ถ้าไม่มีข้อมูลให้ข้ามไป
    }
  
    let audioData = input[0];  
    let processedData = audioData.map(sample => 
      this.limiter(this.smoothSample(this.lowPassFilter(sample)))
    );
    this.port.postMessage({ audioData: processedData.slice() });
    return true;
  }
}

registerProcessor('audio-recorder-processor', AudioRecorderProcessor);