# Panduan Deploy MAVI MES ke Google Cloud Run

Dokumen ini menjelaskan langkah-langkah untuk mendeploy aplikasi **MAVI MES** ke **Google Cloud Run**.

---

## 📌 Yang Sudah Disiapkan di Kode Project

1. **`Dockerfile` (Multi-stage build)**:
   - Stage 1: Build bundle Vite React dengan alokasi memori Node.js yang optimal.
   - Stage 2: Serve menggunakan Nginx Alpine yang sangat ringan dan cepat.
   - Mendukung build arguments untuk environment variable: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
2. **`nginx.conf`**:
   - Port default disesuaikan ke **`8080`** (standar Cloud Run).
   - Fitur dynamic port injection (`${PORT:-8080}`) saat container boot.
   - Konfigurasi SPA routing (`try_files $uri $uri/ /index.html;`) agar routing React Router tidak error 404 saat refresh.
   - Gzip compression & static asset caching untuk loading super cepat.
3. **`.dockerignore` & `.gcloudignore`**:
   - Mengecualikan file biner besar (`*.exe`, `*.pt`, `node_modules`, `tests`) agar proses upload dan build ke Google Cloud cepat dan hemat bandwidth.
4. **`.github/workflows/deploy-cloudrun.yml`**:
   - Pipeline otomatis CI/CD untuk deploy langsung dari GitHub ke Cloud Run.

---

## 🚀 Pilihan Metode Deployment

Pilih salah satu metode yang paling nyaman untuk Anda:

---

### METODE 1: Menggunakan Google Cloud Console UI (Paling Mudah, Tanpa Install CLI)

Metode ini cocok jika Anda tidak ingin menginstall software tambahan di komputer.

#### Langkah 1: Buka Google Cloud Console
1. Kunjungi [Google Cloud Console](https://console.cloud.google.com/).
2. Buat atau pilih Project GCP Anda (misal: `mavi-mes-prod`).
3. Aktifkan API berikut (cari di search bar dan klik **Enable**):
   - **Cloud Run Admin API**
   - **Cloud Build API**
   - **Artifact Registry API**

#### Langkah 2: Buat Service Cloud Run
1. Buka menu **Cloud Run** > Klik **Create Service** (Buat Layanan).
2. Pada bagian deployment:
   - Pilih **Continuously deploy from a repository** (Deploy terus-menerus dari repositori).
   - Klik **Set up with Cloud Build**.
   - Pilih Provider: **GitHub**.
   - Hubungkan akun GitHub Anda dan pilih repositori: `zainalkhmi/mavi-mes`.
   - Branch: `main`.
   - Build Type: **Dockerfile** (Path: `/Dockerfile`).
3. Pada konfigurasi layanan:
   - **Service name**: `mavi-mes`
   - **Region**: `asia-southeast2 (Jakarta)` (atau `asia-southeast1 (Singapore)`)
   - **Authentication**: Pilih **Allow unauthenticated invocations** (agar aplikasi dapat diakses publik via browser).
   - **Container, Networking, Security** > **Container Port**: `8080`.
   - Memory: Disarankan **512 MiB** atau **1 GiB**.
4. Klik **Create**. Google Cloud Build akan otomatis mengompilasi Dockerfile dan mendeploy aplikasi. Anda akan mendapatkan URL publik HTTPS (contoh: `https://mavi-mes-xxxxx.asia-southeast2.run.app`).

---

### METODE 2: Menggunakan `gcloud` CLI (Deploy Langsung dari Terminal)

Jika Anda memiliki `gcloud` CLI di komputer atau Google Cloud Shell:

```bash
# 1. Login ke akun Google Cloud
gcloud auth login

# 2. Set project ID Anda
gcloud config set project [PROJECT_ID_ANDA]

# 3. Aktifkan service yang dibutuhkan
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# 4. Deploy langsung dari source code
gcloud run deploy mavi-mes \
  --source . \
  --region asia-southeast2 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi
```

> **Catatan:** Perintah `--source .` akan otomatis menggunakan Google Cloud Build untuk membuild `Dockerfile` yang ada di root project dan langsung mendeploy hasilnya ke Cloud Run.

---

### METODE 3: CI/CD Otomatis lewat GitHub Actions

File workflow telah dibuat di: [`.github/workflows/deploy-cloudrun.yml`](.github/workflows/deploy-cloudrun.yml).

#### Pengaturan GitHub Secrets:
Buka repositori Anda di GitHub > **Settings** > **Secrets and variables** > **Actions** > **New repository secret**:

1. `GCP_PROJECT_ID`: ID Project Google Cloud Anda.
2. `GCP_SA_KEY`: JSON Key dari Service Account yang memiliki role:
   - *Cloud Run Admin*
   - *Artifact Registry Administrator* (atau *Storage Admin*)
   - *Service Account User*
3. `VITE_SUPABASE_URL`: URL project Supabase Anda.
4. `VITE_SUPABASE_ANON_KEY`: Anon key Supabase Anda.

Setelah konfigurasi secret disimpan, Anda bisa menjalankan workflow secara manual via tab **Actions** > **Deploy to Google Cloud Run** > **Run workflow**, atau menghubungkannya ke trigger `push`.

---

## ⚙️ Pengaturan Domain Kustom (Opsional)

Jika ingin menggunakan domain sendiri (misal: `mes.perusahaan.com`):
1. Di Google Cloud Console, buka **Cloud Run** > Pilih service `mavi-mes`.
2. Klik tab **Custom Domains** > **Add Mapping**.
3. Masukkan domain/subdomain Anda dan ikuti panduan verifikasi DNS (menambahkan CNAME / record A yang diberikan oleh Google).
4. Google Cloud Run akan otomatis menerbitkan sertifikat SSL Let's Encrypt secara gratis.
