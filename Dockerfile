FROM rust:latest

# Solana Anchor ve diğer bağımlılıkları yükleyin
RUN apt-get update && apt-get install -y curl

# Rust'u yükleyin
RUN apt install build-essential


ENV PATH="/root/.cargo/bin:$PATH"
ENV PATH="/root/.local/share/solana/install/active_release/bin:$PATH"

# node kurulumu 
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g yarn


RUN sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"
RUN curl "https://sh.rustup.rs" -sfo rustup.sh && \
    sh rustup.sh -y && \
    rustup component add rustfmt clippy

RUN cargo install --git https://github.com/coral-xyz/anchor --tag v0.27.0 anchor-cli --locked

# Solana CLI'ı yükleyin
RUN sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"

RUN yarn install

COPY . /app
WORKDIR /app
# Gerekli komutları çalıştırın
RUN cargo build 

CMD ["cargo", "run"]
