// تنظیمات API گوگل
const API_KEY = 'AIzaSyB7VbFf-pzf3z80cZul-80vmoJkfPD5kAw';
const CX = '07b5a593d7b37455f';

// متغیرهای وضعیت
let currentPage = 1;
let currentQuery = '';
let currentTab = 'all';

// انتخاب المان‌های HTML
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const resultsContainer = document.getElementById('results');
const statusDiv = document.getElementById('status');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const skeletonLoader = document.getElementById('skeletonLoader');
const typingText = document.getElementById('typingText');
const cursorGlow = document.getElementById('cursorGlow');
const tabBtns = document.querySelectorAll('.tab-btn');

// متن‌های چرخشی برای افکت تایپ
const typingMessages = [
    'جستجوی هوشمند در اینترنت...',
    'یافتن بهترین نتایج...',
    'جستجو در میلیاردها صفحه...',
    'سریع، دقیق، هوشمند...'
];

// ایجاد ذرات متحرک در پس‌زمینه
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 20 + 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// افکت تایپ خودکار
function startTypingEffect() {
    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentMessage = typingMessages[messageIndex];
        
        if (isDeleting) {
            typingText.textContent = currentMessage.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingText.textContent = currentMessage.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentMessage.length) {
            typeSpeed = 2000; // مکث بعد از تکمیل تایپ
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            messageIndex = (messageIndex + 1) % typingMessages.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    type();
}

// افکت نور موس
function initCursorGlow() {
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });

    document.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        cursorGlow.style.opacity = '1';
    });
}

// مدیریت تب‌ها
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.dataset.tab;
        
        // انیمیشن تغییر تب
        resultsContainer.style.opacity = '0';
        setTimeout(() => {
            resultsContainer.style.opacity = '1';
        }, 300);
    });
});

// رویداد کلیک روی دکمه جستجو
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        currentQuery = query;
        currentPage = 1;
        performSearch();
    }
});

// رویداد Enter
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            currentQuery = query;
            currentPage = 1;
            performSearch();
        }
    }
});

// نمایش/مخفی کردن دکمه پاک کردن
searchInput.addEventListener('input', () => {
    if (searchInput.value.trim().length > 0) {
        clearBtn.classList.add('show');
    } else {
        clearBtn.classList.remove('show');
    }
});

// پاک کردن اینپوت
clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.classList.remove('show');
    searchInput.focus();
});

// صفحه‌بندی
prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        performSearch();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

nextBtn.addEventListener('click', () => {
    currentPage++;
    performSearch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// تابع اصلی جستجو
async function performSearch() {
    // نمایش اسکلتون لودینگ
    skeletonLoader.classList.add('show');
    resultsContainer.innerHTML = '';
    statusDiv.innerHTML = '';
    prevBtn.disabled = true;
    nextBtn.disabled = true;

    const startIndex = (currentPage - 1) * 10 + 1;

    try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(currentQuery)}&start=${startIndex}`;
        
        const response = await fetch(url);
        const data = await response.json();

        // مخفی کردن اسکلتون
        skeletonLoader.classList.remove('show');

        if (data.error) {
            throw new Error(data.error.message);
        }

        if (!data.items || data.items.length === 0) {
            statusDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> نتیجه‌ای یافت نشد. لطفاً عبارت دیگری را امتحان کنید.';
            statusDiv.style.background = 'rgba(255, 0, 110, 0.1)';
            statusDiv.style.borderColor = 'rgba(255, 0, 110, 0.3)';
            return;
        }

        // نمایش آمار
        statusDiv.innerHTML = `
            <i class="fas fa-check-circle"></i> 
            حدود ${data.searchInformation.formattedTotalResults} نتیجه 
            <span style="color: var(--primary)">(${data.searchInformation.formattedSearchTime} ثانیه)</span>
        `;
        statusDiv.style.background = 'rgba(0, 212, 255, 0.1)';
        statusDiv.style.borderColor = 'rgba(0, 212, 255, 0.3)';

        // نمایش نتایج با انیمیشن تاخیری
        data.items.forEach((item, index) => {
            setTimeout(() => {
                const resultDiv = document.createElement('div');
                resultDiv.className = 'result-item';
                resultDiv.style.animationDelay = `${index * 0.1}s`;
                
                resultDiv.innerHTML = `
                    <a href="${item.link}" target="_blank" class="result-title">
                        <i class="fas fa-external-link-alt" style="font-size: 0.7em; margin-left: 5px;"></i>
                        ${item.title}
                    </a>
                    <span class="result-link">
                        <i class="fas fa-link"></i> ${item.displayLink}
                    </span>
                    <p class="result-snippet">${item.snippet}</p>
                `;
                
                resultsContainer.appendChild(resultDiv);
            }, index * 100);
        });

        // به‌روزرسانی صفحه‌بندی
        pageInfo.textContent = `صفحه ${currentPage}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = data.items.length < 10;

    } catch (error) {
        skeletonLoader.classList.remove('show');
        console.error('Error:', error);
        statusDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i> 
            خطا در دریافت نتایج:<br>
            <small>${error.message}</small><br>
            <small style="color: var(--primary)">
                • بررسی کنید API Key محدود نشده باشد<br>
                • سهمیه روزانه (۱۰۰ جستجو) تمام نشده باشد
            </small>
        `;
        statusDiv.style.background = 'rgba(255, 0, 110, 0.2)';
        statusDiv.style.borderColor = 'rgba(255, 0, 110, 0.5)';
    }
}

// مقداردهی اولیه
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    startTypingEffect();
    initCursorGlow();
    searchInput.focus();
});

// افکت صوتی (اختیاری - فقط برای دسکتاپ)
function playClickSound() {
    // می‌توانید اینجا یک صدای کوتاه اضافه کنید
    // const audio = new Audio('click.mp3');
    // audio.volume = 0.3;
    // audio.play().catch(() => {});
}

searchBtn.addEventListener('click', playClickSound);