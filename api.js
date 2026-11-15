// Public ESM entry. This module does not touch the DOM or fetch network resources.
export const VERSION='0.9.0';
export const API_VERSION='0.9';
export {TrolicError,parse,validate,compile,diagnose,svg,lottie,sample,compact,readable,retime,reframe,createRenderer} from './compiler.js';
export {deliveryProfiles,analyzeDelivery,compileForProfile,TrolicDeliveryError} from './delivery.js';
