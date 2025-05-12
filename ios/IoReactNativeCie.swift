import CieSDK
import React

@objc(IoReactNativeCie)
class IoReactNativeCie: RCTEventEmitter {
  private typealias ME = ModuleException
  
  private let cieSdk: CieDigitalId
  private var readProgress: Float = 0
  
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
      
      // Reset read progress
      self.readProgress = 0;
      
      do {
        let atr = try await self.cieSdk.performReadAtr { event in
          self.readProgress = event.progressForAttributes
          let payload: NSDictionary = [ "name" : "\(event)", "progress": self.readProgress]
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
      
      // Reset read progress
      self.readProgress = 0;
      
      do {
        let authenticatedUrl = try await self.cieSdk.performAuthentication(forUrl: authUrl, withPin: pin) { event in
          self.readProgress = event.progressForAuth.filter { $0 > self.readProgress }.first ?? 0
          let payload: NSDictionary = [ "name" : "\(event)", "progress": self.readProgress]
          self.sendEvent(withName: Event.onEvent.rawValue, body: payload)
        }
        self.sendEvent(withName: Event.onReadSuccess.rawValue, body: authenticatedUrl)
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

public extension CieDigitalIdEvent {
  
  var progressForAttributes: Float {
    return (step.forAttributes ?? 0) / totalStepsForAttributes
  }
  
  var progressForAuth: [Float] {
    return step.forAuth?.map { $0 / totalStepsForAuth } ?? []
  }
  
  var totalStepsForAttributes: Float {
    return 7
  }
  
  var totalStepsForAuth: Float {
    return 30
  }
  
  var step: (forAttributes: Float?, forAuth: [Float]?) {
        switch self {
        case .ON_TAG_DISCOVERED:
          return (forAttributes: 1, forAuth: [1])
        case .CONNECTED:
          return (forAttributes: 2, forAuth: [2])
        case .GET_SERVICE_ID:
          return (forAttributes: nil, forAuth: [3])
        case .SELECT_IAS:
          return (forAttributes: 3, forAuth: [4, 7])
        case .SELECT_CIE:
          return (forAttributes: 4, forAuth: [5, 8])
        case .SELECT_ROOT:
          return (forAttributes: 5, forAuth: [5])
        case .SELECT_FOR_READ_FILE:
          return (forAttributes: 6, forAuth: [6, 13, 27])
        case .READ_FILE:
          return (forAttributes: 7, forAuth: [14, 28])
        case .DH_INIT_GET_G:
          return (forAttributes: nil, forAuth: [9])
        case .DH_INIT_GET_P:
          return (forAttributes: nil, forAuth: [10])
        case .DH_INIT_GET_Q:
          return (forAttributes: nil, forAuth: [11])
        case .READ_CHIP_PUBLIC_KEY:
          return (forAttributes: nil, forAuth: [12])
        case .GET_D_H_EXTERNAL_PARAMETERS:
          return (forAttributes: nil, forAuth: [15])
        case .SET_D_H_PUBLIC_KEY:
          return (forAttributes: nil, forAuth: [16])
        case .GET_ICC_PUBLIC_KEY:
          return (forAttributes: nil, forAuth: [17])
        case .CHIP_SET_KEY:
          return (forAttributes: nil, forAuth: [18])
        case .CHIP_VERIFY_CERTIFICATE:
          return (forAttributes: nil, forAuth: [19])
        case .CHIP_SET_CAR:
          return (forAttributes: nil, forAuth: [20])
        case .CHIP_GET_CHALLENGE:
          return (forAttributes: nil, forAuth: [21])
        case .CHIP_ANSWER_CHALLENGE:
          return (forAttributes: nil, forAuth: [22])
        case .SELECT_KEY:
          return (forAttributes: nil, forAuth: [23, 29])
        case .SIGN:
          return (forAttributes: nil, forAuth: [24, 30])
        case .VERIFY_PIN:
          return (forAttributes: nil, forAuth: [25])
        case .READ_CERTIFICATE:
          return (forAttributes: nil, forAuth: [26])
        default:
          return (forAttributes: nil, forAuth: nil)
        }
    }
}
