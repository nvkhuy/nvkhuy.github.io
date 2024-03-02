import type {CollectionEntry} from "astro:content";
import gameFilter from "./gameFilter";

const getSortedGames = (posts: CollectionEntry<"game">[]) => {
    return posts
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
