import faker from "@faker-js/faker";

export type SeedGameType = 'ranked' | 'unranked';

export type SeedGameSummary = {
	players: [string, string]
	duration: number; /* in ms */
	score: [number, number];
	date: string;
	id: string;
};

export type SeedRankedGameSummary = SeedGameSummary & {
	win: number;
	loose: number;
};

export const genGameSummary = (): SeedGameSummary => {
	const game = {
		players: [ faker.internet.userName(), faker.internet.userName() ] as [string, string],
		duration: faker.datatype.number({ min: 30000, max: 300000 }),
		score: [ faker.datatype.number({ min: 0, max: 10}), faker.datatype.number({ min: 0, max: 10}) ] as [number, number],
		date: faker.date.recent().toISOString(),
		id: faker.datatype.uuid()
	};

	return game;
}

export const genUnrankedGameSummary = () => genGameSummary();

export const genRankedGameSummary = (): SeedRankedGameSummary => ({
	...genGameSummary(),
	win: 0,
	loose: 1
})
