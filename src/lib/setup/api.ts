import { API } from '@discordjs/core/http-only';
import { container } from '@skyra/http-framework';

container.api = new API(container.rest);

declare module '@sapphire/pieces' {
	interface Container {
		api: API;
	}
}
