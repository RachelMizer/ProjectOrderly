import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.models import CustomerProfile, UserRole, UserRoleChoices
from catalog.models import Category, Product, ProductVariant
from orders.models import Order, OrderItem, OrderStatus

User = get_user_model()


@pytest.mark.django_db
def test_get_order_detail_returns_consistent_field_names():
    client = APIClient()

    user = User.objects.create_user(
        username="detail@test.com",
        email="detail@test.com",
        password="Password123!",
    )
    UserRole.objects.create(user=user, role=UserRoleChoices.CUSTOMER)
    customer_profile = CustomerProfile.objects.create(user=user)

    category = Category.objects.create(name="Tea")
    product = Product.objects.create(
        category=category,
        name="Chai",
        description="Spiced tea",
        has_variants=True,
        has_modifiers=False,
    )
    variant = ProductVariant.objects.create(
        product=product,
        name="Medium Chai",
        sku="CHAI-MD-001",
        unit_price=Decimal("4.50"),
        stock_quantity=25,
        reorder_level=5,
    )

    order = Order.objects.create(
        customer=customer_profile,
        status=OrderStatus.COMPLETED,
        subtotal=Decimal("9.00"),
        tax_amount=Decimal("0.50"),
        total_payment_due=Decimal("9.50"),
    )

    OrderItem.objects.create(
        order=order,
        variant=variant,
        quantity=2,
        unit_price_charged=Decimal("4.50"),
    )

    client.force_authenticate(user=user)
    response = client.get(f"/api/v1/orders/{order.id}")

    assert response.status_code == 200

    # should use consistent names
    assert response.data["id"] == order.id
    assert response.data["totalDue"] == "9.50"
    assert response.data["taxAmount"] == "0.50"

    # old inconsistent names should not exist
    assert "orderId" not in response.data
    assert "totalPaymentDue" not in response.data