#!/bin/bash

file_env() {
  local var="$1"
  local fileVar="${var}_FILE"
  local def="${2:-}"
  if [ "${!var:-}" ] && [ "${!fileVar:-}" ]; then
    echo >&2 "error: both $var and $fileVar are set (but are exclusive)"
    exit 1
  fi
  local val="$def"
  if [ "${!var:-}" ]; then
    val="${!var}"
  elif [ "${!fileVar:-}" ]; then
    val="$(<"${!fileVar}")"
  fi
  export "$var"="$val"
  echo "export $var=\"$val\"" >>~/.bashrc

  unset "$fileVar"
}

file_env 'LCC_ACCESS_TOKEN'

echo "\"${LCC_ACCESS_TOKEN}\":\"${LCC_ACCESS_TOKEN}\"" > /etc/nanomq/nanomq_pwd.conf

sed -i "s/\"lcc\"/\"${LCC_ACCESS_TOKEN}\"/g" /etc/nanomq/nanomq_acl.conf

_main() {
	if [ -f "/tmp/nanomq/nanomq.pid" ];then
		rm -f /tmp/nanomq/nanomq.pid
	fi

	if [ "$#" -eq 0 ];then
		set -- nanomq start --conf /etc/nanomq/nanomq.conf
	elif [ "${1#-}" != "$1" ]; then
		set -- nanomq start --conf /etc/nanomq/nanomq.conf "$@"
	fi

  exec "$@"
}

_main "$@"