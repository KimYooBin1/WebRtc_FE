import {AppProps} from "next/app";
import {RecoilRoot} from "recoil";
import {CookiesProvider} from "react-cookie";

export default function App({ Component, pageProps }:AppProps):JSX.Element {
    return<>
        <CookiesProvider>
            <RecoilRoot>
                <Component {...pageProps} />
            </RecoilRoot>
        </CookiesProvider>
    </>
}
