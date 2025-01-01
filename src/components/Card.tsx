import {slugifyStr} from "@utils/slugify";
import Datetime from "./Datetime";
import type {CollectionEntry} from "astro:content";
import {Image} from 'astro:assets';

export interface Props {
  href?: string;
  frontmatter: CollectionEntry<"blog">["data"];
  secHeading?: boolean;
}

export default function Card({href, frontmatter, secHeading = true}: Props) {
  const {title, ogImage, pubDatetime, modDatetime, description} = frontmatter;

  const headerProps = {
    style: {viewTransitionName: slugifyStr(title)},
    className: "text-lg font-medium decoration-dashed hover:underline",
  };

  return (
    <a
      href={href}
      className="p-4 rounded-lg hover:bg-skin-card-muted transition duration-200 focus:outline-none focus:ring-2 focus:ring-skin-accent"
    >
      <div className="">
        <img
          src={ogImage as string}
          className="object-cover w-auto h-auto rounded-lg"
          decoding="async"
          loading="lazy"
          alt={title}
        />
      </div>
      <div className="mt-4">
        <div className="text-lg font-medium text-skin-accent decoration-dashed underline-offset-4">
          {secHeading ? (
            <h2 {...headerProps}>{title}</h2>
          ) : (
            <h3 {...headerProps}>{title}</h3>
          )}
        </div>
        <Datetime pubDatetime={pubDatetime} modDatetime={modDatetime}/>
        <p>{description}</p>
      </div>
    </a>
  );
}
