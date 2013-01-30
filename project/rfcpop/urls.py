from django.conf.urls.defaults import patterns, include, url
from rfcpop.feeds import *

urlpatterns = patterns('rfcpop.views',
    # This one is for links from "tools" RFCs
    url(r'^rfc/rfc(?P<rfc_num>\d+)', 'rfc'),
    # And this is our standard URL
    url(r'^rfc/(?P<rfc_num>\d+)', 'rfc'),
    url(r'^annot/(?P<annot_id>\d+)', 'annot'),
    # list annots. Filters: url, bookmark
    url(r'^annot/', 'annots'),
    # A generic "show" (now only used in the home page)
    url(r'^show/', 'show'),
    url(r'^logout/', 'logout'),
    url(r'^about/', 'about'),
    url(r'^release-notes/', 'release_notes'),
    # RSS Feeds
    url(r'^feeds/latest/', LatestEntriesFeed()),
    # Empty URL
    url(r'^$', 'home', name='home'),
)

urlpatterns += patterns('', url(r'^login/', 'django_openid_auth.views.login_begin', {'template_name':'openid-login.html'}, name='openid-login'))
