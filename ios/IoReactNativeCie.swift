import CieSDK
import React

@objc(IoReactNativeCie)
class IoReactNativeCie: RCTEventEmitter {
  private typealias ME = ModuleException

  private let cieSdk: CieDigitalId

  override init() {
    #if DEBUG
      self.cieSdk = CieDigitalId.init(.console)
    #else
      self.cieSdk = CieDigitalId.init()
    #endif
    super.init()
  }

  @objc override func supportedEvents() -> [String]! {
    return EventType.allCases.map { $0.rawValue }
  }

  @objc func hasNfcFeature(
    _ resolve: RCTPromiseResolveBlock,
    withRejecter reject: RCTPromiseRejectBlock
  ) {
    resolve(true)  // iOS devices always have NFC functionality
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
    resolve(false)  // iOS does not have NFC settings
  }

  @objc func setAlertMessage(
    _ key: String,
    withValue value: String
  ) {
    cieSdk.setAlertMessage(key: key, value: value)
  }

  @objc func setCurrentAlertMessage(
    _ value: String
  ) {
    cieSdk.alertMessage = value
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
        let atr = try await self.cieSdk.performReadAtr(handleReadEvent)
        let cieType = CIEType.fromATR(atr)
        let payload: NSDictionary = [
          "type": cieType.rawValue,
          "atr": Data(atr).base64EncodedString(),
        ]
        self.sendEvent(
          withName: EventType.onAttributesSuccess.rawValue, body: payload)
      } catch {
        guard let nfcDigitalIdError = error as? NfcDigitalIdError else {
          ME.unexpected.reject(
            reject: reject, ("error", error.localizedDescription))
          return
        }
        handleReadError(nfcDigitalIdError)
        resolve(nil)
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

      guard pin.count == 8, pin.allSatisfy(\.isNumber) else {
        ME.invalidPin.reject(reject: reject)
        return
      }

      guard let url = URL(string: authUrl) else {
        ME.invalidAuthUrl.reject(reject: reject)
        return
      }

      do {
        let authenticatedUrl = try await self.cieSdk.performAuthentication(
          forUrl: url.absoluteString, withPin: pin, handleReadEvent)
        self.sendEvent(
          withName: EventType.onReadSuccess.rawValue, body: authenticatedUrl)
      } catch {
        guard let nfcDigitalIdError = error as? NfcDigitalIdError else {
          ME.unexpected.reject(
            reject: reject, ("error", error.localizedDescription))
          return
        }
        handleReadError(nfcDigitalIdError)
        resolve(nil)
      }
    }
  }

  func handleReadEvent(event: CieSDK.CieDigitalIdEvent, progress: Float) {
    let payload: NSDictionary = ["name": "\(event)", "progress": progress]
    self.sendEvent(withName: EventType.onEvent.rawValue, body: payload)
  }

  func handleReadError(_ error: NfcDigitalIdError) {
    let payload: NSDictionary = [
      "name": mapError(error).rawValue, "message": error.description,
    ]
    self.sendEvent(withName: EventType.onError.rawValue, body: payload)
  }

  private func mapError(_ error: NfcDigitalIdError) -> ErrorType {
    switch error {
    case .invalidTag:
      return ErrorType.NOT_A_CIE
    case .nfcError(let nfcError):
      switch nfcError.code {
      case .readerTransceiveErrorTagConnectionLost,
        .readerTransceiveErrorTagResponseError:
        return ErrorType.TAG_LOST
      case .readerSessionInvalidationErrorUserCanceled:
        return ErrorType.CANCELLED_BY_USER
      default:
        return ErrorType.GENERIC_ERROR
      }
    case .errorBuildingApdu, .responseError:
      return ErrorType.APDU_ERROR
    case .wrongPin:
      return ErrorType.WRONG_PIN
    case .cardBlocked:
      return ErrorType.CARD_BLOCKED
    case .sslError(let status, let functionName):
      return ErrorType.CERTIFICATE_EXPIRED
    default:
      return ErrorType.GENERIC_ERROR
    }
  }

  private enum EventType: String, CaseIterable {
    case onEvent
    case onError
    case onAttributesSuccess
    case onReadSuccess
  }

  private enum ErrorType: String, CaseIterable {
    case NOT_A_CIE
    case TAG_LOST
    case CANCELLED_BY_USER
    case APDU_ERROR
    case WRONG_PIN
    case CARD_BLOCKED
    case NO_INTERNET_CONNECTION
    case CERTIFICATE_EXPIRED
    case CERTIFICATE_REVOKED
    case AUTHENTICATION_ERROR
    case GENERIC_ERROR
  }

  private enum ModuleException: String, CaseIterable {
    case invalidPin = "PIN_REGEX_NOT_VALID"
    case invalidAuthUrl = "INVALID_AUTH_URL"
    case threadingError = "THREADING_ERROR"
    case unexpected = "UNEXPECTED_ERROR"

    func error(userInfo: [String: Any]? = nil) -> NSError {
      switch self {
      case .invalidPin:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      case .invalidAuthUrl:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      case .threadingError:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      case .unexpected:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      }
    }

    func reject(reject: RCTPromiseRejectBlock, _ moreUserInfo: (String, Any)...)
    {
      var userInfo = [String: Any]()
      moreUserInfo.forEach { userInfo[$0.0] = $0.1 }
      let error = error(userInfo: userInfo)
      reject("\(error.code)", error.domain, error)
    }
  }

}

extension NfcDigitalIdError {
  var name: String {
    switch self {
    case .missingAuthenticationUrl: return "missingAuthenticationUrl"
    case .emptyPin: return "emptyPin"
    case .missingDeepLinkParameters: return "missingDeepLinkParameters"
    case .errorBuildingApdu: return "errorBuildingApdu"
    case .errorDecodingAsn1: return "errorDecodingAsn1"
    case .secureMessagingHashMismatch: return "secureMessagingHashMismatch"
    case .secureMessagingRequired: return "secureMessagingRequired"
    case .chipAuthenticationFailed: return "chipAuthenticationFailed"
    case .commonCryptoError: return "commonCryptoError"
    case .sslError: return "sslError"
    case .tlsUnsupportedAlgorithm: return "tlsUnsupportedAlgorithm"
    case .tlsHashingFailed: return "tlsHashingFailed"
    case .idpEmptyBody: return "idpEmptyBody"
    case .idpCodeNotFound: return "idpCodeNotFound"
    case .scanNotSupported: return "scanNotSupported"
    case .invalidTag: return "invalidTag"
    case .sendCommandForResponse: return "sendCommandForResponse"
    case .responseError: return "responseError"
    case .genericError: return "genericError"
    case .wrongPin: return "wrongPin"
    case .cardBlocked: return "cardBlocked"
    @unknown default:
      return "unknownValue"
    }
  }
}
