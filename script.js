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
const noteColors = ["#FFEBEE", "#E8F5E9", "#E3F2FD", "#FFFDE7", "#F3E5F5"];

// MODE SISWA
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
    shareLink.textContent = `Link untuk siswa: ${url}`;
    shareLink.classList.remove('hidden');
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
