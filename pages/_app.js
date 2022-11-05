import React from "react";
import PropTypes from "prop-types";
import Head from "next/head";

// mui
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import createEmotionCache from "@/utils/createEmotionCache";
import lightTheme from "@/themes/lightTheme";

// styles
import "@/styles/globals.css";

// layout
import DefaultLayout from "@/layouts/DefaultLayout";

import Favicon from "@/public/favicon/favicon.ico";
import Logo192 from "@/public/favicon/android-chrome-192x192.png";
import manifest from "@/public/favicon/manifest.json";

import siteMetadata from "@/data/siteMetadata";

const clientSideEmotionCache = createEmotionCache();

const MyApp = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  // Use the layout defined at the page level, if available
  const getLayout =
    Component.getLayout || ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return getLayout(
    <CacheProvider value={emotionCache}>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
        <meta charSet="utf-8" />
        <link rel="icon" href={`${Favicon.src}`} />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href={`${Logo192.src}`} />
        <link rel="manifest" href={`${manifest}`} />

        {/* humans.txt */}
        <link
          type="text/plain"
          rel="author"
          href="https://api.codinasion.org/humans.txt"
        />

        {/* twitter card meta tags */}
        <meta
          key="twitter-title"
          name="twitter:title"
          content={`${siteMetadata.title}`}
        />
        <meta
          key="twitter-description"
          name="twitter:description"
          content={`${siteMetadata.description}`}
        />
        <meta key="twitter-site" name="twitter:site" content="@codinasion" />
        <meta
          key="twitter-card"
          name="twitter:card"
          content="summary_large_image"
        />
        <meta
          key="twitter-image-src"
          name="twitter:image:src"
          content={`https://api.codinasion.org/og`}
        />
        {/* og card meta tags */}
        <meta
          key="og-title"
          property="og:title"
          content={`${siteMetadata.title}`}
        />
        <meta
          key="og-description"
          property="og:description"
          content={`${siteMetadata.description}`}
        />
        <meta
          key="og-url"
          property="og:url"
          content={`${siteMetadata.siteUrl}`}
        />
        <meta key="og-site-name" property="og:site_name" content="Codinasion" />
        <meta key="og-type" property="og:type" content="website" />
        <meta
          key="og-image"
          property="og:image"
          content={`https://api.codinasion.org/og`}
        />
        <meta
          key="og-image-alt"
          property="og:image:alt"
          content={`${siteMetadata.title}`}
        />

        {/* title */}
        <title key="title">{`${siteMetadata.title}`}</title>
        <meta
          key="description"
          name="description"
          content={`${siteMetadata.description}`}
        />
      </Head>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  );
};

export default MyApp;

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
};
