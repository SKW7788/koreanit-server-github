const { createApp } = Vue;

createApp({
  data() {
    return {
      baseUrl: location.origin,
      authUser: null,
      logs: 'Ready.\n',
      signup: { username: '', password: '', nickname: '', email: '' },
      login: { username: '', password: '' },
      postForm: { title: '', content: '' },
      postTargetId: null,
      commentText: '',
      posts: []
    };
  },
  methods: {
    appendLog(title, payload) {
      const text = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
      this.logs = `[${new Date().toLocaleTimeString()}] ${title}\n${text}\n\n` + this.logs;
    },

    async api(path, options = {}) {
      const res = await fetch(`${this.baseUrl}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options
      });

      let body;
      try {
        body = await res.json();
      } catch {
        body = { message: 'JSON 응답이 아닙니다.' };
      }

      this.appendLog(`${options.method || 'GET'} ${path} [${res.status}]`, body);
      if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`);
      return body;
    },

    async register() {
      try {
        await this.api('/api/users', { method: 'POST', body: JSON.stringify(this.signup) });
      } catch (e) {
        this.appendLog('회원가입 실패', e.message);
      }
    },

    async doLogin() {
      try {
        await this.api('/api/login', { method: 'POST', body: JSON.stringify(this.login) });
        await this.pingMe();
      } catch (e) {
        this.appendLog('로그인 실패', e.message);
      }
    },

    async doLogout() {
      try {
        await this.api('/api/logout', { method: 'POST' });
        this.authUser = null;
      } catch (e) {
        this.appendLog('로그아웃 실패', e.message);
      }
    },

    async pingMe() {
      try {
        const res = await this.api('/api/me');
        this.authUser = res?.data || null;
      } catch {
        this.authUser = null;
      }
    },

    async getUsers() {
      try {
        await this.api('/api/users?limit=20');
      } catch (e) {
        this.appendLog('유저목록 실패', e.message);
      }
    },

    async createPost() {
      try {
        await this.api('/api/posts', { method: 'POST', body: JSON.stringify(this.postForm) });
        await this.loadPosts();
      } catch (e) {
        this.appendLog('게시글 생성 실패', e.message);
      }
    },

    async loadPosts() {
      try {
        const res = await this.api('/api/posts?page=1&limit=20');
        this.posts = res?.data || [];
      } catch (e) {
        this.appendLog('게시글 목록 실패', e.message);
      }
    },

    async getPost() {
      if (!this.postTargetId) return;
      try {
        await this.api(`/api/posts/${this.postTargetId}`);
      } catch (e) {
        this.appendLog('게시글 단건 실패', e.message);
      }
    },

    async deletePost() {
      if (!this.postTargetId) return;
      try {
        await this.api(`/api/posts/${this.postTargetId}`, { method: 'DELETE' });
        await this.loadPosts();
      } catch (e) {
        this.appendLog('게시글 삭제 실패', e.message);
      }
    },

    async createComment() {
      if (!this.postTargetId || !this.commentText.trim()) return;
      try {
        await this.api(`/api/posts/${this.postTargetId}/comments`, {
          method: 'POST',
          body: JSON.stringify({ content: this.commentText })
        });
      } catch (e) {
        this.appendLog('댓글 생성 실패', e.message);
      }
    },

    async loadComments() {
      if (!this.postTargetId) return;
      try {
        await this.api(`/api/posts/${this.postTargetId}/comments?limit=20`);
      } catch (e) {
        this.appendLog('댓글 목록 실패', e.message);
      }
    }
  },

  mounted() {
    this.pingMe();
    this.loadPosts();
  }
}).mount('#app');
