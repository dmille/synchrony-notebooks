import Observable from "rxjs";
import dsp from "./custom_imports/dsp/dsp.js";
// import dsp from "dspjs/dsp.js";
import math from "mathjs";

// import { groupByChannel } from '/imports/utils/groupByChannel';
// import logErrors from "/imports/utils/log-errors";

/**
 * @method bufferToSynchrony
 * Takes a buffer of samples and returns an array of synchrony values per frequency across channels
 *
 * @param {Object} options
 * @returns {Observable}
 */

export function bufferToSynchrony(samplesBuffer, sampleRate) {
  if (sampleRate === undefined || !sampleRate) sampleRate = 400;

  const phaser = (channelGroup, channel) => {
    // console.log(channelGroup);
    // console.log(channel);

    const bins = channelGroup.length;
    const fft = new dsp.FFT(bins, sampleRate);
    fft.forward(channelGroup);
    let real = Array.from(fft.real);
    let imag = Array.from(fft.imag);
    let phase = real.map((r, idx) => {
      let i = imag[idx];
      return math.atan2(i, r);
    });
    return Array.from(fft.phaseShift);
    return phase;
  };

  // reduce into arrays of a single frequemcy range with each element
  // in the array being the current phase for each channel. If we have
  // 8 channels, each array will be 8 elements long, and the overall array
  // will be as long as the number of frequencies we're reporting on.
  const consolidator = (acc, current, index) => {
    current.map((val, vindex) => {
      if (!acc[vindex]) {
        acc[vindex] = [];
      }
      acc[vindex].push(val);
    });
    return acc;
  };

  // Map the channels for each frequency into a matrix of relative synchrony values.
  // If we're doing 8 channels then we'd have an 8x8 matrix for each frequency, indicating
  // the relative synchrony of each channel to every other channel for that frequency.
  // The matrix contains -1 in the same channel/channel comparison, otherwise a number
  // indicating a degree of synhrony: closer to 1 is more synchrony, closer to 0 is less.
  // This way we can tell at a glance whether, for example, channels 2 and 7 are in
  // synchrony for a specific frequency, say 10 Mhz
  const comparator = (frequencyGroup) => {
    const comparisons = Array(frequencyGroup.length);

    frequencyGroup.map((val, index) => {
      comparisons[index] = frequencyGroup.map((innerVal, innerIndex) => {
        if (innerIndex === index) {
          return -1;
        }
        if (Math.abs(innerVal) >= Math.abs(val)) {
          if (innerVal === 0) {
            return 0;
          }
          return val / innerVal;
        } else {
          if (val === 0) {
            return 0;
          }
          return innerVal / val;
        }
      });
    });
    return comparisons;
  };

  const synchrony = function (samplesBuffer) {
    const phased = samplesBuffer.map(phaser);
    console.log(phased);
    const consolidated = phased.reduce(consolidator, []);

    const compared = consolidated.map(comparator);

    return compared;
  };
  return synchrony(samplesBuffer);
}
