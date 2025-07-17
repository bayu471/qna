const firebaseConfig = {
  apiKey: "AIzaSyDF2hcjget7HTmLMJs7cvx9zf0zc0zUxvs",
  authDomain: "Yqna-app-11105.firebaseapp.com",
  databaseURL: "https://qna-app-11105-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "qna-app-11105",
  storageBucket: "qna-app-11105.appspot.com",
  messagingSenderId: "595300522810",
  appId: "1:595300522810:web:2dc9e327c6e71af3000e03"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const questionsRef = db.ref('questions');
const answersRef = db.ref('answers');

const questionInput = document.getElementById('questionInput');
const adminMessage = document.getElementById('adminMessage');
const shareLink = document.getElementById('shareLink');
const answerInput = document.getElementById('answerInput');
const questionText = document.getElementById('questionText');
const studentMessage = document.getElementById('studentMessage');

const adminForm = document.getElementById('adminForm');
const studentForm = document.getElementById('studentForm');

const urlParams = new URLSearchParams(window.location.search);
const questionId = urlParams.get('id');

let activeListenerId = null;
const noteColors = [
  "#FFEBEE", "#FFCDD2", "#EF9A9A", "#E57373", "#F8BBD0",
  "#F48FB1", "#CE93D8", "#E1BEE7", "#D1C4E9", "#B39DDB",
  "#C5CAE9", "#9FA8DA", "#BBDEFB", "#90CAF9", "#64B5F6",
  "#81D4FA", "#4FC3F7", "#4DD0E1", "#26C6DA", "#80DEEA",
  "#B2EBF2", "#B2DFDB", "#A5D6A7", "#C8E6C9", "#DCEDC8",
  "#F0F4C3", "#FFF9C4", "#FFECB3", "#FFE0B2", "#FFCCBC",
  "#D7CCC8", "#CFD8DC", "#E0F2F1", "#F1F8E9", "#FBE9E7",
  "#FFF3E0", "#F3E5F5", "#E8EAF6", "#E3F2FD", "#E0F7FA",
  "#F9FBE7", "#FFFDE7", "#EDE7F6", "#ECEFF1", "#FCE4EC",
  "#E6EE9C", "#FFCDD2", "#F8BBD0", "#D1C4E9", "#B2EBF2"
];


if (questionId) {
  adminForm.classList.add('hidden');
  studentForm.classList.remove('hidden');

  questionsRef.child(questionId).once('value', (snap) => {
    const data = snap.val();
    if (data) {
      questionText.textContent = data.text;
    } else {
      questionText.textContent = 'Pertanyaan tidak ditemukan.';
      answerInput.disabled = true;
    }
  });
} else {
  adminForm.classList.remove('hidden');
  studentForm.classList.add('hidden');

  const savedId = localStorage.getItem('activeQuestionId');
  if (savedId) {
    listenForAnswers(savedId);
  }
}

function createQuestion() {
  const text = questionInput.value.trim();
  if (!text) {
    adminMessage.textContent = 'Pertanyaan tidak boleh kosong.';
    adminMessage.className = 'error';
    return;
  }

  const newRef = questionsRef.push();
  newRef.set({
    text,
    timestamp: Date.now()
  }).then(() => {
    const id = newRef.key;
    const url = `${location.href.split('?')[0]}?id=${id}`;
    shareLink.textContent = `${url}`;
    document.getElementById('shareLinkWrapper').classList.remove('hidden');
    adminMessage.textContent = 'Pertanyaan berhasil dibuat.';
    adminMessage.className = 'success';
    questionInput.value = '';

    localStorage.setItem('activeQuestionId', id);
    listenForAnswers(id);
  }).catch((err) => {
    adminMessage.textContent = 'Gagal membuat pertanyaan.';
    adminMessage.className = 'error';
    console.error(err);
  });
}

function submitAnswer() {
  const text = answerInput.value.trim();
  if (!text || !questionId) return;

  answersRef.push({
    questionId,
    text,
    timestamp: Date.now()
  }).then(() => {
    studentMessage.textContent = 'Jawaban berhasil dikirim.';
    studentMessage.className = 'success';
    answerInput.value = '';
    answerInput.disabled = true;
  }).catch((err) => {
    studentMessage.textContent = 'Gagal mengirim jawaban.';
    studentMessage.className = 'error';
    console.error(err);
  });
}

function listenForAnswers(questionId) {
  if (activeListenerId === questionId) return;
  activeListenerId = questionId;

  const oldContainer = document.getElementById('answerContainer');
  if (oldContainer) oldContainer.remove();

  const container = document.createElement('div');
  container.id = 'answerContainer';
  container.innerHTML = "<h4>Jawaban yang Masuk:</h4><ul id='answerList'></ul>";
  adminForm.appendChild(container);

  answersRef.orderByChild('questionId').equalTo(questionId).on('value', (snapshot) => {
    const answerList = container.querySelector('#answerList');
    answerList.innerHTML = '';

    const data = snapshot.val();
    if (data) {
      Object.entries(data).forEach(([id, answer]) => {
        const div = document.createElement('div');
        div.className = 'answer-card';
            div.onclick = (e) => {
            // Jangan tampilkan modal jika klik tombol hapus
            if (e.target.tagName === 'BUTTON') return;

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modalContent');
            modalContent.innerHTML = answer.text;
            modal.classList.remove('hidden');
            };

        div.style.backgroundColor = noteColors[Math.floor(Math.random() * noteColors.length)];

        const delBtn = document.createElement('button');
        delBtn.textContent = '×';
        delBtn.onclick = () => {
          if (confirm('Yakin ingin menghapus jawaban ini?')) {
            answersRef.child(id).remove();
          }
        };

        const content = document.createElement('div');
        content.className = 'answer-content';
        content.textContent = answer.text;

        div.appendChild(delBtn);
        div.appendChild(content);
        answerList.appendChild(div);
      });
    } else {
      answerList.innerHTML = '<li>Belum ada jawaban.</li>';
    }
  });
}

function copyLink() {
  const link = document.getElementById('shareLink').textContent;
  navigator.clipboard.writeText(link).then(() => {
    const notice = document.getElementById('copyNotice');
    notice.classList.remove('hidden');
    setTimeout(() => notice.classList.add('hidden'), 2000);
  });
}
// Tutup modal saat diklik (di mana pun di luar fungsi lain)
document.getElementById('modal').onclick = () => {
  document.getElementById('modal').classList.add('hidden');
};
delBtn.title = "Hapus jawaban ini";
