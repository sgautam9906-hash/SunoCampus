(() => {
  const subjectType = document.querySelector('#subjectType');
  const identityPolicy = document.querySelector('#identityPolicy');
  const sensitivePrivacy = document.querySelector('#sensitivePrivacy');
  const updateIdentityPolicy = () => {
    if (!subjectType || !identityPolicy) return;
    const protectedTypes = ['Faculty/Teacher', 'Department/Official', 'Harassment/Sensitive Safety'];
    const protectedIdentity = protectedTypes.includes(subjectType.value) || document.querySelector('#category')?.value === 'Safety & Security';
    identityPolicy.textContent = protectedIdentity ? 'Identity Protected' : 'Identity: Visible to responsible authority';
    if (sensitivePrivacy) sensitivePrivacy.hidden = subjectType.value !== 'Harassment/Sensitive Safety';
  };
  subjectType?.addEventListener('change', updateIdentityPolicy);
  document.querySelectorAll('.category-chip').forEach(button => button.addEventListener('click', () => setTimeout(updateIdentityPolicy, 0)));
  updateIdentityPolicy();
  const categoryButtons = [...document.querySelectorAll('.category-chip')];
  const categoryInput = document.querySelector('#category');
  const issueSelect = document.querySelector('#issue');
  const locationSelect = document.querySelector('#location');
  const urgencySelect = document.querySelector('#urgency');
  const affectedInput = null;
  const titleInput = document.querySelector('#title');
  const areaInput = document.querySelector('#area');
  const detailInput = document.querySelector('#details');
  const summary = document.querySelector('#summaryPreview');
  const priorityValue = document.querySelector('#priorityValue');
  const priorityHint = document.querySelector('#priorityHint');
  const categories = window.SUNOCAMPUS_CATEGORIES || {};
  const issuePhrases = {
    'Broken classroom furniture':'Broken classroom furniture','Damaged road or pathway':'Damaged pathway','Electrical fault':'Electrical fault','Water leakage':'Water leak','Lift not working':'Lift outage',
    'Overflowing dustbin':'Overflowing bin','Unclean washroom':'Washroom cleanliness','No drinking water':'Drinking water outage','Broken campus light':'Broken campus lighting','Wi-Fi outage':'Wi-Fi outage'
  };
  function selectedPriority() {
    if (!categoryInput) return 'Low';
    const safety=categoryInput.value==='Safety & Security';
    if(safety&&urgencySelect?.value==='Urgent')return 'Critical';
    if(safety||urgencySelect?.value==='Urgent')return 'High';
    if(urgencySelect?.value==='Soon')return 'Medium';
    return 'Low';
  }
  function refreshSummary() {
    if (!summary || !categoryInput) return;
    const issue = issueSelect.value;
    const location = locationSelect.value;
    const priority = selectedPriority();
    priorityValue.textContent = priority;
    priorityHint.className = `priority-hint ${priority.toLowerCase()}`;
    if (!location) { summary.textContent = 'Select a category and location to build your summary.'; return; }
    const people = 1;
    const title = titleInput?.value.trim() || issue;
    const detail = detailInput.value.trim();
    const cleanIssue = issuePhrases[issue] || issue.charAt(0).toLowerCase() + issue.slice(1);
    summary.innerHTML = `<b>${escapeHTML(title)}</b> ? ${escapeHTML(cleanIssue)} at <b>${escapeHTML(location)}${areaInput?.value.trim() ? ', ' + escapeHTML(areaInput.value.trim()) : ''}</b>. Category: <b>${escapeHTML(categoryInput.value)}</b>. Suggested priority: <span class="priority-text ${priority.toLowerCase()}">${priority}</span>${detail ? `<br><span class="summary-detail">${escapeHTML(detail)}</span>` : ''}`;
  }
  function escapeHTML(value) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }
  categoryButtons.forEach(button => button.addEventListener('click', () => {
    categoryButtons.forEach(item => item.classList.remove('selected'));
    button.classList.add('selected'); categoryInput.value = button.dataset.category;
    issueSelect.innerHTML = categories[categoryInput.value].map(issue => `<option>${escapeHTML(issue)}</option>`).join('');
    refreshSummary();
  }));
  [issueSelect, locationSelect, urgencySelect, titleInput, areaInput, detailInput].filter(Boolean).forEach(el => el.addEventListener('input', refreshSummary));
  [issueSelect, locationSelect, urgencySelect].filter(Boolean).forEach(el => el.addEventListener('change', refreshSummary));
  refreshSummary();

  const file = document.querySelector('#photo');
  const preview = document.querySelector('#photoPreview');
  if (file) file.addEventListener('change', () => {
    preview.innerHTML = '';
    const selected = file.files[0];
    if (selected) {
      const image = document.createElement('img'); image.src = URL.createObjectURL(selected); image.alt = 'Selected evidence preview';
      const label = document.createElement('span'); label.textContent = selected.name;
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remove'; remove.onclick = () => { file.value = ''; preview.innerHTML = ''; };
      preview.append(image, label, remove);
    }
  });
  const charCount = document.querySelector('#charCount');
  if (detailInput && charCount) detailInput.addEventListener('input', () => { charCount.textContent = `${detailInput.value.length} / 1500`; refreshSummary(); });
  document.querySelectorAll('[data-scroll]').forEach(button => button.addEventListener('click', () => document.querySelector(button.dataset.scroll)?.scrollIntoView({ behavior: 'smooth', block: 'start' })));

  const voiceButton = document.querySelector('#voiceButton');
  if (voiceButton && detailInput) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) voiceButton.title = 'Voice input is supported in Chrome and Edge.';
    let recognition, listening = false;
    voiceButton.addEventListener('click', () => {
      if (!SpeechRecognition) { voiceButton.querySelector('#voiceLabel').textContent = 'Use Chrome or Edge'; return; }
      if (!recognition) { recognition = new SpeechRecognition(); recognition.lang = 'en-IN'; recognition.interimResults = true; recognition.continuous = true;
        recognition.onresult = event => { let spoken = ''; for (let i = event.resultIndex; i < event.results.length; i++) spoken += event.results[i][0].transcript; const prefix = detailInput.dataset.voicePrefix || detailInput.value; detailInput.value = `${prefix}${prefix && spoken ? ' ' : ''}${spoken}`.trim(); detailInput.dispatchEvent(new Event('input')); };
        recognition.onend = () => { listening = false; voiceButton.classList.remove('recording'); voiceButton.querySelector('#voiceLabel').textContent = 'Speak instead'; detailInput.dataset.voicePrefix = detailInput.value; };
        recognition.onerror = () => { listening = false; voiceButton.classList.remove('recording'); voiceButton.querySelector('#voiceLabel').textContent = 'Try again'; };
      }
      if (listening) recognition.stop(); else { detailInput.dataset.voicePrefix = detailInput.value; recognition.start(); listening = true; voiceButton.classList.add('recording'); voiceButton.querySelector('#voiceLabel').textContent = 'Listening… click to stop'; }
    });
  }
  const form = document.querySelector('#complaintForm');
  const similarPanel = document.querySelector('#similarPanel');
  const forceNew = document.querySelector('#forceNew');
  if (form && similarPanel) {
    let checking = false;
    form.addEventListener('submit', async event => {
      if (forceNew?.value === 'yes' || checking) return;
      event.preventDefault();
      checking = true;
      try {
        const data = new FormData(form);
        const response = await fetch('/complaints/similar', {method:'POST', body:data});
        const result = await response.json();
        const match = result.matches?.[0];
        if (!match) { checking = false; form.requestSubmit(); return; }
        const safe = value => escapeHTML(String(value || ''));
        similarPanel.hidden = false;
        similarPanel.innerHTML = `<span class="section-kicker">POSSIBLE MATCH</span><h3>Similar issue detected</h3><p><b>${safe(match.title)}</b> ? ${safe(match.location)} ? ${safe(match.status)}</p><p>${match.affected} student${match.affected===1?'':'s'} affected across ${match.reports} report${match.reports===1?'':'s'}.</p><div class="similar-actions"><button type="button" class="btn btn-dark" data-support="${safe(match.ticket)}">I?m affected too</button><button type="button" class="btn btn-outline" data-create-new>Create a new complaint</button></div>`;
        similarPanel.scrollIntoView({behavior:'smooth',block:'center'});
        similarPanel.querySelector('[data-create-new]').onclick = () => { forceNew.value='yes'; checking=false; form.requestSubmit(); };
        similarPanel.querySelector('[data-support]').onclick = async () => {
          const supportForm=document.createElement('form'); supportForm.method='post'; supportForm.action=`/complaint/${encodeURIComponent(match.ticket)}/support`;
          const csrf=form.querySelector('[name=csrf_token]')?.value || document.querySelector('input[name=csrf_token]')?.value || '';
          supportForm.innerHTML=`<input type="hidden" name="csrf_token" value="${safe(csrf)}">`; document.body.append(supportForm); supportForm.submit();
        };
      } catch (_) { checking=false; form.requestSubmit(); }
    });
  }
  const evidenceStatus=document.querySelector('#evidenceValidation');
  if(file&&evidenceStatus&&form){file.addEventListener('change',async()=>{
    const chosen=file.files[0]; document.querySelector('#evidenceToken').value=''; evidenceStatus.textContent='';
    if(!chosen)return;
    if(chosen.size>8*1024*1024){file.value='';preview.replaceChildren();evidenceStatus.textContent='Photo must be 8 MB or smaller.';return;}
    const data=new FormData();data.append('photo',chosen);data.append('category',categoryInput.value);data.append('issue',issueSelect.value);
    const csrfToken=form.querySelector('[name=csrf_token]')?.value;
    if(csrfToken)data.append('csrf_token',csrfToken);
    const consent=form.querySelector('[name=ai_image_consent]');if(consent?.checked)data.append('ai_image_consent','yes');
    evidenceStatus.textContent=consent&&!consent.checked?'Choose whether to send this image for an advisory AI screen, or continue with human review.':'Checking evidence relevance?';
    try{const res=await fetch('/evidence/check',{method:'POST',body:data});const value=await res.json();evidenceStatus.textContent=value.relevance==='likely_relevant'?'? Likely relevant ? '+value.note:value.relevance==='may_not_match'?'? May not match ? '+value.note:'? Needs confirmation ? '+(value.note||'Staff can review this photo.');if(value.token)document.querySelector('#evidenceToken').value=value.token;}
    catch(_){evidenceStatus.textContent='Needs confirmation. Staff can review this photo.';}
  });}
  const aiConsent=form?.querySelector('[name=ai_image_consent]');
  if(aiConsent&&file){aiConsent.addEventListener('change',()=>{if(file.files[0])file.dispatchEvent(new Event('change'));});}
  const uploadZone = document.querySelector('.upload-zone');
  if (uploadZone && file) {
    uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragging'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragging'));
    uploadZone.addEventListener('drop', e => { e.preventDefault(); uploadZone.classList.remove('dragging'); if (e.dataTransfer.files.length) { file.files = e.dataTransfer.files; file.dispatchEvent(new Event('change')); } });
  }
  const notificationCenter=document.querySelector('#adminNotificationCenter');
  if(notificationCenter){
    const toggle=document.querySelector('#adminNotificationToggle');
    const panel=document.querySelector('#adminNotificationPanel');
    const badge=document.querySelector('#adminNotificationCount');
    const seen=new Set();let firstPoll=true;
    toggle?.addEventListener('click',()=>{const open=panel.hidden;panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));});
    const pollAdminNotifications=async()=>{
      try{
        const response=await fetch('/admin/notifications',{headers:{'Accept':'application/json'},cache:'no-store'});
        if(!response.ok)return;const data=await response.json();
        badge.textContent=String(data.unread||0);badge.hidden=!(data.unread>0);
        panel.replaceChildren();
        if(!data.notifications.length){const empty=document.createElement('p');empty.textContent='No unread reopened reports.';panel.append(empty);}
        data.notifications.forEach(item=>{
          const row=document.createElement('div');row.className='live-admin-alert';
          const link=document.createElement('a');link.href=item.url;link.textContent=item.message;
          const mark=document.createElement('button');mark.type='button';mark.textContent='Mark seen';
          mark.addEventListener('click',async()=>{await fetch(`/admin/notifications/${item.id}/read`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({csrf_token:notificationCenter.dataset.csrf})});await pollAdminNotifications();});
          row.append(link,mark);panel.append(row);
          if(!firstPoll&&!seen.has(item.id)){const stack=document.querySelector('.flash-stack')||document.querySelector('.page-content');const toast=document.createElement('div');toast.className='admin-live-toast';toast.setAttribute('role','status');toast.textContent=`A student reopened ?${item.title}?. Admin follow-up is needed.`;stack.prepend(toast);setTimeout(()=>toast.remove(),9000);}
          seen.add(item.id);
        });
        firstPoll=false;
      }catch(_){/* Admin alert polling can retry without interrupting the page. */}
    };
    pollAdminNotifications();window.setInterval(pollAdminNotifications,15000);
  }
  const campusChat = document.querySelector('#campusChat');
  if (campusChat) {
    const toggle = document.querySelector('#campusChatToggle');
    const panel = document.querySelector('#campusChatPanel');
    const close = document.querySelector('#campusChatClose');
    const form = document.querySelector('#campusChatForm');
    const input = document.querySelector('#campusChatInput');
    const send = document.querySelector('#campusChatSend');
    const messages = document.querySelector('#campusChatMessages');
    const history = [];
    const addMessage = (text, role) => {
      const message = document.createElement('p');
      message.className = `campus-chat-message ${role}`;
      message.textContent = text;
      messages.append(message);
      messages.scrollTop = messages.scrollHeight;
      return message;
    };
    const setOpen = open => {
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open) input.focus();
    };
    toggle.addEventListener('click', () => setOpen(panel.hidden));
    close.addEventListener('click', () => { setOpen(false); toggle.focus(); });
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        form.requestSubmit();
      }
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const message = input.value.trim();
      if (!message || send.disabled) return;
      addMessage(message, 'user');
      input.value = '';
      input.disabled = true;
      send.disabled = true;
      const typing = addMessage('Thinking…', 'assistant typing');
      try {
        const response = await fetch('/chat', {
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: new URLSearchParams({
            csrf_token: campusChat.dataset.csrf,
            message,
            history: JSON.stringify(history.slice(-8)),
          }),
        });
        const result = await response.json();
        typing.remove();
        if (!response.ok) throw new Error(result.error || 'The chatbot is temporarily unavailable.');
        addMessage(result.reply, 'assistant');
        history.push({role: 'user', content: message}, {role: 'assistant', content: result.reply});
        if (history.length > 8) history.splice(0, history.length - 8);
      } catch (error) {
        typing.remove();
        addMessage(error.message || 'The chatbot is temporarily unavailable. Please try again.', 'error');
      } finally {
        input.disabled = false;
        send.disabled = false;
        input.focus();
      }
    });
  }
})();
