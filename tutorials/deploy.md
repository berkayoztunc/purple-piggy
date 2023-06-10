# Solana programının kurulması

başladamdan önce medium üzerindeki gereksinimleri okuduğunuzdan emin olun. 

öncelikle repoyu indiriyoruz.
```
git clone https://github.com/berkayoztunc/purple-piggy
cd purple-piggy
```


üzerinde çalışıcağımız program bu klasörde bulunmakta.
```sh
anchor.toml
program/purple-piggy
    |
    |__Cargo.toml
    |__src
        |__lib.rs
```
### anchor.toml dosyası
anchor.toml dosyası programın deploy edilmesi için gerekli bilgileri içerir. 

anchor.toml dosyasındaki solana cli wallet ve program id bilgilerini güncelliyoruz.
güncelenmesi gerekli olanlar `wallet` ve `purple_piggy` alanlarıdır.

```toml
.
.
.
purple_piggy = "FZaN7Fs58eKPa6NJ93EeKt1j5x6ZUcCAGsKif7mgeWaZ" // program id
.
.
.
.
[provider]
cluster = "devnet"
wallet = "/home/forge/.config/solana/id.json" // burdaki id.json dosyası solana cli wallet oluştururken oluşturduğumuz dosya
```

öncelikle cüzdan dosyası kısmını güncelliyoruz.Bu işlem tamamlandıkdan sonra programı build alıp güncelliyoruz
```sh
anchor build
```

Build işlemi tamamlandıkdan sonra programı deploy ediyoruz.
```sh
anchor deploy
```
sistem çıktısı bu şekilde olucaktır(eğer yeterli SOL varsa)
```sh
Deploying workspace: https://api.devnet.solana.com
Upgrade authority: /home/forge/.config/solana/id.json
Deploying program "puprle-piggy"...
Program path: /home/forge/x_projects/demoPurple/purple-piggy/target/deploy/puprle_piggy.so...
Program Id: FzKXXLpRcNi6MsvS4o6LsbqPCUmP9XvCXntrcAhXdjc4

Deploy success
```

Sonuç içerisinde `Program Id: FzKXXLpRcNi6MsvS4o6LsbqPCUmP9XvCXntrcAhXdjc4`yeni bir program id görüceksiniz. Bu program idyi `anchor.toml` dosyasındaki `purple_piggy` alanına yazıyoruz. Bununlada bitmedi `lib.rs` dosyasındaki `program_id` alanınıda güncelliyoruz.

```rust
declare_id!("FzKXXLpRcNi6MsvS4o6LsbqPCUmP9XvCXntrcAhXdjc4");
```

bu işlemler sonunda artık kendi cüzdanınız ile kendi programınızı kullanabilirsiniz. Ve ilerlemeye devam edebilirsiniz.

### Ek bilgi 

Yeterli solunuz yok ise 2 sol airdrop alabilirsiniz. 2 den fazla olmaz.
```sh
solana airdrop 2
```
Solana cüzdanınız adresini bilmiyorsanız.`solana config get` komutu ile öğrenebilirsiniz.
```sh
# çıktı
Config File: /home/forge/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com 
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/forge/.config/solana/id.json 
Commitment: confirmed 
```
Pubkey'inizi merak ediyorsanız `solana address` komutu ile öğrenebilirsiniz.

Cüzdanınız localnet ile çalışıyorsa onu devnet ile çalıştırmak için `solana config set --url https://api.devnet.solana.com` komutunu kullanabilirsiniz.

Solana cüzdanı kurmadıysanız medium yazsındaki link üzerinde takip edin.



# Kod içersinde olan önemli detaylar
## init hesap açılışı için detaylar
lib.rs içersinde ingilizce olarak tüm satırlar dökünate edilmiş şekildedir. Ama bazı kod detaylarını burada ne işe yaradıklarını anlatıcağım.

```rust

#[instruction(name: String,percentage: Vec<u64>)]
pub struct CreateVault<'info> {
    #[account(init,
        payer=authority,
        space = 8 + CreateVault::space(&name,percentage),
        seeds=[
            b"vault",
            name_seed(&name),
            authority.to_account_info().key.as_ref(),
        ],
        bump)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

```


`instruction` komutu driven olan bir struct'üzerinde kullanılırak program argümanlarını hesap şeması içerisinde kullanabilmeye olanak sağlar.

Burdaki örnekde `name` ve `percentage` argümanları hesap şeması içerisinde kullanılmak fonksiyon içersine aktarılmaya sağlar. 

`name` ise rasgele bir PDA hesabı yerine isim ile bir PDA hesabı oluşturmak için kullanılır.
`percentage` ise hesap şeması içersinde kullanılmak üzere uzunluk değerini almak için kullanılıyor.

Bu iki parametrede sonradan `CreateVault::space(&name,percentage)` ve `name_seed(&name)` fonksiyonlarına gönderiliyor. Bu fonksiyonlar `name` ve `percentage` değerlerini kullanarak hesap şeması içersinde kullanılmak üzere uzunluk değerini hesaplıyor. Rust içinde hesapların belirli bir hacmi olabilmekte. Ve bu hesabı oluştururken bunu hesaplama yapmanız gerekmekte. detaylar için https://www.anchor-lang.com/docs/space

Bizim sistemdeki alan hesabı ile aşağıda fonksiyon içersinde hesaplanıyor. Burada gönderilecek verilen byte cinsinden ne kadar alan sahip olucağı hesaplanıyor. Bu hesaplamayı yaparken `name` ve `percentage` değerlerini kullanıyoruz. özellikle `Vec` değerleri için dökümantasyondada belirtildiği gibi `Vec<T>	4 + (space(T) * amount)` şeklinde `amount` istenmekte, yani array'in uzunluğu ne kadar olucak ve ne tiğinde data tutucak

```rust
impl CreateVault<'_> {
    fn space(name: &str, acct: Vec<u64>) -> usize {
        let name_len = name.len() as usize;
        let accounts_len = acct.len();
        let name_size = 4 + name_len;
        let authority_size = 32; // Assuming the authority field is always a Pubkey (32 bytes)
        let total_size = 8;
        let percentages_size = 4 + (8 * (1 + accounts_len));
        let accounts_vault_size = 4 + (8 * (1 + accounts_len));
        let accounts_size = 4 + (32 * (1 + accounts_len));
        name_size
            + authority_size
            + total_size
            + percentages_size
            + accounts_vault_size
            + accounts_size
    }
}
```


Bir diğer fonksiyon ise `name_seed` bu fonksiton ise gelen parametreyi uzunluğunu 32 birime küçültüp geri dönmesini sağlıyor. Peki bu init kısmında ne işe yarıyor ? 

```rust
#[account(init,
        payer=authority,
        space = 8 + CreateVault::space(&name,percentage),
        seeds=[
            b"vault",
            name_seed(&name),
            authority.to_account_info().key.as_ref(),
        ],
        bump)]
```
Gördüğünüz anchor üzerinde bir PDA oluştururken `init` parametresi verilmekte. sonrasında payer, space,seeds ve bump gelmekte. 
Burdaki space'i hesaplamayı az önce açıkladım. Geriye `seeds` nedir ve neden bu kadar komplex ? 

Seed bir PDA adresi oluşturmak için veriken argümanlar array'i dir. Solana ağı üzerinde PDA açarken bu seedler sayesinde privite anahtarı olamayan benzersiz bir cüzdan numarası üretebilmektesiniz. Genelde solana programları ile bu PDA hesapları ile iletişime geçmekteyiz. Yanlız burda çok üzücü bir durum var, kişiler kendi PDA'leriniz listelerse bile anlamlı olmuyor. Bunu offchain veya başka bir metod ile anlaşabilir bir erişim yapmanız gerekmekte. Eğer seed benzersiz değişkenler vermezseni sonuçlar herzaman aynı üretilir, ve init olan bir PDA pubkey'i birdaha üretilemez. 

Bu yüzden `name_seed` fonksiyonu ile gelen `name` değerini 32 byte'a küçültüp geri döndürüyoruz, üzerine  'vault' metinin byte şekilde ekliyoruz ve en son olarak `authority` değerini ekliyoruz. Bu sayede her PDA adresi farklı olucak ve aynı isimdeki PDA adresleri aynı cüzdan için aynı olucak olucak. Seed kısmı biraz karmaşık olabilir ama faydalarını anladığınızda solana ağı içğnde bir cüzdan adresi ile aynı program için birden fazla PDA oluşturmayı anlamış olucaksınız. 


## DPA'den sol çekme

Noramlde bu işlem için bir invoke gerçekleştirmeniz gerekmekte. Ama bir PDA ve imzacınız ver ise PDA'niz otamatik olarak native değişiklik yapabilmekte. `Claim` fonksiyonunda bu metodu kullandım örneklem olması açısında. Burdaki imzalıyıcı ve PDA izinlerine hakim olmanız gerekmekte. Aksi taktirde yalnışlıkla programınız zararlı bir yazılıma dönüşebilir. 

```rust
   **vault.to_account_info().try_borrow_mut_lamports()? -= money;
   **ctx.accounts.claimer.try_borrow_mut_lamports()? += money;
```