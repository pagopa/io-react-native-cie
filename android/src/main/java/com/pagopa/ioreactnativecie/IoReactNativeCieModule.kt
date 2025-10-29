package com.pagopa.ioreactnativecie

import android.util.Base64
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.pagopa.ioreactnativecie.cie.Atr
import it.pagopa.io.app.cie.CieLogger
import it.pagopa.io.app.cie.CieSDK
import it.pagopa.io.app.cie.cie.CieAtrCallback
import it.pagopa.io.app.cie.cie.NfcError
import it.pagopa.io.app.cie.cie.NfcEvent
import it.pagopa.io.app.cie.network.NetworkCallback
import it.pagopa.io.app.cie.network.NetworkError
import it.pagopa.io.app.cie.nfc.NfcEvents
import it.pagopa.io.app.cie.nis.InternalAuthenticationResponse
import it.pagopa.io.app.cie.nis.NisCallback
import it.pagopa.io.app.cie.toHex
import java.net.URL

class IoReactNativeCieModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  init {
    CieLogger.enabled = BuildConfig.DEBUG
  }

  override fun getName(): String {
    return NAME
  }

  /**
   * Lazy value ensures it is initialized with a valid activity when first used.
   */
  val cieSdk: CieSDK by lazy {
    CieSDK.withContext(currentActivity)
  }

  @Suppress("unused")
  @ReactMethod
  fun addListener(eventName: String) {
  }

  @Suppress("unused")
  @ReactMethod
  fun removeListeners(count: Int) {
  }

  @Suppress("unused")
  @ReactMethod
  fun hasNfcFeature(promise: Promise) {
    try {
      cieSdk.hasNfcFeature().let {
        promise.resolve(it)
      }
    } catch (e: Exception) {
      promise.reject(ModuleException.UNKNOWN_EXCEPTION, e.message, e)
    }
  }

  @Suppress("unused")
  @ReactMethod
  fun isNfcEnabled(promise: Promise) {
    try {
      cieSdk.isNfcAvailable().let {
        promise.resolve(it)
      }
    } catch (e: Exception) {
      promise.reject(ModuleException.UNKNOWN_EXCEPTION, e.message, e)
    }
  }

  @Suppress("unused")
  @ReactMethod
  fun isCieAuthenticationSupported(promise: Promise) {
    cieSdk.isCieAuthenticationSupported().apply {
      promise.resolve(this)
    }
  }

  @Suppress("unused")
  @ReactMethod
  fun openNfcSettings(promise: Promise) {
    try {
      cieSdk.openNfcSettings()
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject(ModuleException.UNKNOWN_EXCEPTION, e.message, e)
    }
  }

  @Suppress("unused")
  @ReactMethod
  fun setAlertMessage(key: String, value: String) {
    // Android does not support alert messages for NFC reading
  }

  @Suppress("unused")
  @ReactMethod
  fun setCurrentAlertMessage(value: String) {
    // Android does not support alert messages for NFC reading
  }

  @Suppress("unused")
  @ReactMethod
  fun setCustomIdpUrl(url: String) {
    cieSdk.withCustomIdpUrl(url)
  }

  @Suppress("unused")
  @ReactMethod
  fun startInternalAuthentication(
    challenge: String,
    resultEncoding: String,
    timeout: Int = 10000,
    promise: Promise,
  ) {
    val encoding: ResultEncoding = ResultEncoding.fromString(resultEncoding)
    try {
      cieSdk.startReadingNis(challenge, timeout, object : NfcEvents {
        override fun event(event: NfcEvent) {
          this@IoReactNativeCieModule.reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EventType.EVENT.value, WritableNativeMap().apply {
              putString("name", event.name)
              putDouble(
                "progress",
                (event.numeratorForNis.toDouble() / NfcEvent.totalNisOfNumeratorEvent.toDouble())
              )
            })
        }

        override fun error(error: NfcError) {
          this@IoReactNativeCieModule.reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EventType.ERROR.value, WritableNativeMap().apply {
              putString("name", mapNfcError(error).name)
              error.msg?.let { putString("message", it) }
            })

        }
      }, object : NisCallback {
        override fun onSuccess(nisAuth: InternalAuthenticationResponse) {
          this@IoReactNativeCieModule.reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EventType.INTERNAL_AUTHENTICATION_SUCCESS.value, WritableNativeMap().apply {
              putString("nis", encoding.encode(nisAuth.nis))
              putString("publicKey", encoding.encode(nisAuth.kpubIntServ))
              putString("sod", encoding.encode(nisAuth.sod))
              putString("signedChallenge", encoding.encode(nisAuth.challengeSigned))
            })
        }

        override fun onError(error: NfcError) {
          this@IoReactNativeCieModule.reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EventType.ERROR.value, WritableNativeMap().apply {
              putString("name", mapNfcError(error).name)
              error.msg?.let { putString("message", it) }
            })
        }
      })
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject(ModuleException.UNKNOWN_EXCEPTION, e.message, e)
    }
  }

  @Suppress("unused")
  @ReactMethod
  fun startReadingAttributes(
    timeout: Int = 10000,
    promise: Promise,
  ) {
    try {
      cieSdk.startReadingCieAtr(timeout, object : NfcEvents {
        override fun event(event: NfcEvent) {
          this@IoReactNativeCieModule.reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EventType.EVENT.value, WritableNativeMap().apply {
              putString("name", event.name)
              putDouble(
                "progress",
                (event.numeratorForKindOf.toDouble() / NfcEvent.totalKindOfNumeratorEvent.toDouble())
              )
            })
        }

        override fun error(error: NfcError) {
          this@IoReactNativeCieModule.reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EventType.ERROR.value, WritableNativeMap().apply {
              putString("name", mapNfcError(error).name)
              error.msg?.let { putString("message", it) }
            })

        }
      }, object : CieAtrCallback {
        override fun onSuccess(atr: ByteArray) {
          this@IoReactNativeCieModule.reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EventType.ATTRIBUTES_SUCCESS.value, WritableNativeMap().apply {
              putString("base64", Base64.encodeToString(atr, Base64.DEFAULT))
              putString("type", Atr(atr).getCieType().name)
            })
        }

        override fun onError(error: NfcError) {
          this@IoReactNativeCieModule.reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EventType.ERROR.value, WritableNativeMap().apply {
              putString("name", mapNfcError(error).name)
              error.msg?.let { putString("message", it) }
            })
        }
      })
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject(ModuleException.UNKNOWN_EXCEPTION, e.message, e)
    }
  }

  @Suppress("unused")
  @ReactMethod
  fun startReading(
    pin: String,
    authenticationUrl: String,
    timeout: Int = 10000,
    promise: Promise,
  ) {
    try {
      cieSdk.setPin(pin)
    } catch (e: Exception) {
      promise.reject(ModuleException.PIN_REGEX_NOT_VALID, e.message, e)
      return
    }

    try {
      cieSdk.withUrl(URL(authenticationUrl).toString())
    } catch (e: Exception) {
      promise.reject(ModuleException.INVALID_AUTH_URL, e.message, e)
      return
    }

    try {
      cieSdk.startReading(timeout, object : NfcEvents {
        override fun event(event: NfcEvent) {
          this@IoReactNativeCieModule.reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EventType.EVENT.value, WritableNativeMap().apply {
              putString("name", event.name)
              putDouble(
                "progress", (event.numerator.toDouble() / NfcEvent.totalNumeratorEvent.toDouble())
              )
            })
        }

        override fun error(error: NfcError) {
          this@IoReactNativeCieModule.reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EventType.ERROR.value, WritableNativeMap().apply {
              putString("name", mapNfcError(error).name)
              error.msg?.let { putString("msg", it) }
              error.numberOfAttempts?.let { putInt("attemptsLeft", it) }
            })

        }
      }, object : NetworkCallback {
        override fun onSuccess(url: String) {
          this@IoReactNativeCieModule.reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EventType.SUCCESS.value, url)
        }

        override fun onError(networkError: NetworkError) {
          this@IoReactNativeCieModule.reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EventType.ERROR.value, WritableNativeMap().apply {
              putString("name", mapNetworkError(networkError).name)
              networkError.msg?.let { putString("message", it) }
            })
        }
      })
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject(ModuleException.UNKNOWN_EXCEPTION, e.message, e)
    }
  }

  @Suppress("unused")
  @ReactMethod
  fun stopReading() {
    cieSdk.stopNFCListening()
  }

  fun mapNfcError(error: NfcError): ErrorType {
    return when (error) {
      NfcError.NOT_A_CIE -> ErrorType.NOT_A_CIE
      NfcError.TAG_LOST -> ErrorType.TAG_LOST
      NfcError.APDU_ERROR -> ErrorType.APDU_ERROR
      NfcError.EXTENDED_APDU_NOT_SUPPORTED -> ErrorType.APDU_ERROR
      NfcError.WRONG_PIN -> ErrorType.WRONG_PIN
      NfcError.PIN_BLOCKED -> ErrorType.CARD_BLOCKED
      else -> ErrorType.GENERIC_ERROR
    }
  }

  fun mapNetworkError(error: NetworkError): ErrorType {
    return when (error) {
      NetworkError.NO_INTERNET_CONNECTION -> ErrorType.NO_INTERNET_CONNECTION
      NetworkError.CERTIFICATE_EXPIRED -> ErrorType.CERTIFICATE_EXPIRED
      NetworkError.CERTIFICATE_REVOKED -> ErrorType.CERTIFICATE_REVOKED
      NetworkError.AUTHENTICATION_ERROR -> ErrorType.AUTHENTICATION_ERROR
      else -> ErrorType.GENERIC_ERROR
    }
  }

  companion object {
    const val NAME = "IoReactNativeCie"

    enum class ResultEncoding(val value: String) {
      BASE64("base64"),
      HEX("hex");

      fun encode(data: ByteArray): String = when (this) {
        BASE64 -> Base64.encodeToString(data, Base64.URL_SAFE or Base64.NO_WRAP)
        HEX -> data.toHex().uppercase()
      }

      companion object {
        fun fromString(value: String?): ResultEncoding {
          return when (value) {
            "hex" -> HEX
            "base64" -> BASE64
            else -> BASE64 // Default
          }
        }
      }
    }

    enum class EventType(val value: String) {
      EVENT("onEvent"),
      ERROR("onError"),
      ATTRIBUTES_SUCCESS("onAttributesSuccess"),
      INTERNAL_AUTHENTICATION_SUCCESS("onInternalAuthenticationSuccess"),
      SUCCESS("onSuccess")
    }

    enum class ErrorType {
      NOT_A_CIE,
      TAG_LOST,
      APDU_ERROR,
      WRONG_PIN,
      CARD_BLOCKED,
      NO_INTERNET_CONNECTION,
      CERTIFICATE_EXPIRED,
      CERTIFICATE_REVOKED,
      AUTHENTICATION_ERROR,
      GENERIC_ERROR,
    }

    private object ModuleException {
      const val PIN_REGEX_NOT_VALID = "PIN_REGEX_NOT_VALID"
      const val INVALID_AUTH_URL = "INVALID_AUTH_URL"
      const val UNKNOWN_EXCEPTION = "UNKNOWN_EXCEPTION"
    }
  }
}
