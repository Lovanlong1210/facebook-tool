import '../styles/globals.css';
import axios from 'axios';

axios.defaults.withCredentials = true;

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}