import { Controller } from "@nestjs/common";
// import { BadRequestException, Get, Param, Query } from "@nestjs/common";
// import { PunishmentsService } from "./punishments.service";

/**
 * Mostly built for test purposes, we should use the service with
 * websockets exclusively.
 */

@Controller('channels/:channelId/punishments')
export class ChannelPunishmentsController {
    /*
    constructor(
        private readonly channelPunishmentService: PunishmentsService
    ) {}

    @Get('/')
    getPunishmentsForUser(@Param('channelId') channelId: number, @Query('userId') userId: number) {
        return this.channelPunishmentService.getActiveUserPunishments(channelId, userId);
    }

    // example endpoint call: /channels/1/punishments/punish-by-mute?punishedId=1&punisherId=2

    @Get('/punish-by-mute')
    punishUser(@Param('channelId') channelId: number, @Query('punishedId') punishedId: number, @Query('punisherId') punisherId: number) {
        // this is checked at the controller level but may be checked at the service level if necessary. I didn't made it to make my testing easier
        if (punisherId === punishedId) {
            throw new BadRequestException('punisherId should be different from punishedId')
        }

        return this.channelPunishmentService.punishUser(channelId, punishedId, punisherId, 'mute', {
            reason: 'Un méchant garçon, à n\'en point douter.'
        })
    }

    @Get('/is-punished')
    async findOutIfUserIsPunished(@Param('channelId') channelId: number, @Query('userId') userId: number) {
        const isPunished = await this.channelPunishmentService.isUserCurrentlyPunished(channelId, userId);

        return { isPunished }
    }

    @Get('/is-muted')
    async findOutIfUserIsMuted(@Param('channelId') channelId: number, @Query('userId') userId: number) {
        const isMuted = await this.channelPunishmentService.isUserCurrentlyMuted(channelId, userId);

        return { isMuted }
    }

    @Get('/is-banned')
    async findOutIfUserIsBanned(@Param('channelId') channelId: number, @Query('userId') userId: number) {
        const isBanned = await this.channelPunishmentService.isUserCurrentlyBanned(channelId, userId);

        return { isBanned }
    }
    */
}
