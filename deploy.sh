#!/usr/bin/env bash

set -e

dirname=$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd -P)
cd "$dirname"

if [[ "$TERM_PROGRAM" == "vscode" ]]; then
    clear
fi

git status -s
if [[ -n $(git status -s) ]]; then
    echo "Git working directory dirty"
    exit 1
fi

if [[ -e ".env" ]]; then
    set -o allexport
    source ".env"
    set +o allexport
fi

name="snippets.gl"
remote="$SSH_USER@$SSH_HOST"

echo "Building..."
npx gulp rebuild

# Suppress Apple-specific metadata
export COPYFILE_DISABLE=1

tar="${name}.tar.gz"

echo "Packing..."
tar -v -czf $tar \
    static/ \
    www/nginx.conf

echo "Uploading..."
scp $tar $remote:$tar

rm -f $tar

echo "Deploying..."
ssh $remote "DEPLOY_TAR=$tar bash -s" < "www/deploy.sh"
