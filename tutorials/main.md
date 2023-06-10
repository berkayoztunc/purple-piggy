# Baştan sona bir solana örnek eğitimi
Selam herkeze, internet de genelde örnekler arasında 100% döngüyü sağlayan pek örnekler bulamadığım için madem öyle ben bildiklerimle bir örnek yapıyım dedim. Bu seride 3 farklı alan anlatıcağım, tabi içerisinde bir çok teknoloji var.
 
## Sistemler
- Anchor lang ile bir solana programı geliştirmek
- Geliştirdiğimiz Anchor programına front-end (Vue) üzerinden bağlanmak ve işlem yapmak
- Solana pay ile geliştirdiğimiz anchor programına qr ile işlem talebi göndermek 

## Başlamadan önce gereksinimler 
Eğitime başlamadan önce bir çok yazılım vs kurmanız gerekmekte ama ben bunuda biraz kolaylaştırmak adına bazı öneriler ekledim.
Kurulumlu gereksinimler
ide
https://medium.com/nerd-for-tech/install-visual-studio-code-fe3908c5cf15

Phantom cüzdan
https://phantom.app/

Solana CLI wallet
https://docs.solana.com/cli/install-solana-cli-tools

node@18 
https://nodejs.dev/en/learn/how-to-install-nodejs/

rust 1.69.0
https://www.rust-lang.org/tools/install

cargo 1.69.0
https://github.com/rust-lang/cargo

Anchor lang
https://www.anchor-lang.com/docs/installation

firebase cli
https://firebase.google.com/docs/cli

Okey eğer bunları kurmaya üşendiyseniz o zaman direk 2 site size yeterli olucaktır ama örnek repo kurulum yapılmış şekilde kodlar barındırmakta. 
https://beta.solpg.io
https://stackblitz.com

# Sistem özeti
## Bu program ne iş yapıyor ?
Örnek de ki program verilen cüzdan adreslerini(Pubkey) ve bu cüzdan oranlarına göre bir kumbara hesabı oluşturuyor. Oluşan bu cüzdana yarırılan para orana göre dağılım sağlıyor, ve cüzdan oluştururken verilen pubkey'ler bu kumbaradan para çekebiliyor, özetlemek gerekirse basit ama yinede temel mekanikler içeren bir örnek. 
## Programın amacı ve vizyonu nedir ? 
Bir bağış, ödeme veya ortak birikim yaparken, güven odaklı para dağılımı sağlanması. Temelde inovasyonel olan kısım dağılım oranlarının solana programı tarafından hesaplanması ve manüpilasyona kapalı olması. 
#### Programın çalışmasına bir örnek;
Solana superteamtr bir bounty yayınladı ve bu bounty de bir tutorial yapılarak ödül kazanılma durumu söz konusu. PurplePiggy(bizim örnek programın adı) ile 4 farklı developer %25 olucak şekilde bir kumbara oluşturuyoruz, olurda etkinliği kazanırsak, ödül bu kumbaraya yatırılıyor ve tüm geliştiriciler başlangıçta belirledikde orana göre kumbaradan paralarını alabiliyorlar 🥳 örnek aşırı gerçekçi bu arada. Micro ölçekli örneği bu ama bunu geniş ölçekli bir alanda işletmelerin gelirlerini kırılımlamalarını da bu sayede sağlayabilirsiniz. 

Evet sanırım yapıcağımız örneğe biraz hakim oldunuz o zaman hemen sistemi adım adım geliştirdiğimize geçelim
1.  
2. 


