import { SITE } from "@config";

const getGamePageNumbers = (numberOfGames: number) => {
  const numberOfPages = numberOfGames / Number(SITE.gamePerPage);

  let pageNumbers: number[] = [];
  for (let i = 1; i <= Math.ceil(numberOfPages); i++) {
    pageNumbers = [...pageNumbers, i];
  }

  return pageNumbers;
};

export default getGamePageNumbers;
