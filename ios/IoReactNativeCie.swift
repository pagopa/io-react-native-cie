import CieSDK
import React

@objc(IoReactNativeCie)
class IoReactNativeCie: RCTEventEmitter {
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
  
  @objc func startInternalAuthentication(
    _ challenge: String,
    withResultEncoding encodingString: String,
    withTimeout timeout: Int,
    withResolver resolve: @escaping RCTPromiseResolveBlock,
    withRejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { [weak self] in
      guard let self = self else {
        reject(ModuleException.threadingError.rawValue, "Failed to perform background operation, self was deallocated", nil)
        return
      }
      
      do {
        let internalAuthResponse = try await self.cieSdk.performInternalAuthentication(
          challenge: Array(challenge.utf8),
          handleReadEvent
        )
        let encoding = DataEncoding.from(string: encodingString)
        let payload: NSDictionary = [
          "nis": internalAuthResponse.nis.encodedDataString(encoding: encoding),
          "publicKey": internalAuthResponse.publicKey.encodedDataString(encoding: encoding),
          "sod": internalAuthResponse.sod.encodedDataString(encoding: encoding),
          "signedChallenge": internalAuthResponse.signedChallenge.encodedDataString(encoding: encoding)
        ]
        self.sendEvent(
          withName: EventType.onInternalAuthenticationSuccess.rawValue, body: payload)
        resolve(nil)
      } catch {
        guard let nfcDigitalIdError = error as? NfcDigitalIdError else {
          reject(ModuleException.unexpected.rawValue, error.localizedDescription, error)
          return
        }
        handleReadError(nfcDigitalIdError)
        resolve(nil)
      }
    }
  }
  
  @objc func startMRTDReading(
    _ can: String,
    withResultEncoding encodingString: String,
    withTimeout timeout: Int,
    withResolver resolve: @escaping RCTPromiseResolveBlock,
    withRejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { [weak self] in
      guard let self = self else {
        reject(ModuleException.threadingError.rawValue, "Failed to perform background operation, self was deallocated", nil)
        return
      }
      
      do {
        let mrtdResponse = try await self.cieSdk.performMtrd(
          can: can,
          handleReadEvent
        )
        let encoding = DataEncoding.from(string: encodingString)
        let payload: NSDictionary = [
          "dg1": mrtdResponse.dg1.encodedDataString(encoding: encoding),
          "dg11": mrtdResponse.dg11.encodedDataString(encoding: encoding),
          "sod": mrtdResponse.sod.encodedDataString(encoding: encoding)
        ]
        self.sendEvent(
          withName: EventType.onMRTDWithPaceSuccess.rawValue, body: payload)
        resolve(nil)
      } catch {
        guard let nfcDigitalIdError = error as? NfcDigitalIdError else {
          reject(ModuleException.unexpected.rawValue, error.localizedDescription, error)
          return
        }
        handleReadError(nfcDigitalIdError)
        resolve(nil)
      }
    }
  }
  
  @objc func startInternalAuthAndMRTDReading(
    _ can: String,
    withChallenge challenge: String,
    withResultEncoding encodingString: String,
    withTimeout timeout: Int,
    withResolver resolve: @escaping RCTPromiseResolveBlock,
    withRejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { [weak self] in
      guard let self = self else {
        reject(ModuleException.threadingError.rawValue, "Failed to perform background operation, self was deallocated", nil)
        return
      }
      
      do {
        let (mrtdResponse, internalAuthResponse) = try await self.cieSdk.performMRTDAndInternalAuthentication(
          challenge: Array(challenge.utf8),
          can: can,
          handleReadEvent
        )
        let encoding = DataEncoding.from(string: encodingString)
        let payload: NSDictionary = [
          "nis_data": [
            "nis": internalAuthResponse.nis.encodedDataString(encoding: encoding),
            "publicKey": internalAuthResponse.publicKey.encodedDataString(encoding: encoding),
            "sod": internalAuthResponse.sod.encodedDataString(encoding: encoding),
            "signedChallenge": internalAuthResponse.signedChallenge.encodedDataString(encoding: encoding)
          ],
          "mrtd_data": [
            "dg1": mrtdResponse.dg1.encodedDataString(encoding: encoding),
            "dg11": mrtdResponse.dg11.encodedDataString(encoding: encoding),
            "sod": mrtdResponse.sod.encodedDataString(encoding: encoding)
          ]
        ]
        self.sendEvent(
          withName: EventType.onInternalAuthAndMRTDWithPaceSuccess.rawValue, body: payload)
        resolve(nil)
      } catch {
        guard let nfcDigitalIdError = error as? NfcDigitalIdError else {
          reject(ModuleException.unexpected.rawValue, error.localizedDescription, error)
          return
        }
        handleReadError(nfcDigitalIdError)
        resolve(nil)
      }
    }
  }
  
  @objc func startReadingAttributes(
    _ timeout: Int,
    withResolver resolve: @escaping RCTPromiseResolveBlock,
    withRejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { [weak self] in
      guard let self = self else {
        reject(ModuleException.threadingError.rawValue, "Failed to perform background operation, self was deallocated", nil)
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
          reject(ModuleException.unexpected.rawValue, error.localizedDescription, error)
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
        reject(ModuleException.threadingError.rawValue, "Failed to perform background operation, self was deallocated", nil)
        return
      }
      
      guard pin.count == 8, pin.allSatisfy(\.isNumber) else {
        reject(ModuleException.invalidPin.rawValue, "Pin must be exactly 8 digits", nil)
        return
      }
      
      guard let url = URL(string: authUrl) else {
        reject(ModuleException.invalidAuthUrl.rawValue, "Auth URL is invalid", nil)
        return
      }
      
      do {
        let authenticatedUrl = try await self.cieSdk.performAuthentication(
          forUrl: url.absoluteString, withPin: pin, handleReadEvent)
        self.sendEvent(
          withName: EventType.onSuccess.rawValue, body: authenticatedUrl)
      } catch {
        guard let nfcDigitalIdError = error as? NfcDigitalIdError else {
          reject(ModuleException.unexpected.rawValue, error.localizedDescription, error)
          return
        }
        handleReadError(nfcDigitalIdError)
        resolve(nil)
      }
    }
  }
  
  @objc func startReadingCertificate(
    _ pin: String,
    withTimeout timeout: Int,
    withResolver resolve: @escaping RCTPromiseResolveBlock,
    withRejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { [weak self] in
      guard let self = self else {
        reject(ModuleException.threadingError.rawValue, "Failed to perform background operation, self was deallocated", nil)
        return
      }
      
      guard pin.count == 8, pin.allSatisfy(\.isNumber) else {
        reject(ModuleException.invalidPin.rawValue, "Pin must be exactly 8 digits", nil)
        return
      }
      
      do {
        let data = try await self.cieSdk.performCertificate(withPin: pin, handleReadEvent)
        self.sendEvent(
          withName: EventType.onCertificateSuccess.rawValue, body: ["name": data.name, "surname": data.surname, "docSerialNumber": data.docSerialNumber, "fiscalCode": data.fiscalCode])
      } catch {
        guard let nfcDigitalIdError = error as? NfcDigitalIdError else {
          reject(ModuleException.unexpected.rawValue, error.localizedDescription, error)
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
    var payload: [String: Any] = [:]
    
    switch error {
    case .invalidTag:
      payload = [ "name": ErrorType.NOT_A_CIE.rawValue, "message": error.description ]
    case .nfcError(let nfcError):
      switch nfcError.code {
      case .readerTransceiveErrorTagConnectionLost, .readerTransceiveErrorTagResponseError:
        payload = [ "name": ErrorType.TAG_LOST.rawValue, "message": error.description ]
      case .readerSessionInvalidationErrorUserCanceled:
        payload = [ "name": ErrorType.CANCELLED_BY_USER.rawValue, "message": error.description ]
      default:
        payload = [ "name": ErrorType.GENERIC_ERROR.rawValue, "message": error.description ]
      }
    case .errorBuildingApdu, .responseError:
      payload = [ "name": ErrorType.APDU_ERROR.rawValue, "message": error.description ]
    case .wrongPin(let attemptsLeft):
      payload = [ "name":ErrorType.WRONG_PIN.rawValue, "message": error.description, "attemptsLeft": attemptsLeft ]
    case .cardBlocked:
      payload = [ "name": ErrorType.CARD_BLOCKED.rawValue, "message": error.description ]
    case .sslError:
      payload = [ "name": ErrorType.CERTIFICATE_EXPIRED.rawValue, "message": error.description ]
    default:
      payload = [ "name": ErrorType.GENERIC_ERROR.rawValue, "message": error.description ]
    }
    
    self.sendEvent(withName: EventType.onError.rawValue, body: payload)
  }
  
  private enum EventType: String, CaseIterable {
    case onEvent
    case onError
    case onAttributesSuccess
    case onInternalAuthenticationSuccess
    case onMRTDWithPaceSuccess
    case onInternalAuthAndMRTDWithPaceSuccess
    case onSuccess
    case onCertificateSuccess
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
  }
}

