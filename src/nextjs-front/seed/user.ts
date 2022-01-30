import { faker } from '@faker-js/faker';

export type SeedUser = {
	username: string;
	avatar: string;
};

export const genUser = (): SeedUser => {
	return {
		username: faker.internet.userName(),
		avatar: faker.image.avatar()
	};
}
