import faker from "@faker-js/faker";

export const prefixWithRandomAdjective = (src: string, maxLen?: number) => {
  if (!maxLen) {
    return `${faker.word.adjective()}_${src}`;
  }

  const adjLen = maxLen - src.length - 1;

  if (adjLen < 0) {
    throw new Error('src should be shorter than maxLen characters');
  }

  let adj = faker.word.adjective(maxLen).substring(0, adjLen);

  return `${adj}_${src}`;
};
