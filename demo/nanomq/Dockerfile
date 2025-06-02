FROM emqx/nanomq:0.23.5-full

RUN apt-get update && apt-get install -y bash \
    # Clean up
    && apt-get -y autoremove \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*


COPY source /tmp/

RUN cd /tmp \
    && mkdir -p /etc/nanomq \
    && cp docker-entrypoint.sh /usr/local/bin/ \
    && chmod +x /usr/local/bin/docker-entrypoint.sh \
    && cp config/* /etc/nanomq

EXPOSE 1884

ENTRYPOINT ["docker-entrypoint.sh"]