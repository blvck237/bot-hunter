function getIp(){console.log("getIp");var e,t=new XMLHttpRequest;t.open("GET","https://api.ipify.org?format=json",!0),t.onload=function(){t.status>=200&&t.status<400&&(e=JSON.parse(t.responseText).ip,console.log("clientIp",e))},t.send()}var startTime,endTime,requestStart,requestEnd,canExecuteJs=!1;function jsIsRunning(){console.log("JavaScript is executing"),canExecuteJs=!0}jsIsRunning(),window.onload=function(){startTime=Date.now()},window.onbeforeunload=function(){endTime=Date.now()};var _userActions=[],open=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(e,t,o){this._openArgs={method:e,url:t,async:o},open.call(this,e,t,o)};var onClick=Element.prototype.addEventListener,untrackedActions=["error","canplaythrough","canplay"];function displayBotMessage(){var e=document.createElement("div");e.innerHTML="You are a bot",e.style.color="red",e.style.fontSize="30px",e.style.fontWeight="bold",e.style.position="absolute",e.style.top="50%",e.style.left="50%",e.style.transform="translate(-50%, -50%)",document.body.appendChild(e)}async function sendRTT(){console.log("sendRTT",requestEnd,requestStart);var e=requestEnd-requestStart,t=window.fetch;let o={url:this._openArgs.url,method:this._openArgs.method,userActions:_userActions||[],clientInformation:{rtt:e,canExecuteJs,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,endTime:endTime,userAgent:navigator.userAgent,platform:navigator.platform,language:navigator.language,vendor:navigator.vendor,appVersion:navigator.appVersion,appName:navigator.appName,appCodeName:navigator.appCodeName,cookieEnabled:navigator.cookieEnabled,onLine:navigator.onLine,product:navigator.product,productSub:navigator.productSub,vendorSub:navigator.vendorSub,doNotTrack:navigator.doNotTrack,hardwareConcurrency:navigator.hardwareConcurrency,maxTouchPoints:navigator.maxTouchPoints,msManipulationViewsEnabled:navigator.msManipulationViewsEnabled,msMaxTouchPoints:navigator.msMaxTouchPoints,msPointerEnabled:navigator.msPointerEnabled,pointerEnabled:navigator.pointerEnabled,serviceWorker:navigator.serviceWorker,webdriver:navigator.webdriver,deviceMemory:navigator.deviceMemory,languages:navigator.languages,mimeTypes:navigator.mimeTypes,screen:{width:screen.width,height:screen.height,availWidth:screen.availWidth,availHeight:screen.availHeight,colorDepth:screen.colorDepth,pixelDepth:screen.pixelDepth,orientation:screen.orientation,availLeft:screen.availLeft,availTop:screen.availTop,availHeight:screen.availHeight,availWidth:screen.availWidth,colorDepth:screen.colorDepth,id:screen.id,internal:screen.internal,left:screen.left,orientation:screen.orientation,pixelDepth:screen.pixelDepth,primary:screen.primary,scaleFactor:screen.scaleFactor,top:screen.top},location:{hash:location.hash,host:location.host,hostname:location.hostname,href:location.href,origin:location.origin,pathname:location.pathname,port:location.port,protocol:location.protocol,search:location.search},history:{length:history.length,state:history.state},performance:{navigation:performance.navigation,timing:performance.timing}}},a=await t("http://192.168.1.192:3080/evaluate/rtt",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)});403===a.status&&displayBotMessage()}async function sendAnalytics(){var e=window.fetch;let t={url:this._openArgs.url,method:this._openArgs.method,userActions:_userActions||[],clientInformation:{canExecuteJs,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,endTime:endTime,userAgent:navigator.userAgent,platform:navigator.platform,language:navigator.language,vendor:navigator.vendor,appVersion:navigator.appVersion,appName:navigator.appName,appCodeName:navigator.appCodeName,cookieEnabled:navigator.cookieEnabled,onLine:navigator.onLine,product:navigator.product,productSub:navigator.productSub,vendorSub:navigator.vendorSub,doNotTrack:navigator.doNotTrack,hardwareConcurrency:navigator.hardwareConcurrency,maxTouchPoints:navigator.maxTouchPoints,msManipulationViewsEnabled:navigator.msManipulationViewsEnabled,msMaxTouchPoints:navigator.msMaxTouchPoints,msPointerEnabled:navigator.msPointerEnabled,pointerEnabled:navigator.pointerEnabled,serviceWorker:navigator.serviceWorker,webdriver:navigator.webdriver,deviceMemory:navigator.deviceMemory,languages:navigator.languages,mimeTypes:navigator.mimeTypes,screen:{width:screen.width,height:screen.height,availWidth:screen.availWidth,availHeight:screen.availHeight,colorDepth:screen.colorDepth,pixelDepth:screen.pixelDepth,orientation:screen.orientation,availLeft:screen.availLeft,availTop:screen.availTop,availHeight:screen.availHeight,availWidth:screen.availWidth,colorDepth:screen.colorDepth,id:screen.id,internal:screen.internal,left:screen.left,orientation:screen.orientation,pixelDepth:screen.pixelDepth,primary:screen.primary,scaleFactor:screen.scaleFactor,top:screen.top},location:{hash:location.hash,host:location.host,hostname:location.hostname,href:location.href,origin:location.origin,pathname:location.pathname,port:location.port,protocol:location.protocol,search:location.search},history:{length:history.length,state:history.state},performance:{navigation:performance.navigation,timing:performance.timing}}};_userActions=[],requestStart=Date.now();let o=await e("http://192.168.1.192:3080/evaluate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)});403===o.status&&displayBotMessage()}Element.prototype.addEventListener=function(e,t,o){if(!untrackedActions.includes(e)){var a=t;t=function(t){_userActions.unshift({event:e,time:Date.now()}),a.apply(this,arguments)}}onClick.call(this,e,t,o)};var send=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=async function(){this._openArgs.url.startsWith("https://tall-insects-feel-195-216-219-4.loca.lt/products")&&(sendAnalytics.apply(this,arguments),this.onreadystatechange=function(){4===this.readyState&&(requestEnd=Date.now(),sendRTT.call(this))}),send.apply(this,arguments)};