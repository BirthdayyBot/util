import { setup as envSetup } from '@skyra/env-utilities';
import { initializeSentry, setInvite, setRepository } from '@skyra/shared-http-pieces';


import '@skyra/shared-http-pieces/register';

envSetup(new URL('../../../src/.env', import.meta.url));
setInvite('948377113457745990', '326417868864');
setRepository('https://github.com/BirthdayyBot/util');
initializeSentry();


import '#lib/setup/api';
import '#lib/setup/fastify';
import '#lib/setup/logger';
import '#lib/setup/prisma';



export async function setup() {
	// Load all routes
	await import('#api/routes/_load');
}
