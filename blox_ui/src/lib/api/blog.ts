import { Node } from 'unist';

export interface MarkdownBlock {
  id: string;
  content: string;
  node: Node;
}

export interface BlogMetadataForm {
  title: string;
  description: string;
  targetAudience: string;
  desiredTone: string;
  blogLength: { min: number; max: number };
  seoKeywords: string;
}
