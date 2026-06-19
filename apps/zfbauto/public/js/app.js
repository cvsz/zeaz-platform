document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('post-form');
  const btnSubmit = document.getElementById('btn-submit');
  const feedList = document.getElementById('feed-list');
  const btnRefresh = document.getElementById('btn-refresh');
  const kpiTotalPosts = document.getElementById('kpi-total-posts');
  
  // Health Check
  const checkHealth = async () => {
    try {
      const res = await fetch('/health');
      const data = await res.json();
      const statusText = document.getElementById('status-text');
      const statusBadge = document.getElementById('system-status');
      
      if (data.ok) {
        statusText.textContent = 'System Online';
        statusBadge.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
        statusBadge.style.color = 'var(--color-accent)';
      } else {
        throw new Error('Not OK');
      }
    } catch (e) {
      const statusText = document.getElementById('status-text');
      const statusBadge = document.getElementById('system-status');
      statusText.textContent = 'System Offline';
      statusBadge.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
      statusBadge.style.color = 'var(--color-destructive)';
      document.querySelector('.status-dot').style.backgroundColor = 'var(--color-destructive)';
      document.querySelector('.status-dot').style.boxShadow = '0 0 8px var(--color-destructive)';
    }
  };

  // Fetch recent posts
  const fetchPosts = async () => {
    feedList.innerHTML = '<div class="text-muted" style="text-align: center; padding: 32px 0;">Loading recent posts...</div>';
    try {
      const res = await fetch('/api/facebook/posts');
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error?.message || 'Failed to fetch posts. Make sure PAGE_ID and ACCESS_TOKEN are valid in .env');
      }

      const posts = json.data?.data || [];
      
      kpiTotalPosts.textContent = posts.length > 0 ? posts.length : '0';

      if (posts.length === 0) {
        feedList.innerHTML = '<div class="text-muted" style="text-align: center; padding: 32px 0;">No posts found. Publish something!</div>';
        return;
      }

      feedList.innerHTML = posts.map(post => {
        const date = new Date(post.created_time).toLocaleString();
        const message = post.message || '<i>No message</i>';
        return `
          <div class="feed-item">
            <div class="feed-header">
              <span>Post ID: ${post.id.split('_')[1] || post.id}</span>
              <span>${date}</span>
            </div>
            <div class="feed-content">
              ${message.replace(/\\n/g, '<br>')}
            </div>
          </div>
        `;
      }).join('');
      
    } catch (e) {
      console.error(e);
      feedList.innerHTML = `<div style="color: var(--color-destructive); text-align: center; padding: 32px 0;">${e.message}</div>`;
      showToast(e.message, 'error');
    }
  };

  // Submit form
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const message = document.getElementById('message').value;
    const imageUrl = document.getElementById('imageUrl').value;
    
    btnSubmit.disabled = true;
    btnSubmit.classList.add('loading');

    try {
      const endpoint = imageUrl ? '/api/facebook/post-photo' : '/api/facebook/post-message';
      const body = { message };
      if (imageUrl) body.url = imageUrl;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const json = await res.json();

      if (json.success) {
        showToast('Successfully published to Facebook!');
        form.reset();
        fetchPosts(); // Refresh feed
      } else {
        throw new Error(json.error?.message || json.error || 'Failed to publish post');
      }
    } catch (e) {
      console.error(e);
      showToast(e.message, 'error');
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.classList.remove('loading');
    }
  });

  // Toasts
  const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' 
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease-out forwards';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  btnRefresh.addEventListener('click', fetchPosts);

  // Init
  checkHealth();
  fetchPosts();
});
