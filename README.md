rfcpop
======

**An RFC Comment System**

----

IETF RFCs are immutable. Only when an actual error is found, can it be reported through the Errata process.

The goal of this system is to provide an easy-to-use venue for implementors and other users of IETF specs to point out issues in the
documents, related implementation problems, clarifications and and useful references.

Needless to say, this does not replace the IETF mailing lists.

Current Features
----------------

 * A Wysiwyg editor is included, so some basic markup can be used.
 * All user-generated HTML is sanitized for security before display.
 * All commnets are publicly viewable.
 * A login is required to create comments, and later to edit/delete them.
 * Currently, only OpenID is supported.
