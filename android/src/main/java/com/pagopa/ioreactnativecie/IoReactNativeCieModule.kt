package com.pagopa.ioreactnativecie

import android.util.Base64
import android.util.Log
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.pagopa.ioreactnativecie.cie.Atr
import com.pagopa.ioreactnativecie.cie.CieType
import it.pagopa.io.app.cie.CieLogger
import it.pagopa.io.app.cie.CieSDK
import it.pagopa.io.app.cie.cie.CieAtrCallback
import it.pagopa.io.app.cie.cie.NfcError
import it.pagopa.io.app.cie.cie.NfcEvent
import it.pagopa.io.app.cie.network.NetworkCallback
import it.pagopa.io.app.cie.network.NetworkError
import it.pagopa.io.app.cie.nfc.NfcEvents


class IoReactNativeCieModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

  /**
   * Lazy value ensures it is initialized with a valid activity when first used.
   */
  val cieSdk: CieSDK by lazy {
    CieSDK.withContext(currentActivity)
  };

  private var listenerCount = 0

  @ReactMethod
  fun addListener(eventName: String) {
    if (listenerCount == 0) {
      // Set up any upstream listeners or background tasks as necessary
    }

    listenerCount += 1
  }

  @ReactMethod
  fun removeListeners(count: Int) {
    listenerCount -= count
    if (listenerCount == 0) {
      // Remove upstream listeners, stop unnecessary background tasks
    }
  }

  @ReactMethod
  fun hasNfcFeature(promise: Promise) {
    try {
      cieSdk.hasNfcFeature().let {
        promise.resolve(it)
      }
    } catch (e: Exception) {
      ModuleException.UNKNOWN_EXCEPTION.reject(
        promise,
        Pair(ERROR_USER_INFO_KEY, e.message.orEmpty())
      )
    }
  }

  @ReactMethod
  fun isNfcEnabled(promise: Promise) {
    try {
      cieSdk.isNfcAvailable().let {
        promise.resolve(it)
      }
    } catch (e: Exception) {
      ModuleException.UNKNOWN_EXCEPTION.reject(
        promise,
        Pair(ERROR_USER_INFO_KEY, e.message.orEmpty())
      )
    }
  }

  @ReactMethod
  fun isCieAuthenticationSupported(promise: Promise) {
    cieSdk.isCieAuthenticationSupported().apply {
      promise.resolve(this)
    }
  }

  @ReactMethod
  fun openNfcSettings(promise: Promise) {
    try {
      cieSdk.openNfcSettings()
      promise.resolve(null)
    } catch (e: Exception) {
      ModuleException.UNKNOWN_EXCEPTION.reject(
        promise,
        Pair(ERROR_USER_INFO_KEY, e.message.orEmpty())
      )
    }
  }

  @ReactMethod
  fun setCustomIdpUrl(url: String) {
    cieSdk.withCustomIdpUrl(url)
  }

  @ReactMethod
  fun startReadingAttributes(
    timeout: Int = 10000,
    promise: Promise,
  ) {
    try {
      cieSdk.startReadingCieAtr(
        timeout,
        object : NfcEvents {
          override fun event(event: NfcEvent) {
            this@IoReactNativeCieModule.reactApplicationContext
              .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
              .emit("onEvent", WritableNativeMap().apply {
                putString("name", event.name)
                putDouble(
                  "progress",
                  (event.numeratorForKindOf.toDouble() / NfcEvent.totalKindOfNumeratorEvent.toDouble())
                )
              })
          }

          override fun error(error: NfcError) {
            this@IoReactNativeCieModule.reactApplicationContext
              .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
              .emit("onError", WritableNativeMap().apply {
                putString("name", error.name)
                error.numberOfAttempts?.let {
                  putInt("numberOfAttempts", it)
                }
                error.msg?.let {
                  putString("message", it)
                }
              })

          }
        }, object : CieAtrCallback {
          override fun onSuccess(atr: ByteArray) {
            this@IoReactNativeCieModule.reactApplicationContext
              .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
              .emit("onAttributesSuccess", WritableNativeMap().apply {
                putString("base64", Base64.encodeToString(atr, Base64.DEFAULT))
                putString("type", Atr(atr).getCieType().name)
              })
          }

          override fun onError(error: NfcError) {
            this@IoReactNativeCieModule.reactApplicationContext
              .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
              .emit("onError", WritableNativeMap().apply {
                putString("name", error.name)
                error.numberOfAttempts?.let {
                  putInt("numberOfAttempts", it)
                }
                error.msg?.let {
                  putString("message", it)
                }
              })
          }
        }
      )
      promise.resolve(null)
    } catch (e: Exception) {
      ModuleException.UNKNOWN_EXCEPTION.reject(
        promise,
        Pair(ERROR_USER_INFO_KEY, e.message.orEmpty())
      )
    }
  }

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
      ModuleException.PIN_REGEX_NOT_VALID.reject(
        promise,
        Pair(ERROR_USER_INFO_KEY, e.message.orEmpty())
      )
      return;
    }

    cieSdk.withUrl(authenticationUrl)

    try {
      cieSdk.startReading(
        timeout,
        object : NfcEvents {
          override fun event(event: NfcEvent) {
            this@IoReactNativeCieModule.reactApplicationContext
              .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
              .emit("onEvent", WritableNativeMap().apply {
                putString("name", event.name)
                putDouble(
                  "progress",
                  (event.numerator.toDouble() / NfcEvent.totalNumeratorEvent.toDouble())
                )
              })
          }

          override fun error(error: NfcError) {
            this@IoReactNativeCieModule.reactApplicationContext
              .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
              .emit("onError", WritableNativeMap().apply {
                putString("name", error.name)
                error.numberOfAttempts?.let {
                  putInt("numberOfAttempts", it)
                }
                error.msg?.let {
                  putString("msg", it)
                }
              })

          }
        },
        object : NetworkCallback {
          override fun onSuccess(url: String) {
            this@IoReactNativeCieModule.reactApplicationContext
              .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
              .emit("onReadSuccess", url)
          }

          override fun onError(e: NetworkError) {
            this@IoReactNativeCieModule.reactApplicationContext
              .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
              .emit("onError", WritableNativeMap().apply {
                putString("name", e.name)
                e.msg?.let {
                  putString("message", it)
                }
              })
          }
        }
      )
      promise.resolve(null)
    } catch (e: Exception) {
      ModuleException.UNKNOWN_EXCEPTION.reject(
        promise,
        Pair(ERROR_USER_INFO_KEY, e.message.orEmpty())
      )
    }
  }

  @ReactMethod
  fun stopReading() {
    cieSdk.stopNFCListening()
  }

  companion object {
    const val NAME = "IoReactNativeCie"
    const val ERROR_USER_INFO_KEY = "error"

    private enum class ModuleException(
      val ex: Exception
    ) {
      PIN_REGEX_NOT_VALID(Exception("PIN_REGEX_NOT_VALID")),
      UNKNOWN_EXCEPTION(Exception("UNKNOWN_EXCEPTION"));

      fun reject(
        promise: Promise, vararg args: Pair<String, String>
      ) {
        exMap(*args).let {
          promise.reject(it.first, ex.message, it.second)
        }
      }

      private fun exMap(vararg args: Pair<String, String>): Pair<String, WritableMap> {
        val writableMap = WritableNativeMap()
        args.forEach { writableMap.putString(it.first, it.second) }
        return Pair(this.ex.message ?: "UNKNOWN", writableMap)
      }
    }
  }
}
