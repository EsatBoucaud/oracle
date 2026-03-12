export type NodeType = 'concept' | 'image' | 'link' | 'text' | 'video' | 'task' | 'audio' | 'document' | 'event';

export interface ArborNode {
  id: string;
  parentId: string | null;
  title: string;
  content?: string;
  type: NodeType;
  imageUrl?: string;
  url?: string;
  color?: string;
  completed?: boolean;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  updatedAt?: string;
}
