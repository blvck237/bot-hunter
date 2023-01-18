export interface AnalyticsInput {
  url: string;
  method: string;
  request: string;
  key: string;
  sessionDuration: number;
  clickedElement: any[];
  eventStats: AnalyticEventsSummary;
  clientInformation: AnalyticsInputClientInfo;
  userActions: AnalyticEvents[];
}

export interface AnalyticEventsSummary {
  avgTClicks: number;
  avgTKeydown: number;
  avgTScroll: number;
}
export interface AnalyticEvents {
  event: string;
  time: number;
}

export interface AnalyticsInputClientInfo {
  canExecuteJs: boolean;
  timeZone: string;
  startTime: number;
  endTime: number;
  userAgent: string;
  platform: string;
  language: string;
  vendor: string;
  appVersion: string;
  appName: string;
  appCodeName: string;
  cookieEnabled: true;
  onLine: true;
  product: string;
  productSub: string;
  vendorSub: string;
  doNotTrack: null;
  hardwareConcurrency: number;
  maxTouchPoints: 0;
  serviceWorker: {};
  webdriver: false;
  deviceMemory: number;
  languages: string[];
  mimeTypes: Record<string, any>;
  screen: AnalyticsInputScreen;
  location: AnalyticsInputLocation;
  history: { length: number; state: any };
  performance: AnalyticsInputPerformance;
}

export interface AnalyticsEvaluation {
  score: number;
}

export interface AnalyticsInputPerformance {
  navigation: { type: number; redirectCount: number };
  timing: {
    connectStart: number;
    navigationStart: number;
    secureConnectionStart: number;
    fetchStart: number;
    domContentLoadedEventStart: number;
    responseStart: number;
    domInteractive: number;
    domainLookupEnd: number;
    responseEnd: number;
    redirectStart: number;
    requestStart: number;
    unloadEventEnd: number;
    unloadEventStart: number;
    domLoading: number;
    domComplete: number;
    domainLookupStart: number;
    loadEventStart: number;
    domContentLoadedEventEnd: number;
    loadEventEnd: number;
    redirectEnd: number;
    connectEnd: number;
  };
}

export interface AnalyticsInputLocation {
  hash: string;
  host: string;
  hostname: string;
  href: string;
  origin: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
}

export interface AnalyticsInputScreen {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelDepth: number;
  orientation: {};
  availLeft: number;
  availTop: number;
  id: string;
  internal: boolean;
  left: number;
  primary: boolean;
  scaleFactor: number;
  top: number;
}
