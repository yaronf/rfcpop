import logging

logger = logging.getLogger(__name__)

class generic_handler:
    '''Generic exception handler middleware, mainly useful for console development'''
    def process_exception(self, request, exception):
        logger.error(exception)
        return None
