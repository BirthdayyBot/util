import { SlashCommandIntegerOption, SlashCommandStringOption } from '@discordjs/builders';
import { codeBlock, isNullish } from '@sapphire/utilities';
import { envParseArray } from '@skyra/env-utilities';
import { Command, RegisterCommand, RegisterSubCommand } from '@skyra/http-framework';
import { blue, bold, red, yellow } from '@skyra/logger';
import { MessageFlags, PermissionFlagsBits } from 'discord-api-types/v10';

@RegisterCommand((builder) =>
	builder
		.setName('config')
		.setDescription("Manage a guild's features")
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
)
export class UserCommand extends Command {
	@RegisterSubCommand((builder) => builder.setName('get').setDescription("Gets a guild's features").addStringOption(getGuildOption))
	public async get(interaction: Command.ChatInputInteraction, options: Options) {
		if (!UserCommand.ClientOwners.includes(interaction.user.id)) {
			return interaction.reply({ content: 'You cannot use this command.', flags: MessageFlags.Ephemeral });
		}

		const data = await this.container.prisma.guild.findFirst({ where: { id: BigInt(options.guild) } });
		if (isNullish(data)) {
			return interaction.reply({ content: 'There is no data recorded for that guild.', flags: MessageFlags.Ephemeral });
		}

		const lines = [
			`${bold('Guild ID')}: ${bold(blue(data.id.toString().padStart(19, ' ')))}`,
			`${bold('Maximum Announcement Length')}: ${formatRange(data.maximumAnnouncementLength, 128, 512)}`,
			`${bold('Maximum Giveable Birthday Roles')}: ${formatRange(data.maximumGiveableBirthdayRoles, 1, 5)}`,
			`${bold('Maximum Birthday List Amount')}: ${formatRange(data.maximumBirthdayListAmount, 10, 50)}`
		];
		return interaction.reply({ content: codeBlock('ansi', lines.join('\n')), flags: MessageFlags.Ephemeral });
	}

	@RegisterSubCommand((builder) =>
		builder
			.setName('set')
			.setDescription("Updates a guild's features")
			.addStringOption(getGuildOption)
			.addIntegerOption(getIntegerOption(128, 512, 'maximum-announcement-length', 'The maximum announcement length'))
			.addIntegerOption(getIntegerOption(1, 5, 'maximum-giveable-birthday-roles', 'The maximum giveable birthday roles'))
			.addIntegerOption(getIntegerOption(10, 50, 'maximum-birthday-list-amount', 'The maximum birthday list amount'))
	)
	public async set(interaction: Command.ChatInputInteraction, options: SetOptions) {
		if (!UserCommand.ClientOwners.includes(interaction.user.id)) {
			return interaction.reply({ content: 'You cannot use this command.', flags: MessageFlags.Ephemeral });
		}

		const id = BigInt(options.guild);
		const data = {
			maximumAnnouncementLength: options['maximum-announcement-length'],
			maximumGiveableBirthdayRoles: options['maximum-giveable-birthday-roles'],
			maximumBirthdayListAmount: options['maximum-birthday-list-amount']
		};
		try {
			await this.container.prisma.guild.upsert({
				where: { id },
				create: { id, ...data },
				update: data
			});
			return interaction.reply({ content: 'Updated.', flags: MessageFlags.Ephemeral });
		} catch (error) {
			this.container.logger.error(error);

			return interaction.reply({
				content: 'I was not able to update the configuration, please check my logs and/or try again later.',
				flags: MessageFlags.Ephemeral
			});
		}
	}

	@RegisterSubCommand((builder) => builder.setName('reset').setDescription("Resets a guild's features").addStringOption(getGuildOption))
	public async reset(interaction: Command.ChatInputInteraction, options: Options) {
		if (!UserCommand.ClientOwners.includes(interaction.user.id)) {
			return interaction.reply({ content: 'You cannot use this command.', flags: MessageFlags.Ephemeral });
		}

		const data = await this.container.prisma.guild.delete({ where: { id: BigInt(options.guild) } });
		const content = isNullish(data) ? 'There is no data recorded for that guild.' : "Successfully deleted the specified guild's data.";
		return interaction.reply({ content, flags: MessageFlags.Ephemeral });
	}

	private static readonly ClientOwners = envParseArray('CLIENT_OWNERS');
}

interface Options {
	guild: string;
}

interface SetOptions extends Options {
	'maximum-announcement-length': number;
	'maximum-giveable-birthday-roles': number;
	'maximum-birthday-list-amount': number;
}

function getGuildOption() {
	return new SlashCommandStringOption()
		.setName('guild')
		.setDescription('The ID of the guild to manage')
		.setMinLength(17)
		.setMaxLength(19)
		.setRequired(true);
}

function getIntegerOption(min: number, max: number, name: string, description: string) {
	return new SlashCommandIntegerOption().setName(name).setDescription(`${description} (${min}-${max})`).setMinValue(min).setMaxValue(max);
}

function formatRange(value: number, min: number, max: number) {
	if (value === min) return `${blue(format(value))} → ${red(format(max))}`;
	if (value === max) return `${yellow(format(min))} ← ${blue(format(value))}`;
	return `${yellow(format(min))} ← ${blue(format(value))} → ${red(format(max))}`;
}

function format(value: number) {
	return value.toString().padStart(3, ' ');
}
