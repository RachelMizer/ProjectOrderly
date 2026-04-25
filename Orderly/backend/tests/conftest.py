import pytest
from decimal import Decimal

from settings.models import StoreSettings


@pytest.fixture
def store_settings(db):
    """
    Creates a StoreSettings row with Wake County tax rate (7.25%).
    Required by any test that calls recalculate_order_totals, because that
    function reads tax_rate from the DB and defaults to 0 when no row exists.
    """
    return StoreSettings.objects.create(tax_rate=Decimal("7.25"))
