import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.models import CustomerProfile, UserRole, UserRoleChoices
from catalog.models import Product, ProductVariant
from orders.models import Order, OrderItem, OrderStatus


@pytest.mark.django_db
class TestSubmitOrderAPI:

    def setup_method(self):
        self.client = APIClient()

    # -----------------------------
    # Helpers (CRITICAL SETUP)
    # -----------------------------
    def create_customer_user(self, email):
        User = get_user_model()

        user = User.objects.create_user(
            username=email,
            email=email,
            password="Testpass123!",
            first_name="Test",
            last_name="User",
        )

        # REQUIRED for CustomerProfile
        UserRole.objects.create(
            user=user,
            role=UserRoleChoices.CUSTOMER,
        )

        customer_profile = CustomerProfile.objects.create(user=user)

        return user, customer_profile

    def create_variant(self, stock_quantity=10):
        from catalog.models import Product, ProductVariant, Category

        category = Category.objects.create(name="Test Category")

        product = Product.objects.create(
            name="Coffee",
            description="",
            category=category,
            has_variants=True,
            has_modifiers=False,
        )

        return ProductVariant.objects.create(
            product=product,
            name="Large",
            unit_price=Decimal("4.25"),
            stock_quantity=stock_quantity,
        )

    def create_order(self, customer_profile, status=OrderStatus.DRAFT):
        return Order.objects.create(
            customer=customer_profile,
            status=status,
            subtotal=Decimal("0.00"),
            tax_amount=Decimal("0.00"),
            total_payment_due=Decimal("0.00"),
        )

    def add_item(self, order, variant, quantity=1):
        return OrderItem.objects.create(
            order=order,
            variant=variant,
            quantity=quantity,
            unit_price_charged=variant.unit_price,
        )

    # -----------------------------
    # Tests
    # -----------------------------

    def test_pytest_is_running(self):
        """Sanity check to confirm pytest discovery"""
        assert True

    def test_submit_order_success_sets_pending(self):
        user, customer_profile = self.create_customer_user("success@test.com")
        self.client.force_authenticate(user=user)

        variant = self.create_variant(stock_quantity=10)
        order = self.create_order(customer_profile)
        self.add_item(order, variant, quantity=2)

        response = self.client.patch(
            f"/api/v1/orders/{order.id}/submit",
            {"paymentType": "CASH"},
            format="json",
        )

        order.refresh_from_db()

        assert response.status_code == 200
        assert response.data["id"] == order.id
        assert response.data["status"] == OrderStatus.PENDING
        assert order.status == OrderStatus.PENDING

    def test_submit_fails_if_order_empty(self):
        user, customer_profile = self.create_customer_user("empty@test.com")
        self.client.force_authenticate(user=user)

        order = self.create_order(customer_profile)

        response = self.client.patch(
            f"/api/v1/orders/{order.id}/submit",
            {"paymentType": "CASH"},
            format="json",
        )

        order.refresh_from_db()

        assert response.status_code == 400
        assert response.data["error"] == "INVALID_INPUT"
        assert order.status == OrderStatus.DRAFT

    def test_submit_fails_if_not_owner(self):
        user, _ = self.create_customer_user("owner@test.com")
        other_user, other_profile = self.create_customer_user("other@test.com")

        self.client.force_authenticate(user=user)

        variant = self.create_variant(stock_quantity=10)
        order = self.create_order(other_profile)
        self.add_item(order, variant, quantity=1)

        response = self.client.patch(
            f"/api/v1/orders/{order.id}/submit",
            {"paymentType": "CASH"},
            format="json",
        )

        order.refresh_from_db()

        assert response.status_code == 403
        assert response.data["error"] == "NOT_AUTHORIZED"
        assert order.status == OrderStatus.DRAFT

    def test_submit_fails_if_not_draft(self):
        user, customer_profile = self.create_customer_user("notdraft@test.com")
        self.client.force_authenticate(user=user)

        variant = self.create_variant(stock_quantity=10)
        order = self.create_order(customer_profile)
        self.add_item(order, variant, quantity=1)

        order.status = OrderStatus.PENDING
        order.save()

        response = self.client.patch(
            f"/api/v1/orders/{order.id}/submit",
            {"paymentType": "CASH"},
            format="json",
        )

        order.refresh_from_db()

        assert response.status_code == 400
        assert response.data["error"] == "INVALID_INPUT"
        assert order.status == OrderStatus.PENDING

    def test_submit_fails_if_variant_out_of_stock(self):
        user, customer_profile = self.create_customer_user("outofstock@test.com")
        self.client.force_authenticate(user=user)

        variant = self.create_variant(stock_quantity=0)
        order = self.create_order(customer_profile)
        self.add_item(order, variant, quantity=1)

        response = self.client.patch(
            f"/api/v1/orders/{order.id}/submit",
            {"paymentType": "CASH"},
            format="json",
        )

        order.refresh_from_db()

        assert response.status_code == 400
        assert response.data["error"] == "INVALID_INPUT"
        assert order.status == OrderStatus.DRAFT

    def test_submit_requires_authentication(self):
        user, customer_profile = self.create_customer_user("noauth@test.com")

        variant = self.create_variant(stock_quantity=10)
        order = self.create_order(customer_profile)
        self.add_item(order, variant, quantity=1)

        response = self.client.patch(
            f"/api/v1/orders/{order.id}/submit",
            {"paymentType": "CASH"},
            format="json",
        )

        assert response.status_code == 401