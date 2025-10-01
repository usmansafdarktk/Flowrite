// parseMarkdownBlocks.ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { Node } from 'unist';
import { MarkdownBlock } from '@/src/lib/api/blog';

export function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
  const processor = unified().use(remarkParse);
  const tree = processor.parse(markdown);

  const blocks: MarkdownBlock[] = [];
  let id = 0;

  // Iterate over the top-level children of the root node
  (tree.children as Node[]).forEach((node: Node) => {
    const position = node.position;
    if (!position || position.start.offset === undefined || position.end.offset === undefined) {
      return;
    }

    const content = markdown.slice(position.start.offset, position.end.offset);

    blocks.push({
      id: `md-block-${id++}`,
      content,
      node,
    });

    // if (['heading', 'paragraph', 'list', 'code', 'blockquote', 'table'].includes(node.type)) {

    //   blocks.push({
    //     id: `md-block-${id++}`,
    //     content,
    //     node,
    //   });
    // }
  });

  return blocks;
}
