/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const isFirebaseAdminConfigured = firebaseConfig && 
  firebaseConfig.projectId !== 'remixed-project-id' && 
  firebaseConfig.apiKey !== 'placeholder-api-key-bovino-vision-2026';

let adminAuth: any = null;

if (isFirebaseAdminConfigured) {
  try {
    if (!getApps().length) {
      initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }
    adminAuth = getAuth();
  } catch (error) {
    console.error("Firebase Admin initialization failed: ", error);
  }
}

export { adminAuth };
