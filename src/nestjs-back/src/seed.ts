function seed() {

const { faker } = require('@faker-js/faker');

const randomName = faker.name.findName();
const randomEmail = faker.internet.email();
const randomCard = faker.helpers.createCard();

//usersRepository.create() <=== Comment créer un user ?? on a pas accès au repo !!!

}

export default seed;