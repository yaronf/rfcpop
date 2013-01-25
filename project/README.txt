Config machine to allow port 8000.

Installation:

Django from repo

django-admin createproject project

Unpack tar file.

- python-openid
- python-requests

python manage.py syncdb

Run:

python manage.py runserver --insecure 10.172.29.148:8000

To sync a local copy of RFCs:

rsync -avz rsync.tools.ietf.org::tools.html.rfc ./html
