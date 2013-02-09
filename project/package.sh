#!/bin/bash

# These should really be installed separately
libs="djason django_openid_auth"

tar cvzf rfcpop-package.tar.gz --exclude-vcs --exclude "html-rfcs" package.sh README.txt urls.py settings.py rfcpop/ apache/ $libs
