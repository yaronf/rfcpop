from django.contrib.syndication.views import Feed
from rfcpop.models import Annot, AnnotAuthor

class LatestEntriesFeed(Feed):
    title = "RFCpop Latest Comments"
    link = "/rfcpop/"
    description = "Latest comments posted to RFCpop"

    def items(self):
        return Annot.objects.order_by('-created')[:5]

    def item_title(self, item):
        return item.text

    def item_description(self, item):
        return item.text

    def item_author_name(self, item):
        return item.author.nickname
