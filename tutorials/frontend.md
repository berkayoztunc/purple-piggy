## Solana programını VUE ile kullanma 
Selam şimdi solana ağında devnet üzerine yüklediğimiz bir program ile VUE ile nasıl bağlantı kurulur ona bakalım.
Genellikle react örnekleri mevcut, ama ben bu eğitimde vue'de kullanabiliceğini göstericeğim. O yüzden herkez next yada react öğrenmesine gerek yok. 

vue için gerekli olan `solana-vue-wallet` kurmanız, diğer anchor, serum ve web3 zaten ts olarak uygun bir şekilde çalışmakta. Wallet bağlantısı kurmak içinde useAnchorWallet hooku veya useWallet hooku kullanabilirsiniz. ben bu işlemler için useWorkspace.ts dosyasını oluşturdum. İçerisinde `program`, `wallet` ve `Provider` bağlantılarını kuruyorum. Sistemin tüm web3 ayarlarıda o dosyada bulunmaktadır.

Vue projemizin dizini şu şekilde 
    
    ```sh
    dapp/PurplePiggy
    |__ src
        |__ components
            |__ ClaimFromPiggy.vue
            |__ CreatePiggy.vue
            |__ ListAllPiggy.vue
        |__ lib
            |__ idl.ts
            |__ useWorkspace.ts
        |__ App.vue
        |__ main.ts
    ```
    Kodların detayları için repoyu inceleyebilirsiniz, listede verilen dosyalar kendi içinde dökümante edilmiştir. 

    Diğer dosyalar zaten tailwind,vite,vue boilerplate ile gelmekte. Isterseniz sizde sıfırdan bir kurulum yaparak başlayabilirsiniz. 
    yeni bir vue projesi oluşturmak için. (Vite cli kurulu olmalıdır.)

    ```sh
    yarn create vite-app PurplePiggy
    ```

## PurplePiggy Front-end'ini çalıştırma

    ```sh
    yarn install
    yarn run dev
    ```

Bu işlemlerden sonra http://localhost:5173/ adresinden uygulamayı görebilirsiniz. Tabikide şu anda benim örnek programına bağlantı kurmuş bulunuyorsunuz. Bunu değiştirmek için `useWorkspace.ts` dosyasınıdaki `programID` alanını değiştirmeniz yeterli olacaktır.

```ts
 const programID = new PublicKey( "FZaN7Fs58eKPa6NJ93EeKt1j5x6ZUcCAGsKif7mgeWaZ"); // bu programı sizin kendi deploy ettiğiniz anchor ile güncelleyin
```

Bu işlemden sonra artık ara yüz sizin sisteminize bağlanıcaktır. Artık arayüzden programı kullanabilirsiniz.



# Kod içersinde olan önemli detaylar


## PDA hesabını ağ üzerinden okuma

Program detaylarında bahsettiğim benzersiz program hesabını oluşturmak için aşağıdaki kodu kullanabilirsiniz. Burada okuma veya yazman yaparken program üzerinden neden o kadar karmaşık işlemler yaptığımızı anlayabilirsiniz. normalde `findProgramAddressSync` daha karmaşık array'ler alabilir ve duruma göre farklı PDA'ler üretebilmekte. Ben burda sadece sisteme bağlı olan wallet ve gönderilen isim üzerinden PDA hesabını buluyorum.

```ts
const handlePDA = async (name:string,wallet:Wallet) => {
        const [vault, bump] =
            await PublicKey.findProgramAddressSync(
                [
                    Buffer.from("vault"), 
                    Buffer.from(name),
                    wallet.publicKey.toBytes(),
                ],
                programID
            );
        return vault;
    };
```

Peki sonrasında bu PDA numarası ile nasıl hesabın bilgilerini oluyoruz ? 
```ts
const { program ,handlePDA} = useWorkspace();

const resp = await program.value.account.vault.fetch(await handlePDA("my awesome vault")); // burda PDA.value yerine yukarıda oluşturduğumuz PDA hesabını yazıyoruz.
const resp =  await program.value.account.vault.all(); // burda tüm PDAları çekebilirsiniz.
```


## Qr oluşturma 

QR oluşturmak için solana-pay kütüphanesinin `createQR` ve `encodeURL` fonksiyonlarını kullanabilirsiniz. Bu fonksiyonlar için gerekli olan URL'yi bir sonraki adımda daha detaylı anlatacağım. 

Burada solana pay için bir QR oluşturuyoruz, QR için bir GET api ucuna ihtiyacımız var. Burada sadece front'en için öenli olan noktası. Api ucuna eklenicek parametreleri `encodeURL` fonksiyonuna göndermeniz. 



Oluşan QR için `download` fonksiyonu ile indirme işlemi yapabilirsiniz.


```ts

async function createQRCode() {
    my_modal_2.showModal();
    let url = encodeURL({
        label: "Purple Piggy Bank",
        link:
            "https://myspacialfunction-qo2dv4mlkq-uc.a.run.app/api/v1/qr-deposite?pda=" +
            PDA.value +
            "&amount=" +
            depositeAmount.value * 1000000000,
    });
    const qrCode = createQR(url);
    qrCode.append(qr.value);
}
async function downloadQrCode() {
    let url = encodeURL({
        label: "Purple Piggy Bank",
        link:
            "https://myspacialfunction-qo2dv4mlkq-uc.a.run.app/api/v1/qr-deposite?pda=" +
            PDA.value +
            "&amount=" +
            depositeAmount.value * 1000000000,
    });
    const qrCode = createQR(url);
    qrCode.download();
}
```


Bu kısmın detaylarını değiştirmek için bir sonraki adıma geçip [API  oluşturup](https://github.com/berkayoztunc/purple-piggy/wiki/5-Firebase-ve-solana-pay) geri dönebilirsiniz 


