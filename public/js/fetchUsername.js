document.addEventListener('DOMContentLoaded', async () => {
    try {
      const res = await fetch('/api/me');
      if (!res.ok) throw new Error('Not logged in');
      const data = await res.json();
      // e.g. data: { nickname: "...", gold: ... }
      document.getElementById('usernameDisplay').textContent = data.nickname || 'User';
    } catch (err) {
      console.error(err);
      // If not logged in, you could redirect or show a message
    }
  });