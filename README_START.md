# Hakan Portfolio — Fable 5 Başlangıç Paketi

Bu paket, portfolyo projesinin yapay zekâ tarafından kafasına göre şekillendirilmesini engellemek için hazırlanmıştır.

## Dosyalar

- `CLAUDE.md`  
  Fable/Claude Code'un her oturumda uyması gereken kalıcı proje kuralları.

- `docs/PROJECT_SPEC.md`  
  Ürünün kapsamı, tasarım yönü, sayfaları, teknik sınırları ve kabul kriterleri.

- `docs/CONTENT_INVENTORY.md`  
  Hangi projelerin hangi seviyede gösterileceği ve hangi bilgilerin henüz eksik olduğu.

- `FABLE5_BOOTSTRAP_PROMPT.md`  
  İlk oturumda Fable 5'e verilecek prompt. İlk görevde üretim kodu yazdırmaz; plan ve mimari belgelerini hazırlatır.

- `PHASE_EXECUTION_PROMPT.md`  
  Onaylanan tek bir fazı veya ticket'ı uygulatmak için tekrar kullanılacak prompt şablonu.

- `REVIEW_PROMPT.md`  
  Bir faz tamamlandıktan sonra kodu değiştirmeden denetim yaptırmak için prompt.

## Mevcut uygulamayı yerelde çalıştırma

Bu depoyu klonladıysan yeni bir repository oluşturman gerekmez. Aşağıdaki
komutları `package.json` dosyasının bulunduğu depo kökünde çalıştır.
Proje Node.js 22 veya üzerini ve pnpm 11.17.0 sürümünü kullanır.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Tarayıcıda terminalin gösterdiği yerel adresi aç. Varsayılan geliştirme portu
3000'dir; başka bir uygulama bu portu kullanıyorsa ayrı bir port seçebilirsin:

```sh
pnpm dev --port 3248
```

Değişikliğin kapsamına uygun kontrolleri seç; aşağıdaki komutlar depoda tanımlıdır:

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Yeni başlangıç paketi için sıra

1. Yeni ve boş bir Git repository oluştur.
2. Bu paketteki `CLAUDE.md` ve `docs/` klasörünü repository köküne kopyala.
3. Fable 5 oturumunu repository kökünde aç.
4. Mümkünse Plan Mode'u etkinleştir.
5. `FABLE5_BOOTSTRAP_PROMPT.md` içeriğini aynen gönder.
6. Fable'ın hazırladığı planı ve dokümanları incelemeden kod yazmasına izin verme.
7. Plan onaylandıktan sonra yalnızca ilk faz için `PHASE_EXECUTION_PROMPT.md` kullan.
8. Her fazdan sonra `REVIEW_PROMPT.md` ile bağımsız denetim yaptır.
9. Bir faz onaylanmadan sonraki faza geçme.

## Temel çalışma kuralı

Her oturum şu döngüyle ilerlemelidir:

`Oku → Planla → Uygula → Test et → Dokümante et → Dur`

Fable kendiliğinden yeni özellik, paket, sayfa, animasyon veya tasarım yaklaşımı eklememelidir.
