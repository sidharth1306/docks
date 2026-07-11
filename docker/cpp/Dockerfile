FROM gcc:13-bookworm

RUN useradd -m docks

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER docks
WORKDIR /home/docks

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
