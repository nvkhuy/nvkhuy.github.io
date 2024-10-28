import { slugifyStr } from "@utils/slugify";
import Datetime from "./Datetime";
import type { CollectionEntry } from "astro:content";
import { Image } from 'astro:assets';


export interface Props {
  href?: string;
  frontmatter: CollectionEntry<"blog">["data"];
  secHeading?: boolean;
}

export default function Card({ href, frontmatter, secHeading = true }: Props) {
  const { title,ogImage, pubDatetime, modDatetime, description } = frontmatter;

  const headerProps = {
    style: { viewTransitionName: slugifyStr(title) },
    className: "text-lg font-medium decoration-dashed hover:underline",
  };

  return (
      <li className="my-6 flex">
          <div className="w-1/4">
              <img
                  src={ogImage as string}
                  className="object-cover"
                  decoding="async"
                  loading="lazy"
                  alt={title}
              />
          </div>
          <div className="w-3/4 pl-4">
              <a
                  href={href}
                  className="inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
              >
                  {secHeading ? (
                      <h2 {...headerProps}>{title}</h2>
                  ) : (
                      <h3 {...headerProps}>{title}</h3>
                  )}
              </a>
              <Datetime pubDatetime={pubDatetime} modDatetime={modDatetime}/>
              <p>{description}</p>
          </div>
      </li>
  );
}
