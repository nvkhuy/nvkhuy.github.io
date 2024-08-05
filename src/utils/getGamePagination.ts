import { SITE } from "@config";
import getGamePageNumbers from "./getGamePageNumber.ts";

interface GetGamePaginationProps<T> {
  games: T;
  page: string | number;
  isIndex?: boolean;
}

const getGamePagination = <T>({
  games,
  page,
  isIndex = false,
}: GetGamePaginationProps<T[]>) => {
  const totalPagesArray = getGamePageNumbers(games.length);
  const totalPages = totalPagesArray.length;

  const currentPage = isIndex
    ? 1
    : page && !isNaN(Number(page)) && totalPagesArray.includes(Number(page))
      ? Number(page)
      : 0;

  const lastGame = isIndex ? SITE.gamePerPage : currentPage * SITE.gamePerPage;
  const startGame = isIndex ? 0 : lastGame - SITE.gamePerPage;
  const paginatedGames = games.slice(startGame, lastGame);

  return {
    totalPages,
    currentPage,
    paginatedGames,
  };
};

export default getGamePagination;
