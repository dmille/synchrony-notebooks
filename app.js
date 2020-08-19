import { bufferToSynchrony } from "./synchrony.js";
import math from "mathjs";
import fs from "fs";

import dsp from "dspjs/dsp.js";

let rawdata = fs.readFileSync("samples-data.json");
let sample = JSON.parse(rawdata);

rawdata = fs.readFileSync("sample1.json");
let sample1 = JSON.parse(rawdata);

rawdata = fs.readFileSync("sample2.json");
let sample2 = JSON.parse(rawdata);

// let output = bufferToSynchrony(sample, 1600);

// const bins = sample[0].length;
// const fft = new dsp.FFT(256, 400);

// fft.forward(sample[0]);
// console.log(Object.keys(fft));
// console.log(fft.spectrum[0]);

const samp = [3, 5, -6, 2, 4, -1, -4, 1];

const fft = new dsp.FFT(8, 10);
fft.forward(samp);
console.log(Object.keys(fft));
console.log(fft.real);
console.log(fft.imag);
