// នៅក្នុងឯកសារ sw.js
const CACHE_NAME = 'employee-mgmt-v1.3';
const ASSETS_TO_CACHE = [
  // ត្រូវប្រាកដថាទាំងនេះគឺជាឯកសាររបស់អ្នកនៅក្នុង Folder 'js/' និង 'css/'
  './',
  './index.html',
  './manifest.json',
  './css/style.css', // ត្រូវតែមាន Folder 'css' និង File 'style.css'
  './js/app.js',     // ត្រូវតែមាន Folder 'js'
  './js/license.js',
  './js/database.js',
  './js/install.js',
  // ... រួមបញ្ចូល Icons ទាំងអស់ដែលអ្នកបានកំណត់ក្នុង manifest.json ផង!
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  // ...
  // CDNs គឺត្រឹមត្រូវហើយ
  'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
  // ...
];
// ...
