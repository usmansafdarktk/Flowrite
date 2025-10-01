import BlogIntentForm from './BlogIntentForm';
import { useBlogStore } from '@/stores/blogStore';
import ChatBox from './ChatBox';

const RightWindow = () => {
  const blogId = useBlogStore((state) => state.activeBlogId);

  return (
    <div className="h-full">
      {blogId === 'new' && <BlogIntentForm />}
      {blogId !== 'new' && <ChatBox />}
    </div>
  );
};

export default RightWindow;
