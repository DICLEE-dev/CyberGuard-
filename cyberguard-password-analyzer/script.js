const passwordInput = document.getElementById("passwordInput");
const toggleVisibility = document.getElementById("toggleVisibility");
const copyBtn = document.getElementById("copyBtn");
const generateBtn = document.getElementById("generateBtn");

const strengthBar = document.getElementById("strengthBar");
const strengthLabel = document.getElementById("strengthLabel");
const entropyLabel = document.getElementById("entropyLabel");

const timeCpu = document.getElementById("timeCpu");
const timeGpu = document.getElementById("timeGpu");
const timeSuper = document.getElementById("timeSuper");

const metricLength = document.getElementById("metricLength");
const metricPool = document.getElementById("metricPool");
const metricCombinations = document.getElementById("metricCombinations");

const badgeLower = document.getElementById("badgeLower");
const badgeUpper = document.getElementById("badgeUpper");
const badgeDigit = document.getElementById("badgeDigit");
const badgeSymbol = document.getElementById("badgeSymbol");
const weaknessList = document.getElementById("weaknessList");

// Yaygın sızdırılmış şifreler (Türkçe & Global)
const COMMON_PASSWORDS = new Set([
  "123456", "123456789", "qwerty", "password", "12345678", "111111",
  "123123", "1234567890", "asdfgh", "galatasaray", "fenerbahce", "besiktas",
  "trabzonspor", "turkiye", "istanbul", "ankara", "izmir", "sifre", "sifre123",
  "admin", "root", "iloveyou", "merhaba", "14531453", "19031903", "19051905", "19071907"
]);

// Kırılma süresini okunabilir Türkçe metne çevirir
function formatDuration(seconds) {
  if (seconds < 0.001) return "Anında (< 1 milisaniye)";
  if (seconds < 1) return `${Math.round(seconds * 1000)} milisaniye`;
  if (seconds < 60) return `${seconds.toFixed(1)} saniye`;

  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.round(minutes)} dakika`;

  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours)} saat`;

  const days = hours / 24;
  if (days < 365) return `${Math.round(days)} gün`;

  const years = days / 365.25;
  if (years < 100) return `${Math.round(years)} yıl`;
  if (years < 1_000_000) return `${Math.round(years / 100)} yüzyıl`;
  if (years < 1_000_000_000) return `${(years / 1_000_000).toFixed(1)} milyon yıl`;
  if (years < 1_000_000_000_000) return `${(years / 1_000_000_000).toFixed(1)} milyar yıl`;

  return "Evrenin yaşından uzun (∞)";
}

// Zayıf noktaları tespit eder ve entropi cezası hesaplar
function detectWeaknesses(pwd) {
  const issues = [];
  let penaltyBits = 0;
  const lower = pwd.toLowerCase();

  if (COMMON_PASSWORDS.has(lower)) {
    issues.push("Sızdırılmış en yaygın şifreler listesinde yer alıyor (sözlük saldırısıyla anında kırılır).");
    penaltyBits += 40;
  }

  if (pwd.length < 8) {
    issues.push("Şifre 8 karakterden kısa. En az 12 karakter önerilir.");
    penaltyBits += 15;
  }

  if (/(.)\1{2,}/.test(pwd)) {
    issues.push("Arka arkaya tekrarlayan karakterler içeriyor (örn: 'aaa', '111').");
    penaltyBits += 12;
  }

  if (/(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|xyz)/i.test(pwd)) {
    issues.push("Ardışık sayı veya harf dizisi içeriyor (örn: '123', 'abc').");
    penaltyBits += 12;
  }

  if (/(qwerty|asdf|zxcv|qwertz|azerty)/i.test(pwd)) {
    issues.push("Klavye sırası deseni tespit edildi (örn: 'qwerty', 'asdf').");
    penaltyBits += 15;
  }

  if (/(19\d\d|20[0-2]\d)/.test(pwd)) {
    issues.push("Doğum yılı veya güncel yıl ifadesi içeriyor.");
    penaltyBits += 10;
  }

  return { issues, penaltyBits };
}

function analyzePassword(pwd) {
  if (!pwd) {
    strengthBar.style.width = "0%";
    strengthLabel.textContent = "Şifre bekleniyor...";
    entropyLabel.textContent = "0 bit entropi";
    timeCpu.textContent = "-";
    timeGpu.textContent = "-";
    timeSuper.textContent = "-";
    metricLength.textContent = "0 karakter";
    metricPool.textContent = "0 karakter";
    metricCombinations.textContent = "0";
    [badgeLower, badgeUpper, badgeDigit, badgeSymbol].forEach(b => b.classList.remove("active"));
    weaknessList.innerHTML = `<li class="neutral">Analiz için şifre girmeye başlayın.</li>`;
    return;
  }

  const hasLower = /[a-zçğıöşü]/.test(pwd);
  const hasUpper = /[A-ZÇĞİÖŞÜ]/.test(pwd);
  const hasDigit = /[0-9]/.test(pwd);
  const hasSymbol = /[^a-zA-ZçğıöşüÇĞİÖŞÜ0-9]/.test(pwd);

  badgeLower.classList.toggle("active", hasLower);
  badgeUpper.classList.toggle("active", hasUpper);
  badgeDigit.classList.toggle("active", hasDigit);
  badgeSymbol.classList.toggle("active", hasSymbol);

  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigit) poolSize += 10;
  if (hasSymbol) poolSize += 32;

  // Ham entropi = L * log2(N)
  const rawEntropy = pwd.length * Math.log2(poolSize || 1);
  const { issues, penaltyBits } = detectWeaknesses(pwd);
  const effectiveEntropy = Math.max(4, rawEntropy - penaltyBits);

  // Ortalama kırılma süresi için kombinasyonların yarısı (2^(H-1)) hesaplanır
  const averageGuesses = Math.pow(2, effectiveEntropy - 1);
  const totalCombinations = Math.pow(poolSize, pwd.length);

  // Hızlar (tahmin / saniye)
  const cpuSpeed = 1e7;    // 10 Milyon/sn
  const gpuSpeed = 1e11;   // 100 Milyar/sn (8x RTX 4090)
  const superSpeed = 1e13; // 10 Trilyon/sn

  timeCpu.textContent = formatDuration(averageGuesses / cpuSpeed);
  timeGpu.textContent = formatDuration(averageGuesses / gpuSpeed);
  timeSuper.textContent = formatDuration(averageGuesses / superSpeed);

  metricLength.textContent = `${pwd.length} karakter`;
  metricPool.textContent = `${poolSize} karakter`;
  metricCombinations.textContent = totalCombinations > 1e15
    ? totalCombinations.toExponential(2)
    : Math.round(totalCombinations).toLocaleString("tr-TR");

  entropyLabel.textContent = `${Math.round(effectiveEntropy)} bit entropi`;

  // Güç çubuğu ve seviye etiketi
  let scorePercent = Math.min(100, (effectiveEntropy / 100) * 100);
  strengthBar.style.width = `${scorePercent}%`;

  if (effectiveEntropy < 35) {
    strengthBar.style.backgroundColor = "#ef4444";
    strengthLabel.textContent = "Çok Zayıf";
  } else if (effectiveEntropy < 55) {
    strengthBar.style.backgroundColor = "#f59e0b";
    strengthLabel.textContent = "Zayıf / Orta";
  } else if (effectiveEntropy < 80) {
    strengthBar.style.backgroundColor = "#38bdf8";
    strengthLabel.textContent = "Güçlü";
  } else {
    strengthBar.style.backgroundColor = "#10b981";
    strengthLabel.textContent = "Kırılamaz Seviye";
  }

  // Zayıf noktaları listele
  if (issues.length === 0) {
    weaknessList.innerHTML = `<li class="safe">Harika! Bilinen bir desen veya zayıf nokta tespit edilmedi.</li>`;
  } else {
    weaknessList.innerHTML = issues.map(item => `<li>${item}</li>`).join("");
  }
}

// Web Crypto API ile kriptografik olarak güvenli şifre üretici
function generateSecurePassword(length = 16) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);

  let generated = "";
  for (let i = 0; i < length; i++) {
    generated += charset[randomValues[i] % charset.length];
  }
  return generated;
}

passwordInput.addEventListener("input", (e) => analyzePassword(e.target.value));

toggleVisibility.addEventListener("click", () => {
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
});

copyBtn.addEventListener("click", () => {
  if (!passwordInput.value) return;
  navigator.clipboard.writeText(passwordInput.value);
  copyBtn.textContent = "✅";
  setTimeout(() => (copyBtn.textContent = "📋"), 1500);
});

generateBtn.addEventListener("click", () => {
  const newPwd = generateSecurePassword(16);
  passwordInput.value = newPwd;
  passwordInput.type = "text";
  analyzePassword(newPwd);
});