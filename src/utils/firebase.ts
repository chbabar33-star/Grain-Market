/**
 * Shared Firebase Authentication & Client Initializer
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
