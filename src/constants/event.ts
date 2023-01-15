export const EVENTS_MOUSE = [
  'mousedown',
  'mousemove',
  'mouseup',
  'click',
  'dblclick',
  'contextmenu',
  'wheel',
  'mouseenter',
  'mouseleave',
  'mouseover',
  'mouseout',
  'pointermove',
  'focusin',
  'focusout',
  'pointerdown',
  'pointerup',
  'pointerover',
  'pointerout',
  'pointerenter',
  'pointerleave',
  'gotpointercapture',
  'lostpointercapture',
  'dragstart',
  'drag',
  'dragend',
  'dragenter',
  'dragover',
  'dragleave',
  'drop',
  'selectstart',
  'selectionchange',
  'select',
  'animationstart',
  'animationend',
  'animationiteration',
  'wheel'
];

export const EVENTS_CLIPBOARD = ['copy', 'cut', 'paste'];
export const EVENTS_KEYBOARD = ['keydown', 'keypress', 'keyup', 'compositionstart', 'compositionupdate', 'compositionend', 'textInput'];
export const EVENTS_TOUCH = ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'touchenter', 'touchleave', 'touchforcechange'];

export const EVENTS_MOBILE = [...EVENTS_MOUSE, ...EVENTS_CLIPBOARD, ...EVENTS_KEYBOARD, ...EVENTS_TOUCH];
export const EVENTS_DESKTOP = [...EVENTS_MOUSE, ...EVENTS_CLIPBOARD, ...EVENTS_KEYBOARD];
export const EVENTS_UNUSED_BOTS = ['blur', 'focus', 'focusin', 'focusout', 'mousemove', 'click', 'keydown', 'scroll', 'blur'];
