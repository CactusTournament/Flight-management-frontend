// src/setupTests.js
import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder in Node.js (for React Router 7)
import { TextEncoder, TextDecoder } from 'util';
if (typeof global.TextEncoder === 'undefined') {
	global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
	global.TextDecoder = TextDecoder;
}
