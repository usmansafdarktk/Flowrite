// stores/blogStore.ts
import { create } from 'zustand';
import type { AxiosInstance } from 'axios';
import { Message as MessageInterface } from '@/src/types/chat';

// API Response Types
interface BlogSummary {
  id: number;
  title: string;
}

interface MessageResponse {
  id: string;
  role: string;
  message: string;
  timestamp: string;
  checkpoint_id?: number;
}

interface BlogDataResponse {
  id: number;
  title: string;
  description: string;
  desired_tone: string;
  seo_keywords: string[];
  target_audience: string;
  blog_length_min: number;
  blog_length_max: number;
  content: string;
  messages: MessageResponse[];
  created_at: string;
  updated_at: string;
}

interface Checkpoint {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  blog_id: number;
}

// Request Types
interface CreateBlogRequest {
  title: string;
  description: string;
  desired_tone: string;
  seo_keywords: string[];
  target_audience: string;
  blog_length_min: number;
  blog_length_max: number;
}

interface UpdateBlogRequest {
  content: string;
}

interface SendMessageRequest {
  title: string;
  description: string;
  desired_tone: string;
  seo_keywords: string[];
  target_audience: string;
  blog_length_min: number;
  blog_length_max: number;
  user_message: string;
  selected_context?: string[];
  blog_id: number;
}

interface BlogBlock {
  id: string;
  content: string;
}

interface BlogStore {
  // State
  blogs: BlogSummary[];
  currentBlog: BlogDataResponse | null;
  markdown: string;
  activeBlogId: string;
  blogLoading: boolean;
  selectedBlocks: BlogBlock[];
  chatLoading: boolean;
  workingOnBlog: boolean;
  editingBlog: boolean;
  editedMarkdown: string;
  messages: MessageInterface[];
  checkpoints: Checkpoint[];
  
  // Basic Actions
  addBlog: (blog: BlogSummary) => void;
  updateMarkdown: (newMarkdown: string) => void;
  setBlogs: (blogs: BlogSummary[]) => void;
  setActiveBlogId: (id: string) => void;
  updateBlogLoading: (bool: boolean) => void;
  addSelectedBlock: (block: BlogBlock) => void;
  removeSelectedBlock: (id: string) => void;
  setChatLoading: (bool: boolean) => void;
  setWorkingOnBlog: (bool: boolean) => void;
  setEditingBlog: (bool: boolean) => void;
  setEditedMarkdown: (md: string) => void;
  setCurrentBlog: (blog: BlogDataResponse | null) => void;
  setMessages: (messages: MessageInterface[]) => void;
  setCheckpoints: (checkpoints: Checkpoint[]) => void;
  addCheckpoint: (checkpoint: Checkpoint) => void;
  removeCheckpoint: (checkpointId: number) => void;
  
  // API Methods
  createBlog: (client: AxiosInstance, data: CreateBlogRequest) => Promise<BlogDataResponse>;
  listBlogs: (client: AxiosInstance) => Promise<BlogSummary[]>;
  getBlog: (client: AxiosInstance, blogId: number) => Promise<BlogDataResponse>;
  updateBlog: (client: AxiosInstance, blogId: number, data: UpdateBlogRequest) => Promise<BlogDataResponse>;
  sendMessage: (client: AxiosInstance, data: SendMessageRequest) => Promise<BlogDataResponse>;
  createCheckpoint: (client: AxiosInstance, messageId: number) => Promise<Checkpoint>;
  getCheckpoint: (client: AxiosInstance, checkpointId: number) => Promise<Checkpoint>;
  restoreCheckpoint: (client: AxiosInstance, checkpointId: number) => Promise<BlogDataResponse>;
  deleteCheckpoint: (client: AxiosInstance, checkpointId: number) => Promise<void>;
}

export const useBlogStore = create<BlogStore>((set, get) => ({
  // State
  blogs: [],
  currentBlog: null,
  markdown: '',
  activeBlogId: '',
  blogLoading: false,
  selectedBlocks: [],
  chatLoading: false,
  workingOnBlog: false,
  editingBlog: false,
  editedMarkdown: '',
  messages: [],
  checkpoints: [],
  
  // Basic Actions
  addBlog: (blog) =>
    set((state) => ({
      blogs: [blog, ...state.blogs],
    })),
  updateMarkdown: (newMarkdown) => set({ markdown: newMarkdown }),
  setBlogs: (blogs) => set({ blogs }),
  setActiveBlogId: (activeBlogId) => set({ activeBlogId }),
  updateBlogLoading: (blogLoading) => set({ blogLoading }),
  addSelectedBlock: (block: BlogBlock) =>
    set((state) => ({
      selectedBlocks: [block, ...state.selectedBlocks],
    })),
  removeSelectedBlock: (id: string) => {
    set((state) => {
      if (id === 'ALL') return { selectedBlocks: [] };

      const newSelectedBlocks = state.selectedBlocks.filter((el) => el.id !== id);
      return { selectedBlocks: newSelectedBlocks };
    });
  },
  setChatLoading: (chatLoading) => set({ chatLoading }),
  setWorkingOnBlog: (workingOnBlog) => set({ workingOnBlog }),
  setEditingBlog: (editingBlog) => set({ editingBlog }),
  setEditedMarkdown: (editedMarkdown) => {
    if (editedMarkdown) {
      set({ editedMarkdown });
    }
  },
  setCurrentBlog: (currentBlog) => set({ currentBlog }),
  setMessages: (messages) => set({ messages }),
  setCheckpoints: (checkpoints) => set({ checkpoints }),
  addCheckpoint: (checkpoint) =>
    set((state) => ({
      checkpoints: [...state.checkpoints, checkpoint],
    })),
  removeCheckpoint: (checkpointId) =>
    set((state) => ({
      checkpoints: state.checkpoints.filter((cp) => cp.id !== checkpointId),
    })),
  
  // API Methods
  createBlog: async (client, data) => {
    try {
      set({ blogLoading: true });
      const response = await client.post('/blogs/', data);
      const blogData = response.data;
      
      // Add to blogs list
      set((state) => ({
        blogs: [{ id: blogData.id, title: blogData.title }, ...state.blogs],
        currentBlog: blogData,
        markdown: blogData.content,
        activeBlogId: blogData.id.toString(),
      }));
      
      return blogData;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to create blog');
    } finally {
      set({ blogLoading: false });
    }
  },

  listBlogs: async (client) => {
    try {
      const response = await client.get('/blogs/');
      const blogs = response.data;
      set({ blogs });
      return blogs;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch blogs');
    }
  },

  getBlog: async (client, blogId) => {
    try {
      set({ blogLoading: true, chatLoading: true });
      const response = await client.get(`/blogs/${blogId}`);
      const blogData = response.data;
      
      // Convert API messages to UI format
      const uiMessages: MessageInterface[] = blogData.messages.map((msg: MessageResponse) => ({
        message: msg.message,
        time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: msg.role === 'user' ? 'sent' : 'received',
        checkpointId: msg.checkpoint_id,
        messageId: parseInt(msg.id.split('_')[1]) || undefined,
      }));
      
      // Extract checkpoints from messages
      const checkpoints: Checkpoint[] = blogData.messages
        .filter((msg: MessageResponse) => msg.checkpoint_id)
        .map((msg: MessageResponse) => ({
          id: msg.checkpoint_id!,
          content: '', // Will be fetched separately if needed
          created_at: msg.timestamp,
          updated_at: msg.timestamp,
          blog_id: blogData.id,
        }));
      
      set({
        currentBlog: blogData,
        markdown: blogData.content,
        activeBlogId: blogData.id.toString(),
        messages: uiMessages,
        checkpoints,
      });
      
      return blogData;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch blog');
    } finally {
      set({ blogLoading: false, chatLoading: false });
    }
  },

  updateBlog: async (client, blogId, data) => {
    try {
      set({ workingOnBlog: true });
      const response = await client.put(`/blogs/${blogId}`, data);
      const blogData = response.data;
      
      set({
        currentBlog: blogData,
        markdown: blogData.content,
      });
      
      return blogData;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to update blog');
    } finally {
      set({ workingOnBlog: false });
    }
  },

  sendMessage: async (client, data) => {
    try {
      set({ workingOnBlog: true });

      // Get current messages to add new ones
      const currentMessages = get().messages;

      // Add user message
      const userMessage: MessageInterface = {
        message: data.user_message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'sent',
      };
      let updatedMessages = [...currentMessages, userMessage];
      set({
        messages: updatedMessages,
      });

      const response = await client.post('/blogs/message', data);
      const responseData = response.data;

      // Add AI message from response
      const aiMessage: MessageInterface = {
        message: responseData.message.ai_message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'received',
        messageId: responseData.message?.id,
      };
      updatedMessages = [...updatedMessages, aiMessage];
      console.log("afaq updatedMessages: ", updatedMessages);
      
      set({
        currentBlog: responseData.currentBlog || get().currentBlog,
        markdown: responseData.content || get().markdown,
        messages: updatedMessages,
        workingOnBlog: false,
      });
      
      return responseData;
    } catch (error: any) {
      set({ workingOnBlog: false });
      throw new Error(error.response?.data?.detail || 'Failed to create message');
    }
  },

  createCheckpoint: async (client, messageId) => {
    try {
      const response = await client.post(`/blogs/checkpoint/${messageId}`);
      const checkpoint = response.data;
      
      // Update the last message to include the checkpoint_id
      set((state) => {
        const updatedMessages = [...state.messages];
        const lastMessageIndex = updatedMessages.length - 1;
        if (lastMessageIndex >= 0 && updatedMessages[lastMessageIndex].type === 'received') {
          updatedMessages[lastMessageIndex] = {
            ...updatedMessages[lastMessageIndex],
            checkpointId: checkpoint.id,
          };
        }
        return { messages: updatedMessages };
      });

      return checkpoint;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to create checkpoint');
    }
  },

  getCheckpoint: async (client, checkpointId) => {
    try {
      const response = await client.get(`/blogs/checkpoint/${checkpointId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch checkpoint');
    }
  },

  restoreCheckpoint: async (client, checkpointId) => {
    try {
      set({ workingOnBlog: true });
      const response = await client.post(`/blogs/checkpoint/${checkpointId}/restore`);
      const blogData = response.data;
      
      // Convert API messages to UI format
      const uiMessages: MessageInterface[] = blogData.messages.map((msg: MessageResponse) => ({
        message: msg.message,
        time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: msg.role === 'user' ? 'sent' : 'received',
        checkpointId: msg.checkpoint_id,
        messageId: parseInt(msg.id.split('_')[1]) || undefined,
      }));
      
      // Extract checkpoints from messages
      const checkpoints: Checkpoint[] = blogData.messages
        .filter((msg: MessageResponse) => msg.checkpoint_id)
        .map((msg: MessageResponse) => ({
          id: msg.checkpoint_id!,
          content: '', // Will be fetched separately if needed
          created_at: msg.timestamp,
          updated_at: msg.timestamp,
          blog_id: blogData.id,
        }));
      
      set({
        currentBlog: blogData,
        markdown: blogData.content,
        messages: uiMessages,
        checkpoints,
        workingOnBlog: false,
      });
      
      return blogData;
    } catch (error: any) {
      set({ workingOnBlog: false });
      throw new Error(error.response?.data?.detail || 'Failed to restore checkpoint');
    }
  },

  deleteCheckpoint: async (client, checkpointId) => {
    try {
      await client.delete(`/blogs/checkpoint/${checkpointId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to delete checkpoint');
    }
  },
}));
