# Master Plan: Strategi Pengembangan Proyek yang Efisien

> Dokumen panduan dasar untuk setiap proyek baru - mengoptimalkan waktu, biaya, dan kualitas kode.

---

## Daftar Isi

1. [Software Development Lifecycle (SDLC)](#1-software-development-lifecycle-sdlc)
2. [Agile & Sprint Process](#2-agile--sprint-process)
3. [Development Workflow & Local Environment](#3-development-workflow--local-environment)
4. [Strategi Penggunaan AI](#4-strategi-penggunaan-ai)
5. [CI/CD Pipeline & Automation](#5-cicd-pipeline--automation)
6. [Testing Strategy](#6-testing-strategy)
7. [Code Quality & Standards](#7-code-quality--standards)
8. [Git Branching & Pull Request Process](#8-git-branching--pull-request-process)
9. [Environment Management](#9-environment-management)
10. [Security Best Practices](#10-security-best-practices)
11. [Monitoring & Observability](#11-monitoring--observability)
12. [Documentation Standards](#12-documentation-standards)
13. [Checklist Siap Pakai](#13-checklist-siap-pakai)

---

## 1. Software Development Lifecycle (SDLC)

### 1.1 Apa itu SDLC?

**Software Development Lifecycle (SDLC)** adalah kerangka kerja yang mendefinisikan tahapan proses pengembangan perangkat lunak dari awal hingga maintenance. Hampir semua perusahaan teknologi (Google, Meta, Stripe, Gojek) menggunakan variasi SDLC sebagai fondasi proyek.

### 1.2 Fase SDLC Standar Industri

```
Requirements -> Design -> Implementation -> Testing -> Deployment -> Maintenance
     ^                                                              |
     +---------------------- Feedback Loop -------------------------+
```

| Fase | Nama Industri              | Aktivitas Utama                                           | Output                        |
| :--- | :------------------------- | :-------------------------------------------------------- | :---------------------------- |
| 1    | **Requirements Gathering** | Analisis kebutuhan, user stories, SRS                     | Dokumen SRS, daftar fitur MVP |
| 2    | **System Design**          | Arsitektur sistem, database schema, ERD, UI/UX wireframes | schema.sql, ERD, wireframes   |
| 3    | **Implementation**         | Coding per komponen/modul, code review                    | Source code, PR merged        |
| 4    | **Testing & QA**           | Unit test, integration test, E2E, security audit          | Test reports, bug fixes       |
| 5    | **Deployment**             | Release ke staging lalu production                        | Live application              |
| 6    | **Maintenance**            | Bug fixes, performance tuning, feature iteration          | Patches, minor releases       |

### 1.3 Requirements Gathering

**Tujuan:** Mematangkan konsep sebelum menulis satu baris kode.

**Deliverables:**

- **User Stories** - Deskripsi fitur dari perspektif pengguna: _"Sebagai [user], saya ingin [aksi], agar [manfaat]"_
- **MoSCoW Prioritization**:
  - **Must Have** - Fitur wajib untuk MVP
  - **Should Have** - Penting tapi bisa ditunda
  - **Could Have** - Nice to have
  - **Won't Have** - Tidak untuk versi ini
- **Software Requirement Specification (SRS)** - Dokumen formal berisi scope, batasan, dan acceptance criteria

### 1.4 System Design

**Tujuan:** Merancang fondasi arsitektur sebelum implementasi.

**Deliverables:**

- **ERD** - Visualisasi relasi antar tabel
- **Database Schema** - File schema.sql siap eksekusi
- **System Architecture** - Diagram komponen (frontend, backend, database)
- **Project Structure** - Standar folder/file layout

**Contoh Struktur Folder:**

```
project/
  src/
    components/    # Komponen UI reusable
    pages/         # Halaman/routes utama
    lib/           # Utility & helper functions
    services/      # API calls & business logic
    hooks/         # Custom hooks (React)
    styles/        # CSS/styling
  tests/           # Test files
  docs/            # Dokumentasi & ADR
  supabase/
    migrations/    # SQL migration files
  public/          # Static assets
  .env.example     # Template environment variables
  .gitignore
  package.json
```

### 1.5 Implementation, Testing, Deployment

Fase ini dibahas secara detail di seksi berikutnya:

- **Implementation** - Seksi 3 (Development Workflow) + Seksi 7 (Code Quality)
- **Testing** - Seksi 6 (Testing Strategy)
- **Deployment** - Seksi 5 (CI/CD Pipeline) + Seksi 9 (Environment Management)

---

## 2. Agile & Sprint Process

### 2.1 Mengapa Agile?

Agile adalah metodologi pengembangan yang digunakan oleh **90%+ perusahaan teknologi** modern. Inti filosofinya: deliver value secara iteratif dalam siklus pendek (sprint).

### 2.2 Framework: Scrum vs Kanban

**Untuk tim (5+ orang)** - gunakan Scrum:

```
Sprint Planning -> Daily Standup -> Sprint Review -> Retrospective
      |                                                |
      +------------ 1 Sprint (1-2 Minggu) -------------+
```

| Ceremony            | Kapan        | Durasi      | Tujuan                                |
| :------------------ | :----------- | :---------- | :------------------------------------ |
| **Sprint Planning** | Awal sprint  | 1-2 jam     | Memilih item backlog untuk dikerjakan |
| **Daily Standup**   | Setiap hari  | 15 menit    | Sinkronisasi progress dan blocker     |
| **Sprint Review**   | Akhir sprint | 1 jam       | Demo hasil kerja ke stakeholder       |
| **Retrospective**   | Akhir sprint | 30-60 menit | Evaluasi proses tim                   |

### 2.3 Lean/Kanban untuk Solo Developer

> **PENTING:** Scrum Ceremonies didesain untuk tim 5-9 orang. Jika kamu bekerja sendirian atau tim kecil (2-3 orang), **gunakan Kanban** - ambil esensinya, buang seremoninya.

**Prinsip Kanban Solo:**

- Tidak perlu "Daily Standup" atau "Retro" dengan diri sendiri
- Cukup disiplin mengisi **Kanban board** setiap mulai dan selesai coding
- Batasi Work-in-Progress (WIP) maksimal 2-3 task bersamaan
- Review mingguan singkat (15 menit): apa yang berjalan baik, apa yang perlu diperbaiki

### 2.4 Sprint/Kanban Workflow

```
Product Backlog -> Sprint Backlog -> In Progress -> In Review -> Done
```

| Kolom Board     | Isi                                  |
| :-------------- | :----------------------------------- |
| **Backlog**     | Semua task yang belum dimulai        |
| **To Do**       | Task untuk sprint/minggu ini         |
| **In Progress** | Sedang dikerjakan (max 2-3 simultan) |
| **In Review**   | Menunggu code review / testing       |
| **Done**        | Selesai, tested, dan merged          |

> **TIP:** Gunakan **GitHub Projects**, **Linear**, atau **Notion** sebagai Kanban board gratis.

### 2.5 Estimasi & Story Points

| Point  | Kompleksitas | Contoh                                 |
| :----- | :----------- | :------------------------------------- |
| **1**  | Trivial      | Ubah teks, fix typo                    |
| **2**  | Simple       | Tambah field di form                   |
| **3**  | Medium       | Buat komponen baru                     |
| **5**  | Complex      | Implementasi fitur auth, CRUD lengkap  |
| **8**  | Very Complex | Integrasi third-party API              |
| **13** | Epic         | Perlu dipecah menjadi task lebih kecil |

### 2.6 Definition of Done (DoD)

- [ ] Kode sudah di-review (minimal 1 reviewer atau AI review)
- [ ] Unit test ditulis dan passed
- [ ] Tidak ada linting error
- [ ] Tested di localhost
- [ ] Dokumentasi diupdate (jika ada perubahan API)
- [ ] PR approved dan merged

---

## 3. Development Workflow & Local Environment

### 3.1 Prinsip: Local-First Development

Developer **TIDAK** coding langsung di server production. Semua pengembangan dan testing dilakukan di environment lokal.

**Keuntungan:**

- Hot reload instan (< 100ms)
- Data testing terisolasi dari production
- Bisa coding tanpa koneksi internet konstan
- Tidak mengkonsumsi kuota hosting

### 3.2 Setup Environment Lokal

**JavaScript/Node.js:**

```bash
git clone <repo-url>
npm install
cp .env.example .env.local
npm run dev
```

**Python:**

```bash
git clone <repo-url>
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py runserver  # atau: uvicorn main:app --reload
```

**Rust:**

```bash
git clone <repo-url>
cargo build
cargo run
```

> **CATATAN:** Sesuaikan perintah dengan stack teknologi proyek. Prinsipnya sama: clone, install dependencies, konfigurasi env, jalankan dev server.

### 3.3 Daily Development Cycle

```
Start Day             During Coding         End of Day
-----------------     ------------------    -----------------
Pull latest           Edit -> Save ->       git add .
Checkout branch         Auto-reload         git commit [skip ci]
Start dev server      Test di browser       git push (backup)
```

**Pagi:**

```bash
git pull origin dev
git checkout -b feature/nama-fitur
supabase start
npm run dev
```

**Malam - Backup:**

```bash
git add .
git commit -m "feat: progress navbar 70% [skip ci]"
git push origin feature/nama-fitur
```

> **CATATAN:** Tag `[skip ci]` dikenali oleh Vercel, Netlify, dan GitHub Actions. Commit tetap ter-backup tapi **tidak memicu build**.

### 3.4 Release Cycle

```bash
# 1. Merge feature ke dev
git checkout dev && git merge feature/nama-fitur

# 2. Merge dev ke main
git checkout main && git merge dev

# 3. Push ke production (TANPA [skip ci])
git push origin main
# CI/CD pipeline otomatis: lint -> test -> build -> deploy
```

### 3.5 Cost Optimization (Free Tier Hosting)

| Strategi                           | Dampak                             |
| :--------------------------------- | :--------------------------------- |
| Matikan Preview Deploys            | Hemat 1 build per push ke non-main |
| Production Branch = main saja      | Mencegah build tak terduga         |
| Gunakan [skip ci] di commit harian | Mencegah build saat backup         |
| Develop & test 100% di localhost   | Nol build selama development       |

---

## 4. Strategi Penggunaan AI

### 4.1 Context Prompting - Template Pembuka Proyek

```
[Peran]: Kamu adalah Senior Software Engineer dan Pakar Arsitektur Sistem.
[Proyek]: Saya sedang membangun [Nama Proyek] - [Deskripsi 1-2 kalimat].
[Teknologi]: [Stack teknologi, misal: Vite + React + Supabase].
[Fase Saat Ini]: Saya sedang di [Fase X - nama fase].
[Aturan]:
  - Berikan kode yang clean dan modular
  - Jelaskan langkah per komponen
  - Jangan berikan seluruh kode aplikasi sekaligus
[Konteks Tambahan]: [file/kode yang sudah ada, jika relevan]
```

### 4.2 Prinsip Emas Penggunaan AI

| Prinsip                    | Penjelasan                                                   |
| :------------------------- | :----------------------------------------------------------- |
| **Spesifik > Umum**        | "Buat fungsi addTask(title, priority)" bukan "Buat app todo" |
| **Kecil > Besar**          | Minta per komponen, bukan seluruh halaman sekaligus          |
| **Iteratif > Sekali Jadi** | Bangun bertahap, review tiap langkah                         |
| **Verifikasi Selalu**      | Selalu test kode AI di localhost sebelum commit              |

### 4.3 Prompt Templates per Fase

**Brainstorming:**

```
Bantu saya mendefinisikan MVP untuk aplikasi [X].
Target user: [siapa]. Masalah: [apa].
Buatkan daftar fitur dengan prioritas MoSCoW.
```

**Database Design:**

```
Rancang skema database PostgreSQL untuk fitur: [daftar fitur].
Sertakan: tabel, relasi, constraint, index, dan RLS policies.
```

**Coding:**

```
Buat [komponen/fungsi/endpoint] untuk [tujuan spesifik].
Tech stack: [teknologi]. Terima input: [parameter].
Return: [output yang diharapkan]. Handle error: [kasus error].
```

**Review:**

```
Review kode berikut sebagai Senior Developer.
Fokus pada: bug, keamanan, performa, dan best practices.
Berikan skor 1-10 dan daftar perbaikan prioritas.
```

### 4.4 AI IDE Workflow (Modern)

Selain chat-based AI (ChatGPT/Claude web), manfaatkan AI yang terintegrasi langsung di editor:

| Fitur               | Cara Pakai                            | Keuntungan                                   |
| :------------------ | :------------------------------------ | :------------------------------------------- |
| **Inline Editing**  | `Ctrl+I` di VS Code (Copilot/Codeium) | Perbaikan instan tanpa copy-paste ke browser |
| **Autocomplete**    | Ketik kode, AI menyarankan kelanjutan | Mempercepat coding repetitif                 |
| **Chat in Editor**  | Panel chat bawaan ekstensi AI         | Konteks file otomatis terbaca                |
| **Multi-file Edit** | AI Agent mode (Cursor, Windsurf)      | Refactor lintas file sekaligus               |

> **TIP:** Untuk perbaikan kecil (rename variable, fix bug 1 baris), gunakan inline editing. Untuk desain arsitektur atau diskusi konsep, gunakan chat-based AI.

---

## 5. CI/CD Pipeline & Automation

### 5.1 Apa itu CI/CD?

- **CI (Continuous Integration):** Kode yang di-push otomatis dicek (lint, test) sebelum digabung.
- **CD (Continuous Deployment):** Setelah lolos CI, kode otomatis di-deploy.

### 5.2 Contoh GitHub Actions

Buat file `.github/workflows/ci.yml`:

```yaml
name: CI Pipeline
on:
  pull_request:
    branches: [main, dev]
  push:
    branches: [main]
jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --coverage
      - run: npm run build
```

### 5.3 Pipeline Stages

```
Code Push -> Lint -> Unit Test -> Build -> Integration Test -> Deploy Staging -> E2E Test -> Deploy Production
```

| Stage            | Tool                | Tujuan                      |
| :--------------- | :------------------ | :-------------------------- |
| Lint             | ESLint, Prettier    | Konsistensi kode            |
| Unit Test        | Vitest, Jest        | Logika fungsi benar         |
| Build            | Vite, Webpack       | Kode bisa di-compile        |
| Integration Test | Vitest + MSW        | API & komponen terintegrasi |
| E2E Test         | Playwright, Cypress | User flow end-to-end        |

---

## 6. Testing Strategy

### 6.1 Testing Pyramid

```
      /  E2E  \          <- Sedikit, mahal, lambat
     / Integration \     <- Sedang
    /  Unit Tests   \    <- Banyak, murah, cepat
```

### 6.2 Target Coverage (Pragmatis)

**Fase MVP / Proyek Awal** - gunakan Critical Path Testing:

| Level       | Target         | Fokus pada                                    |
| :---------- | :------------- | :-------------------------------------------- |
| Unit Test   | >= 40-50%      | Fungsi inti yang fatal jika rusak             |
| Integration | Critical paths | Alur auth, transaksi, manipulasi data krusial |
| E2E         | Happy paths    | Login -> Dashboard -> Aksi utama -> Logout    |

> **PENTING:** Di tahap MVP, fitur berubah sangat cepat. Menulis test terlalu ketat untuk UI/fungsi yang besok bisa dihapus = membuang 50% waktu untuk memperbaiki tes yang rusak. Fokuskan testing pada **critical paths** yang fatal jika error.

**Fase Production / Mature** - naikkan target:

| Level       | Target         | Contoh                                    |
| :---------- | :------------- | :---------------------------------------- |
| Unit Test   | >= 80%         | Fungsi utilitas, validasi, business logic |
| Integration | >= 60%         | API endpoints, database queries           |
| E2E         | Critical paths | Login, checkout, registrasi               |

### 6.3 Contoh Unit Test (Vitest)

```javascript
import { describe, it, expect } from 'vitest';
import { validateEmail } from './validation';

describe('validateEmail', () => {
	it('returns true for valid email', () => {
		expect(validateEmail('user@example.com')).toBe(true);
	});
	it('returns false for invalid email', () => {
		expect(validateEmail('invalid')).toBe(false);
	});
});
```

### 6.4 Setup Testing

```json
{
	"scripts": {
		"test": "vitest run",
		"test:watch": "vitest",
		"test:coverage": "vitest run --coverage",
		"test:e2e": "playwright test"
	}
}
```

---

## 7. Code Quality & Standards

### 7.1 Tool Wajib

| Tool            | Fungsi                           | Config File     |
| :-------------- | :------------------------------- | :-------------- |
| **ESLint**      | Mendeteksi error & enforce rules | `.eslintrc.cjs` |
| **Prettier**    | Auto-format kode                 | `.prettierrc`   |
| **Husky**       | Git hooks (lint sebelum commit)  | `.husky/`       |
| **lint-staged** | Lint hanya file yang berubah     | `package.json`  |

### 7.2 Setup Pre-Commit Hooks

```bash
npm install -D husky lint-staged prettier eslint
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

Di `package.json`:

```json
{
	"lint-staged": {
		"*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
		"*.{css,md,json}": ["prettier --write"]
	}
}
```

### 7.3 Coding Conventions

| Aturan          | Standar                                        |
| :-------------- | :--------------------------------------------- |
| Variables       | `camelCase` (JS/TS), `snake_case` (Python/SQL) |
| Komponen        | `PascalCase` (contoh: `UserProfile.jsx`)       |
| File            | `kebab-case` (contoh: `user-profile.jsx`)      |
| Max line length | 80-120 karakter                                |
| Indentasi       | 2 spaces (JS/TS) atau 4 spaces (Python)        |

---

## 8. Git Branching & Pull Request Process

### 8.1 Branching Strategy (Git Flow Simplified)

`main          --o------------------o------------ (production-ready)
                |                  ^
dev           --o---o---o---o-----o------------ (integration)
                    |       ^
feature/auth  -----o---o---o                    (fitur spesifik)
hotfix/bug-x  ----------------------o---o--- main (perbaikan darurat)`

| Branch    | Tujuan                        | Siapa yang Push    |
| :-------- | :---------------------------- | :----------------- |
| main      | Production - kode stabil      | Hanya via merge/PR |
| dev       | Integrasi fitur sebelum rilis | Hanya via merge/PR |
| eature/\* | Fitur baru                    | Developer          |
| hotfix/\* | Perbaikan darurat             | Developer senior   |

### 8.2 Pull Request (PR) Process

**Setiap merge ke dev atau main WAJIB melalui Pull Request.**

### 8.3 Definition of Done (DoD)

- [ ] Kode sudah di-review (minimal 1 reviewer)
- [ ] Semua test passed (unit + integration)
- [ ] Tidak ada linting error
- [ ] Dokumentasi diupdate (jika ada perubahan API)
- [ ] PR approved dan merged

---

## 9. Environment Management

### 9.1 Tiga Environment Standar

| Environment     | Tujuan                 | URL             | Database       |
| :-------------- | :--------------------- | :-------------- | :------------- |
| **Development** | Coding harian          | localhost:5173  | Supabase lokal |
| **Staging**     | Testing pre-production | staging.app.com | DB staging     |
| **Production**  | Live untuk user        | pp.com          | DB production  |

### 9.2 Environment Variables

`.env.local       -> Development (git-ignored)
.env.staging     -> Staging (git-ignored)
.env.production  -> Production (set di dashboard hosting)`

**Aturan Emas:**

- JANGAN commit file .env ke Git
- Buat .env.example berisi template tanpa nilai sensitif
- Set env vars production di dashboard hosting

### 9.3 Contoh .env.example

`ash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_NAME=
VITE_ENABLE_ANALYTICS=false
`

---

## 10. Security Best Practices

### 10.1 OWASP Top 10

| Risiko             | Pencegahan                             |
| :----------------- | :------------------------------------- |
| **Injection**      | Parameterized queries, sanitasi input  |
| **Broken Auth**    | Library auth (Supabase Auth, NextAuth) |
| **Data Exposure**  | Enkripsi, HTTPS wajib                  |
| **Access Control** | RLS, validasi server-side              |

### 10.2 Secret Management

| Jangan                | Lakukan                        |
| :-------------------- | :----------------------------- |
| Hardcode API key      | Gunakan environment variables  |
| Commit .env           | Tambahkan .env\* ke .gitignore |
| Share secret via chat | Gunakan secret manager         |

---

## 11. Monitoring & Observability

### 11.1 Tiga Pilar

| Pilar              | Tool           | Tujuan                        |
| :----------------- | :------------- | :---------------------------- |
| **Error Tracking** | Sentry         | Error di production real-time |
| **Logging**        | LogTail, Axiom | Log untuk debugging           |
| **Performance**    | Lighthouse     | Kecepatan & performa          |

### 11.2 Performance Budgets

| Metrik                   | Target          |
| :----------------------- | :-------------- |
| Lighthouse Score         | >= 90           |
| First Contentful Paint   | < 1.8s          |
| Largest Contentful Paint | < 2.5s          |
| Cumulative Layout Shift  | < 0.1           |
| Bundle Size              | < 200KB gzipped |

### 11.3 Rollback

`ash
git revert HEAD && git push origin main

# Atau rollback via dashboard Vercel/Netlify

`

---

## 12. Documentation Standards

### 12.1 Dokumen Wajib

| Dokumen          | Isi                            |
| :--------------- | :----------------------------- |
| **README.md**    | Setup guide, tech stack        |
| **CHANGELOG.md** | Riwayat perubahan per versi    |
| **ADR**          | Architecture Decision Records  |
| **.env.example** | Template environment variables |

### 12.2 Semantic Versioning

Format: MAJOR.MINOR.PATCH

| Komponen  | Kapan Naik                      |
| :-------- | :------------------------------ |
| **MAJOR** | Breaking changes                |
| **MINOR** | Fitur baru, backward compatible |
| **PATCH** | Bug fix                         |

---

## 13. Checklist Siap Pakai

### Checklist Mulai Proyek Baru

- [ ] SRS dan daftar fitur MVP selesai
- [ ] Skema database dan ERD selesai
- [ ] Environment lokal berjalan
- [ ] Git repo dengan branch main dan dev
- [ ] .env.example dibuat sebagai template
- [ ] ESLint + Prettier + Husky terkonfigurasi
- [ ] CI/CD pipeline ter-setup
- [ ] PR template dibuat
- [ ] README.md berisi setup guide

### Checklist Harian

- [ ] Berada di branch yang benar (bukan main)
- [ ] Backend lokal menyala
- [ ] Frontend dev server aktif
- [ ] Unit test untuk kode baru
- [ ] Kode lolos lint
- [ ] Commit akhir hari dengan [skip ci]
- [ ] Push ke remote untuk backup

### Checklist Pre-Deployment

- [ ] Semua fitur tested di localhost
- [ ] Unit test coverage sesuai fase (MVP: >= 40%, Mature: >= 80%)
- [ ] Code review selesai
- [ ] `npm audit` bersih
- [ ] Lighthouse score >= 90
- [ ] CHANGELOG.md diupdate
- [ ] PR merged ke main

### Checklist Post-Deployment

- [ ] Aplikasi accessible di production
- [ ] SSL/HTTPS aktif
- [ ] Error monitoring aktif
- [ ] Performance metrics sesuai target
- [ ] Rollback plan siap

### Checklist Keamanan

- [ ] `npm audit` dijalankan
- [ ] Tidak ada secret di source code
- [ ] RLS policies aktif
- [ ] Input validation aktif
- [ ] Dependency di-update

---

> **CATATAN:** Dokumen ini adalah **living document** - update seiring bertambahnya pengalaman dan kebutuhan proyek.

---

_Dibuat: 20 Mei 2026 | Versi: 2.0 - Industry-Grade Edition_
