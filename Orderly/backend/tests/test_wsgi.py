import pytest


@pytest.mark.django_db
def test_wsgi_application_imports():
    from orderly.wsgi import application

    assert application is not None