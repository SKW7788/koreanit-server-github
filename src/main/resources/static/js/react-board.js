const { useState, useEffect } = React;

function BoardPage() {
  const [baseUrl] = useState(localStorage.getItem('reactBaseUrl') || location.origin);
  const [me, setMe] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postForm, setPostForm] = useState({ title: '', content: '' });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const api = async (path, options = {}) => {
    const res = await fetch(`${baseUrl}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`);
    return body;
  };

  const loadMe = async () => {
    try {
      const r = await api('/api/me');
      setMe(r?.data || null);
    } catch {
      location.href = '/';
    }
  };

  const loadPosts = async () => {
    const r = await api('/api/posts?page=1&limit=20');
    setPosts(r?.data || []);
  };

  const selectPostWithComments = async (post) => {
    setSelectedPost(post);
    setEditingCommentId(null);
    setEditingContent('');
    setNewComment('');

    try {
      const r = await api(`/api/posts/${post.id}/comments?limit=50`);
      setComments(r?.data || []);
    } catch {
      setComments([]);
    }
  };

  const createPost = async () => {
    await api('/api/posts', { method: 'POST', body: JSON.stringify(postForm) });
    setPostForm({ title: '', content: '' });
    await loadPosts();
  };

  const createComment = async () => {
    if (!selectedPost || !newComment.trim()) return;
    await api(`/api/posts/${selectedPost.id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content: newComment.trim() })
    });
    setNewComment('');
    await selectPostWithComments(selectedPost);
  };

  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const saveEditComment = async () => {
    if (!selectedPost || !editingCommentId || !editingContent.trim()) return;
    await api(`/api/comments/${editingCommentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content: editingContent.trim() })
    });
    setEditingCommentId(null);
    setEditingContent('');
    await selectPostWithComments(selectedPost);
  };

  const deleteComment = async (commentId) => {
    if (!selectedPost) return;
    await api(`/api/comments/${commentId}`, { method: 'DELETE' });
    await selectPostWithComments(selectedPost);
  };

  const logout = async () => {
    await api('/api/logout', { method: 'POST' });
    location.href = '/';
  };

  useEffect(() => {
    loadMe();
    loadPosts();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <header className="card p-5 text-center">
        <h1 className="text-2xl font-bold">Koreanit 게시판</h1>
        {me && <p className="text-sm text-slate-500 mt-1">{me.username}님 환영합니다</p>}
        <div className="mt-3">
          <button className="btn btn-muted" onClick={logout}>로그아웃</button>
        </div>
      </header>

      <section className="card p-5 space-y-3">
        <h2 className="text-lg font-semibold">게시글 작성</h2>
        <input className="input" placeholder="title" value={postForm.title} onChange={e => setPostForm({ ...postForm, title: e.target.value })} />
        <textarea className="input" rows="3" placeholder="content" value={postForm.content} onChange={e => setPostForm({ ...postForm, content: e.target.value })}></textarea>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={createPost}>작성</button>
          <button className="btn btn-muted" onClick={loadPosts}>새로고침</button>
        </div>
      </section>

      <section className="card p-6 space-y-5">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">게시글 목록</h2>
          <span className="text-sm md:text-base text-slate-500">총 {posts.length}개</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {posts.map(p => (
            <div
              key={p.id}
              className="group border border-slate-200 rounded-2xl p-5 md:p-6 bg-gradient-to-br from-white to-slate-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="mb-2">
                  <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-1 text-xs md:text-sm font-semibold">
                    POST #{p.id}
                  </span>
                </div>
                <p className="font-bold text-xl md:text-2xl text-slate-900 leading-snug break-words">{p.title}</p>
                <p className="mt-2 text-base md:text-lg text-slate-600 line-clamp-2 break-words">{p.content}</p>
              </div>

              <button className="btn btn-primary shrink-0" onClick={() => selectPostWithComments(p)}>댓글</button>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="border border-dashed border-slate-300 rounded-2xl p-8 text-center text-lg text-slate-500">
              게시글이 없습니다.
            </div>
          )}
        </div>
      </section>

      {selectedPost && (
        <section className="card p-5 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">선택한 게시글</h3>
            <p className="font-semibold mt-1">#{selectedPost.id} {selectedPost.title}</p>
            <p className="text-slate-700 mt-1">{selectedPost.content}</p>
          </div>

          <div className="pt-2 border-t space-y-3">
            <h4 className="font-semibold">댓글 작성</h4>
            <div className="flex gap-2">
              <input className="input" placeholder="댓글 입력" value={newComment} onChange={e => setNewComment(e.target.value)} />
              <button className="btn btn-primary" onClick={createComment}>작성</button>
            </div>
          </div>

          <div className="pt-2 border-t space-y-2">
            <h4 className="font-semibold">기존 댓글</h4>
            {comments.map(c => {
              const isMine = me && Number(me.id) === Number(c.userId);
              const isEditing = editingCommentId === c.id;

              return (
                <div key={c.id} className="border rounded-lg p-3 space-y-2">
                  <div className="text-sm text-slate-500">댓글 #{c.id} · 작성자 #{c.userId}</div>

                  {!isEditing ? (
                    <p className="text-sm">{c.content}</p>
                  ) : (
                    <input
                      className="input"
                      value={editingContent}
                      onChange={e => setEditingContent(e.target.value)}
                    />
                  )}

                  {isMine && (
                    <div className="flex gap-2">
                      {!isEditing ? (
                        <button className="btn btn-muted" onClick={() => startEditComment(c)}>수정</button>
                      ) : (
                        <>
                          <button className="btn btn-primary" onClick={saveEditComment}>수정완료</button>
                          <button className="btn btn-muted" onClick={() => { setEditingCommentId(null); setEditingContent(''); }}>취소</button>
                        </>
                      )}
                      <button className="btn btn-muted" onClick={() => deleteComment(c.id)}>삭제</button>
                    </div>
                  )}
                </div>
              );
            })}
            {comments.length === 0 && <p className="text-sm text-slate-500">댓글이 없습니다.</p>}
          </div>
        </section>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<BoardPage />);
