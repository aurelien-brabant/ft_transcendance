import { faker } from '@faker-js/faker';
import {genRankedGameSummary, genUnrankedGameSummary, SeedGameSummary, SeedRankedGameSummary} from './game';

export type SeedUser = {
	username: string;
	avatar: string;
	unrankedHistory: SeedGameSummary[];
	rankedHistory: SeedRankedGameSummary[];
};

export const genUser = (): SeedUser => {
	const unrankedHistory = new Array(50).fill(0).map(el => genUnrankedGameSummary());
	const rankedHistory = new Array(50).fill(0).map(el => genRankedGameSummary());

	return {
		username: faker.internet.userName(),
		avatar: faker.image.nature(),
		unrankedHistory,
		rankedHistory
	};
}
