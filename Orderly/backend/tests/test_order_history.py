# orders/tests/test_order_history.py

from decimal import Decimal
from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import CustomerProfile, UserRole, UserRoleChoices
from orders.models import Order, OrderStatus


User = get_user_model()


@pytest.mark.django_db
class TestOrderHistoryView:
    def setup_method(self):
        self.client = APIClient()
        self.url = reverse("order-history")

    def create_customer_user(self, email="customer@example.com", password="Password123!"):
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
        )
        UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER)
        customer_profile = CustomerProfile.objects.create(user=user)
        return user, customer_profile

    def create_order(
        self,
        customer_profile,
        status=OrderStatus.PENDING,
        subtotal="10.00",
        tax_amount="0.00",
        created_at=None,
    ):
        order = Order.objects.create(
            customer=customer_profile,
            subtotal=Decimal(subtotal),
            tax_amount=Decimal(tax_amount),
            total_payment_due=Decimal(subtotal) + Decimal(tax_amount),
            status=status,
        )

        if created_at is not None:
            Order.objects.filter(pk=order.pk).update(
                created_at=created_at,
                updated_at=created_at,
                order_date=created_at,
            )
            order.refresh_from_db()

        return order

    def test_returns_only_logged_in_users_orders(self):
        user1, customer1 = self.create_customer_user("user1@example.com")
        user2, customer2 = self.create_customer_user("user2@example.com")

        own_order_1 = self.create_order(customer1, status=OrderStatus.PENDING, subtotal="12.50")
        own_order_2 = self.create_order(customer1, status=OrderStatus.COMPLETED, subtotal="8.00")
        self.create_order(customer2, status=OrderStatus.PAID, subtotal="99.99")

        self.client.force_authenticate(user=user1)
        response = self.client.get(self.url)

        assert response.status_code == 200
        data = response.json()

        assert data["count"] == 2
        returned_ids = [order["id"] for order in data["results"]]

        assert own_order_1.id in returned_ids
        assert own_order_2.id in returned_ids
        assert len(returned_ids) == 2

    def test_excludes_draft_orders(self):
        user, customer = self.create_customer_user()

        self.create_order(customer, status=OrderStatus.DRAFT, subtotal="5.00")
        pending_order = self.create_order(customer, status=OrderStatus.PENDING, subtotal="10.00")
        completed_order = self.create_order(customer, status=OrderStatus.COMPLETED, subtotal="15.00")

        self.client.force_authenticate(user=user)
        response = self.client.get(self.url)

        assert response.status_code == 200
        data = response.json()

        returned_ids = [order["id"] for order in data["results"]]
        returned_statuses = [order["status"] for order in data["results"]]

        assert data["count"] == 2
        assert pending_order.id in returned_ids
        assert completed_order.id in returned_ids
        assert "DRAFT" not in returned_statuses

    def test_returns_orders_sorted_newest_first(self):
        user, customer = self.create_customer_user()

        now = timezone.now()
        oldest = self.create_order(
            customer,
            status=OrderStatus.COMPLETED,
            subtotal="7.00",
            created_at=now - timedelta(days=3),
        )
        middle = self.create_order(
            customer,
            status=OrderStatus.PENDING,
            subtotal="8.00",
            created_at=now - timedelta(days=2),
        )
        newest = self.create_order(
            customer,
            status=OrderStatus.PAID,
            subtotal="9.00",
            created_at=now - timedelta(days=1),
        )

        self.client.force_authenticate(user=user)
        response = self.client.get(self.url)

        assert response.status_code == 200
        data = response.json()

        returned_ids = [order["id"] for order in data["results"]]
        assert returned_ids == [newest.id, middle.id, oldest.id]

    def test_returns_empty_collection_when_user_has_no_non_draft_orders(self):
        user, customer = self.create_customer_user()

        self.create_order(customer, status=OrderStatus.DRAFT, subtotal="5.00")

        self.client.force_authenticate(user=user)
        response = self.client.get(self.url)

        assert response.status_code == 200
        data = response.json()

        assert data["count"] == 0
        assert data["pageSize"] == 25
        assert data["next"] is None
        assert data["previous"] is None
        assert data["results"] == []

    def test_response_matches_contract_structure(self):
        user, customer = self.create_customer_user()

        order = self.create_order(
            customer,
            status=OrderStatus.PENDING,
            subtotal="14.50",
            tax_amount="0.00",
        )

        self.client.force_authenticate(user=user)
        response = self.client.get(self.url)

        assert response.status_code == 200
        data = response.json()

        assert set(data.keys()) == {"count", "pageSize", "next", "previous", "results"}
        assert data["count"] == 1
        assert data["pageSize"] == 25
        assert isinstance(data["results"], list)
        assert len(data["results"]) == 1

        item = data["results"][0]
        assert set(item.keys()) == {
            "id",
            "date",
            "subtotal",
            "taxAmount",
            "totalDue",
            "status",
            "createdAt",
            "updatedAt",
        }

        assert item["id"] == order.id
        assert item["subtotal"] == "14.50"
        assert item["taxAmount"] == "0.00"
        assert item["totalDue"] == "14.50"
        assert item["status"] == "PENDING"

    def test_supports_pagination(self):
        user, customer = self.create_customer_user()
        now = timezone.now()

        newest = self.create_order(customer, status=OrderStatus.PENDING, created_at=now)
        middle = self.create_order(
            customer,
            status=OrderStatus.COMPLETED,
            created_at=now - timedelta(minutes=1),
        )
        oldest = self.create_order(
            customer,
            status=OrderStatus.PAID,
            created_at=now - timedelta(minutes=2),
        )

        self.client.force_authenticate(user=user)
        response = self.client.get(self.url, {"page": 1, "pageSize": 2})

        assert response.status_code == 200
        data = response.json()

        assert data["count"] == 3
        assert data["pageSize"] == 2
        assert data["next"] == "/api/v1/orders/me?page=2&pageSize=2"
        assert data["previous"] is None
        assert [item["id"] for item in data["results"]] == [newest.id, middle.id]

        response_page_2 = self.client.get(self.url, {"page": 2, "pageSize": 2})
        assert response_page_2.status_code == 200

        page_2_data = response_page_2.json()
        assert page_2_data["count"] == 3
        assert page_2_data["pageSize"] == 2
        assert page_2_data["next"] is None
        assert page_2_data["previous"] == "/api/v1/orders/me?page=1&pageSize=2"
        assert [item["id"] for item in page_2_data["results"]] == [oldest.id]

    def test_returns_401_for_unauthenticated_request(self):
        response = self.client.get(self.url)

        assert response.status_code == 401

    def test_returns_403_for_authenticated_user_without_customer_profile(self):
        user = User.objects.create_user(
            username="nocustomer@example.com",
            email="nocustomer@example.com",
            password="Password123!",
        )

        self.client.force_authenticate(user=user)
        response = self.client.get(self.url)

        assert response.status_code == 403

    def test_returns_400_for_non_integer_pagination_values(self):
        user, _customer = self.create_customer_user()
        self.client.force_authenticate(user=user)

        response = self.client.get(self.url, {"page": "abc", "pageSize": "xyz"})

        assert response.status_code == 400
        data = response.json()
        assert data["error"] == "INVALID_INPUT"
        assert data["message"] == "page and pageSize must be integers."

    def test_returns_400_for_pagination_values_less_than_one(self):
        user, _customer = self.create_customer_user()
        self.client.force_authenticate(user=user)

        response = self.client.get(self.url, {"page": 0, "pageSize": 0})

        assert response.status_code == 400
        data = response.json()
        assert data["error"] == "INVALID_INPUT"
        assert data["message"] == "page and pageSize must be greater than 0."