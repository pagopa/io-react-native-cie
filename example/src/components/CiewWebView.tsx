import { createRef, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';

const iOSUserAgent =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
const defaultUserAgent = Platform.select({
  ios: iOSUserAgent,
  default: undefined,
});

/**
 * This JS is injection on every page load. It tries to decrease to 0 the sleeping time of a script.
 * That sleeping is used to allow user to read page content until the content changes to an automatic redirect.
 * This script also tries also to call apriIosUL.
 * If it is defined it starts the authentication process (iOS only).
 */
const injectJs = Platform.select({
  ios: `
  seconds = 0;
  if(typeof apriIosUL !== 'undefined' && apriIosUL !== null){
    apriIosUL();
  }
`,
  default: undefined,
});

type CiewWebViewProps = {
  uri: string;
  onAuthUrlChange: (url: string) => void;
};

export const CiewWebView = ({ uri, onAuthUrlChange }: CiewWebViewProps) => {
  const webView = createRef<WebView>();
  const [authUrl, setAuthUrl] = useState<string>();

  useEffect(() => {
    authUrl && onAuthUrlChange(authUrl);
  }, [authUrl, onAuthUrlChange]);

  return (
    <WebView
      ref={webView}
      userAgent={defaultUserAgent}
      javaScriptEnabled={true}
      injectedJavaScript={injectJs}
      onLoadEnd={() => {
        // inject JS on every page load end
        if (injectJs && webView.current) {
          webView.current.injectJavaScript(injectJs);
        }
      }}
      onShouldStartLoadWithRequest={({ url }: WebViewNavigation) => {
        if (authUrl) {
          return false;
        }

        // on iOS when authnRequestString is present in the url, it means we have all stuffs to go on.
        if (
          url !== undefined &&
          Platform.OS === 'ios' &&
          url.indexOf('authnRequestString') !== -1
        ) {
          // avoid redirect and follow the 'happy path'
          if (webView.current !== null) {
            setAuthUrl(url);
          }
          return false;
        }

        // Once the returned url contains the "OpenApp" string, then the authorization has been given
        if (url && url.indexOf('OpenApp') !== -1) {
          setAuthUrl(url);
          return false;
        }

        return true;
      }}
      source={{ uri }}
    />
  );
};
