/* ── Shared nav helpers ── */
(function(){
  // highlight active nav item
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(a=>{
    const href = a.getAttribute('href');
    if(href === page) a.classList.add('active');
    else a.classList.remove('active');
  });

  // mobile hamburger
  const btn = document.getElementById('hamburgerBtn');
  const sidebar = document.getElementById('sidebar');
  if(btn && sidebar){
    btn.addEventListener('click',()=>sidebar.classList.toggle('open'));
    document.addEventListener('click',e=>{
      if(!sidebar.contains(e.target) && e.target!==btn) sidebar.classList.remove('open');
    });
  }

  // date badge
  const el = document.getElementById('currentDate');
  if(el){
    el.textContent = new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  }

  // toast system
  window.showToast = function(msg, type='success'){
    let container = document.getElementById('toastContainer');
    if(!container){
      container = document.createElement('div');
      container.id = 'toastContainer';
      document.body.appendChild(container);
    }
    const t = document.createElement('div');
    t.className = 'toast' + (type==='error'?' error':'');
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(()=>t.remove(), 3500);
  };

  // modal helpers
  window.openModal = function(id){ document.getElementById(id).classList.add('open'); };
  window.closeModal = function(id){ document.getElementById(id).classList.remove('open'); };
  document.addEventListener('click', e=>{
    if(e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
    if(e.target.classList.contains('modal-close')){
      e.target.closest('.modal-overlay').classList.remove('open');
    }
  });
})();
