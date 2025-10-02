#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(IoReactNativeCie, NSObject)

RCT_EXTERN_METHOD(addListener:  (NSString)type)

RCT_EXTERN_METHOD(removeListeners:  (NSString)type)

RCT_EXTERN_METHOD(hasNfcFeature:  (RCTPromiseResolveBlock)resolve
                  withRejecter:   (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isNfcEnabled: (RCTPromiseResolveBlock)resolve
                  withRejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isCieAuthenticationSupported: (RCTPromiseResolveBlock)resolve
                  withRejecter:                 (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(openNfcSettings:  (RCTPromiseResolveBlock)resolve
                  withRejecter:     (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setAlertMessage:  (NSString)key
                  withValue:        (NSString)value)

RCT_EXTERN_METHOD(setCurrentAlertMessage:  (NSString)value)

RCT_EXTERN_METHOD(setCustomIdpUrl:  (NSString)url)

RCT_EXTERN_METHOD(startInternalAuthentication:  (NSString)challenge
                  withEncoding:             (NSString)encodingString
                  withTimeout:              (NSNumber)timeout
                  withResolver:             (RCTPromiseResolveBlock)resolve
                  withRejecter:             (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(startReadingAttributes:   (NSNumber)timeout
                  withResolver:             (RCTPromiseResolveBlock)resolve
                  withRejecter:             (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(startReading:             (NSString)pin
                  withAuthUrl:              (NSString)authUrl
                  withTimeout:              (NSNumber)timeout
                  withResolver:             (RCTPromiseResolveBlock)resolve
                  withRejecter:             (RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
