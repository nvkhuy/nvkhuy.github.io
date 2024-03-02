import {SITE} from "@config";
import type {CollectionEntry} from "astro:content";

const gameFilter = ({data}: CollectionEntry<"game">) => {
    const isPublishTimePassed =
        Date.now() >
        new Date(data.pubDatetime).getTime() - SITE.scheduledPostMargin;
    return !data.draft && (import.meta.env.DEV || isPublishTimePassed);
};

export default gameFilter;
