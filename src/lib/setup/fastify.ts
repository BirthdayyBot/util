import { container } from '@skyra/http-framework';
import fastify from 'fastify';

const server = fastify();

container.server = server;

declare module '@sapphire/pieces' {
	interface Container {
		server: typeof server;
	}
}
