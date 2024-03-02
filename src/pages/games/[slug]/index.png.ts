import type {APIRoute} from "astro";
import {getCollection, type CollectionEntry} from "astro:content";
import {generateOgImageForGame} from "@utils/generateOgImages";
import {slugifyStr} from "@utils/slugify";

export async function getStaticPaths() {
    const games = await getCollection("game").then((p) =>
        p.filter(({data}) => !data.draft && !data.ogImage),
    );

    return games.map((game) => ({
        params: {slug: slugifyStr(game.data.title)},
        props: game,
    }));
}

export const GET: APIRoute = async ({props}) =>
    new Response(await generateOgImageForGame(props as CollectionEntry<"game">), {
        headers: {"Content-Type": "image/png"},
    });
