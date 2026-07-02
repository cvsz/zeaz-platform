import React, { useMemo } from 'react';

interface Post {
  id: string;
  title: string;
  scheduledAt: Date;
  status: 'pending' | 'published' | 'error';
}

export const CalendarView = ({ posts }: { posts: Post[] }) => {
  const groupedPosts = useMemo(() => {
    return posts.reduce((acc, post) => {
      const dateKey = post.scheduledAt.toISOString().split('T')[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(post);
      return acc;
    }, {} as Record<string, Post[]>);
  }, [posts]);

  return (
    <div className="grid grid-cols-7 gap-2">
      {Object.entries(groupedPosts).map(([date, dayPosts]) => (
        <article key={date} className="rounded-2xl border border-slate-200 bg-white p-2 min-h-[100px] shadow-sm">
          <div className="text-xs font-semibold">{date}</div>
          {dayPosts.map(post => (
            <div key={post.id} className="text-xs p-1 mt-1 bg-gray-100 rounded">
              {post.title}
              <span className={`block w-2 h-2 rounded-full ${post.status === 'pending' ? 'bg-yellow-400' : post.status === 'published' ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          ))}
        </article>
      ))}
    </div>
  );
};
