# Admin Ödemeleri — Para Birimi

Endpoint ve query parametreleri değişmedi:

```text
GET /api/admin/payments?page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

`data.payments` içindeki her ödeme artık aşağıdaki alanları içerir:

| Alan | Açıklama |
| --- | --- |
| `payment_currency` | Kaydedilen ödeme para birimi: `TRY`, `USD` veya `EUR`. Eski kayıtlarda `null` olabilir. |
| `original_amount` | Ödeme para birimindeki orijinal tutar; bilgi yoksa `null`. |
| `store_currency` | İşlemde kaydedilen mağaza para birimi. Ödeme para biriminden farklı olabilir. |
| `exchange_rate` | Kaydedilen dönüşüm kuru; yoksa `null`. |
| `converted_amount` | Kaydedilen dönüştürülmüş tutar; yoksa `null`. |

## FE değişikliği

- Para birimi sütununda `payment_currency` gösterin; mağaza para birimini kullanmayın.
- Orijinal ödeme tutarını `original_amount` ile gösterin. `0` geçerli bir tutardır.
- Eksik para birimini otomatik TRY saymayın; “Belirtilmemiş” gösterin.
- `amount` mevcut haliyle korunur. Dönüşüm olan işlemlerde bunu doğrudan `payment_currency` ile etiketlemeyin.
- Sayfalama ve diğer yanıt alanları değişmedi.

```js
const currency = payment.payment_currency;
const amount = payment.original_amount;

const currencyLabel = currency ?? "Belirtilmemiş";
const amountLabel = amount == null
  ? "—"
  : currency
    ? new Intl.NumberFormat("tr-TR", {
        style: "currency", currency,
      }).format(amount)
    : new Intl.NumberFormat("tr-TR").format(amount);
```

Yeni alanlar backend deploy'u tamamlandıktan sonra canlı yanıtta görünür. Migration gerekmez.
