// All 35 images from your images/ folder with categories and descriptions
const photoData = [
  // Row 1
  { file: '4073', category: 'nature', title: 'Mountain Lake Reflection' },
  { file: '5699', category: 'wildlife', title: 'Lion Portrait' },
  { file: '6092', category: 'nature', title: 'Coastal Bay View' },
  { file: '9113', category: 'vehicles', title: 'Green Sportbike' },
  { file: '9858', category: 'nature', title: 'Sunset Meadow' },
  { file: '12453', category: 'space', title: 'Earth Horizon from Orbit' },
  { file: '12523', category: 'space', title: 'Orbital Sunrise' },
  { file: '12873', category: 'vehicles', title: 'Red Supercar with Scissor Doors' },
  { file: '13238', category: 'wildlife', title: 'White Puppy' },
  { file: '19771', category: 'wildlife', title: 'Puppy on Red Backdrop' },
  { file: '19920', category: 'nature', title: 'Geothermal Hot Spring' },

  // Row 2
  { file: '20083', category: 'wildlife', title: 'Lion in Golden Sunset' },
  { file: '21854', category: 'nature', title: 'Turquoise Thermal Pool' },
  { file: '24057', category: 'wildlife', title: 'Snow Leopard' },
  { file: '25240', category: 'wildlife', title: 'Penguin at Sunset' },
  { file: '26089', category: 'vehicles', title: 'Red Racing Motorcycle' },
  { file: '26347', category: 'space', title: 'Planet Mars' },
  { file: '26348', category: 'space', title: 'Planet Jupiter' },
  { file: '26350', category: 'space', title: 'Planet Saturn' },
  { file: '26876', category: 'vehicles', title: 'Motorcycle by the Water' },
  { file: '27328', category: 'space', title: 'Earthrise over Lunar Surface' },
  { file: '27329', category: 'space', title: 'Crescent Earth from Moon' },

  // Row 3
  { file: '27333', category: 'space', title: 'Total Solar Eclipse' },
  { file: '27374', category: 'nature', title: 'Dramatic Mountain Coastline' },
  { file: '27639', category: 'space', title: 'Eclipse over Planetary Horizon' },
  { file: '27675', category: 'vehicles', title: 'Red Naked Streetfighter Bike' },
  { file: '27678', category: 'vehicles', title: 'Off-Road Trophy Truck' },
  { file: '27699', category: 'vehicles', title: 'Blue Sport Motorcycle' },
  { file: '27704', category: 'vehicles', title: 'Silver Hypercar' },
  { file: '27746', category: 'vehicles', title: 'Custom Cruiser Motorcycle' },
  { file: '27760', category: 'vehicles', title: 'Dark Luxury Coupe' },
  { file: '27766', category: 'vehicles', title: 'Yellow Supercar' },

  // Row 4
  { file: '27776', category: 'vehicles', title: 'Red Sports Car on Bridge' },
  { file: 'maelifell-volcano-5120x3513-16484', category: 'nature', title: 'Maelifell Volcano, Iceland' }
];

const galleryGrid = document.getElementById('gallery-grid');
const filterButtons = document.querySelectorAll('.filter-btn');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const closeBtn = document.getElementById('close-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

let currentIndex = 0;

// Helper: tries .jpg first, then falls back to .png, .jpeg, or .webp automatically
function setImageSourceWithFallback(imgElement, fileName) {
  const extensions = ['jpg', 'png', 'jpeg', 'webp'];
  let extIndex = 0;

  imgElement.src = `images/${fileName}.${extensions[extIndex]}`;

  imgElement.onerror = function () {
    extIndex++;
    if (extIndex < extensions.length) {
      imgElement.src = `images/${fileName}.${extensions[extIndex]}`;
    } else {
      imgElement.onerror = null; // Stop retrying if none match
    }
  };
}

// Build the gallery cards dynamically
photoData.forEach((photo) => {
  const item = document.createElement('div');
  item.className = 'gallery-item';
  item.setAttribute('data-category', photo.category);

  const img = document.createElement('img');
  img.alt = photo.title;
  img.loading = 'lazy';
  setImageSourceWithFallback(img, photo.file);

  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `<span>${photo.category}</span>`;

  item.appendChild(img);
  item.appendChild(overlay);
  galleryGrid.appendChild(item);

  // Open Lightbox on click
  item.addEventListener('click', () => {
    const visibleImages = getVisibleImages();
    currentIndex = visibleImages.indexOf(img);
    updateLightboxImage(visibleImages);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  });
});

// Returns only currently visible images based on active filter
function getVisibleImages() {
  return Array.from(document.querySelectorAll('.gallery-item'))
    .filter(item => !item.classList.contains('hide'))
    .map(item => item.querySelector('img'));
}

// Category Filtering
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const filterValue = button.getAttribute('data-filter');

    document.querySelectorAll('.gallery-item').forEach(item => {
      const category = item.getAttribute('data-category');
      if (filterValue === 'all' || category === filterValue) {
        item.classList.remove('hide');
      } else {
        item.classList.add('hide');
      }
    });
  });
});

// Lightbox Controls
function updateLightboxImage(images) {
  const targetImg = images[currentIndex];
  lightboxImg.src = targetImg.src;
  lightboxImg.alt = targetImg.alt;
  lightboxCaption.textContent = `${targetImg.alt} (${currentIndex + 1} of ${images.length})`;
}

function showNext() {
  const visibleImages = getVisibleImages();
  currentIndex = (currentIndex + 1) % visibleImages.length;
  updateLightboxImage(visibleImages);
}

function showPrev() {
  const visibleImages = getVisibleImages();
  currentIndex = (currentIndex - 1 + visibleImages.length) % visibleImages.length;
  updateLightboxImage(visibleImages);
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
}

nextBtn.addEventListener('click', showNext);
prevBtn.addEventListener('click', showPrev);
closeBtn.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'ArrowRight') showNext();
  if (e.key === 'ArrowLeft') showPrev();
  if (e.key === 'Escape') closeLightbox();
});