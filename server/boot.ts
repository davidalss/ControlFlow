import crypto from 'crypto';

export const SERVER_BOOT_ID: string = crypto.randomUUID();
export const SERVER_STARTED_AT: Date = new Date();


