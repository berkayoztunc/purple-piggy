# solana pay ile QR üzerinden para yatırma firebase üzerinden
Normalde çoğu örnek Next.js üzerinde vercel deploy olarak yapılmış, bende farklı bir deploy deneyimi eklemek istedim. Firebase üzerinde firestore ile daha programatik bir ödeme sistemi yapabilirsiniz, ve herşeyi serverless bir şekilde sunabilirsiniz. Firebase'in hosting'i üzerinde dapp'iniz statik bir şekilde yayınlayabilirsiniz. Bu tarz özellikler için firebase'i tercih ettim, ayıca kimse yapmamış.

## firebase kurulumu
firebase üzerinden cloud function kısmı ücretsiz ve oldukça fazla request sayısı sağlamakta. Tabi bunun için firebase projenizin "blaze" planında olması gerekmekte. Olurda aşım gerçekleşirse kartınızdan para çekilir.

Firebase oluşturmak için [buraya](https://console.firebase.google.com/) tıklayın. Sonrasında gmail hesabınız ile giriş yapın. Giriş yaptıkdan sonra plan seçim kısmında "blaze" plana geçebilirsiniz. Bu işlemlerde tamamsa "functions" kısmına geçebiliriz. Burada functions'ı aktif ettiğimizde bize bir kurulum yönergesi vericek. Ordaki kurulumları yaptıkdan sonra firebase cli ve çalışıcağınız klasör hazır. 

kurulum kodları
```
npm install -g firebase-tools
mkdir solana-qr
cd solana-qr
firebase login
firebase init functions
```


Kurulum sırasında typescript seçmeyi unutmayın ve mutlaka node@18 kullanın. 

Tüm kurulumlar tamam sıra geldi kod yazmaya.

functions için kodlar `/functions/src/index.ts` içerisine yazılacak.

proje dosya dizini 
```
- functions
  - src
    - index.ts // ana işlemler 
    - idl.ts // programın IDL dosyası
```

Kod içersindeki fonksiyonlar için index.ts üzerinden detaylıca dökümante edilmiştir. 

## Önemli değişkenler 

biraz zamanım kısıtlı olduğu için index.ts üzerinde çok fazla parametre ve env tanımlaması yapamadım ama sistem içinde bir adet önemli lan var. Program ID kısmı. Bu kısma daha önceki adımlarda anchor üzerinde ürettiğiniz programID'nizi girmeniz gerekmekte. İsterseniz response mesajlarını ve sistem logosunuda özelleştirebilirsiniz.

```ts
 const programID = new web3.PublicKey("FZaN7Fs58eKPa6NJ93EeKt1j5x6ZUcCAGsKif7mgeWaZ");
```

## Firebase deploy

firebase deploy için öncelikle firebase cli kurulumu yapmanız gerekmekte. Bu işlem sonrasıda sistem size bir url vericektir bunu firebase üzerinden functions kısmından öğrenebilirsiniz. Orada `triger` alanında url şeklinde yer almakta.

```
firebase deploy --only functions
```

## Kod detayları

Kodumuz aslında firebase üzerinde basit bir express api şeklinde başlıyoruz. Sonrasında anchor ve web3 js ile bu api uçlarında etkileşim sağlıyoruz. solana pay bizden 2 uç istemekte GET ve POST olmak üzere. 

bu kısmı biraz uzun yazıcam çünkü asıl önemli olan konu solana pay kısmı yoksa bir çoğunuz express ile api yazabilirsiniz.

Solana pay işlem için QR taratıldığında verilen URL'ye bir get isteği atmakta ve zaten bu url'yi siz QR oluşturuken solana pay'in `createQR` kısmına parametre olarak veriyorsunuz.  

`createQR` kullanımı için `/dapp/PurplePiggy/src/components/ClaimFromPiggy.tsx` dosyasına bakabilirsiniz.

Oluşan QR içerisine verilen link, taratıldığında cüzdan uygulaması tarafında otomatik olarak sizin GET ucunuza iletilmekte. Bu kısımda cüzdan bir doğrulama yapmakta bir nevi `options` isteği gibi.

Sonrasında api ucunuz GET isteğine `200` responsu, icon ve label leri döndüğünde, bu sefer cüzdanınız hemen ardına POST request adımına geçiyor. Cüzdan o sırada loading ekranında bekliyor. 

POST isteği ise biraz daha değişik. AYNI URL ye bu sefer post olarak istek atıyor ve body de sadece cüzdan numarasını gönderiyor. !dikkat imzalıyıcı değik sadece cüdan numarası. 

Bu işlemden sonra POST kodları içinde 
```ts
const accountField = req.body?.account;
const account = new web3.PublicKey(accountField);
```

şeklinde gelen cüzdanı bir public key'e çeviriyoruz. Burdan sonra geriye sadece anchor ve solana-web3-js ile programımıza ait olan fonkiyona çalıştırmak için gerekli kodları yazıyoru.

Kodlar okey ama burda bir fark olması gerekmekte. normalde front-end de ve test üzerinde anchor metodlarının `.rpc` bittiğini görmüşsünüzdür. 

```ts
// test.ts
await program.methods
      .deposite(amount)
      .accounts({
        vault: pda,
        authority: vaultOwner.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([vaultOwner])
      .rpc();

// dapp/PurplePiggy/src/components/ClaimFromPiggy.vue
 await program.value.methods
        .deposite(new anchor.BN(depositeAmount.value * LAMPORT_PER_SOL))
        .accounts({
            vault: new anchor.web3.PublicKey(PDA.value),
            authority: wallet.value.publicKey,
            systemProgram: SystemProgram.programId,
        })
        .rpc();

// functions/src/index.ts
const ix = await program.methods
    .deposite(new BN(AMOUNT))
    .accounts({
      vault: new web3.PublicKey(PDA),
      authority: sender,
      systemProgram: web3.SystemProgram.programId,
    })
    .instruction();        
 ```
 Püf noktası :D 

 Burdaki fark isteği `.rpc` göndermiyoruz, zaten bir imzacı olmadığı için elinizde gönderemezsiniz. Çünkü cüzdandan bize sadece account numarası geliyor. Bu yüzden burda `instruction` kullanıyoruz. 

 oluşan `instruction` bir transection dizisine ekleyip -> serileştirip -> base64'e çeviriyoruz. 

 Sonrasında response olarak bu base64 işlem metnini ve mesajımızı gönderiyoruz.

 ```ts
 res.status(200).send({ transaction: base64Transaction, message });
 ```

 bu işlem sonrasında cüzdan üzerinde gerekli olan bilgiler görünür oluyor ve imza soruyor. Eğer imzalarsa artık etkileşim tamamlanmış oluyor. Burdan sonraki adımları bu örnekde işlemedim ama solana pay de "handle" bölümüna bakarsanız bu kısmınıda tamamlamış olursunuz. 


 ## Solana Pay LİNK 

benimde denemeden hiç anlayamadığım bir konu solana pay için link durumu. Solana pay için bazı link şemaları bulunmakta

```ts
const url = encodeURL({ recipient, amount, reference, label, message, memo });

// ve

solana:<recipient>
      ?amount=<amount>
      &spl-token=<spl-token>
      &reference=<reference>
      &label=<label>
      &message=<message>
      &memo=<memo>
```


Bu iki örnek spasifik olarak x kişisinden y kişine SPL ve SOL göndermek için kullanılmakta. Bu örnekde ise biz direk bir programa ait olan bir fonksiyonu çalıştırmak istiyoruz. Bu yüzden bu link şemasını kullanamıyoruz.

bunun yerine direk link + query parameteleri ile işlemimizi yapıyoruz. Solana pay tüm alanlarda,  qr oluşturma GET isteği ve POST isteğinde query parametlerini direk taşımkata. Bu yüzden özellikle bir parametre taşımak istiyorsanız Program metodunuza burda query parametleri iletmeniz yeterli. 

ben projede aşğıdaki gibi kullandım. Ana api ucuna `&pda` ve `&amount` parametrelerini ekledim. Bu sayede hangi piggy'e ne kadar göndermek istediğine göre farklı QR'lar oluşturup telefona parametre olarak göndebiliyorum. Solana pay sırasında telefondaki cüzdanınızda bu değerleri değiştirmenize imkan sağlamıyor.

```ts
// dapp/PurplePiggy/src/components/ClaimFromPiggy.vue
"https://myspacialfunction-qo2dv4mlkq-uc.a.run.app/api/v1/qr-deposite?pda=" +PDA.value +"&amount=" +depositeAmount.value * LAMPORT_PER_SOL,`

```