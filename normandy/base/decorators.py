from functools import wraps

from django.db import transaction

from reversion import revisions


def short_circuit_middlewares(view_func):
    """
    Marks a view function as wanting to short circuit middlewares.
    """
    # Based on Django's csrf_exempt

    # We could just do view_func.short_circuit_middlewares = True, but
    # decorators are nicer if they don't have side-effects, so we return
    # a new function.
    def wrapped_view(*args, **kwargs):
        return view_func(*args, **kwargs)
    wrapped_view.short_circuit_middlewares = True
    return wraps(view_func)(wrapped_view)


def reversion_transaction(view_func):
    def wrapped_view(*args, **kwargs):
        with transaction.atomic(), revisions.create_revision():
            return view_func(*args, **kwargs)
    return wraps(view_func)(wrapped_view)
