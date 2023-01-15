function getIp() {
  var clientIp;
  var clientIpUrl = 'https://api.ipify.org?format=json';
  var clientIpRequest = new XMLHttpRequest();
  clientIpRequest.open('GET', clientIpUrl, true);
  clientIpRequest.onload = function () {
    if (clientIpRequest.status >= 200 && clientIpRequest.status < 400) {
      // Success!
      var data = JSON.parse(clientIpRequest.responseText);
      clientIp = data.ip;
    } else {
      // We reached our target server, but it returned an error
    }
  };
  clientIpRequest.send();
}
// Check if Js can be executed
var canExecuteJs = false;
function jsIsRunning() {
  canExecuteJs = true;
}
if (typeof jsIsRunning === 'function') {
  jsIsRunning();
}
// Add hidden input to forms, if these inputs are filled, indicate with boolean that hidden inputs are filled

// ============

// Measure Rtt

// ============
var startTime;
var endTime;
window.onload = function () {
  startTime = Date.now();
};

window.onbeforeunload = function () {
  endTime = Date.now();
  var timeSpent = endTime - startTime;
};

var _userActions = [];
// Override the XMLHttpRequest object's open method to track API calls
var open = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url, async) {
  // Save the original arguments
  this._openArgs = { method, url, async };
  open.call(this, method, url, async);
};

// Override the onClick method to track user clicks
var onClick = Element.prototype.addEventListener;
var untrackedActions = ['error', 'canplaythrough', 'canplay'];
Element.prototype.addEventListener = function (event, callback, useCapture) {
  if (!untrackedActions.includes(event)) {
    var _callback = callback;
    callback = function (e) {
      _userActions.unshift({ event, time: Date.now() });
      _callback.apply(this, arguments);
    };
  }
  onClick.call(this, event, callback, useCapture);
};

function displayBotMessage() {
  var botMessage = document.createElement('div');
  botMessage.innerHTML = 'You are a bot';
  botMessage.style.color = 'red';
  botMessage.style.fontSize = '30px';
  botMessage.style.fontWeight = 'bold';
  botMessage.style.position = 'absolute';
  botMessage.style.top = '50%';
  botMessage.style.left = '50%';
  botMessage.style.transform = 'translate(-50%, -50%)';
  document.body.appendChild(botMessage);
}

var requestStart;
var requestEnd;

async function sendRTT() {
  var rtt = requestEnd - requestStart;
  var fetch = window.fetch;
  const body = {
    url: this._openArgs.url,
    method: this._openArgs.method,
    // request: arguments[0],
    userActions: _userActions || [],
    clientInformation: {
      rtt,
      canExecuteJs,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      endTime: endTime,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      vendor: navigator.vendor,
      appVersion: navigator.appVersion,
      appName: navigator.appName,
      appCodeName: navigator.appCodeName,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      product: navigator.product,
      productSub: navigator.productSub,
      vendorSub: navigator.vendorSub,
      doNotTrack: navigator.doNotTrack,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      msManipulationViewsEnabled: navigator.msManipulationViewsEnabled,
      msMaxTouchPoints: navigator.msMaxTouchPoints,
      msPointerEnabled: navigator.msPointerEnabled,
      pointerEnabled: navigator.pointerEnabled,
      serviceWorker: navigator.serviceWorker,
      webdriver: navigator.webdriver,
      deviceMemory: navigator.deviceMemory,
      languages: navigator.languages,
      // plugins: navigator.plugins,
      mimeTypes: navigator.mimeTypes,
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
        orientation: screen.orientation,
        availLeft: screen.availLeft,
        availTop: screen.availTop,
        availHeight: screen.availHeight,
        availWidth: screen.availWidth,
        colorDepth: screen.colorDepth,
        id: screen.id,
        internal: screen.internal,
        left: screen.left,
        orientation: screen.orientation,
        pixelDepth: screen.pixelDepth,
        primary: screen.primary,
        scaleFactor: screen.scaleFactor,
        top: screen.top
      },
      location: {
        hash: location.hash,
        host: location.host,
        hostname: location.hostname,
        href: location.href,
        origin: location.origin,
        pathname: location.pathname,
        port: location.port,
        protocol: location.protocol,
        search: location.search
      },
      history: {
        length: history.length,
        state: history.state
      },
      performance: {
        navigation: performance.navigation,
        timing: performance.timing
      }
    }
  };

  const result = await fetch('http://192.168.1.192:3080/evaluate/rtt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  // Status == 403 means that the user is a bot
  if (result.status === 403) {
    displayBotMessage();
  }
}

async function sendAnalytics() {
  var fetch = window.fetch;
  const body = {
    url: this._openArgs.url,
    method: this._openArgs.method,
    // request: arguments[0],
    userActions: _userActions || [],
    clientInformation: {
      canExecuteJs,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      endTime: endTime,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      vendor: navigator.vendor,
      appVersion: navigator.appVersion,
      appName: navigator.appName,
      appCodeName: navigator.appCodeName,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      product: navigator.product,
      productSub: navigator.productSub,
      vendorSub: navigator.vendorSub,
      doNotTrack: navigator.doNotTrack,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      msManipulationViewsEnabled: navigator.msManipulationViewsEnabled,
      msMaxTouchPoints: navigator.msMaxTouchPoints,
      msPointerEnabled: navigator.msPointerEnabled,
      pointerEnabled: navigator.pointerEnabled,
      serviceWorker: navigator.serviceWorker,
      webdriver: navigator.webdriver,
      deviceMemory: navigator.deviceMemory,
      languages: navigator.languages,
      // plugins: navigator.plugins,
      mimeTypes: navigator.mimeTypes,
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
        orientation: screen.orientation,
        availLeft: screen.availLeft,
        availTop: screen.availTop,
        availHeight: screen.availHeight,
        availWidth: screen.availWidth,
        colorDepth: screen.colorDepth,
        id: screen.id,
        internal: screen.internal,
        left: screen.left,
        orientation: screen.orientation,
        pixelDepth: screen.pixelDepth,
        primary: screen.primary,
        scaleFactor: screen.scaleFactor,
        top: screen.top
      },
      location: {
        hash: location.hash,
        host: location.host,
        hostname: location.hostname,
        href: location.href,
        origin: location.origin,
        pathname: location.pathname,
        port: location.port,
        protocol: location.protocol,
        search: location.search
      },
      history: {
        length: history.length,
        state: history.state
      },
      performance: {
        navigation: performance.navigation,
        timing: performance.timing
      }
      // localStorage: localStorage,
      // sessionStorage: sessionStorage,
      // indexedDB: indexedDB,
      // webkitIndexedDB: webkitIndexedDB,
      // mozIndexedDB: mozIndexedDB,
    }
    // window,
  };
  // Reset the user actions
  _userActions = [];
  requestStart = Date.now();
  const result = await fetch('http://192.168.1.192:3080/evaluate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  // Status == 403 means that the user is a bot
  if (result.status === 403) {
    displayBotMessage();
  }
}

// Override the XMLHttpRequest object's send method to track API calls
var send = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = async function () {
  var endPoints = window.bhOptions.endpoints;
  console.log('endPoints', endPoints);
  // Check if the request is included in one of the end points
  if (endPoints.some((endPoint) => this._openArgs.url.startsWith(endPoint))) {
    // if (this._openArgs.url.startsWith('https://tall-insects-feel-195-216-219-4.loca.lt/products')) {
    // Send the tracking data to the server
    sendAnalytics.apply(this, arguments);
    this.onreadystatechange = function () {
      // Request finished and response is ready
      if (this.readyState === 4) {
        requestEnd = Date.now();
        sendRTT.call(this);
      }
    };
  }
  send.apply(this, arguments);
};
