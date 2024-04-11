import { container } from '@sapphire/pieces';

container.server.route({
	url: '/',
	method: 'GET',
	handler: () => ({ data: 'Hello world' })
});
