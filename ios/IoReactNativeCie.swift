import CieSDK
import React

@objc(IoReactNativeCie)
class IoReactNativeCie: RCTEventEmitter {
  private typealias ME = ModuleException
  
  private let cieSdk: CieDigitalId
  
  enum Event: String, CaseIterable {
    case onEvent = "onEvent"
    case onError = "onError"
    case onAttributesSuccess = "onAttributesSuccess"
    case onReadSuccess = "onReadSuccess"
  }
  
  override init() {
#if DEBUG
    self.cieSdk = CieDigitalId.init(.console)
#else
    self.cieSdk = CieDigitalId.init()
#endif
    super.init()
  }
  
  @objc override func supportedEvents() -> [String]! {
    return Event.allCases.map { $0.rawValue }
  }
  
  @objc func hasNfcFeature(
    _ resolve: RCTPromiseResolveBlock,
    withRejecter reject: RCTPromiseRejectBlock
  ) {
    resolve(true) // iOS devices always have NFC functionality
  }
  
  @objc func isNfcEnabled(
    _ resolve: RCTPromiseResolveBlock,
    withRejecter reject: RCTPromiseRejectBlock
  ) {
    resolve(CieDigitalId.isNFCEnabled())
  }
  
  @objc func isCieAuthenticationSupported(
    _ resolve: RCTPromiseResolveBlock,
    withRejecter reject: RCTPromiseRejectBlock
  ) {
    resolve(CieDigitalId.isNFCEnabled())
  }
  
  @objc func openNfcSettings(
    _ resolve: RCTPromiseResolveBlock,
    withRejecter reject: RCTPromiseRejectBlock
  ) {
    resolve(false) // iOS does not have NFC settings
  }
  
  @objc func setAlertMessage(
    _ key: String,
    withValue value: String
  ) {
    cieSdk.setAlertMessage(key: key, value: value)
  }
  
  @objc func setCustomIdpUrl(
    _ url: String
  ) {
    cieSdk.idpUrl = url
  }
  
  @objc func startReadingAttributes(
    _ timeout: Int,
    withResolver resolve: @escaping RCTPromiseResolveBlock,
    withRejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { [weak self] in
      guard let self = self else {
        ME.threadingError.reject(reject: reject)
        return
      }
      
      do {
        let atr = try await self.cieSdk.performReadAtr { event in
          // TODO add progress for iOS
          let payload: NSDictionary = [ "name" : "\(event)", "progress": 0.5]
          self.sendEvent(withName: Event.onEvent.rawValue, body: payload)
        }
        let cieType = CIEType.fromATR(atr)
        let payload: NSDictionary = [
          "type" : cieType.rawValue,
          "atr" : Data(atr).base64EncodedString()
        ]
        self.sendEvent(withName: Event.onAttributesSuccess.rawValue, body: payload)
      } catch  {
        if let nfcDigitalIdError = error as? NfcDigitalIdError {
          let payload: NSDictionary = ["name" : nfcDigitalIdError, "message" : nfcDigitalIdError.description]
          self.sendEvent(withName: Event.onError.rawValue, body: payload)
          return
        }
        ME.unexpected.reject(reject: reject)
      }
    }
  }
  
  @objc func startReading(
    _ pin: String,
    withAuthUrl authUrl: String,
    withTimeout timeout: Int,
    withResolver resolve: @escaping RCTPromiseResolveBlock,
    withRejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { [weak self] in
      guard let self = self else {
        ME.threadingError.reject(reject: reject)
        return
      }
      
      do {
        let authenticatedUrl = try await self.cieSdk.performAuthentication(forUrl: authUrl, withPin: pin) { event in
          // TODO add progress for iOS
          let payload: NSDictionary = [ "name" : "\(event)", "progress": 0.5]
          self.sendEvent(withName: Event.onEvent.rawValue, body: payload)
        }
        self.sendEvent(withName: Event.onAttributesSuccess.rawValue, body: authenticatedUrl)
      } catch  {
        if let nfcDigitalIdError = error as? NfcDigitalIdError {
          let payload: NSDictionary = ["name" : nfcDigitalIdError, "message" : nfcDigitalIdError.description]
          self.sendEvent(withName: Event.onError.rawValue, body: payload)
          return
        }
        ME.unexpected.reject(reject: reject)
      }
    }
  }
  
  private enum ModuleException: String, CaseIterable {
    case threadingError = "THREADING_ERROR"
    case unexpected = "UNEXPECTED_ERROR"
    
    func error(userInfo: [String : Any]? = nil) -> NSError {
      switch self {
      case .threadingError:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      case .unexpected:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      }
    }
    
    func reject(reject: RCTPromiseRejectBlock, _ moreUserInfo: (String, Any)...) {
      var userInfo = [String : Any]()
      moreUserInfo.forEach { userInfo[$0.0] = $0.1 }
      let error = error(userInfo: userInfo)
      reject("\(error.code)", error.domain, error)
    }
  }
  
}
