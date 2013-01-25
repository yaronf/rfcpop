#!/bin/bash

# These should really be installed separately
libs="djason django_openid_auth"

tar cvzf rfcpop-package.tar.gz --exclude-vcs package.sh urls.py settings.py rfcpop/ $libs
