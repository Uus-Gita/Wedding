// ==========================================
// 1. PENGATURAN UTAMA & MUSIK
// ==========================================
function openInvitation() {
  const cover = document.getElementById('slide-1');
  if (cover) {
    cover.classList.add('cover-zoom-out');
    setTimeout(() => {
      cover.style.display = 'none';
    }, 800);
  }
  document.body.classList.remove('no-scroll');

  const music = document.getElementById('bg-music');
  const btn = document.getElementById('music-btn');
  if (music) {
    music.play().catch(e => console.log(e));
    if (btn) btn.classList.add('playing');
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
// 4. FITUR PHOTOBOOTH & GOOGLE APPS SCRIPT URL
// ==========================================
let mediaStream = null;
let useFrontCamera = true;

// ⚠️ Pastikan URL Web App Google Apps Script kamu dipasang di sini
const GOOGLE_DRIVE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwEylglQKf2t8tu1l-JBy16TY7PQbkRx-2MI4KMKJSBOonkiXrHX75bPM6NXxh11TrQ/exec";

async function startCamera() {
  const video = document.getElementById('booth-video');
  const resultImg = document.getElementById('booth-result');
  const watermark = document.querySelector('.booth-watermark');
  
  const btnStart = document.getElementById('btn-start-cam');
  const btnSwitch = document.getElementById('btn-switch-cam');
  const btnCapture = document.getElementById('btn-capture');
  const btnRetake = document.getElementById('btn-retake');
  const btnDownload = document.getElementById('btn-download-photo');

  try {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
      video: { 
        facingMode: useFrontCamera ? 'user' : 'environment'
      },
      audio: false
    };

    mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = mediaStream;
    
    video.style.display = 'block';
    if (watermark) watermark.style.display = 'block';
    if (resultImg) resultImg.style.display = 'none';

    if (btnStart) btnStart.style.display = 'none';
    if (btnSwitch) btnSwitch.style.display = 'flex';
    if (btnCapture) btnCapture.style.display = 'flex';
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
  const watermark = document.querySelector('.booth-watermark');
  
  const btnSwitch = document.getElementById('btn-switch-cam');
  const btnCapture = document.getElementById('btn-capture');
  const btnRetake = document.getElementById('btn-retake');
  const downloadBtn = document.getElementById('btn-download-photo');

  if (!video.srcObject) return;

  canvas.width = 1000;
  canvas.height = 1000; 
  const ctx = canvas.getContext('2d');

  const vWidth = video.videoWidth;
  const vHeight = video.videoHeight;
  let sWidth, sHeight, sX, sY;

  if (vWidth > vHeight) {
    sHeight = vHeight;
    sWidth = vHeight;
    sX = (vWidth - sWidth) / 2;
    sY = 0;
  } else {
    sWidth = vWidth;
    sHeight = vWidth;
    sX = 0;
    sY = (vHeight - sHeight) / 2;
  }

  // 1. GAMBAR VIDEO KAMERA DENGAN EFEK MIRROR
  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, sX, sY, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  // 2. TIMPA DENGAN BINGKAI PNG TRANSPARAN
  const templateImg = new Image();
  templateImg.src = 'Galery/booth.png'; // Menyesuaikan dengan format .png baru kamu
  
  templateImg.onload = function() {
    ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL('image/png');
    resultImg.src = dataURL;
    downloadBtn.href = dataURL;

    uploadPhotoToGoogleDrive(dataURL);
  };

  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
  }

  video.style.display = 'none';
  if (watermark) watermark.style.display = 'none'; 
  resultImg.style.display = 'block';

  if (btnSwitch) btnSwitch.style.display = 'none';
  if (btnCapture) btnCapture.style.display = 'none';
  if (btnRetake) btnRetake.style.display = 'inline-flex';
  if (downloadBtn) downloadBtn.style.display = 'inline-flex';
}

function uploadPhotoToGoogleDrive(base64Image) {
  if (!GOOGLE_DRIVE_WEB_APP_URL || GOOGLE_DRIVE_WEB_APP_URL.includes("URL_WEB_APP")) return;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `Photobooth-UusGita-${timestamp}.png`;

  const photoData = {
    file: base64Image,
    filename: fileName
  };

  fetch(GOOGLE_DRIVE_WEB_APP_URL, {
    method: 'POST',
    body: JSON.stringify(photoData),
    headers: { 'Content-Type': 'application/json' }
  }).catch(error => console.error("Error Upload Foto:", error));
}

function retakePhoto() {
  startCamera();
}

// ==========================================
// 5. RSVP & E-ID CARD (TERINTEGRASI GOOGLE APPS SCRIPT)
// ==========================================
function handleRSVP(event) {
  event.preventDefault();
  
  const nameInput = document.getElementById('rsvp-name');
  const attendanceInput = document.getElementById('rsvp-attendance');
  const guestsInput = document.getElementById('rsvp-guests');
  const messageInput = document.getElementById('rsvp-message');

  const name = nameInput ? nameInput.value : "";
  const attendance = attendanceInput ? attendanceInput.value : "";
  const guests = guestsInput ? guestsInput.value : "1 Orang";
  const message = messageInput ? messageInput.value : "";

  const rsvpData = {
    name: name,
    attendance: attendance,
    guests: guests,
    message: message
  };

  if (GOOGLE_DRIVE_WEB_APP_URL && !GOOGLE_DRIVE_WEB_APP_URL.includes("URL_WEB_APP")) {
    fetch(GOOGLE_DRIVE_WEB_APP_URL, {
      method: 'POST',
      body: JSON.stringify(rsvpData),
      headers: { 'Content-Type': 'application/json' }
    }).catch(error => console.error("Error RSVP:", error));
  }

  const nameEl = document.getElementById('card-guest-name');
  const countEl = document.getElementById('card-guest-count');
  const statusEl = document.getElementById('card-attendance-status');
  const msgEl = document.getElementById('card-guest-message');

  if (nameEl) nameEl.innerText = name;
  if (countEl) countEl.innerText = guests;
  if (statusEl) statusEl.innerText = attendance;
  if (msgEl) msgEl.innerText = `"${message || '-'}"`;

  const modalEl = document.getElementById('idcard-modal');
  if (modalEl) modalEl.classList.add('active');
  
  const formEl = document.getElementById('rsvp-form');
  if (formEl) formEl.reset();
}

function closeModal() {
  const modalEl = document.getElementById('idcard-modal');
  if (modalEl) modalEl.classList.remove('active');
}

// ==========================================
// 6. INISIALISASI URL & NAVIGASI BAWAH
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('to');
  if (guestName && document.getElementById('guest-name')) {
    document.getElementById('guest-name').innerText = decodeURIComponent(guestName);
  }

  const navLinks = document.querySelectorAll('.bottom-nav .nav-item');
  const scrollContainer = document.querySelector('.scroll-container');
  const homeIcon = document.querySelector('.bottom-nav .nav-item[href="#slide-1"]');

  if (homeIcon) {
    homeIcon.addEventListener('click', function(e) {
      e.preventDefault();
      const cover = document.getElementById('slide-1');
      if (cover) {
        cover.style.display = 'flex';
        cover.classList.remove('cover-zoom-out');
      }
      document.body.classList.add('no-scroll');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'instant' });
      }
    });
  }

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
// 7. INTERSECTION OBSERVER UNTUK ANIMASI KIRI & KANAN
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
  const leftElements = document.querySelectorAll('.slide-title, .calendar-card, .rsvp-form, .thanks-opening, .polaroid-wrapper .polaroid:nth-child(1)');
  const rightElements = document.querySelectorAll('.verse-text, .live-calendar-card, .thanks-couples, .polaroid-wrapper .polaroid:nth-child(2)');

  const profileCards = document.querySelectorAll('.profile-card');
  if (profileCards.length >= 2) {
    profileCards[0].classList.add('animate-left');
    profileCards[1].classList.add('animate-right');
  }

  const atmCards = document.querySelectorAll('.atm-card');
  if (atmCards.length >= 2) {
    atmCards[0].classList.add('animate-left');
    atmCards[1].classList.add('animate-right');
  }

  const galleryItems = document.querySelectorAll('.gallery-grid .grid-item');
  galleryItems.forEach((item, index) => {
    if (index === 0) {
      item.classList.add('animate-left');
    } else if (index % 2 !== 0) {
      item.classList.add('animate-left');
    } else {
      item.classList.add('animate-right');
    }
  });

  leftElements.forEach(el => el.classList.add('animate-left'));
  rightElements.forEach(el => el.classList.add('animate-right'));

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      } else {
        entry.target.classList.remove('active');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-left, .animate-right').forEach(el => {
    observer.observe(el);
  });
});

// ==========================================
// 8. FITUR TAMBAH KE KALENDER (GOOGLE CALENDAR)
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
