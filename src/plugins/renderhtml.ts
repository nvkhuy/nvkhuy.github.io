import type {RemarkPlugin} from "@astrojs/markdown-remark"
import {visit} from "unist-util-visit"

const escapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
}

const escapeHtml = (str: string) => str.replace(/[&<>"']/g, c => escapeMap[c])

export const renderhtml: RemarkPlugin<[]> = () => tree => {
    visit(tree, "code", node => {
        if (node.lang !== "renderhtml") return

        // @ts-ignore
        node.type = "html"
        node.value = `
      <div class="renderhtml" data-content="${escapeHtml(node.value)}">
        <p>Loading HTML...</p>
      </div>
    `
    })
}