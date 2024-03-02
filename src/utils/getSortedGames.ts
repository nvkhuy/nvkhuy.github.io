import type {CollectionEntry} from "astro:content";
import gameFilter from "./gameFilter";

const getSortedGames = (games: CollectionEntry<"game">[]) => {
    return games
        .filter(gameFilter)
        .sort(
            (a, b) =>
                Math.floor(
                    new Date(b.data.modDatetime ?? b.data.pubDatetime).getTime() / 1000,
                ) -
                Math.floor(
                    new Date(a.data.modDatetime ?? a.data.pubDatetime).getTime() / 1000,
                ),
        );
};

export default getSortedGames;
