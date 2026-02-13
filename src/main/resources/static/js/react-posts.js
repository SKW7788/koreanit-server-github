const { useState, useEffect } = React;

function PostsPage() {
  const [baseUrl] = useState(localStorage.getItem('reactBaseUrl') || location.origin);
  const [me, setMe] = useState(null);
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFindingLast, setIsFindingLast] = useState(false);

  const PAGE_SIZE = 10;
  const MAX_PAGE_SCAN = 500;

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

  const loadPosts = async (page = currentPage) => {
    const r = await api(`/api/posts?page=${page}&limit=${PAGE_SIZE}`);
    setPosts(r?.data || []);
    setCurrentPage(page);
  };

  const goFirstPage = async () => {
    await loadPosts(1);
  };

  const goLastPage = async () => {
    setIsFindingLast(true);
    try {
      let page = Math.max(1, currentPage);
      let safety = 0;

      while (safety < MAX_PAGE_SCAN) {
        const r = await api(`/api/posts?page=${page}&limit=${PAGE_SIZE}`);
        const data = r?.data || [];

        if (data.length < PAGE_SIZE) {
          setPosts(data);
          setCurrentPage(page);
          return;
        }

        page += 1;
        safety += 1;
      }

      await loadPosts(currentPage);
    } finally {
      setIsFindingLast(false);
    }
  };

  const logout = async () => {
    await api('/api/logout', { method: 'POST' });
    location.href = '/';
  };

  useEffect(() => { loadMe(); loadPosts(1); }, []);

  const hasNextPage = posts.length === PAGE_SIZE;
  const pageTabs = Array.from({ length: 5 }, (_, i) => Math.max(1, currentPage - 2) + i);

  return (
    <div className="max-w-3xl mx-auto p-3 md:p-5 space-y-4">
      <header className="card rounded-lg p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold">Koreanit 게시판</h1>
            {me && <p className="text-xs text-slate-500 mt-0.5">{me.username}님</p>}
          </div>
          <div className="flex gap-2">
            <button className="btn btn-muted" onClick={logout}>로그아웃</button>
          </div>
        </div>
      </header>

      <section className="card rounded-lg p-3 space-y-2.5">
        <div className="flex items-end justify-between">
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-800">게시글 목록</h2>
          <span className="text-[11px] md:text-xs text-slate-500">페이지 {currentPage} · {posts.length}개 표시</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] md:text-xs text-slate-600">
            댓글 작성은 <span className="underline underline-offset-2 font-semibold">게시글번호</span>를 클릭하여 작성하십시요.
          </p>
          <div className="flex gap-2 justify-end shrink-0">
            <button className="btn btn-primary" onClick={() => location.href='/post-create.html'}>게시글 작성</button>
            <button className="btn btn-muted" onClick={() => loadPosts(currentPage)}>새로고침</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-1">
          {posts.map((p, idx) => (
            <div
              key={p.id}
              className="group border border-slate-200 rounded-md p-1.5 md:p-2 bg-gradient-to-br from-white to-slate-50 hover:shadow-sm transition-all duration-200"
            >
              <div className="text-left w-full">
                <div className="mb-1 flex items-center gap-2 min-w-0">
                  <button
                    className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-1.5 py-0.5 text-[10px] md:text-[11px] font-semibold hover:bg-indigo-100 shrink-0 underline underline-offset-2"
                    onClick={() => location.href=`/comments.html?postId=${p.id}`}
                    title="댓글 페이지로 이동"
                  >
                    {((currentPage - 1) * PAGE_SIZE) + idx + 1}. POST #{p.id}
                  </button>
                  <p className="font-semibold text-xs md:text-sm text-slate-900 leading-tight break-words line-clamp-1 min-w-0">{p.title}</p>
                </div>
                <p className="mt-0.5 text-[11px] md:text-xs text-slate-600 line-clamp-1 break-words">{p.content}</p>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center text-base text-slate-500">
              게시글이 없습니다.
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            className="btn btn-muted"
            disabled={currentPage <= 1}
            onClick={goFirstPage}
          >
            처음
          </button>

          <button
            className="btn btn-muted"
            disabled={currentPage <= 1}
            onClick={() => currentPage > 1 && loadPosts(currentPage - 1)}
          >
            이전
          </button>

          {pageTabs.map(page => (
            <button
              key={page}
              className={`btn ${page === currentPage ? 'btn-primary' : 'btn-muted'}`}
              onClick={() => loadPosts(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="btn btn-muted"
            disabled={!hasNextPage}
            onClick={() => hasNextPage && loadPosts(currentPage + 1)}
          >
            다음
          </button>

          <button
            className="btn btn-muted"
            disabled={isFindingLast || posts.length === 0}
            onClick={goLastPage}
          >
            {isFindingLast ? '마지막 찾는 중...' : '마지막'}
          </button>
        </div>
      </section>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<PostsPage />);