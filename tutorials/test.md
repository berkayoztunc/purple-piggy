# Solana Programı Testi

bir çok solana programı ve akıllı kontrat mutlaka otomatik test edilmesi gerekmektedir. Ben bu projede `.ts`ile bir test hazırladım. Testin detaylarını geçmeden dilerseniz repo üzerinde önce bir npm paketlerini kuralım 

```sh
 yarn install
```

bu işlem tamamlandıkdan sonra sırada test için gerekli .env dosyasını oluşturma geliyor. `.env` dosyası içeriğinde 3 adet değişken bulunmakta. Bunlar sırasi ile 
PRIVATE_KEY, PERSON_1_KEY, PERSON_2_KEY. Bu anahtarları isterseniz phantom üzerinden istersenizde cli üzerinden oluşturabilirsiniz.

 Benim tercihim phantom üzerinden 2 yeni anahtar oluşturmak ve VAULT_OWNER_KEY içinde development cüzdanınızı kullanmanız. Gizli anahtarları array şeklinde çıkarttıkdan sonra `.env` dosyasına ekliyoruz. 

```sh
VAULT_OWNER_KEY=
PERSON_1_KEY=
PERSON_2_KEY="[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]"
```

Burdaki amaç sistemi kullanucak ve oluşturucak kişileri belirlemek. Bu işlem tamamlandıkdan sonra testi çalıştırabiliriz.

Artık tüm hazırlık tamam sistemi test edebiliriz ama test'i çalıştırmadan `test.ts` dosyası üzerinden de bir kaç ayar değiştirebilirsiniz. Bunlarda en işlevselleri aşağıdaki gibidir.

```ts
  const PDAwillDeleteAfterTest = true; // test bittikden sonra PDA'yı siler
  const sendSomeLamportToPersons = true; // test başlangıcında 2 kişiye lamport gönderir eğer bu iki hesap açık ise mutlaka true olmalıdır. 
  .
  .
  .
  const vaultName = "Awesome Vault"; // oluşturulacak vault ismi
```

Diğer değişkenler testin içinde dökümantasyon olarak bulunmakta. ama önemli olanlar bunlardır. 

Şimdi sırada test'i çalıştırmak. Unutmayın bu işlemde sol tüketicektir.
    
```sh
  anchor test
```

Eğer tüm işlemleri yaptıysanız test başarılı olacaktır ve çıktısı şu şekilde görünücektir. 
```sh
  purple-piggy
    ✔ Ready to perseon sol (1870ms)
    ✔ Is initialized! (1209ms)
    ✔ Deposite sol in vault (1544ms)
    ✔ Person 1 claims (1972ms)
    ✔ Person 2 claims (1980ms)
    ✔ Random person cant claim (448ms)
    ✔ Update vault (1535ms)
    ✔ after update Deposite again (1670ms)
    ✔ after update Can claim person 1 (2083ms)
    ✔ after update Can claim person 2 (1683ms)
    ✔ delete vault (1356ms)

  11 passing (17s)
Done in 18.54s.
```

Okey şimdi bir programı çalıştırdınız ve test ettiniz süper bir noktadasınız. Şimdi sırada programın çıktılarını explorer üzerinden bakmaya geldi.
Bunun için https://explorer.solana.com/ adresine giderek sağ üst tarafdan devnet'i seçiyoruz. Sonra programımızın adresini kopyalıyoruz ve arama çubuğuna yapıştırıyoruz. Arama bizi direk programımıza görütürcek ve üzerindeki işlemleri aşağıdaki `Transaction History
` listede görüceksiniz. Burada listelenen işlemler yukarıdaki test işlermlerinin sırasının tersini takip eder. Son işlem "delete vault" işlemi olduğu için en yukarıda gördüğünüz işlemde bununla ilgili olacaktır.

İşlem göresel 1
Açılan cüzdanlar için sistem üzerinde logları


İşlem görseli 2 yatırılan tutarın logları


İşlem görseli 3 bir çekim işleminin logları 