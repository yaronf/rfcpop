from django.conf.urls.defaults import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from proj2 import rfcpop

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Admin:
    url(r'^admin/', include(admin.site.urls)),

    url(r'^rfcpop/', include('rfcpop.urls')),

    # Empty URL
    url(r'^$', 'proj2.rfcpop.views.home', name='home'),

    url(r'^openid/', include('django_openid_auth.urls')),
)

urlpatterns += staticfiles_urlpatterns()
