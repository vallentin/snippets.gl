#!/usr/bin/env bash

set -e

if [ -z "${DEPLOY_TAR}" ]; then
    echo "DEPLOY_TAR missing"
    exit 1
fi

conf="snippets.gl.conf"
conf="/etc/nginx/sites-enabled/${conf}"

tar="${DEPLOY_TAR}"
name="${DEPLOY_TAR%.tar.gz}"
# dir="$(pwd)/${name}"
dir="/home/vallentin/${name}"

echo "Cleaning..."
rm -rf "${dir}"
rm -f "${conf}"

echo "Unpacking..."
mkdir -p "${dir}"
tar -v -xzf "${tar}" -C "${dir}"
rm -f "${tar}"

cd "${dir}"

ln -sf "${dir}/www/nginx.conf" "${conf}"

echo "Testing nginx.conf"
if ! nginx -t; then
    rm -f "${conf}"
    exit 2
fi

echo "Restarting Nginx..."
service nginx restart

echo "Deployed..."
