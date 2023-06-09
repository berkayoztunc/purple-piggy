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



