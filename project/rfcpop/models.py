from django.db import models
from django.contrib import auth

class Document(models.Model):
    DOC_TYPES = [(0, 'reserved'), (1, 'rfc')]
    url = models.URLField(unique = True)
    doctype = models.IntegerField(choices = DOC_TYPES)

    def __unicode__(self):
	return self.url

class AnnotAuthor(models.Model):
    user = models.ForeignKey(auth.models.User,
                             on_delete = models.CASCADE)

    def __unicode__(self):
	    return unicode(self.user)

class Annot(models.Model):
    text = models.TextField(max_length=65536)
    author = models.ForeignKey(AnnotAuthor, on_delete = models.CASCADE)
    document = models.ForeignKey(Document, on_delete = models.CASCADE)
    bookmark = models.CharField(max_length=128)
    created = models.DateField(auto_now_add = True)
    saved = models.DateField(auto_now = True)

    def __unicode__(self):
	    return self.text
