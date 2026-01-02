// ====================
// 전역 변수
// ====================

let currentMemoId = null; // 현재 보고 있는 메모 ID
let currentImageData = null; // 현재 선택된 이미지 데이터 (Base64)

// ====================
// 앱 초기화
// ====================

document.addEventListener('DOMContentLoaded', () => {
  console.log('H_Memo 앱 시작');
  initUI();
  initDetailView();
  loadMemos();
});


// ====================
// UI 초기화
// ====================

function initUI() {
  // 더보기 메뉴 버튼
  const menuBtn = document.querySelector('.header__menu-btn');
  const menu = document.getElementById('menu');

  // 중요 메모 필터 버튼
  const starBtn = document.querySelector('.memo-list-header__star-btn');

  // 메모 작성 영역 버튼들
  const editorStarBtn = document.querySelector('.memo-editor__star-btn');
  const editorImageBtn = document.querySelector('.memo-editor__image-btn');

  // 더보기 메뉴 열기/닫기
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // 메뉴 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && e.target !== menuBtn) {
        closeMenu();
      }
    });
  }

  // 중요 메모 필터 토글
  if (starBtn) {
    starBtn.addEventListener('click', () => {
      toggleImportantFilter();
    });
  }

  // 메모 작성 영역 중요 표시 토글
  if (editorStarBtn) {
    editorStarBtn.addEventListener('click', () => {
      toggleEditorStar();
    });
  }

  // 이미지 추가 버튼
  if (editorImageBtn) {
    editorImageBtn.addEventListener('click', () => {
      openImagePicker();
    });
  }

  // 이미지 파일 선택
  const imageInput = document.getElementById('imageInput');
  if (imageInput) {
    imageInput.addEventListener('change', (e) => {
      handleImageSelect(e);
    });
  }

  // 이미지 삭제 버튼
  const imageRemoveBtn = document.querySelector('.memo-editor__image-remove-btn');
  if (imageRemoveBtn) {
    imageRemoveBtn.addEventListener('click', () => {
      removeImage();
    });
  }

  // 저장 버튼
  const saveBtn = document.querySelector('.memo-editor__save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveMemo();
    });
  }

  // 검색 기능
  const searchInput = document.querySelector('.search-box__input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchMemos(e.target.value);
    });
  }

  // 더보기 메뉴 버튼들
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const fontSizeBtn = document.getElementById('fontSizeBtn');
  const darkModeBtn = document.getElementById('darkModeBtn');

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportMemos();
      closeMenu();
    });
  }

  if (importBtn) {
    importBtn.addEventListener('click', () => {
      openImportDialog();
      closeMenu();
    });
  }

  if (fontSizeBtn) {
    fontSizeBtn.addEventListener('click', () => {
      toggleFontSize();
      closeMenu();
    });
  }

  if (darkModeBtn) {
    darkModeBtn.addEventListener('click', () => {
      toggleDarkMode();
      closeMenu();
    });
  }

  // 파일 가져오기 입력
  const importFileInput = document.getElementById('importFileInput');
  if (importFileInput) {
    importFileInput.addEventListener('change', (e) => {
      handleImportFile(e);
    });
  }

  // 저장된 설정 불러오기
  loadSettings();
}


// ====================
// UI 이벤트 핸들러
// ====================

// 더보기 메뉴 열기
function toggleMenu() {
  const menu = document.getElementById('menu');
  if (menu.hasAttribute('hidden')) {
    menu.removeAttribute('hidden');
  } else {
    menu.setAttribute('hidden', '');
  }
}

// 더보기 메뉴 닫기
function closeMenu() {
  const menu = document.getElementById('menu');
  menu.setAttribute('hidden', '');
}

// 중요 메모 필터 토글
let isImportantFilterActive = false;

function toggleImportantFilter() {
  const starBtn = document.querySelector('.memo-list-header__star-btn');
  const memoItems = document.querySelectorAll('.memo-item');

  isImportantFilterActive = !isImportantFilterActive;

  if (isImportantFilterActive) {
    // 중요 메모만 보기
    starBtn.classList.add('active');
    memoItems.forEach(item => {
      if (!item.classList.contains('memo-item--important')) {
        item.style.display = 'none';
      }
    });
  } else {
    // 전체 메모 보기
    starBtn.classList.remove('active');
    memoItems.forEach(item => {
      item.style.display = 'block';
    });
  }
}

// 메모 작성 영역 중요 표시 토글
function toggleEditorStar() {
  const editorStarBtn = document.querySelector('.memo-editor__star-btn');

  if (editorStarBtn.classList.contains('active')) {
    // 중요 표시 해제
    editorStarBtn.classList.remove('active');
    editorStarBtn.textContent = '☆';
  } else {
    // 중요 표시 설정
    editorStarBtn.classList.add('active');
    editorStarBtn.textContent = '★';
  }
}


// ====================
// 메모 관리 함수
// ====================

// 메모 저장
function saveMemo() {
  const titleInput = document.querySelector('.memo-editor__title');
  const contentInput = document.querySelector('.memo-editor__content');
  const starBtn = document.querySelector('.memo-editor__star-btn');
  const saveBtn = document.querySelector('.memo-editor__save-btn');

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  // 제목과 내용이 모두 비어있으면 저장하지 않음
  if (!title && !content) {
    alert('제목 또는 내용을 입력해주세요.');
    return;
  }

  const isEditMode = saveBtn.dataset.editId;

  if (isEditMode) {
    // 수정 모드
    const updatedData = {
      title: title || content.split('\n')[0].substring(0, 30),
      content: content,
      isImportant: starBtn.classList.contains('active'),
      image: currentImageData
    };
    updateMemo(saveBtn.dataset.editId, updatedData);

    // 수정 모드 해제
    delete saveBtn.dataset.editId;
    saveBtn.textContent = '저장하기';
  } else {
    // 새 메모 추가
    const memo = {
      id: Date.now(), // 고유 ID (타임스탬프)
      title: title || content.split('\n')[0].substring(0, 30), // 제목이 없으면 내용 첫줄
      content: content,
      date: new Date().toISOString(),
      isImportant: starBtn.classList.contains('active'),
      image: currentImageData
    };

    // LocalStorage에 저장
    const memos = getMemos();
    memos.unshift(memo); // 배열 맨 앞에 추가 (최신순)
    setMemos(memos);
  }

  // 입력창 초기화
  titleInput.value = '';
  contentInput.value = '';
  starBtn.classList.remove('active');
  starBtn.textContent = '☆';
  removeImage(); // 이미지 초기화

  // 메모 목록 다시 렌더링
  renderMemos();
}

// 메모 목록 렌더링
function renderMemos() {
  const memoList = document.getElementById('memoList');
  const memos = getMemos();

  // 기존 목록 비우기
  memoList.innerHTML = '';

  // 메모가 없으면 안내 메시지
  if (memos.length === 0) {
    memoList.innerHTML = '<li class="memo-item"><p style="text-align: center; color: #999; padding: 20px;">저장된 메모가 없습니다.</p></li>';
    return;
  }

  // 메모 목록 생성
  memos.forEach(memo => {
    const memoItem = createMemoItem(memo);
    memoList.appendChild(memoItem);
  });
}

// 메모 아이템 HTML 생성
function createMemoItem(memo) {
  const li = document.createElement('li');
  li.className = 'memo-item';
  if (memo.isImportant) {
    li.classList.add('memo-item--important');
  }
  li.dataset.id = memo.id;

  const date = new Date(memo.date);
  const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;

  li.innerHTML = `
    <div class="memo-item__content">
      <p class="memo-item__title">${memo.title}</p>
      <time class="memo-item__date">${formattedDate}</time>
    </div>
    <button class="memo-item__delete-btn" aria-label="삭제">🗑️</button>
  `;

  // 메모 클릭 시 상세보기로 이동
  const contentDiv = li.querySelector('.memo-item__content');
  contentDiv.addEventListener('click', () => {
    showDetailView(memo.id);
  });

  // 삭제 버튼 클릭 시 삭제
  const deleteBtn = li.querySelector('.memo-item__delete-btn');
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // 메모 클릭 이벤트 방지
    deleteMemoWithConfirm(memo.id);
  });

  return li;
}

// 메모 불러오기
function loadMemos() {
  renderMemos();
}


// ====================
// LocalStorage 함수
// ====================

const STORAGE_KEY = 'h_memo_data';

// 모든 메모 가져오기
function getMemos() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// 메모 저장하기
function setMemos(memos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
}

// 메모 삭제하기
function deleteMemo(id) {
  const memos = getMemos();
  const filteredMemos = memos.filter(memo => memo.id !== id);
  setMemos(filteredMemos);
  renderMemos();
}

// 메모 ID로 찾기
function getMemoById(id) {
  const memos = getMemos();
  return memos.find(memo => memo.id === parseInt(id));
}

// 메모 업데이트
function updateMemo(id, updatedData) {
  const memos = getMemos();
  const index = memos.findIndex(memo => memo.id === parseInt(id));
  if (index !== -1) {
    memos[index] = { ...memos[index], ...updatedData };
    setMemos(memos);
    renderMemos();
  }
}


// ====================
// 상세보기 화면
// ====================

// 상세보기 초기화
function initDetailView() {
  const detailView = document.getElementById('detailView');
  const backBtn = detailView.querySelector('.detail-view__back-btn');
  const editBtn = detailView.querySelector('.detail-view__edit-btn');
  const deleteBtn = detailView.querySelector('.detail-view__delete-btn');
  const copyBtn = detailView.querySelector('.detail-view__copy-btn');
  const shareBtn = detailView.querySelector('.detail-view__share-btn');

  // 뒤로가기
  backBtn.addEventListener('click', () => {
    hideDetailView();
  });

  // 수정 버튼
  editBtn.addEventListener('click', () => {
    editMemoFromDetail();
  });

  // 삭제 버튼
  deleteBtn.addEventListener('click', () => {
    deleteMemoFromDetail();
  });

  // 복사 버튼
  copyBtn.addEventListener('click', () => {
    copyMemoContent();
  });

  // 공유 버튼
  shareBtn.addEventListener('click', () => {
    shareMemoContent();
  });
}

// 상세보기 표시
function showDetailView(id) {
  const memo = getMemoById(id);
  if (!memo) return;

  currentMemoId = id;

  const detailView = document.getElementById('detailView');
  const titleEl = document.getElementById('detailTitle');
  const dateEl = document.getElementById('detailDate');
  const contentEl = document.getElementById('detailContent');
  const imageContainer = document.getElementById('detailImageContainer');
  const imageEl = document.getElementById('detailImage');

  const date = new Date(memo.date);
  const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;

  titleEl.textContent = memo.title;
  dateEl.textContent = formattedDate;
  contentEl.textContent = memo.content;

  // 이미지 표시
  if (memo.image) {
    imageEl.src = memo.image;
    imageContainer.removeAttribute('hidden');
  } else {
    imageContainer.setAttribute('hidden', '');
  }

  // 중요 메모 표시
  if (memo.isImportant) {
    titleEl.style.color = 'var(--color-warning)';
  } else {
    titleEl.style.color = 'var(--color-primary)';
  }

  detailView.removeAttribute('hidden');
}

// 상세보기 숨기기
function hideDetailView() {
  const detailView = document.getElementById('detailView');
  detailView.setAttribute('hidden', '');
  currentMemoId = null;
}

// 상세보기에서 수정
function editMemoFromDetail() {
  const memo = getMemoById(currentMemoId);
  if (!memo) return;

  // 메인 화면으로 돌아가서 편집 모드 활성화
  hideDetailView();

  const titleInput = document.querySelector('.memo-editor__title');
  const contentInput = document.querySelector('.memo-editor__content');
  const starBtn = document.querySelector('.memo-editor__star-btn');
  const saveBtn = document.querySelector('.memo-editor__save-btn');

  titleInput.value = memo.title;
  contentInput.value = memo.content;

  // 이미지 불러오기
  if (memo.image) {
    currentImageData = memo.image;
    showImagePreview(memo.image);
  } else {
    removeImage();
  }

  if (memo.isImportant) {
    starBtn.classList.add('active');
    starBtn.textContent = '★';
  } else {
    starBtn.classList.remove('active');
    starBtn.textContent = '☆';
  }

  // 저장 버튼 텍스트 변경
  saveBtn.textContent = '수정하기';
  saveBtn.dataset.editId = currentMemoId;

  // 입력창으로 스크롤
  titleInput.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 상세보기에서 삭제
function deleteMemoFromDetail() {
  deleteMemoWithConfirm(currentMemoId);
}

// 삭제 확인 후 삭제
function deleteMemoWithConfirm(id) {
  if (confirm('정말 삭제하시겠습니까?')) {
    deleteMemo(id);
    hideDetailView();
  }
}

// 메모 복사
function copyMemoContent() {
  const memo = getMemoById(currentMemoId);
  if (!memo) return;

  const text = `${memo.title}\n\n${memo.content}`;

  navigator.clipboard.writeText(text).then(() => {
    alert('메모가 복사되었습니다.');
  }).catch(err => {
    console.error('복사 실패:', err);
  });
}

// 메모 공유
function shareMemoContent() {
  const memo = getMemoById(currentMemoId);
  if (!memo) return;

  if (navigator.share) {
    navigator.share({
      title: memo.title,
      text: memo.content
    }).catch(err => {
      console.error('공유 실패:', err);
    });
  } else {
    alert('이 브라우저는 공유 기능을 지원하지 않습니다.');
  }
}


// ====================
// 이미지 처리 함수
// ====================

// 이미지 선택 다이얼로그 열기
function openImagePicker() {
  const imageInput = document.getElementById('imageInput');
  imageInput.click();
}

// 이미지 선택 처리
function handleImageSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  // 파일 크기 체크 (5MB 제한)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    alert('이미지 크기는 5MB 이하만 가능합니다.');
    return;
  }

  // 이미지 파일인지 확인
  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 선택할 수 있습니다.');
    return;
  }

  // FileReader로 이미지를 Base64로 변환
  const reader = new FileReader();
  reader.onload = function(e) {
    currentImageData = e.target.result;
    showImagePreview(currentImageData);
  };
  reader.onerror = function() {
    alert('이미지를 불러오는데 실패했습니다.');
  };
  reader.readAsDataURL(file);
}

// 이미지 미리보기 표시
function showImagePreview(imageData) {
  const preview = document.getElementById('imagePreview');
  const previewImage = document.getElementById('previewImage');

  previewImage.src = imageData;
  preview.removeAttribute('hidden');
}

// 이미지 제거
function removeImage() {
  currentImageData = null;
  const preview = document.getElementById('imagePreview');
  const previewImage = document.getElementById('previewImage');
  const imageInput = document.getElementById('imageInput');

  previewImage.src = '';
  preview.setAttribute('hidden', '');
  imageInput.value = ''; // 파일 입력 초기화
}


// ====================
// 백업/복원 기능
// ====================

// 메모 내보내기 (Export)
function exportMemos() {
  const memos = getMemos();

  if (memos.length === 0) {
    alert('내보낼 메모가 없습니다.');
    return;
  }

  try {
    // JSON 문자열로 변환
    const jsonString = JSON.stringify(memos, null, 2);

    // Blob 생성
    const blob = new Blob([jsonString], { type: 'application/json' });

    // 다운로드 링크 생성
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    // 파일명에 날짜 포함
    const date = new Date();
    const dateString = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    a.href = url;
    a.download = `H_Memo_백업_${dateString}.json`;

    // 다운로드 실행
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`메모 ${memos.length}개를 내보냈습니다.`);
  } catch (error) {
    console.error('내보내기 실패:', error);
    alert('메모 내보내기에 실패했습니다.');
  }
}

// 메모 가져오기 다이얼로그 열기
function openImportDialog() {
  const importFileInput = document.getElementById('importFileInput');
  importFileInput.click();
}

// 메모 가져오기 파일 처리
function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  // JSON 파일인지 확인
  if (!file.name.endsWith('.json')) {
    alert('JSON 파일만 가져올 수 있습니다.');
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);

      // 배열인지 확인
      if (!Array.isArray(importedData)) {
        alert('올바른 메모 백업 파일이 아닙니다.');
        return;
      }

      // 복원 전 확인
      const currentMemos = getMemos();
      const message = currentMemos.length > 0
        ? `현재 메모 ${currentMemos.length}개에 ${importedData.length}개를 추가합니다. 계속하시겠습니까?`
        : `${importedData.length}개의 메모를 가져오시겠습니까?`;

      if (!confirm(message)) {
        return;
      }

      // 기존 메모에 추가 (중복 ID 방지)
      const existingIds = new Set(currentMemos.map(m => m.id));
      const newMemos = importedData.filter(memo => {
        // 필수 속성 확인
        if (!memo.id || !memo.content) return false;
        // 중복 ID 확인
        return !existingIds.has(memo.id);
      });

      // 병합 및 저장
      const mergedMemos = [...currentMemos, ...newMemos];
      setMemos(mergedMemos);
      renderMemos();

      alert(`${newMemos.length}개의 메모를 가져왔습니다.`);
    } catch (error) {
      console.error('가져오기 실패:', error);
      alert('파일을 읽는데 실패했습니다. 올바른 백업 파일인지 확인해주세요.');
    }
  };

  reader.onerror = function() {
    alert('파일을 읽는데 실패했습니다.');
  };

  reader.readAsText(file);

  // 파일 입력 초기화 (같은 파일 다시 선택 가능하도록)
  event.target.value = '';
}


// ====================
// 검색 기능
// ====================

function searchMemos(query) {
  const memoItems = document.querySelectorAll('.memo-item');
  const searchQuery = query.toLowerCase().trim();

  if (!searchQuery) {
    // 검색어가 없으면 모두 표시
    memoItems.forEach(item => {
      item.style.display = 'flex';
    });
    return;
  }

  // 검색어와 일치하는 메모만 표시
  const memos = getMemos();
  memoItems.forEach((item, index) => {
    const memo = memos[index];
    if (!memo) return;

    const titleMatch = memo.title.toLowerCase().includes(searchQuery);
    const contentMatch = memo.content.toLowerCase().includes(searchQuery);

    if (titleMatch || contentMatch) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}


// ====================
// 글자크기 조절
// ====================

const FONT_SIZES = ['small', 'medium', 'large'];
let currentFontSizeIndex = 1; // 기본값: medium

function toggleFontSize() {
  currentFontSizeIndex = (currentFontSizeIndex + 1) % FONT_SIZES.length;
  const fontSize = FONT_SIZES[currentFontSizeIndex];

  applyFontSize(fontSize);
  localStorage.setItem('h_memo_font_size', fontSize);

  const labels = { small: '작게', medium: '보통', large: '크게' };
  alert(`글자크기: ${labels[fontSize]}`);
}

function applyFontSize(size) {
  document.body.classList.remove('font-small', 'font-medium', 'font-large');
  document.body.classList.add(`font-${size}`);
}


// ====================
// 다크모드
// ====================

let isDarkMode = false;

function toggleDarkMode() {
  isDarkMode = !isDarkMode;

  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('h_memo_dark_mode', 'true');
    alert('다크모드 켜짐');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('h_memo_dark_mode', 'false');
    alert('다크모드 꺼짐');
  }
}


// ====================
// 설정 불러오기
// ====================

function loadSettings() {
  // 글자크기 설정 불러오기
  const savedFontSize = localStorage.getItem('h_memo_font_size');
  if (savedFontSize && FONT_SIZES.includes(savedFontSize)) {
    currentFontSizeIndex = FONT_SIZES.indexOf(savedFontSize);
    applyFontSize(savedFontSize);
  } else {
    applyFontSize('medium');
  }

  // 다크모드 설정 불러오기
  const savedDarkMode = localStorage.getItem('h_memo_dark_mode');
  if (savedDarkMode === 'true') {
    isDarkMode = true;
    document.body.classList.add('dark-mode');
  }
}
