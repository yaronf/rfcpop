#!/usr/bin/python
# -*- coding: utf-8 -*-
from django.http import HttpResponse, Http404
from django.shortcuts import render_to_response, redirect
from django.template import RequestContext
from django.contrib import auth
# import requests
import re
import json
import djason.json
import logging

from rfcpop.models import *

HTTP_FORBIDDEN = 403
HTTP_CREATED = 201

logger = logging.getLogger(__name__)

def home(request):
    '''Home page'''
    return render_to_response('rfcpop-home.html', {},
                              context_instance=RequestContext(request))

def release_notes(request):
    '''Release notes'''
    return render_to_response('release-notes.html', {},
                              context_instance=RequestContext(request))

def about(request):
    '''"About" page'''
    return render_to_response('about.html', {},
                              context_instance=RequestContext(request))

def rfc(request, rfc_num):
    '''Scrape the RFC from the IETF tools site, add a "hook" and send it as a response.
    We should have used streaming to do it, but (1) I don't know how to and (2) Django only supports StreamingHttpResponse as of 1.5.'''

    # Sanitize the input
    if (not re.match(r'[1-9]\d{0,3}', str(rfc_num))):
        raise Http404()
    url = 'http://tools.ietf.org/html/rfc' + str(rfc_num)
    # r = requests.get(url)
    # if r.status_code != requests.codes.ok:  # for whatever reason
    #     raise Http404()
    # response_lines = add_hook(r.iter_lines(), request, url)
    filename = 'rfcpop/static/html-rfcs/rfc' + str(rfc_num) + '.html'
    infile = open(filename)
    response_lines = add_hook(infile, request, url)
    response = HttpResponse(response_lines)
    # Allow the browser to cache these responses
    # This is simpler than serevr-side caching, but less useful
    response['Cache-Control'] = "max-age=" + str(6 * 3600)
    return response


def get_doc_id(doctype, url):
    '''Create a document object or fetch an existing one, and return its ID'''

    (doc, created) = Document.objects.get_or_create(doctype=doctype,
            url=url)
    return doc.id


def add_hook(content, request, source_url):
    '''Add a basic "hook" JavaScript code at the top of the rendered RFC'''
    hook_done = False
    in_head = True
    doctype = 1  # rfc
    doc_id = get_doc_id(doctype, source_url)
    author = get_author(request)
    output = ''
    for line in content:
        if in_head and should_swallow(line):
            pass
        elif is_head_closing(line):
            output += line + '\n'
            in_head = False
            output = output + head_hook(doc_id, author)
        elif not hook_done and is_hook_line(line):
            output += page_hook()
            hook_done = True
        else:
            output += line

    # assert hook_done

    return output


def head_hook(doc_id, author):
    '''Stuff we add to the "head" section of the rendered HTML'''
    author_id = author.id if author else None
    details = {'doc_id': doc_id, 'is_authenticated': (author != None)}
    if author:
        details['author_id'] = author_id
        details['full_name'] = author.user.get_full_name()
        details['email'] = author.user.email
    # logger.debug('details: ' + json.dumps(details))
    init_script = '''
<script type='text/javascript'>
window.rfcpop = '''
    init_script += json.dumps(details) + ';'
    init_script += '''
</script>
<link rel='shortcut icon' href='/static/media/primo-partial/comment_add.png' />
'''
    return init_script


def page_hook():
    '''Static code (JavaScript includes) added to the top of the HTML page'''
    return '''
<script type='text/javascript' src='/static/js/lib/jquery.js'></script>
<script type='text/javascript' src='/static/js/lib/jquery.cookie.js'></script>
<script type='text/javascript' src='/static/js/lib/jquery.sticky.js'></script>
<script type='text/javascript' src='/static/js/lib/html-sanitizer-minified.js'></script>
<script type='text/javascript' src='/static/js/lib/purl.js'></script>
<link rel='stylesheet' href='/static/js/lib/jwysiwyg/jquery.wysiwyg.css' type='text/css'/>
<script type='text/javascript' src='/static/js/lib/jwysiwyg/jquery.wysiwyg.js'></script>
<script type='text/javascript' src='/static/js/lib/jwysiwyg/controls/wysiwyg.image.js'></script>
<script type='text/javascript' src='/static/js/lib/jwysiwyg/controls/wysiwyg.link.js'></script>
<script type='text/javascript' src='/static/js/lib/jwysiwyg/controls/wysiwyg.table.js'></script>
<script type='text/javascript' src='/static/js/lib/jwysiwyg/controls/wysiwyg.colorpicker.js'>
</script>

<script type='text/javascript' src='/static/js/rfcpop.js'></script>
<link rel='stylesheet' href='/static/css/rfcpop.css' type='text/css'/>

'''


def is_hook_line(line):
    '''Match a line where the page hook should be added'''
    return bool(re.match('^<body ', line))


def is_head_closing(line):
    '''End of the HTML "head" section'''
    return bool(re.match(r'^</head', line))


def should_swallow(line):
    '''We swallow both "link" tags, which link to non-existent favicons.'''

    return bool(re.match(' *<link rel="(shortcut )?icon".*', line))


def annot(request, annot_id):
    '''View for a single annotation: GET, PUT, DELETE'''
    try:
        o = Annot.objects.get(id=annot_id)
    except Annot.DoesNotExist:
        raise Http404
    if request.method == 'GET':
        return HttpResponse(o.text)
    elif request.method == 'DELETE':
        author = get_author(request)
        if author == None or author != o.author:
            # This should be blocked by the GUI
            return HttpResponse('Permission denied', response_status = HTTP_FORBIDDEN)
        else:
            o.delete()
            return HttpResponse()
    else:
        assert request.method == 'PUT'
        author = get_author(request)
        if author == None or author != o.author:
            # This should be blocked by the GUI
            return HttpResponse('Permission denied', response_status = HTTP_FORBIDDEN)
        else:
            o.text = request.raw_post_data
            o.save()
            return HttpResponse()

def get_author(request):
    '''Get the current Author object for the logged in user, or None'''
    if not request.user.is_authenticated():
        current_author = None
    else:
        user = request.user
        current_author, created = AnnotAuthor.objects.get_or_create(user = user, defaults={'nickname': user.username})
    return current_author

def annots(request):
    '''A view for multiple annotations: POST a new annotation, or
    retrieve a filtered list of annotations'''
    if request.method == 'POST':
        return post_new_annot(request)
    elif request.method == 'GET' and 'doc_id' in request.GET:
        # Currently the only supported filter is doc_id
        current_author = get_author(request)
        rs = Annot.objects.filter(document=request.GET['doc_id'])
        if rs == None:
            return json.dumps({})
        s = djason.json.Serializer()
        return HttpResponse(s.serialize(rs))
    else:
        raise Http404

def post_new_annot(request):
    '''Save a new annotation to the database, return its ID'''
    try:
        if not request.user.is_authenticated():
            # Normally this is prevented by the GUI
            return HttpReponse('Permission denied - did your session time out?', status_code = HTTP_FORBIDDEN)
        (author, created) = AnnotAuthor.objects.get_or_create(user=request.user)
        doc_id = request.GET['doc_id']
        document = Document.objects.get(id = doc_id)
        annot = Annot(document = document,
                        bookmark = request.GET['bookmark'],
                        author = author,
                        text = request.raw_post_data)
        annot.save()
    except Exception as e:
        logger.error(e)
    response = HttpResponse()
    response['Location'] = '/rfcpop/annot/' + str(annot.id)
    response.status_code = HTTP_CREATED
    return response

def show(request):
    '''Display an RFC, with its number given in a get-parameter'''
    if 'rfc_num' in request.GET:
        return redirect('/rfcpop/rfc/' + request.GET['rfc_num'])
    else:
        raise Http404

def logout(request):
    '''Logout the user, redirect to the home page'''
    auth.logout(request)
    # Redirect to a success page.
    return redirect("/rfcpop/")
