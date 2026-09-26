// ==========================================
// 0. KONFIGURASI SUPABASE & GOOGLE DRIVE
// ==========================================
const SUPABASE_URL = "https://osdgyhbvesbwlvfipyfo.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_JFeEWCN1ov9AfcH5XecD-g_GStrV5Qr";

// Inisialisasi Supabase Client (Untuk RSVP & Wishes)
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🔗 Masukkan URL Web App Google Apps Script Anda di sini untuk Google Drive
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwfsxafYCZUIsxk-e_6Mzo0UiY2wsXesiRCdJlrRIzYpsETirgAq5FkxoGolnbmxgbq/exec";


// ==========================================
// 1. PENGATURAN UTAMA, NAVIGASI & MUSIK
// ==========================================

function setActiveNav(element) {
  const navItems = document.querySelectorAll('.bottom-nav .nav-item');
  navItems.forEach(item => item.classList.remove('active'));
  element.classList.add('active');
}

function openInvitation() {
  const cover = document.getElementById('slide-1');
  if (cover) {
    cover.classList.add('cover-zoom-out');
    setTimeout(() => {
      cover.style.display = 'none';
    }, 800);
  }
  document.body.classList.remove('no-scroll');

  // Munculkan Bottom Nav Bar setelah undangan dibuka
  const bottomNav = document.querySelector('.bottom-nav');
  if (bottomNav) {
    bottomNav.classList.remove('hidden');
  }

  // Langsung arahkan ke Slide 2 (Verse) secara mulus
  const scrollContainer = document.querySelector('.scroll-container');
  const slide2 = document.getElementById('slide-2');
  if (slide2 && scrollContainer) {
    const topPos = slide2.offsetTop - scrollContainer.offsetTop;
    scrollContainer.scrollTo({ top: topPos, behavior: 'smooth' });
  }

  // Set aktif bar bawah ke menu Verse (Slide 2)
  const navItems = document.querySelectorAll('.bottom-nav .nav-item');
  navItems.forEach(item => item.classList.remove('active'));
  const verseNav = document.querySelector('.bottom-nav .nav-item[href="#slide-2"]');
  if (verseNav) verseNav.classList.add('active');

  const music = document.getElementById('bg-music');
  const btn = document.getElementById('music-btn');
  if (music) {
    music.play().catch(e => console.log(e));
    if (btn) btn.classList.add('playing');
  }
}

// Fungsi saat ikon Home ditekan untuk kembali ke Cover awal & sembunyikan bar
function resetToCover() {
  const cover = document.getElementById('slide-1');
  if (cover) {
    cover.style.display = 'flex';
    cover.classList.remove('cover-zoom-out');
  }
  document.body.classList.add('no-scroll');

  // Sembunyikan kembali Bottom Nav Bar
  const bottomNav = document.querySelector('.bottom-nav');
  if (bottomNav) {
    bottomNav.classList.add('hidden');
  }

  const scrollContainer = document.querySelector('.scroll-container');
  if (scrollContainer) {
    scrollContainer.scrollTo({ top: 0, behavior: 'instant' });
  }
}

function toggleMusic() {
  const music = document.getElementById('bg-music');
  const btn = document.getElementById('music-btn');
  if (music.paused) {
    music.play();
    if (btn) btn.classList.add('playing');
  } else {
    music.pause();
    if (btn) btn.classList.remove('playing');
  }
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("Nomor rekening berhasil disalin!");
  });
}

// ==========================================
// 2. COUNTDOWN TIMER (04 OKTOBER 2026)
// ==========================================
const targetDate = new Date("Oct 4, 2026 08:00:00").getTime();

setInterval(function() {
  const now = new Date().getTime();
  const distance = targetDate - now;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  if (document.getElementById("days")) {
    document.getElementById("days").innerText = days > 0 ? (days < 10 ? '0' + days : days) : '00';
    document.getElementById("hours").innerText = hours > 0 ? (hours < 10 ? '0' + hours : hours) : '00';
    document.getElementById("minutes").innerText = minutes > 0 ? (minutes < 10 ? '0' + minutes : minutes) : '00';
    document.getElementById("seconds").innerText = seconds > 0 ? (seconds < 10 ? '0' + seconds : seconds) : '00';
  }
}, 1000);

// ==========================================
// 3. EFEK HUJAN HATI BACKGROUND
// ==========================================
function createHeart() {
  const container = document.getElementById('hearts-container');
  if (!container) return;

  const heart = document.createElement('div');
  heart.classList.add('falling-heart');

  const hearts = ['❤️', '💖', '💕', '💗', '💓', '💞', '💘', '🤎', '🤍'];
  heart.innerText = hearts[Math.floor(Math.random() * hearts.length)];

  heart.style.left = Math.random() * 100 + 'vw';
  const size = Math.random() * 14 + 14;
  heart.style.fontSize = size + 'px';

  const duration = Math.random() * 4 + 3;
  heart.style.animationDuration = duration + 's';

  container.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, duration * 1000);
}

setInterval(createHeart, 350);

// ==========================================
// 4. FITUR PHOTOBOOTH (GOOGLE DRIVE VIA APPS SCRIPT)
// ==========================================
let mediaStream = null;
let useFrontCamera = true;
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;

async function startCamera() {
  const video = document.getElementById('booth-video');
  const resultImg = document.getElementById('booth-result');
  const frameOverlay = document.getElementById('cam-frame-overlay');
  const videoPlayer = document.getElementById('booth-video-player');
  
  const btnStart = document.getElementById('btn-start-cam');
  const btnSwitch = document.getElementById('btn-switch-cam');
  const btnCapture = document.getElementById('btn-capture');
  const btnRecord = document.getElementById('btn-record-video');
  const btnRetake = document.getElementById('btn-retake');
  const btnDownload = document.getElementById('btn-download-photo');
  const timerDiv = document.getElementById('video-timer');

  isRecording = false;
  if (window.videoRecordTimer) clearInterval(window.videoRecordTimer);

  if (videoPlayer) videoPlayer.style.display = 'none';

  try {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
      video: { 
        facingMode: useFrontCamera ? 'user' : 'environment'
      },
      audio: true 
    };

    mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = mediaStream;
    
    if (useFrontCamera) {
      video.style.transform = 'scaleX(-1)';
    } else {
      video.style.transform = 'scaleX(1)';
    }

    video.style.display = 'block';
    if (frameOverlay) frameOverlay.style.display = 'block';
    if (resultImg) resultImg.style.display = 'none';
    if (timerDiv) timerDiv.style.display = 'none';

    if (btnStart) btnStart.style.display = 'none';
    if (btnSwitch) btnSwitch.style.display = 'flex';
    if (btnCapture) btnCapture.style.display = 'flex';
    if (btnRecord) {
      btnRecord.style.display = 'inline-flex';
      btnRecord.innerHTML = '🎥 Video (Bebas)';
      btnRecord.style.backgroundColor = '#8B0000';
    }
    if (btnRetake) btnRetake.style.display = 'none';
    if (btnDownload) btnDownload.style.display = 'none';

  } catch (err) {
    alert("Gagal mengakses kamera. Pastikan izin kamera diizinkan di browser HP kamu.");
    console.error(err);
  }
}

function switchCamera() {
  useFrontCamera = !useFrontCamera; 
  startCamera(); 
}

function capturePhoto() {
  const video = document.getElementById('booth-video');
  const canvas = document.getElementById('booth-canvas');
  const resultImg = document.getElementById('booth-result');
  const frameOverlay = document.getElementById('cam-frame-overlay');
  
  const btnSwitch = document.getElementById('btn-switch-cam');
  const btnCapture = document.getElementById('btn-capture');
  const btnRecord = document.getElementById('btn-record-video');
  const btnRetake = document.getElementById('btn-retake');
  const downloadBtn = document.getElementById('btn-download-photo');

  if (!video.srcObject) return;

  canvas.width = video.videoWidth || 720;
  canvas.height = video.videoHeight || 1280; 
  const ctx = canvas.getContext('2d');

  ctx.save();
  if (useFrontCamera) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  const templateImg = new Image();
  templateImg.src = 'Galery/booth.png'; 
  
  templateImg.onload = function() {
    ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL('image/png');
    resultImg.src = dataURL;
    downloadBtn.href = dataURL;
    downloadBtn.download = `Photobooth-UusGita.png`;

    uploadPhotoToGoogleDrive(dataURL);
  };

  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
  }

  video.style.display = 'none';
  if (frameOverlay) frameOverlay.style.display = 'none';
  resultImg.style.display = 'block';

  if (btnSwitch) btnSwitch.style.display = 'none';
  if (btnCapture) btnCapture.style.display = 'none';
  if (btnRecord) btnRecord.style.display = 'none';
  if (btnRetake) btnRetake.style.display = 'inline-flex';
  if (downloadBtn) downloadBtn.style.display = 'inline-flex';
}

function recordVideo() {
  const video = document.getElementById('booth-video');
  const frameOverlay = document.getElementById('cam-frame-overlay');
  const resultImg = document.getElementById('booth-result');
  
  const btnSwitch = document.getElementById('btn-switch-cam');
  const btnCapture = document.getElementById('btn-capture');
  const btnRecord = document.getElementById('btn-record-video');
  const btnRetake = document.getElementById('btn-retake');
  const downloadBtn = document.getElementById('btn-download-photo');
  const timerDiv = document.getElementById('video-timer');
  const countdownSpan = document.getElementById('countdown-number');

  if (!video.srcObject) return;

  if (!isRecording) {
    recordedChunks = [];
    
    let mimeType = 'video/webm; codecs=vp9';
    if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
    } else if (MediaRecorder.isTypeSupported('video/webm; codecs=vp8')) {
      mimeType = 'video/webm; codecs=vp8';
    }

    try {
      mediaRecorder = new MediaRecorder(mediaStream, { mimeType: mimeType });
    } catch (e) {
      try {
        mediaRecorder = new MediaRecorder(mediaStream);
      } catch (err) {
        alert("Browser HP kamu tidak mendukung perekaman video langsung.");
        return;
      }
    }

    mediaRecorder.ondataavailable = function(event) {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = function() {
      const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || 'video/mp4' });
      const videoURL = URL.createObjectURL(blob);

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function() {
        const base64Video = reader.result;
        uploadVideoToGoogleDrive(base64Video);
      };

      if (resultImg) resultImg.style.display = 'none';
      
      let videoPlayer = document.getElementById('booth-video-player');
      if (!videoPlayer) {
        videoPlayer = document.createElement('video');
        videoPlayer.id = 'booth-video-player';
        videoPlayer.controls = true;
        videoPlayer.autoplay = true;
        videoPlayer.playsInline = true;
        videoPlayer.style.position = 'absolute';
        videoPlayer.style.top = '0';
        videoPlayer.style.left = '0';
        videoPlayer.style.width = '100%';
        videoPlayer.style.height = '100%';
        videoPlayer.style.objectFit = 'cover';
        videoPlayer.style.borderRadius = '10px';
        videoPlayer.style.zIndex = '4';
        video.parentNode.appendChild(videoPlayer);
      }

      if (useFrontCamera) {
        videoPlayer.style.transform = 'scaleX(-1)';
      } else {
        videoPlayer.style.transform = 'scaleX(1)';
      }

      videoPlayer.src = videoURL;
      videoPlayer.style.display = 'block';

      if (frameOverlay) frameOverlay.style.display = 'block';

      downloadBtn.href = videoURL;
      downloadBtn.download = `Video-Photobooth-UusGita.mp4`;
      downloadBtn.style.display = 'inline-flex';
      if (btnRetake) btnRetake.style.display = 'inline-flex';

      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      video.style.display = 'none';
    };

    mediaRecorder.start(250);
    isRecording = true;

    if (btnSwitch) btnSwitch.style.display = 'none';
    if (btnCapture) btnCapture.style.display = 'none';
    if (timerDiv) timerDiv.style.display = 'block';
    
    btnRecord.innerHTML = '<i class="fa-solid fa-stop"></i> Berhenti Video';
    btnRecord.style.backgroundColor = '#333';

    let secondsElapsed = 0;
    if (countdownSpan) countdownSpan.innerText = secondsElapsed;
    
    window.videoRecordTimer = setInterval(() => {
      secondsElapsed++;
      if (countdownSpan) countdownSpan.innerText = secondsElapsed;
    }, 1000);

  } else {
    clearInterval(window.videoRecordTimer);
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    isRecording = false;
    if (timerDiv) timerDiv.style.display = 'none';
    btnRecord.style.display = 'none';
  }
}

async function uploadPhotoToGoogleDrive(base64Image) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `Photobooth-UusGita-${timestamp}.png`;

    const payload = {
      fileData: base64Image,
      fileName: fileName,
      mimeType: "image/png"
    };

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.status === "success") {
      console.log("Foto Berhasil Masuk ke Google Drive:", result.fileUrl);
    }
  } catch (err) {
    console.error("Error Upload Foto ke Google Drive:", err);
  }
}

async function uploadVideoToGoogleDrive(base64Video) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `Video-UusGita-${timestamp}.mp4`;

    const payload = {
      fileData: base64Video,
      fileName: fileName,
      mimeType: "video/mp4"
    };

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.status === "success") {
      console.log("Video Berhasil Masuk ke Google Drive:", result.fileUrl);
    }
  } catch (err) {
    console.error("Error Upload Video ke Google Drive:", err);
  }
}

function retakePhoto() {
  isRecording = false;
  if (window.videoRecordTimer) clearInterval(window.videoRecordTimer);
  
  const videoPlayer = document.getElementById('booth-video-player');
  if (videoPlayer) {
    videoPlayer.style.display = 'none';
  }
  
  startCamera();
}


// ==========================================
// 5. WISHES & RSVP (SUPABASE DATABASE)
// ==========================================
async function handleRSVP(event) {
  event.preventDefault();
  
  const nameInput = document.getElementById('rsvp-name');
  const attendanceSelect = document.getElementById('rsvp-attendance');
  const guestsSelect = document.getElementById('rsvp-guests');
  const messageInput = document.getElementById('rsvp-message');

  const name = nameInput ? nameInput.value : "";
  const attendance = attendanceSelect ? attendanceSelect.value : "Ya, Saya Akan Hadir";
  const guests = guestsSelect ? guestsSelect.value : "1 Orang";
  const message = messageInput ? messageInput.value : "";

  const { data, error } = await _supabase
    .from('rsvp_guests')
    .insert([{ 
      name: name, 
      attendance: attendance, 
      guests: guests, 
      message: message 
    }]);

  if (error) {
    console.error("Gagal menyimpan ucapan:", error.message);
    alert("Gagal mengirim ucapan. Silakan coba lagi.");
    return;
  }

  nameInput.value = "";
  messageInput.value = "";
  loadWishes();
}

async function loadWishes() {
  const wishesListContainer = document.getElementById('wishes-list');
  if (!wishesListContainer) return;

  try {
    const { data, error } = await _supabase
      .from('rsvp_guests')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      wishesListContainer.innerHTML = '<p style="text-align: center; font-size: 12px; color: red;">Gagal memuat ucapan.</p>';
      return;
    }

    if (!data || data.length === 0) {
      wishesListContainer.innerHTML = '<p style="text-align: center; font-size: 11px; color: #777; margin: 10px 0;">Belum ada ucapan.</p>';
      return;
    }

    let htmlContent = "";
    data.forEach(item => {
      let dateString = "";
      if (item.created_at) {
        let d = new Date(item.created_at);
        dateString = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
      }

      htmlContent += `
        <div style="border-bottom: 1px solid #ebdcd0; padding: 6px 0; font-size: 11px; text-align: left;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; color: var(--maroon);">
            <span>${escapeHtml(item.name)}</span>
            <span style="font-size: 9px; color: #888;">${dateString}</span>
          </div>
          <p style="margin: 2px 0 0 0; color: var(--text-dark); word-break: break-word;">${escapeHtml(item.message || '-')}</p>
        </div>
      `;
    });

    wishesListContainer.innerHTML = htmlContent;

  } catch (err) {
    console.error("Error loading wishes:", err);
  }
}

function escapeHtml(text) {
  if (!text) return "";
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}


// ==========================================
// 6. INISIALISASI URL & NAVIGASI
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  loadWishes();

  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('to');
  if (guestName && document.getElementById('guest-name')) {
    document.getElementById('guest-name').innerText = decodeURIComponent(guestName);
  }

  const navLinks = document.querySelectorAll('.bottom-nav .nav-item');
  const scrollContainer = document.querySelector('.scroll-container');

  navLinks.forEach(link => {
    if (link.getAttribute('href') === '#slide-1') return;

    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement && scrollContainer) {
        const topPos = targetElement.offsetTop - scrollContainer.offsetTop;
        scrollContainer.scrollTo({ top: topPos, behavior: 'smooth' });
      }
    });
  });
});


// ==========================================
// 7. INTERSECTION OBSERVER UNTUK ANIMASI
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
  const animatedElements = document.querySelectorAll('.animate-left, .animate-right');

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => observer.observe(el));
});


// ==========================================
// 8. GOOGLE CALENDAR
// ==========================================
function addToCalendar() {
  const title = "Pernikahan Uus & Gita";
  const details = "Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami. Lokasi: Blok Jumat RT 001 / RW 001 Desa Cisambeng, Kec. Palasah, Kab. Majalengka.";
  const location = "Desa Cisambeng, Kec. Palasah, Kab. Majalengka";
  
  const startTime = "20261004T020000Z";
  const endTime = "20261004T100000Z";

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;

  window.open(googleUrl, '_blank');
}
