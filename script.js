// Fetch the manifest and render the site
async function loadNotes() {
  const res = await fetch('notes.json');
  const data = await res.json();

  const subjectFilter = document.getElementById('subjectFilter');
  const subjectsContainer = document.getElementById('subjects');
  const searchInput = document.getElementById('search');

  // populate filter
  data.subjects.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.title;
    subjectFilter.appendChild(opt);
  });

  function render(filter = 'all', query = '') {
    subjectsContainer.innerHTML = '';
    const q = query.trim().toLowerCase();

    const filtered = data.subjects
      .filter(s => filter === 'all' ? true : s.id === filter)
      .map(s => {
        // filter notes by search query if there is one
        const notes = s.notes.filter(n => {
          if (!q) return true;
          return (n.name || '').toLowerCase().includes(q) || (s.title || '').toLowerCase().includes(q);
        });
        return {...s, notes};
      })
      .filter(s => s.notes.length > 0);

    if (filtered.length === 0) {
      const el = document.createElement('div');
      el.className = 'card empty';
      el.innerHTML = `<div class="empty">No notes found.</div>`;
      subjectsContainer.appendChild(el);
      return;
    }

    filtered.forEach(s => {
      const card = document.createElement('div');
      card.className = 'card';
      const h = document.createElement('h2');
      h.textContent = s.title;
      card.appendChild(h);

      const list = document.createElement('div');
      list.className = 'note-list';

      s.notes.forEach(n => {
        const note = document.createElement('div');
        note.className = 'note';

        const meta = document.createElement('div');
        meta.className = 'meta';
        const name = document.createElement('div');
        name.textContent = n.name || n.file.split('/').pop();
        const ext = (n.file.split('.').pop() || '').toUpperCase();
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = ext;
        meta.appendChild(name);
        meta.appendChild(badge);

        const actions = document.createElement('div');

        // direct download link
        const a = document.createElement('a');
        a.className = 'download';
        a.href = n.file;
        a.setAttribute('download', '');
        a.textContent = 'Download';
        actions.appendChild(a);

        note.appendChild(meta);
        note.appendChild(actions);
        list.appendChild(note);
      });

      card.appendChild(list);
      subjectsContainer.appendChild(card);
    });
  }

  // initial render
  render();

  // attach events
  subjectFilter.addEventListener('change', () => render(subjectFilter.value, searchInput.value));
  searchInput.addEventListener('input', () => render(subjectFilter.value, searchInput.value));
}

document.addEventListener('DOMContentLoaded', loadNotes);
