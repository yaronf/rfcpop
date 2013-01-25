Config machine to allow port 8000.

Installation:

Django from repo

django-admin createproject proj2

Unpack tar file.

- python-openid
- python-requests

python manage.py syncdb

Remove debug flag from top of settings.py

Run:

python manage.py runserver --insecure 10.172.29.148:8000
