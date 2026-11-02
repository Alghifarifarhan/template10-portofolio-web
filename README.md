# 🌟 Template 10 Luther Portfolio - Modern Full-Stack Dynamic CMS

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-v12.18.0-ffca28?style=flat&logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/Design_License-StyleShout-orange)](https://www.styleshout.com/)

Website portofolio profesional dan modern yang dilengkapi dengan **Content Management System (CMS)** dinamis berbasis **Firebase**. Memungkinkan pemilik portofolio untuk mengelola seluruh teks, profil, foto, keahlian, riwayat karir/pendidikan, karya proyek, hingga tema tampilan secara langsung melalui antarmuka web admin (`/admin`) tanpa perlu menyentuh atau mengubah kode sumber.

---

## 📌 Keterangan Modifikasi & Lisensi Asli (Attribution & License)

> [!IMPORTANT]
> **PEMBERITAHUAN HAK CIPTA & LISENSI MODIFIKASI:**
> Proyek ini merupakan **karya modifikasi dan pengembangan ulang (re-engineered & modified full-stack project)** dari desain template asli bernama **"Luther"**.
>
> - **Desain & Template Asli**: Dirancang oleh [StyleShout](https://www.styleshout.com/) dan didistribusikan secara resmi oleh [ThemeWagon](https://themewagon.com/).
> - **Lisensi Desain Asli**: Mengikuti lisensi resmi StyleShout (dapat dilihat pada file [`readme.txt`](./readme.txt)) yang mengizinkan penggunaan pribadi maupun komersial dengan syarat **wajib menyertakan atribusi kredit asli**.
> - **Kredit Footer Permanen**: Hak cipta asli tetap dipertahankan dan dicantumkan pada bagian footer website:
>   > *© Copyright Luther 2021 Design by [StyleShout](https://www.styleshout.com/) Distribution By [ThemeWagon](https://themewagon.com/)*

### 🛠️ Apa Saja yang Dimodifikasi?
Template aslinya merupakan template HTML5 statis berbasis CSS murni dan jQuery lama. Dalam repositori ini, proyek telah dirombak total menjadi aplikasi web modern:
1. **Arsitektur Modern**: Ditulis ulang sepenuhnya menggunakan **Next.js 15 (App Router)**, **React 19**, **TypeScript**, dan **Tailwind CSS v4**.
2. **Dynamic CMS Backend**: Diintegrasikan dengan **Google Cloud Firestore** sebagai database penyimpanan data portofolio secara dinamis dan real-time.
3. **Panel Admin & Autentikasi**: Dilengkapi dasbor admin interaktif (`/admin`) dengan otentikasi aman melalui **Firebase Authentication**.
4. **Google Drive Integration**: Mendukung penggunaan link publik Google Drive untuk foto profil, gambar portofolio, dan file CV (dikonversi otomatis menjadi direct preview/download link).
5. **Real-time Analytics**: Pelacak statistik bawaan untuk menghitung jumlah kunjungan (pageviews), pengunjung unik (unique visitors), klik proyek, dan unduhan CV.
6. **Tema Dinamis**: Dukungan mode gelap (*Dark Mode*), mode terang (*Light Mode*), serta kustomisasi warna aksen (*Accent Color*) langsung dari CMS.
7. **Dual-Layer Caching**: Optimasi performa instan dengan cache `localStorage` di sisi klien + *real-time listener* Firestore.

---

## 🚀 Framework & Teknologi yang Digunakan

Proyek ini dibangun menggunakan teknologi mutakhir:

### 1. Frontend & Core Framework
- **[Next.js 15.3.3](https://nextjs.org/)**: React Framework untuk *production* dengan fitur App Router, Server Components/Client Components, dan Static HTML Export (`output: "export"`).
- **[React 19.0.0](https://react.dev/)**: Library utama untuk antarmuka pengguna berbasis komponen reaktif.
- **[TypeScript 5.7](https://www.typescriptlang.org/)**: Bahasa pemrograman dengan sistem pengetikan ketat (*strict typing*) untuk menjamin kestabilan dan meminimalisir bug.
- **[Tailwind CSS v4](https://tailwindcss.com/)**: Framework utility-first CSS generasi terbaru yang dioptimasi dengan `@tailwindcss/postcss`.
- **[Lucide React](https://lucide.dev/)**: Koleksi icon SVG modern dan konsisten.
- **Next Font Google**: Optimasi pemuatan font lokal (`DM Serif Display` dan `Public Sans`).

### 2. Backend & Cloud Infrastructure (BaaS)
- **[Firebase SDK v12.18.0](https://firebase.google.com/)**:
  - **Firebase Authentication**: Manajemen otentikasi login, registrasi akun admin, dan pergantian password.
  - **Cloud Firestore**: Database NoSQL berbasis cloud untuk menyimpan data profil, karya, dan statistik kunjungan.
  - **Firestore Security Rules**: Aturan keamanan database (data portofolio dapat dibaca publik, namun hanya admin terverifikasi yang dapat mengubah data).
  - **Firebase Hosting**: Konfigurasi siap pakai untuk hosting statis berperforma tinggi dengan CDN global.

---

## ✨ Fitur-Fitur Utama

- 🎨 **Desain Elegan & Responsif**: Tampilan mewah ala majalah modern, responsif di layar ponsel, tablet, maupun desktop.
- 💫 **Signature Ambient Animation**: Efek latar belakang bercahaya dinamis yang bergerak halus (*ambient glowing circles*).
- 🔐 **Admin Dashboard CMS (`/admin`)**:
  - Pengaturan teks navigasi dan nama brand.
  - Pengaturan salam pembuka dan headline hero section.
  - Manajemen tautan 7 sosial media (LinkedIn, GitHub, Instagram, Twitter/X, Dribbble, Behance, Pinterest).
  - Pengaturan bio, foto profil, dan tombol download resume/CV.
  - Tambah, edit, dan hapus keahlian (skills list).
  - Riwayat karir dan pendidikan (timeline experience & education).
  - Manajemen proyek portofolio (gambar thumbnail, modal galeri, deskripsi, tags, dan link live demo).
  - Pengaturan kontak langsung (email, nomor WhatsApp/telepon, alamat).
  - Ganti password admin & toggle tema (Dark/Light) serta warna aksen.
- 📊 **Live Analytics Counter**: Monitor statistik total kunjungan dan interaksi langsung di halaman admin.
- ⚡ **Super Cepat & SEO Friendly**: Menggunakan static export dan metadata standar OpenGraph & Twitter Cards.

---

## 📁 Struktur Direktori Proyek

```text
├── app/                  # Direktori Next.js App Router
│   ├── admin/            # Halaman Admin CMS (/admin) & Login Auth
│   ├── globals.css       # Tailwind CSS v4 & styling global
│   ├── layout.tsx        # Root Layout & konfigurasi Metadata/SEO
│   └── page.tsx          # Halaman Utama Portofolio (Landing Page)
├── components/           # Komponen React yang dapat digunakan kembali
│   ├── About.tsx         # Bagian tentang saya & download CV
│   ├── AmbientBackground.tsx # Efek animasi ambient light
│   ├── Contact.tsx       # Formulir & informasi kontak
│   ├── Expertise.tsx     # Daftar keahlian & skill badges
│   ├── Footer.tsx        # Footer dengan lisensi tetap StyleShout
│   ├── Hero.tsx          # Bagian pembuka / headline utama
│   ├── Navbar.tsx        # Navigasi sticky responsif
│   ├── Portfolio.tsx     # Grid proyek portofolio
│   ├── ProjectModal.tsx  # Pop-up detail dan galeri proyek
│   ├── Providers.tsx     # Context wrapper (Auth, Portfolio Context)
│   ├── ScrollReveal.tsx  # Animasi interaksi scroll
│   └── Timeline.tsx      # Riwayat pengalaman kerja & pendidikan
├── context/              # React Context Providers
│   ├── AuthContext.tsx   # State otentikasi admin
│   └── PortfolioContext.tsx # State sinkronisasi data portofolio
├── data/                 # Data bawaan & fallback
│   └── portfolio-data.ts # Struktur data & lisensi footer
├── lib/                  # Library & utilitas konfigurasi
│   ├── firebase.ts       # Inisialisasi Firebase App, Auth, Firestore
│   └── gdrive.ts         # Konverter URL sharing Google Drive
├── services/             # Logika interaksi database Firestore
│   ├── analyticsService.ts # Service pelacak statistik kunjungan
│   └── portfolioService.ts # Service baca/tulis konten portofolio
├── public/               # Asset statis (gambar, icon, manifest)
├── firestore.rules       # Aturan keamanan database Cloud Firestore
├── firebase.json         # Konfigurasi deploy Firebase Hosting & Firestore
├── .firebaserc           # Konfigurasi ID proyek Firebase
├── .env.example          # Template konfigurasi environment variables
├── package.json          # Manajemen dependensi dan skrip npm
├── README.md             # Dokumentasi utama proyek
├── README2.md            # Panduan lengkap pengelolaan CMS untuk user awam
└── readme.txt            # Dokumentasi & lisensi asli template StyleShout
```

---

## 🛠️ Panduan Instalasi & Menjalankan Proyek

### 1. Prasyarat Sistem
Pastikan perangkat Anda telah terpasang:
- **Node.js**: Versi `18.18.0` atau `20.x` ke atas ([Unduh Node.js](https://nodejs.org/))
- **Git**: Untuk mengelola repositori ([Unduh Git](https://git-scm.com/))
- **Akun Google Firebase**: Untuk database & otentikasi ([Firebase Console](https://console.firebase.google.com/))

---

### 2. Kloning Repositori
Buka terminal dan jalankan perintah:

```bash
git clone https://github.com/<USERNAME-ANDA>/<NAMA-REPO-ANDA>.git
cd <NAMA-REPO-ANDA>
```

---

### 3. Instalasi Dependensi
Jalankan salah satu package manager berikut:

```bash
npm install
# atau
yarn install
# atau
pnpm install
```

---

### 4. Konfigurasi Firebase SDK

Proyek ini membutuhkan layanan **Firebase Authentication** dan **Cloud Firestore**.

#### A. Buat Proyek di Firebase Console
1. Kunjungi [Firebase Console](https://console.firebase.google.com/) dan buat proyek baru.
2. Pada menu **Build > Authentication**:
   - Klik **Get Started**.
   - Pilih tab **Sign-in method** dan aktifkan **Email/Password**.
3. Pada menu **Build > Firestore Database**:
   - Klik **Create Database**.
   - Pilih lokasi database terdekat (misal: `asia-southeast1` untuk Singapura / Indonesia).
   - Mulai dalam mode *Production* atau *Test mode*.
   - Masuk ke tab **Rules**, lalu salin isi file [`firestore.rules`](./firestore.rules) dan klik **Publish**.
4. Daftarkan Web App:
   - Di halaman Project Overview, klik ikon Web (`</>`).
   - Beri nama aplikasi web Anda.
   - Salin objek konfigurasi `firebaseConfig` yang diberikan.

#### B. Setup Environment Variables
Salin file `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

Buka `.env.local` dan masukkan kunci Firebase SDK Anda:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nama-project-anda.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nama-project-anda
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nama-project-anda.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

> 💡 **Alternatif:** Anda juga dapat memasukkan nilai konfigurasi langsung ke dalam file [`lib/firebase.ts`](./lib/firebase.ts).

---

### 5. Menjalankan Server Development

Jalankan perintah berikut:

```bash
npm run dev
```

Buka browser dan akses:
- **Website Portofolio**: [http://localhost:3000](http://localhost:3000)
- **Halaman CMS Admin**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

### 6. Registrasi Akun Admin Pertama Kali
1. Buka [http://localhost:3000/admin](http://localhost:3000/admin).
2. Klik tautan **"Belum punya akun admin? Buat akun sekarang"**.
3. Masukkan Email dan Password baru Anda (minimal 6 karakter).
4. Klik **"Daftar Akun Admin"**.
5. Anda akan langsung diarahkan ke dasbor CMS untuk mulai melengkapi seluruh data portofolio Anda.
6. *Catatan:* Untuk panduan pengisian konten langkah demi langkah yang ramah bagi pengguna awam, silakan baca [`README2.md`](./README2.md).

---

## 📄 Lisensi

- Desain & UI Asli: Hak Cipta © 2021 [StyleShout](https://www.styleshout.com/) - Distribusi oleh [ThemeWagon](https://themewagon.com/).
- Kode Modifikasi & Ekstensi CMS: Bebas digunakan untuk keperluan personal maupun komersial dengan tetap mencantumkan kredit StyleShout pada footer sesuai ketentuan lisensi aslinya.

