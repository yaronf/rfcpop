Config machine to allow port 8000.

Installation:

apt-get install django python-openid python-requests python-django-south

django-admin createproject project

Unpack tar file.

python manage.py syncdb

If needed: python manage.py migrate

Run:

python manage.py runserver --insecure 10.172.29.148:8000

To sync a local copy of RFCs:

rsync -avz rsync.tools.ietf.org::tools.html.rfc rfcpop/static/html-rfcs/


Extra Libraries
---------------

djason from https://github.com/buchuki/djason
django_openid_auth from https://launchpad.net/django-openid-auth
